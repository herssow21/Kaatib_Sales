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

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  totalOrders: number;
}

interface NewCustomer {
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

const UserManagement: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
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
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === "" || emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, "");

    // Check if phone starts with 0 or 9
    if (digitsOnly.startsWith("0")) {
      // If starts with 0, must be exactly 10 digits
      return digitsOnly.length === 10;
    } else if (digitsOnly.startsWith("9")) {
      // If starts with 9, must be exactly 9 digits
      return digitsOnly.length === 9;
    }

    // For other cases, must be exactly 10 digits
    return digitsOnly.length === 10;
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // Check if phone starts with 0 or 9
    if (cleaned.startsWith("0")) {
      // Format as 0XXX-XXX-XXXX (10 digits)
      const match = cleaned.match(/^(\d{1})(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const formatted = [match[1], match[2], match[3], match[4]]
          .filter(Boolean)
          .join("-");
        return formatted;
      }
    } else if (cleaned.startsWith("9")) {
      // Format as 9XX-XXX-XXXX (9 digits)
      const match = cleaned.match(/^(\d{1})(\d{0,2})(\d{0,3})(\d{0,3})$/);
      if (match) {
        const formatted = [match[1], match[2], match[3], match[4]]
          .filter(Boolean)
          .join("-");
        return formatted;
      }
    } else {
      // Format as XXX-XXX-XXXX (10 digits)
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const formatted = [match[1], match[2], match[3]]
          .filter(Boolean)
          .join("-");
        return formatted;
      }
    }
    return value;
  };

  const handleInputChange = (field: keyof NewCustomer, value: string) => {
    let processedValue = value;

    if (field === "phone") {
      // Format phone number as user types
      processedValue = formatPhoneNumber(value);
    }

    setNewCustomer((prev) => ({ ...prev, [field]: processedValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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

  // Mock data for customers
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "(555) 123-4567",
      address: "123 Main St, Anytown, CA 94321",
      totalOrders: 12,
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      phone: "(555) 234-5678",
      address: "456 Oak Ave, Somewhere, NY 10001",
      totalOrders: 8,
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol@example.com",
      phone: "(555) 345-6789",
      address: "789 Pine Rd, Nowhere, TX 75001",
      totalOrders: 3,
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david@example.com",
      phone: "(555) 456-7890",
      address: "101 Cedar Ln, Everywhere, FL 33101",
      totalOrders: 15,
    },
  ]);

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
    const newErrors: typeof errors = {};

    if (!newCustomer.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (newCustomer.email && !validateEmail(newCustomer.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!newCustomer.phone || !validatePhone(newCustomer.phone)) {
      newErrors.phone = "Please enter a valid phone number";
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
      showFeedback("Please fill in all required fields correctly", "error");
      return;
    }

    if (isEditing) {
      // Update existing customer
      const customerToUpdate = customers.find(
        (c) => c.name === newCustomer.name || c.phone === newCustomer.phone
      );

      if (customerToUpdate) {
        setCustomers(
          customers.map((customer) =>
            customer.id === customerToUpdate.id
              ? { ...customer, ...newCustomer }
              : customer
          )
        );
        showFeedback("Customer updated successfully", "warning");
      }
    } else {
      // Add new customer
      const newId = Math.max(...customers.map((c) => c.id)) + 1;
      setCustomers([
        ...customers,
        {
          ...newCustomer,
          id: newId,
          totalOrders: 0,
        },
      ]);
      showFeedback("Customer added successfully", "success");
    }
    resetForm();
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          "Are you sure you want to delete this customer? This action cannot be undone."
        )
      ) {
        setCustomers(customers.filter((c) => c.id !== customer.id));
        showFeedback("Customer deleted successfully", "error");
        setIsDeleteDialogVisible(false);
        setSelectedCustomer(null);
      } else {
        setIsDeleteDialogVisible(false);
        setSelectedCustomer(null);
      }
    } else {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this customer? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setIsDeleteDialogVisible(false);
              setSelectedCustomer(null);
            },
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setCustomers(customers.filter((c) => c.id !== customer.id));
              showFeedback("Customer deleted successfully", "error");
              setIsDeleteDialogVisible(false);
              setSelectedCustomer(null);
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleEditCustomer = (customer: Customer) => {
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
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    footerText: {
      color: theme.colors.onSurfaceVariant,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      margin: 20,
      borderRadius: 8,
      width: Platform.OS === "web" ? 500 : "90%",
      alignSelf: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      height: Platform.OS === "web" ? 48 : 56,
      fontSize: 16,
      letterSpacing: 0.5,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
      gap: 8,
    },
    orderDetailsContainer: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      margin: 16,
    },
    orderDetailsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    orderDetailsText: {
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    orderList: {
      marginTop: 8,
      paddingLeft: 16,
    },
    orderItem: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
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
    orderListContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
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
                    onPress={() => handleViewOrders(customer)}
                    title="View Orders"
                    leadingIcon="shopping"
                  />
                  <Menu.Item
                    onPress={() => handleEditCustomer(customer)}
                    title="Edit Customer"
                    leadingIcon="pencil"
                  />
                  <Divider />
                  <Menu.Item
                    onPress={() => handleDeleteCustomer(customer)}
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
          onDismiss={resetForm}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>
            {isEditing ? "Edit Customer" : "Add New Customer"}
          </Text>
          <TextInput
            label="Name *"
            value={newCustomer.name}
            onChangeText={(text) => handleInputChange("name", text)}
            style={styles.input}
            mode="outlined"
            error={!!errors.name}
            textContentType="none"
            autoComplete="off"
            selectionColor={theme.colors.primary}
          />
          <TextInput
            label="Email"
            value={newCustomer.email}
            onChangeText={(text) => handleInputChange("email", text)}
            onBlur={() => handleBlur("email", newCustomer.email)}
            style={styles.input}
            mode="outlined"
            error={!!errors.email}
            keyboardType="email-address"
            textContentType="none"
            autoComplete="off"
            selectionColor={theme.colors.primary}
          />
          {errors.email && (
            <Text
              style={{
                color: theme.colors.error,
                marginTop: -12,
                marginBottom: 12,
              }}
            >
              {errors.email}
            </Text>
          )}
          <TextInput
            label="Phone *"
            value={newCustomer.phone}
            onChangeText={(text) => handleInputChange("phone", text)}
            onBlur={() => handleBlur("phone", newCustomer.phone)}
            style={styles.input}
            mode="outlined"
            error={!!errors.phone}
            keyboardType="phone-pad"
            textContentType="none"
            autoComplete="off"
            selectionColor={theme.colors.primary}
            maxLength={14} // (XXX) XXX-XXXX
            inputMode="tel"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          {errors.phone && (
            <Text
              style={{
                color: theme.colors.error,
                marginTop: -12,
                marginBottom: 12,
              }}
            >
              {errors.phone}
            </Text>
          )}
          <TextInput
            label="Address"
            value={newCustomer.address}
            onChangeText={(text) => handleInputChange("address", text)}
            style={styles.input}
            mode="outlined"
            error={!!errors.address}
            textContentType="none"
            autoComplete="off"
            selectionColor={theme.colors.primary}
          />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={resetForm}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddCustomer}
              disabled={!newCustomer.name || !newCustomer.phone}
            >
              {isEditing ? "Save Changes" : "Add Customer"}
            </Button>
          </View>
        </Modal>

        <Dialog
          visible={isDeleteDialogVisible}
          onDismiss={() => setIsDeleteDialogVisible(false)}
          style={styles.dialogContent}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Delete Customer
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogMessage}>
              Are you sure you want to delete {selectedCustomer?.name}? This
              action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setIsDeleteDialogVisible(false);
                setSelectedCustomer(null);
              }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                if (selectedCustomer) {
                  setCustomers(
                    customers.filter((c) => c.id !== selectedCustomer.id)
                  );
                  setIsDeleteDialogVisible(false);
                  setSelectedCustomer(null);
                }
              }}
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        {selectedCustomer && !isDeleteDialogVisible && !isEditing && (
          <Modal
            visible={!!selectedCustomer}
            onDismiss={() => setSelectedCustomer(null)}
            contentContainerStyle={styles.modalContent}
          >
            <Text style={styles.orderDetailsTitle}>Customer Details</Text>
            <Text style={styles.orderDetailsText}>
              <Text style={{ fontWeight: "bold" }}>Name:</Text>{" "}
              {selectedCustomer.name}
            </Text>
            <Text style={styles.orderDetailsText}>
              <Text style={{ fontWeight: "bold" }}>Email:</Text>{" "}
              {selectedCustomer.email || "N/A"}
            </Text>
            <Text style={styles.orderDetailsText}>
              <Text style={{ fontWeight: "bold" }}>Phone:</Text>{" "}
              {selectedCustomer.phone}
            </Text>
            <Text style={styles.orderDetailsText}>
              <Text style={{ fontWeight: "bold" }}>Address:</Text>{" "}
              {selectedCustomer.address || "N/A"}
            </Text>
            <Text style={styles.orderDetailsText}>
              <Text style={{ fontWeight: "bold" }}>Total Orders:</Text>{" "}
              {selectedCustomer.totalOrders}
            </Text>
            <Text style={[styles.orderDetailsTitle, { marginTop: 16 }]}>
              Recent Orders
            </Text>
            <View style={styles.orderListContainer}>
              {Array.from({ length: selectedCustomer.totalOrders }, (_, i) => (
                <Text key={i} style={styles.orderItem}>
                  #{selectedCustomer.id * 1000 + i + 1}
                  {i < selectedCustomer.totalOrders - 1 ? ", " : ""}
                </Text>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setSelectedCustomer(null)}>
                Close
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedCustomer(null);
                  router.push(`/orders?customerId=${selectedCustomer.id}`);
                }}
              >
                View All Orders
              </Button>
            </View>
          </Modal>
        )}
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[styles.snackbar, getSnackbarStyle()]}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
          textColor: theme.colors.onPrimary,
        }}
      >
        <View style={styles.snackbarContent}>
          <IconButton
            icon={getSnackbarIcon()}
            size={20}
            iconColor={theme.colors.onPrimary}
            style={styles.snackbarIcon}
          />
          <Text style={styles.snackbarText}>{snackbarMessage}</Text>
        </View>
      </Snackbar>
    </View>
  );
};

export default UserManagement;
