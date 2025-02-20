import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Modal,
  FlatList,
  ViewStyle,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Text,
  Searchbar,
  FAB,
  useTheme,
  Button,
  Title,
  IconButton,
} from "react-native-paper";
import OrderForm from "../../components/OrderForm";
import { useCategoryContext } from "../../contexts/CategoryContext";
import { type Order } from "../types";
import { MaterialIcons } from "@expo/vector-icons";
import { useInventoryContext } from "../../contexts/InventoryContext";

export default function Orders() {
  const theme = useTheme();
  const { categories } = useCategoryContext();
  const { items: inventoryItems } = useInventoryContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState("today");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastOrderNumber, setLastOrderNumber] = useState(1);
  const [isDetailsVisible, setDetailsVisible] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<Order | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },
    header: {
      padding: 16,
      backgroundColor: theme.colors.primary,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    headerText: {
      fontWeight: "bold",
      fontSize: 24,
      color: theme.colors.onPrimary,
    },
    tableContainer: {
      margin: 16,
      borderRadius: 8,
      backgroundColor: "white",
      elevation: 2,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    headerCell: {
      flex: 1,
      color: theme.colors.onPrimary,
      fontWeight: "bold",
      textAlign: "center",
    },
    tableRow: {
      flexDirection: "row",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
    },
    tableCell: {
      flex: 1,
      textAlign: "center",
      color: "#666",
    },
    statusBadge: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
      alignSelf: "flex-start",
    },
    tableFooter: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: "#e0e0e0",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      padding: 16,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: 8,
      padding: 16,
      maxHeight: "90%",
    },
    filterPicker: {
      width: 160,
      height: 40,
      marginRight: 16,
      backgroundColor: "#f8f9fa",
      borderRadius: 8,
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: "white",
      borderRadius: 8,
      margin: 16,
    },
    filtersRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
    },
    searchbar: {
      width: "30%",
      marginLeft: 16,
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0,
    },
    tableWrapper: {
      flex: 1,
      backgroundColor: "white",
      borderRadius: 8,
      margin: 16,
      overflow: "hidden",
    },
    tableScrollView: {
      flexGrow: 1,
      maxHeight: "70%",
    },
    actionContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      justifyContent: "flex-end",
    },
    actionButton: {
      minWidth: 40,
      padding: 0,
    },
    actionIcon: {
      marginRight: 0,
    },
    filtersContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      gap: 16,
    },
    filterGroup: {
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    detailsSection: {
      marginVertical: 16,
      padding: 16,
      backgroundColor: "#f8f9fa",
      borderRadius: 8,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
    },
    detailsFooter: {
      marginTop: 16,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: "#e0e0e0",
    },
    grandTotal: {
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 8,
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 24,
      marginBottom: 16,
    },
    emptyState: {
      padding: 16,
      alignItems: "center",
    },
  });

  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (categoryFilter !== "all") {
      filtered = filtered.filter((order) =>
        order.items.some((item) => {
          const inventoryItem = inventoryItems.find(
            (inv) => inv.id === item.product
          );
          return inventoryItem?.category === categoryFilter;
        })
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.clientContact
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );
        case "name":
          return a.clientName.localeCompare(b.clientName);
        case "status":
          return a.status.localeCompare(b.status);
        case "paymentMode":
          return a.paymentMethod
            .toString()
            .localeCompare(b.paymentMethod.toString());
        default:
          return 0;
      }
    });
  };

  const formatOrderNumber = (num: number) => {
    return `ORD-${num.toString().padStart(4, "0")}`;
  };

  const handleEdit = (order: Order) => {
    setActiveDropdown(null);
    setSelectedOrder(order);
    setFormVisible(true);
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setActiveDropdown(null);
    }
  };

  const handlePrint = (order: Order) => {
    console.log("Printing order:", order);
    window.print();
    setActiveDropdown(null);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrderDetails(order);
    setDetailsVisible(true);
  };

  const calculateSubtotal = (
    items: Array<{
      quantity: number;
      rate: number;
    }>
  ) => {
    return (
      items?.reduce((sum, item) => sum + item.quantity * item.rate, 0) || 0
    );
  };

  const handleDownload = async (order: Order) => {
    // Implement PDF generation and download
    console.log("Downloading order:", order.id);
  };

  return (
    <View style={styles.container}>
      <Modal visible={isFormVisible} animationType="slide" transparent={true}>
        <ScrollView>
          <View style={styles.modalContainer as ViewStyle}>
            <OrderForm
              initialData={
                selectedOrder
                  ? {
                      orderDate: selectedOrder.orderDate.toString(),
                      clientName: selectedOrder.clientName,
                      clientContact: selectedOrder.clientContact.toString(),
                      address: selectedOrder.address || "",
                      items: selectedOrder.items || [],
                      discount: selectedOrder.discount || 0,
                      paymentMethod: selectedOrder.paymentMethod.toString(),
                      grandTotal: selectedOrder.grandTotal,
                      status: selectedOrder.status,
                      category: selectedOrder.category,
                    }
                  : undefined
              }
              onSubmit={(order) => {
                if (selectedOrder) {
                  setOrders((prev) =>
                    prev.map((o) =>
                      o.id === selectedOrder.id
                        ? {
                            ...order,
                            id: selectedOrder.id,
                            totalOrderItems: order.items.length,
                            paymentStatus:
                              order.status === "Completed"
                                ? "Full Payment"
                                : "No Payment",
                            category: order.category || "clothing",
                          }
                        : o
                    )
                  );
                } else {
                  const orderNumber = lastOrderNumber;
                  setOrders((prev) => [
                    ...prev,
                    {
                      ...order,
                      id: formatOrderNumber(orderNumber),
                      totalOrderItems: order.items.length,
                      paymentStatus:
                        order.status === "Completed"
                          ? "Full Payment"
                          : "No Payment",
                      category: order.category || "clothing",
                    },
                  ]);
                  setLastOrderNumber((prev) => prev + 1);
                }
                setFormVisible(false);
                setSelectedOrder(null);
              }}
              onClose={() => {
                setFormVisible(false);
                setSelectedOrder(null);
              }}
            />
            <Button mode="outlined" onPress={() => setFormVisible(false)}>
              Close
            </Button>
          </View>
        </ScrollView>
      </Modal>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Manage Orders
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filtersRow}>
          <Picker
            selectedValue={categoryFilter}
            onValueChange={setCategoryFilter}
            style={styles.filterPicker}
          >
            <Picker.Item label="All Categories" value="all" />
            {categories.map((category) => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={category.id}
              />
            ))}
          </Picker>

          <Picker
            selectedValue={sortBy}
            onValueChange={setSortBy}
            style={styles.filterPicker}
          >
            <Picker.Item label="Sort by Date" value="date" />
            <Picker.Item label="Sort by Name" value="name" />
            <Picker.Item label="Sort by Status" value="status" />
            <Picker.Item label="Sort by Payment Mode" value="paymentMode" />
            <Picker.Item label="Sort by Category" value="category" />
          </Picker>

          <Picker
            selectedValue={timeFilter}
            onValueChange={setTimeFilter}
            style={styles.filterPicker}
          >
            <Picker.Item label="Today" value="today" />
            <Picker.Item label="This Week" value="week" />
            <Picker.Item label="This Month" value="month" />
            <Picker.Item label="This Year" value="year" />
          </Picker>
        </View>
        <Searchbar
          placeholder="Search orders..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.tableWrapper}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 0.6 }]}>Order No.</Text>
          <Text style={[styles.headerCell, { flex: 0.8 }]}>Order Date</Text>
          <Text style={[styles.headerCell, { flex: 0.8 }]}>Client Name</Text>
          <Text style={[styles.headerCell, { flex: 0.8 }]}>Contact</Text>
          <Text style={[styles.headerCell, { flex: 0.4 }]}>Items</Text>
          <Text style={[styles.headerCell, { flex: 0.6 }]}>Mode</Text>
          <Text style={[styles.headerCell, { flex: 0.8 }]}>Payment Status</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Option</Text>
        </View>

        <FlatList
          data={getFilteredOrders()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.6 }]}>{item.id}</Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}>
                {new Date(item.orderDate).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}>
                {item.clientName}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}>
                {item.clientContact}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.4 }]}>
                {item.totalOrderItems}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.6 }]}>
                {item.paymentMethod}
              </Text>
              <View style={[styles.tableCell, { flex: 0.8 }]}>
                <Text
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.paymentStatus === "Full Payment"
                          ? "#e6f4ea"
                          : "#fff3e0",
                      color:
                        item.paymentStatus === "Full Payment"
                          ? "#34a853"
                          : "#f57c00",
                    },
                  ]}
                >
                  {item.paymentStatus}
                </Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <View style={styles.actionContainer}>
                  <Button
                    mode="text"
                    onPress={() => handleEdit(item)}
                    style={styles.actionButton}
                    icon={({ size, color }) => (
                      <MaterialIcons name="edit" size={20} color="#2c3e50" />
                    )}
                    children={""}
                  />
                  <Button
                    mode="text"
                    onPress={() => handlePrint(item)}
                    style={styles.actionButton}
                    icon={({ size, color }) => (
                      <MaterialIcons name="print" size={20} color="#2c3e50" />
                    )}
                    children={""}
                  />
                  <Button
                    mode="text"
                    onPress={() => handleViewDetails(item)}
                    style={styles.actionButton}
                    icon={({ size, color }) => (
                      <MaterialIcons
                        name="visibility"
                        size={20}
                        color="#2c3e50"
                      />
                    )}
                    children={""}
                  />
                  <Button
                    mode="text"
                    onPress={() => handleDelete(item.id)}
                    style={styles.actionButton}
                    icon={({ size, color }) => (
                      <MaterialIcons name="delete" size={20} color="#e74c3c" />
                    )}
                    children={""}
                  />
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text>No orders found</Text>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={styles.tableFooter}>
              <Text>
                Showing {getFilteredOrders().length} of {orders.length} orders
              </Text>
            </View>
          )}
        />
      </View>
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setFormVisible(true)}
        label="Add Order"
      />

      {selectedOrderDetails && (
        <Modal
          visible={isDetailsVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDetailsVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Title>Order Details - {selectedOrderDetails.id}</Title>
                <IconButton
                  icon="close"
                  onPress={() => setDetailsVisible(false)}
                />
              </View>

              <FlatList
                data={[selectedOrderDetails]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <>
                    <View style={styles.detailsSection}>
                      <Title>Customer Information</Title>
                      <Text>Name: {item.clientName}</Text>
                      <Text>Contact: {item.clientContact}</Text>
                      <Text>Address: {item.address}</Text>
                    </View>

                    <View style={styles.detailsSection}>
                      <Title>Order Information</Title>
                      <Text>
                        Date: {new Date(item.orderDate).toLocaleDateString()}
                      </Text>
                      <Text>Payment Method: {item.paymentMethod}</Text>
                      <Text>Payment Status: {item.paymentStatus}</Text>
                    </View>

                    <View style={styles.detailsSection}>
                      <Title>Items</Title>
                      {item.items.map((orderItem, index) => (
                        <View key={index} style={styles.itemRow}>
                          <Text>{orderItem.product}</Text>
                          <Text>Quantity: {orderItem.quantity}</Text>
                          <Text>Rate: {orderItem.rate}</Text>
                          <Text>
                            Total: {orderItem.quantity * orderItem.rate}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.detailsFooter}>
                      <Text>Subtotal: {calculateSubtotal(item.items)}</Text>
                      <Text>Discount: {item.discount}</Text>
                      <Text style={styles.grandTotal}>
                        Grand Total: {item.grandTotal}
                      </Text>
                    </View>

                    <View style={styles.actionButtons}>
                      <Button
                        mode="contained"
                        onPress={() => handlePrint(item)}
                        icon="printer"
                      >
                        Print Receipt
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleDownload(item)}
                        icon="download"
                      >
                        Download PDF
                      </Button>
                    </View>
                  </>
                )}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
