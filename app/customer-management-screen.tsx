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
  Surface,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCustomerLookup } from "../contexts/CustomerLookupContext";
import type { Customer } from "../contexts/CustomerLookupContext";
import { useThemeContext } from "../contexts/ThemeContext";

interface NewCustomer {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  totalOrders: number;
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

const reddish = "#D32F2F";

// Add a type for the custom theme colors
interface CustomColors {
  primary: string;
  secondary: string;
  primaryContainer: string;
  secondaryContainer: string;
  background: string;
  surface: string;
  error: string;
  outline: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  onBackground: string;
  onPrimary: string;
  onSecondary: string;
  onError: string;
  elevation: any;
  card: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  modalBackground: string;
  modalBorder: string;
  divider: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
  text?: string;
  textSecondary?: string;
  buttonText?: string;
  buttonBackground?: string;
  buttonBorder?: string;
  headerBackground?: string;
  headerText?: string;
  searchBackground?: string;
  searchText?: string;
  searchPlaceholder?: string;
  listBackground?: string;
  listBorder?: string;
  listText?: string;
  listTextSecondary?: string;
  modalText?: string;
  modalTextSecondary?: string;
  modalOverlay?: string;
}

const CustomerManagementScreen = () => {
  const { theme } = useThemeContext();
  const colors = theme.colors as CustomColors;
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
    totalOrders: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const router = useRouter();

  const validatePhoneNumber = (phone: string): string | undefined => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Check if it's a valid length
    if (digits.length === 0) {
      return "Phone number is required";
    }

    // Check if it starts with 0
    if (digits.startsWith("0")) {
      if (digits.length !== 10) {
        return "Phone number must be 10 digits when starting with 0";
      }
    } else {
      if (digits.length !== 9) {
        return "Phone number must be 9 digits when not starting with 0";
      }
    }

    return undefined;
  };

