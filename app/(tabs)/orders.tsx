import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Text, Searchbar, FAB, useTheme, Button } from "react-native-paper";
import OrderForm from "../../components/OrderForm";
import { useCategoryContext } from "../../contexts/CategoryContext";
import { type Order } from "../types";

export default function Orders() {
  const theme = useTheme();
  const { categories } = useCategoryContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("today");

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

  return (
    <View style={styles.container}>
      <Modal visible={isFormVisible} animationType="slide" transparent={true}>
        <ScrollView>
          <View style={styles.modalContainer}>
            <OrderForm
              onSubmit={(order) => {
                setOrders((prev) => [
                  ...prev,
                  {
                    ...order,
                    id: Date.now().toString(),
                    totalOrderItems: order.items.length,
                    paymentStatus:
                      order.status === "Completed"
                        ? "Full Payment"
                        : "No Payment",
                    category: "clothing",
                  },
                ]);
                setFormVisible(false);
              }}
              onClose={() => setFormVisible(false)}
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

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 1 }]}>Order No.</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Order Date</Text>
          <Text style={[styles.headerCell, { flex: 1.2 }]}>Client Name</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Contact</Text>
          <Text style={[styles.headerCell, { flex: 0.8 }]}>Items</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Payment Status</Text>
          <Text style={[styles.headerCell, { flex: 0.8 }]}>Option</Text>
        </View>

        <FlatList
          data={getFilteredOrders()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.id}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {new Date(item.orderDate).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>
                {item.clientName}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {item.clientContact}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}>
                {item.totalOrderItems}
              </Text>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.paymentStatus === "Full Payment"
                          ? "#e6f4ea"
                          : "#fff3e0",
                    },
                  ]}
                >
                  {item.paymentStatus}
                </Text>
              </View>
              <View style={[styles.tableCell, { flex: 0.8 }]}>
                <Button mode="text" onPress={() => console.log("Action")}>
                  Action ▼
                </Button>
              </View>
            </View>
          )}
        />
      </View>
      <View style={styles.tableFooter}>
        <Text>
          Showing {getFilteredOrders().length} of {orders.length} orders
        </Text>
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
