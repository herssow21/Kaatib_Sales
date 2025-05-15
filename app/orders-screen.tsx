import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Searchbar,
  IconButton,
  Portal,
  Modal,
  useTheme,
} from "react-native-paper";
import { useThemeContext } from "../contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: "pending" | "completed" | "cancelled";
  items: OrderItem[];
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export default function OrdersScreen() {
  const { theme, isDarkMode } = useThemeContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: "",
    items: [],
    status: "pending",
  });

  // ... existing functions ...

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: theme.colors.headerBackground,
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
      color: theme.colors.headerText,
    },
    subHeaderText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
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
      backgroundColor: theme.colors.buttonBackground,
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
      color: theme.colors.buttonText,
    },
    searchContainer: {
      padding: 16,
      paddingTop: 0,
    },
    searchInput: {
      backgroundColor: theme.colors.searchBackground,
      color: theme.colors.searchText,
    },
    orderList: {
      padding: 16,
    },
    orderCard: {
      marginBottom: 16,
      backgroundColor: theme.colors.listBackground,
      borderRadius: 8,
      elevation: 2,
      borderColor: theme.colors.listBorder,
      borderWidth: 1,
    },
    orderContent: {
      padding: 16,
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    orderNumber: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.listText,
    },
    orderStatus: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      fontSize: 14,
      fontWeight: "500",
    },
    orderDetails: {
      marginBottom: 12,
    },
    orderDetail: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.colors.listTextSecondary,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.listText,
    },
    orderItems: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      paddingTop: 12,
    },
    orderItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    itemName: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.listText,
    },
    itemQuantity: {
      fontSize: 14,
      color: theme.colors.listTextSecondary,
      marginHorizontal: 8,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.listText,
    },
    orderActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      paddingTop: 12,
    },
    actionButton: {
      marginLeft: 8,
    },
    modalContent: {
      backgroundColor: theme.colors.modalBackground,
      padding: 24,
      margin: 20,
      borderRadius: 12,
      maxHeight: "80%",
      width: "90%",
      maxWidth: 500,
      alignSelf: "center",
      elevation: 4,
      borderColor: theme.colors.modalBorder,
      borderWidth: 1,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: theme.colors.modalText,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.modalText,
    },
    errorText: {
      color: theme.colors.error,
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
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={{ color: theme.colors.onBackground }}
        >
          Orders Management
        </Text>
        <Button
          mode="contained"
          onPress={() => setIsAddModalVisible(true)}
          style={styles.addButton}
        >
          New Order
        </Button>
      </View>

      <Searchbar
        placeholder="Search orders..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[
          styles.searchBar,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
        iconColor={theme.colors.onSurfaceVariant}
        inputStyle={{ color: theme.colors.onSurfaceVariant }}
        placeholderTextColor={theme.colors.placeholder}
      />

      <ScrollView style={styles.orderList}>
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            style={[styles.orderCard, { backgroundColor: theme.colors.card }]}
          >
            <Card.Content>
              <View style={styles.orderHeader}>
                <View>
                  <Text
                    variant="titleMedium"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {order.customerName}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {order.date}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <IconButton
                    icon="eye"
                    size={20}
                    onPress={() => handleView(order)}
                    iconColor={theme.colors.primary}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(order.id)}
                    iconColor={theme.colors.error}
                  />
                </View>
              </View>
              <View style={styles.orderDetails}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Total: ${order.total.toFixed(2)}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.status,
                    {
                      color:
                        order.status === "completed"
                          ? theme.colors.primary
                          : order.status === "cancelled"
                          ? theme.colors.error
                          : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Add Order Modal */}
      <Portal>
        <Modal
          visible={isAddModalVisible}
          onDismiss={() => setIsAddModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.modalBackground },
          ]}
        >
          <Text
            variant="headlineSmall"
            style={[styles.modalTitle, { color: theme.colors.onSurface }]}
          >
            New Order
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.onSurface,
              },
            ]}
            placeholder="Customer Name"
            placeholderTextColor={theme.colors.placeholder}
            value={newOrder.customerName}
            onChangeText={(text) =>
              setNewOrder({ ...newOrder, customerName: text })
            }
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setIsAddModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddOrder}
              style={styles.modalButton}
            >
              Add
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* View Order Modal */}
      <Portal>
        <Modal
          visible={isViewModalVisible}
          onDismiss={() => setIsViewModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.modalBackground },
          ]}
        >
          {selectedOrder && (
            <>
              <Text
                variant="headlineSmall"
                style={[styles.modalTitle, { color: theme.colors.onSurface }]}
              >
                Order Details
              </Text>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface, marginBottom: 8 }}
              >
                {selectedOrder.customerName}
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 16,
                }}
              >
                {selectedOrder.date}
              </Text>
              <View style={styles.itemsList}>
                {selectedOrder.items.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.itemRow,
                      { borderBottomColor: theme.colors.divider },
                    ]}
                  >
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.onSurface }}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.itemDetails}>
                      <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.onSurfaceVariant }}
                      >
                        {item.quantity} x ${item.price.toFixed(2)}
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.onSurface }}
                      >
                        ${(item.quantity * item.price).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.totalRow}>
                <Text
                  variant="titleMedium"
                  style={{ color: theme.colors.onSurface }}
                >
                  Total
                </Text>
                <Text
                  variant="titleMedium"
                  style={{ color: theme.colors.onSurface }}
                >
                  ${selectedOrder.total.toFixed(2)}
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={() => setIsViewModalVisible(false)}
                style={styles.modalButton}
              >
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}