  const handleAddOrUpdate = () => {
    const newErrors: FormErrors = {};

    if (!newCustomer.name.trim()) {
      newErrors.name = "Name is required";
    } else if (newCustomer.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const phoneError = validatePhoneNumber(newCustomer.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    if (newCustomer.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbarMessage("Please fix the errors in the form");
      setSnackbarType("error");
      setSnackbarVisible(true);
      return;
    }

    if (isEditing && selectedCustomer) {
      const updatedCustomers = customers.map((cust) =>
        cust.id === selectedCustomer.id ? { ...cust, ...newCustomer } : cust
      );
      saveCustomers(updatedCustomers);
      setSnackbarMessage("Customer updated successfully");
      setSnackbarType("success");
    } else {
      const existingCustomer = getCustomerByPhone(newCustomer.phone);
      if (existingCustomer) {
        setErrors({ phone: "Phone number already exists" });
        setSnackbarMessage("A customer with this phone number already exists");
        setSnackbarType("error");
        setSnackbarVisible(true);
        return;
      }

      const newCustomerWithId = {
        ...newCustomer,
        id: generateCustomerId(),
      };
      saveCustomers([...customers, newCustomerWithId]);
      setSnackbarMessage("Customer added successfully");
      setSnackbarType("success");
    }

    setSnackbarVisible(true);
    setIsAddModalVisible(false);
    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone,
      address: customer.address || "",
      totalOrders: customer.totalOrders,
    });
    setIsEditing(true);
    setIsAddModalVisible(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    if (selectedCustomer) {
      const updatedCustomers = customers.filter(
        (cust) => cust.id !== selectedCustomer.id
      );
      saveCustomers(updatedCustomers);
      setSnackbarMessage("Customer deleted successfully");
      setSnackbarType("warning");
      setSnackbarVisible(true);
    }
    setIsDeleteDialogVisible(false);
  };

  const handleViewOrders = (customer: Customer) => {
    setSelectedCustomer(customer);
    setMenuVisible(null);
  };

  const resetForm = () => {
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      address: "",
      totalOrders: 0,
    });
    setErrors({});
    setIsEditing(false);
    setSelectedCustomer(null);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.headerBackground,
      elevation: 2,
    },
    backButton: {
      marginRight: 8,
      backgroundColor: reddish,
      borderRadius: 24,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
    },
    headerContent: {
      flex: 1,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.headerText,
    },
    subHeaderText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    addButtonContainer: {
      padding: 16,
      paddingTop: 8,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    addButton: {
      borderRadius: 8,
      elevation: 2,
      backgroundColor: colors.buttonBackground,
    },
    addButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      height: 48,
    },
    addButtonText: {
      marginLeft: 12,
      fontSize: 16,
      fontWeight: "600",
      color: colors.buttonText,
    },
    searchContainer: {
      padding: 16,
      paddingTop: 0,
    },
    searchInput: {
      backgroundColor: colors.searchBackground,
      color: colors.searchText,
    },
    tableContainer: {
      flex: 1,
      backgroundColor: colors.background,
      margin: 16,
      borderRadius: 8,
      elevation: 2,
      borderColor: colors.listBorder,
      borderWidth: 1,
    },
    tableHeader: {
      flexDirection: "row",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.surfaceVariant,
    },
    headerCell: {
      fontWeight: "bold",
      color: colors.listText,
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
      borderBottomColor: colors.divider,
    },
    cell: {
      color: colors.listText,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.surfaceVariant,
    },
    footerText: {
      color: colors.listTextSecondary,
    },
    modalContent: {
      backgroundColor: colors.modalBackground,
      padding: 24,
      margin: 20,
      borderRadius: 12,
      maxHeight: "80%",
      width: "90%",
      maxWidth: 500,
      alignSelf: "center",
      elevation: 4,
      borderColor: colors.modalBorder,
      borderWidth: 1,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.modalText,
    },
    input: {
      marginBottom: 16,
      backgroundColor: colors.inputBackground,
      color: colors.modalText,
    },
    errorText: {
      color: colors.error,
      marginTop: -12,
      marginBottom: 12,
      marginLeft: 4,
      fontSize: 12,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
    },
    modalButton: {
      marginLeft: 8,
    },
    snackbar: {
      margin: 16,
      borderRadius: 8,
    },
    detailsContainer: {
      marginBottom: 16,
    },
    detailsLabel: {
      fontSize: 14,
      marginTop: 12,
      marginBottom: 4,
      color: colors.modalTextSecondary,
    },
    detailsValue: {
      fontSize: 16,
      marginBottom: 8,
      color: colors.modalText,
    },
    ordersListContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
    },
    orderItemContainer: {
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    orderItem: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.listText,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
          iconColor="#fff"
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
          icon="account-plus"
        >
          <Text style={styles.addButtonText}>Add New Customer</Text>
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
                <Text style={[styles.cell, { color: colors.onSurfaceVariant }]}>
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
                    onPress={() => {
                      handleViewOrders(customer);
                      setMenuVisible(null);
                    }}
                    title="View Orders"
                    leadingIcon="shopping"
                  />
                  <Menu.Item
                    onPress={() => {
                      handleEdit(customer);
                      setMenuVisible(null);
                    }}
                    title="Edit"
                    leadingIcon="pencil"
                  />
                  <Menu.Item
                    onPress={() => {
                      handleDelete(customer);
                      setMenuVisible(null);
                    }}
                    title="Delete"
                    leadingIcon="delete"
                    titleStyle={{ color: colors.error }}
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
            setIsAddModalVisible(false);
            resetForm();
          }}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>
              {isEditing ? "Edit Customer" : "Add New Customer"}
            </Text>
            <TextInput
              label="Name *"
              value={newCustomer.name}
              onChangeText={(text) => {
                setNewCustomer((prev) => ({ ...prev, name: text }));
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              style={styles.input}
              mode="outlined"
              error={!!errors.name}
              left={<TextInput.Icon icon="account" />}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            <TextInput
              label="Phone *"
              value={newCustomer.phone}
              onChangeText={(text) => {
                let digits = text.replace(/\D/g, "");
                if (digits.startsWith("0")) {
                  digits = digits.slice(0, 10);
                } else {
                  digits = digits.slice(0, 9);
                }
                setNewCustomer((prev) => ({ ...prev, phone: digits }));
                if (errors.phone)
                  setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              error={!!errors.phone}
              left={<TextInput.Icon icon="phone" />}
              placeholder="e.g. 0123456789 or 123456789"
              maxLength={10}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
            <TextInput
              label="Email (Optional)"
              value={newCustomer.email}
              onChangeText={(text) => {
                setNewCustomer((prev) => ({ ...prev, email: text }));
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" />}
              error={!!errors.email}
              placeholder="e.g. customer@example.com"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            <TextInput
              label="Address (Optional)"
              value={newCustomer.address}
              onChangeText={(text) =>
                setNewCustomer((prev) => ({ ...prev, address: text }))
              }
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="map-marker" />}
              placeholder="Enter customer's address"
            />
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setIsAddModalVisible(false);
                  resetForm();
                }}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddOrUpdate}
                style={styles.modalButton}
              >
                {isEditing ? "Save Changes" : "Add Customer"}
              </Button>
            </View>
          </ScrollView>
        </Modal>

        <Dialog
          visible={isDeleteDialogVisible}
          onDismiss={() => setIsDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Customer</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete this customer? This action cannot
              be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={confirmDelete} textColor="#FF0000">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        {selectedCustomer && (
          <Modal
            visible={!!selectedCustomer}
            onDismiss={() => setSelectedCustomer(null)}
            contentContainerStyle={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <ScrollView>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                Customer Details
              </Text>
              <View style={styles.detailsContainer}>
                <Text
                  style={[
                    styles.detailsLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Name
                </Text>
                <Text
                  style={[styles.detailsValue, { color: colors.onSurface }]}
                >
                  {selectedCustomer.name}
                </Text>

                <Text
                  style={[
                    styles.detailsLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Email
                </Text>
                <Text
                  style={[styles.detailsValue, { color: colors.onSurface }]}
                >
                  {selectedCustomer.email || "N/A"}
                </Text>

                <Text
                  style={[
                    styles.detailsLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Phone
                </Text>
                <Text
                  style={[styles.detailsValue, { color: colors.onSurface }]}
                >
                  {selectedCustomer.phone}
                </Text>

                <Text
                  style={[
                    styles.detailsLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Address
                </Text>
                <Text
                  style={[styles.detailsValue, { color: colors.onSurface }]}
                >
                  {selectedCustomer.address || "N/A"}
                </Text>

                <Text
                  style={[
                    styles.detailsLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Total Orders
                </Text>
                <Text
                  style={[styles.detailsValue, { color: colors.onSurface }]}
                >
                  {selectedCustomer.totalOrders}
                </Text>

                <Text
                  style={[
                    styles.detailsLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Recent Orders
                </Text>
                <View style={styles.ordersListContainer}>
                  {Array.from(
                    { length: selectedCustomer.totalOrders },
                    (_, i) => (
                      <View key={i} style={styles.orderItemContainer}>
                        <Text
                          style={[
                            styles.orderItem,
                            { color: colors.onSurface },
                          ]}
                        >
                          #{i + 1}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setSelectedCustomer(null)}
                  style={styles.modalButton}
                >
                  Close
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setSelectedCustomer(null);
                    router.push(`/orders?customerId=${selectedCustomer.id}`);
                  }}
                  style={styles.modalButton}
                >
                  View All Orders
                </Button>
              </View>
            </ScrollView>
          </Modal>
        )}
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
        }}
        style={[
          styles.snackbar,
          {
            backgroundColor:
              snackbarType === "error"
                ? "#FF0000"
                : snackbarType === "warning"
                ? "#FFA000"
                : "#4CAF50",
          },
        ]}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

export default CustomerManagementScreen;
