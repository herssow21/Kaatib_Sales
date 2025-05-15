import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Platform, Alert } from "react-native";
import {
  TextInput,
  Text,
  IconButton,
  Menu,
  Button,
  Divider,
  Portal,
  Modal,
  Dialog,
  useTheme,
  Snackbar,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCustomerLookup } from "../contexts/CustomerLookupContext";
import type { Customer } from "../contexts/CustomerLookupContext";

interface NewCustomer {
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Helper function to generate unique customer IDs
const generateCustomerId = (): string => {
  return `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const UserManagement = () => {
  const theme = useTheme();
  const { customers, saveCustomers, getCustomerByPhone } = useCustomerLookup();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const router = useRouter();

  const isPhoneNumberUnique = (phone: string, excludeCustomerId?: string) => {
    return !customers.some(
      (customer) =>
        customer.phone === phone &&
        (excludeCustomerId === undefined || customer.id !== excludeCustomerId)
    );
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === "" || emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, "");

    if (digitsOnly.startsWith("0")) {
      return digitsOnly.length <= 10;
    } else if (digitsOnly.startsWith("9")) {
      return digitsOnly.length <= 9;
    }
    return digitsOnly.length <= 10;
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    // Apply length restrictions based on first digit
    let restrictedValue = digitsOnly;
    if (digitsOnly.startsWith("0")) {
      restrictedValue = digitsOnly.slice(0, 10);
    } else if (digitsOnly.startsWith("9")) {
      restrictedValue = digitsOnly.slice(0, 9);
    } else {
      restrictedValue = digitsOnly.slice(0, 10);
    }

    // Format the number with dashes
    if (restrictedValue.startsWith("0")) {
      const parts = [
        restrictedValue.slice(0, 4),
        restrictedValue.slice(4, 7),
        restrictedValue.slice(7),
      ].filter(Boolean);
      return parts.join("-");
    } else if (restrictedValue.startsWith("9")) {
      const parts = [
        restrictedValue.slice(0, 3),
        restrictedValue.slice(3, 6),
        restrictedValue.slice(6),
      ].filter(Boolean);
      return parts.join("-");
    } else {
      const parts = [
        restrictedValue.slice(0, 3),
        restrictedValue.slice(3, 6),
        restrictedValue.slice(6),
      ].filter(Boolean);
      return parts.join("-");
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    const formattedValue = formatPhoneNumber(value);
    if (validatePhone(value)) {
      setNewCustomer((prev) => ({ ...prev, phone: formattedValue }));

      // Check if we can find a customer with this phone number
      const customer = getCustomerByPhone(formattedValue);
      if (customer) {
        setNewCustomer((prev) => ({
          ...prev,
          name: customer.name,
          email: customer.email,
          address: customer.address,
        }));
      }
    }
  };

  const handleInputChange = (
    field: keyof typeof newCustomer,
    value: string
  ) => {
    let formattedValue = value;
    if (field === "phone") {
      formattedValue = formatPhoneNumber(value);
    }

    setNewCustomer((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Clear error for the field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleBlur = (field: keyof NewCustomer, value: string) => {
    if (field === "email" && value) {
      if (!validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      }
    }

    if (field === "phone" && value) {
      if (!validatePhone(value)) {
        setErrors((prev) => ({
          ...prev,
          phone: "Please enter a valid phone number",
        }));
      }
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      customer.phone.includes(searchQuery) ||
      (customer.address &&
        customer.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!newCustomer.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!newCustomer.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(newCustomer.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (newCustomer.email && !validateEmail(newCustomer.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showFeedback = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const getSnackbarStyle = () => {
    switch (snackbarType) {
      case "success":
        return {
          backgroundColor: "#4CAF50", // Green
          borderLeftWidth: 4,
          borderLeftColor: "#81C784", // Light Green
        };
      case "error":
        return {
          backgroundColor: "#F44336", // Red
          borderLeftWidth: 4,
          borderLeftColor: "#E57373", // Light Red
        };
      case "info":
        return {
          backgroundColor: "#2196F3", // Blue
          borderLeftWidth: 4,
          borderLeftColor: "#64B5F6", // Light Blue
        };
      case "warning":
        return {
          backgroundColor: "#FFC107", // Yellow
          borderLeftWidth: 4,
          borderLeftColor: "#FFD54F", // Light Yellow
        };
      default:
        return {
          backgroundColor: "#4CAF50",
        };
    }
  };

  const getSnackbarIcon = () => {
    switch (snackbarType) {
      case "success":
        return "check-circle";
      case "error":
        return "alert-circle";
      case "info":
        return "information";
      case "warning":
        return "alert";
      default:
        return "check-circle";
    }
  };

  const handleAddCustomer = () => {
    if (!validateForm()) {
      return;
    }

    // Check for duplicate phone number
    if (!isPhoneNumberUnique(newCustomer.phone, selectedCustomer?.id)) {
      setErrors({
        ...errors,
        phone: "This phone number is already registered",
      });
      showFeedback("Phone number already exists", "error");
      return;
    }

    if (isEditing && selectedCustomer) {
      // Update existing customer
      const updatedCustomers = customers.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              name: newCustomer.name,
              email: newCustomer.email || undefined,
              phone: newCustomer.phone,
              address: newCustomer.address || undefined,
            }
          : c
      );
      saveCustomers(updatedCustomers);
      showFeedback("Customer updated successfully", "warning");
    } else {
      // Add new customer
      const newCustomerData: Customer = {
        id: generateCustomerId(),
        name: newCustomer.name,
        email: newCustomer.email || undefined,
        phone: newCustomer.phone,
        address: newCustomer.address || undefined,
        totalOrders: 0,
        recentOrders: [],
      };
      const updatedCustomers = [...customers, newCustomerData];
      saveCustomers(updatedCustomers);
      showFeedback("Customer added successfully", "success");
    }

    setIsAddModalVisible(false);
    setIsEditing(false);
    setSelectedCustomer(null);
    resetForm();
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (Platform.OS === "web") {
      // Custom styled web alert
      const alertContainer = document.createElement("div");
      alertContainer.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        ">
          <div style="
            background: white;
            padding: 24px;
            border-radius: 8px;
            width: 400px;
            max-width: 90%;
          ">
            <div style="
              display: flex;
              align-items: center;
              margin-bottom: 16px;
            ">
              <span style="
                color: #FF9800;
                font-size: 24px;
                margin-right: 12px;
              ">⚠️</span>
              <span style="
                font-size: 20px;
                font-weight: 500;
              ">Warning</span>
            </div>
            <p style="
              margin: 0 0 24px 0;
              color: #666;
              font-size: 16px;
            ">Are you sure you want to delete this customer?</p>
            <div style="
              display: flex;
              justify-content: flex-end;
              gap: 12px;
            ">
              <button style="
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                background: #f5f5f5;
                color: #666;
              " onclick="this.closest('.alert-container').remove();">Cancel</button>
              <button style="
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                background: #FF5722;
                color: white;
              " id="deleteConfirm">Delete</button>
            </div>
          </div>
        </div>
      `;
      alertContainer.classList.add("alert-container");
      document.body.appendChild(alertContainer);

      const deleteButton = alertContainer.querySelector("#deleteConfirm");
      if (deleteButton) {
        (deleteButton as HTMLElement).onclick = () => {
          const updatedCustomers = customers.filter(
            (c) => c.id !== customer.id
          );
          saveCustomers(updatedCustomers);
          showFeedback("Customer deleted successfully", "error");
          alertContainer.remove();
        };
      }
    } else {
      Alert.alert(
        "Warning",
        "Are you sure you want to delete this customer?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              const updatedCustomers = customers.filter(
                (c) => c.id !== customer.id
              );
              saveCustomers(updatedCustomers);
              showFeedback("Customer deleted successfully", "error");
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone,
      address: customer.address || "",
    });
    setIsEditing(true);
    setIsAddModalVisible(true);
    setMenuVisible(null);
  };

  const handleViewOrders = (customer: Customer) => {
    setSelectedCustomer(customer);
    setMenuVisible(null);
  };

  const resetForm = () => {
    setNewCustomer({ name: "", email: "", phone: "", address: "" });
    setIsAddModalVisible(false);
    setIsEditing(false);
    setSelectedCustomer(null);
  };

  const handleBack = () => {
    if (Platform.OS === "web") {
      window.history.back();
    } else {
      router.back();
    }
  };

  // Utility for development-only debugging
  const DEBUG = __DEV__;
  const debug = (label: string, value: any) => {
    if (DEBUG) {
      console.log(`[Customer Lookup] ${label}:`, value);
    }
  };

  const getCustomerByEmail = (email: string) => {
    if (!email) return undefined;
    const normalizedEmail = email.toLowerCase();
    return customers.find((c) => c.email?.toLowerCase() === normalizedEmail);
  };

  const handleMenuClick = (customer: Customer, action: string) => {
    // Delay the menu closing slightly to prevent accidental double-clicks
    setTimeout(() => {
      setMenuVisible(null);

      switch (action) {
        case "edit":
          handleEditCustomer(customer);
          break;
        case "delete":
          handleDeleteCustomer(customer);
          break;
        case "view":
          handleViewOrders(customer);
          break;
      }
    }, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      marginTop: 16,
    },
    header: {
      padding: 16,
      paddingBottom: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      marginRight: 16,
    },
    headerContent: {
      flex: 1,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.onBackground,
    },
    subHeaderText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    searchContainer: {
      padding: 16,
      paddingTop: 8,
    },
    searchInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: 4,
    },
    addButtonContainer: {
      padding: 16,
      paddingTop: 0,
      paddingBottom: 8,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    addButton: {
      borderRadius: 8,
      height: 40,
    },
    addButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      height: 40,
    },
    addButtonText: {
      marginLeft: 8,
      color: theme.colors.onPrimary,
      fontWeight: "500",
    },
    tableContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    tableHeader: {
      flexDirection: "row",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    headerCell: {
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    nameCell: {
      flex: 2,
    },
    contactCell: {
      flex: 2,
    },
    addressCell: {
      flex: 3,
    },
    ordersCell: {
      flex: 1,
      alignItems: "center",
    },
    actionsCell: {
      flex: 1,
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    row: {
      flexDirection: "row",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    cell: {
      color: theme.colors.onSurface,
    },
    menuButton: {
      margin: 0,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      height: Platform.OS === "web" ? 48 : 56,
      fontSize: 16,
      letterSpacing: 0.5,
    },
    modalContainer: {
      margin: 20,
      borderRadius: 8,
      maxHeight: "80%",
    },
    modalContent: {
      padding: 16,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    detailsSection: {
      marginBottom: 16,
    },
    detailLabel: {
      fontSize: 14,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
    },
    recentOrdersSection: {
      marginTop: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
    },
    orderItem: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    orderDate: {
      fontSize: 14,
    },
    orderTotal: {
      fontSize: 16,
      fontWeight: "bold",
    },
    orderId: {
      fontSize: 12,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 24,
      gap: 8,
    },
    actionButton: {
      minWidth: 100,
    },
    deleteButton: {
      borderColor: theme.colors.error,
    },
    dialogContent: {
      width: Platform.OS === "web" ? 400 : "auto",
      alignSelf: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
    },
    dialogTitle: {
      color: theme.colors.onSurface,
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 8,
    },
    dialogMessage: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 16,
      lineHeight: 24,
    },
    dialogActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
      gap: 8,
    },
    snackbar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      margin: 16,
      borderRadius: 8,
      elevation: 4,
    },
    snackbarContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    snackbarIcon: {
      margin: 0,
      marginRight: 8,
    },
    snackbarText: {
      color: theme.colors.onPrimary,
      fontSize: 14,
      flex: 1,
    },
    emptyState: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      margin: 16,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      textAlign: "center",
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    footerText: {
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
          style={styles.backButton}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Customers</Text>
          <Text style={styles.subHeaderText}>
            Manage your customer information and track their orders
          </Text>
        </View>
      </View>

      <View style={styles.addButtonContainer}>
        <Button
          mode="contained"
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
          onPress={() => setIsAddModalVisible(true)}
        >
          <MaterialIcons
            name="person-add"
            size={20}
            color={theme.colors.onPrimary}
          />
          <Text style={styles.addButtonText}>Add Customer</Text>
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.nameCell]}>
            Customer Name
          </Text>
          <Text style={[styles.headerCell, styles.contactCell]}>Contact</Text>
          <Text style={[styles.headerCell, styles.addressCell]}>Address</Text>
          <Text style={[styles.headerCell, styles.ordersCell]}>Orders</Text>
          <View style={styles.actionsCell}>
            <Text style={styles.headerCell}>Actions</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {filteredCustomers.map((customer) => (
            <View key={customer.id} style={styles.row}>
              <View style={styles.nameCell}>
                <Text style={styles.cell}>{customer.name}</Text>
              </View>
              <View style={styles.contactCell}>
                <Text style={styles.cell}>{customer.email || "N/A"}</Text>
                <Text
                  style={[
                    styles.cell,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {customer.phone}
                </Text>
              </View>
              <View style={styles.addressCell}>
                <Text style={styles.cell}>{customer.address || "N/A"}</Text>
              </View>
              <View style={styles.ordersCell}>
                <Text style={styles.cell}>{customer.totalOrders}</Text>
              </View>
              <View style={styles.actionsCell}>
                <Menu
                  visible={menuVisible === customer.id}
                  onDismiss={() => setMenuVisible(null)}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => setMenuVisible(customer.id)}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => handleMenuClick(customer, "view")}
                    title="View Orders"
                    leadingIcon="shopping"
                  />
                  <Menu.Item
                    onPress={() => handleMenuClick(customer, "edit")}
                    title="Edit Customer"
                    leadingIcon="pencil"
                  />
                  <Divider />
                  <Menu.Item
                    onPress={() => handleMenuClick(customer, "delete")}
                    title="Delete Customer"
                    leadingIcon="delete"
                    titleStyle={{ color: theme.colors.error }}
                  />
                </Menu>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Showing {filteredCustomers.length} of {customers.length} customers
          </Text>
        </View>
      </View>

      <Portal>
        <Modal
          visible={isAddModalVisible}
          onDismiss={() => {
            resetForm();
            setIsAddModalVisible(false);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text
              style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            >
              {isEditing ? "Edit Customer" : "Add New Customer"}
            </Text>

            <TextInput
              label="Name"
              value={newCustomer.name}
              onChangeText={(value) => handleInputChange("name", value)}
              onBlur={() => handleBlur("name", newCustomer.name)}
              error={!!errors.name}
              style={styles.searchInput}
            />
            {errors.name && (
              <Text style={{ color: theme.colors.error, fontSize: 12 }}>
                {errors.name}
              </Text>
            )}

            <TextInput
              label="Email"
              value={newCustomer.email}
              onChangeText={(value) => handleInputChange("email", value)}
              onBlur={() => handleBlur("email", newCustomer.email)}
              error={!!errors.email}
              style={styles.searchInput}
            />
            {errors.email && (
              <Text style={{ color: theme.colors.error, fontSize: 12 }}>
                {errors.email}
              </Text>
            )}

            <TextInput
              label="Phone"
              value={newCustomer.phone}
              onChangeText={handlePhoneNumberChange}
              onBlur={() => handleBlur("phone", newCustomer.phone)}
              error={!!errors.phone}
              style={styles.searchInput}
            />
            {errors.phone && (
              <Text style={{ color: theme.colors.error, fontSize: 12 }}>
                {errors.phone}
              </Text>
            )}

            <TextInput
              label="Address"
              value={newCustomer.address}
              onChangeText={(value) => handleInputChange("address", value)}
              onBlur={() => handleBlur("address", newCustomer.address)}
              error={!!errors.address}
              style={styles.searchInput}
            />
            {errors.address && (
              <Text style={{ color: theme.colors.error, fontSize: 12 }}>
                {errors.address}
              </Text>
            )}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  resetForm();
                  setIsAddModalVisible(false);
                }}
                style={styles.actionButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddCustomer}
                style={styles.actionButton}
              >
                {isEditing ? "Update" : "Add"}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Dialog
          visible={isDeleteDialogVisible}
          onDismiss={() => setIsDeleteDialogVisible(false)}
          style={styles.modalContainer}
        >
          <Dialog.Title
            style={[styles.modalTitle, { color: theme.colors.onSurface }]}
          >
            Delete Customer
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Are you sure you want to delete this customer? This action cannot
              be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setIsDeleteDialogVisible(false)}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                if (selectedCustomer) {
                  handleDeleteCustomer(selectedCustomer);
                }
                setIsDeleteDialogVisible(false);
              }}
              style={[styles.actionButton, styles.deleteButton]}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.modalContainer,
          { backgroundColor: getSnackbarStyle().backgroundColor },
        ]}
      >
        <View style={styles.modalContent}>
          {getSnackbarIcon()}
          <Text style={[styles.modalTitle, { color: theme.colors.onPrimary }]}>
            {snackbarMessage}
          </Text>
        </View>
      </Snackbar>

      <Portal>
        <Modal
          visible={selectedCustomer !== null}
          onDismiss={() => setSelectedCustomer(null)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {selectedCustomer && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, { color: theme.colors.onSurface }]}
                >
                  Customer Details
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setSelectedCustomer(null)}
                  iconColor={theme.colors.onSurface}
                />
              </View>

              <View style={styles.detailsSection}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Name
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {selectedCustomer.name}
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Phone
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {selectedCustomer.phone}
                </Text>
              </View>

              {selectedCustomer.email && (
                <View style={styles.detailsSection}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Email
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {selectedCustomer.email}
                  </Text>
                </View>
              )}

              {selectedCustomer.address && (
                <View style={styles.detailsSection}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Address
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {selectedCustomer.address}
                  </Text>
                </View>
              )}

              <View style={styles.detailsSection}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Total Orders
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {selectedCustomer.totalOrders}
                </Text>
              </View>

              {selectedCustomer.recentOrders &&
                selectedCustomer.recentOrders.length > 0 && (
                  <View style={styles.recentOrdersSection}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Recent Orders
                    </Text>
                    {selectedCustomer.recentOrders.map((order) => (
                      <View
                        key={order.id}
                        style={[
                          styles.orderItem,
                          { backgroundColor: theme.colors.surfaceVariant },
                        ]}
                      >
                        <View style={styles.orderHeader}>
                          <Text
                            style={[
                              styles.orderDate,
                              { color: theme.colors.onSurfaceVariant },
                            ]}
                          >
                            {formatDate(order.date)}
                          </Text>
                          <Text
                            style={[
                              styles.orderTotal,
                              { color: theme.colors.onSurface },
                            ]}
                          >
                            {formatCurrency(order.total)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.orderId,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          Order #{order.id}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => handleEditCustomer(selectedCustomer)}
                  style={styles.actionButton}
                  textColor={theme.colors.primary}
                >
                  Edit
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleDeleteCustomer(selectedCustomer)}
                  style={[styles.actionButton, styles.deleteButton]}
                  textColor={theme.colors.error}
                >
                  Delete
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default UserManagement;
