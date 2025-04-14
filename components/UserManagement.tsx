import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import {
  TextInput,
  Text,
  IconButton,
  Menu,
  useTheme,
  Button,
  Divider,
  Portal,
  Modal,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
}

interface NewCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const UserManagement: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const router = useRouter();

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
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email) {
      const newId = Math.max(...customers.map((c) => c.id)) + 1;
      setCustomers([
        ...customers,
        {
          ...newCustomer,
          id: newId,
          totalOrders: 0,
        },
      ]);
      setNewCustomer({ name: "", email: "", phone: "", address: "" });
      setIsAddModalVisible(false);
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
      borderBottomColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceVariant,
    },
    headerCell: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    scrollView: {
      flex: 1,
      ...(Platform.OS === "web" && {
        height: 500,
      }),
    },
    row: {
      flexDirection: "row",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surface,
    },
    cell: {
      color: theme.colors.onSurface,
      fontSize: 14,
    },
    nameCell: {
      flex: 2,
      minWidth: 120,
    },
    contactCell: {
      flex: 2,
      minWidth: 160,
    },
    addressCell: {
      flex: 3,
      minWidth: 200,
    },
    ordersCell: {
      flex: 1,
      minWidth: 80,
      alignItems: "center",
    },
    actionsCell: {
      flex: 1,
      minWidth: 80,
      alignItems: "flex-end",
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surface,
    },
    footerText: {
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      margin: 20,
      borderRadius: 8,
      maxWidth: Platform.OS === "web" ? 400 : undefined,
      alignSelf: "center",
      width: "90%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.background,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
      gap: 8,
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
                <Text style={styles.cell}>{customer.email}</Text>
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
                <Text style={styles.cell}>{customer.address}</Text>
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
                      console.log("View details", customer.id);
                      setMenuVisible(null);
                    }}
                    title="View details"
                    leadingIcon="eye"
                  />
                  <Menu.Item
                    onPress={() => {
                      console.log("Edit customer", customer.id);
                      setMenuVisible(null);
                    }}
                    title="Edit customer"
                    leadingIcon="pencil"
                  />
                  <Menu.Item
                    onPress={() => {
                      console.log("View orders", customer.id);
                      setMenuVisible(null);
                    }}
                    title="View orders"
                    leadingIcon="shopping"
                  />
                  <Divider />
                  <Menu.Item
                    onPress={() => {
                      console.log("Delete customer", customer.id);
                      setMenuVisible(null);
                    }}
                    title="Delete customer"
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
          onDismiss={() => setIsAddModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Add New Customer</Text>
          <TextInput
            label="Name"
            value={newCustomer.name}
            onChangeText={(text) =>
              setNewCustomer({ ...newCustomer, name: text })
            }
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={newCustomer.email}
            onChangeText={(text) =>
              setNewCustomer({ ...newCustomer, email: text })
            }
            style={styles.input}
            keyboardType="email-address"
          />
          <TextInput
            label="Phone"
            value={newCustomer.phone}
            onChangeText={(text) =>
              setNewCustomer({ ...newCustomer, phone: text })
            }
            style={styles.input}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Address"
            value={newCustomer.address}
            onChangeText={(text) =>
              setNewCustomer({ ...newCustomer, address: text })
            }
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setIsAddModalVisible(false)}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddCustomer}
              disabled={!newCustomer.name || !newCustomer.email}
            >
              Add Customer
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default UserManagement;
