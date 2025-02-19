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
import { Text, Searchbar, FAB, useTheme, Button } from "react-native-paper";
import OrderForm from "../../components/OrderForm";
import { useCategoryContext } from "../../contexts/CategoryContext";
import { type Order } from "../types";
import { MaterialIcons } from "@expo/vector-icons";

export default function Orders() {
  const theme = useTheme();
  const { categories } = useCategoryContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("today");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastOrderNumber, setLastOrderNumber] = useState(1);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Platform.OS === "ios" ? 16 : 8,
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: "#e0e0e0",
    },
    modalContainer: {
      backgroundColor: "white",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#E03F3E",
      margin: 16,
      maxWidth: "99%",
      alignSelf: "center",
      minHeight: "50%",
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
      margin: 16,
      borderRadius: 8,
      backgroundColor: "white",
      elevation: 2,
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
  });

  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((order) => order.category === categoryFilter);
    }

    const now = new Date();
    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.orderDate);
      switch (timeFilter) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return orderDate >= weekAgo;
        case "month":
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        case "year":
          return orderDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.clientContact.toString().includes(searchQuery) ||
          order.id.includes(searchQuery)
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
    console.log("View details for order:", order);
    // You can add a modal or navigate to a details screen here
  };

  return (
    <View style={styles.container as ViewStyle}>
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
          <Text style={[styles.headerCell, { flex: 0.8 }]}>Payment Status</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Option</Text>
        </View>
        <ScrollView style={styles.tableScrollView}>
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
                        <MaterialIcons
                          name="delete"
                          size={20}
                          color="#e74c3c"
                        />
                      )}
                      children={""}
                    />
                  </View>
                </View>
              </View>
            )}
          />
        </ScrollView>
        <View style={styles.tableFooter}>
          <Text>
            Showing {getFilteredOrders().length} of {orders.length} orders
          </Text>
        </View>
      </View>
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setFormVisible(true)}
        label="Add Order"
      />
    </View>
  );
}
