import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Modal,
  FlatList,
  ViewStyle,
  Alert,
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
  Menu,
  SegmentedButtons,
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
  const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);

  const isMobile = Platform.OS === "android" || Platform.OS === "ios";

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
      borderBottomWidth: 2,
      borderBottomColor: "rgba(255,255,255,0.3)",
      borderStyle: "dotted",
    },
    headerCell: {
      flex: 1,
      color: theme.colors.onPrimary,
      fontWeight: "bold",
      textAlign: "center",
      borderRightWidth: 2,
      borderRightColor: "rgba(255,255,255,0.3)",
      borderStyle: "dotted",
      paddingHorizontal: 8,
    },
    tableRow: {
      flexDirection: "row",
      minHeight: 40,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
      borderStyle: "dotted",
    },
    tableCell: {
      flex: 1,
      padding: 8,
      textAlign: "center",
      color: "#666",
      justifyContent: "center",
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
    modalContainer: Platform.select({
      web: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      },
      android: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-start",
        paddingTop: 40,
      },
    }),
    modalContent: Platform.select({
      web: {
        width: "58%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        maxHeight: "90%",
      },
      android: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        height: "95%",
      },
    }),
    closeButton: {
      position: "absolute",
      right: 10,
      top: 10,
      zIndex: 1,
    },
    closeIcon: {
      backgroundColor: "#ff3b30",
      borderRadius: 20,
      padding: 4,
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
    tableWrapper: Platform.select({
      web: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 8,
        margin: 16,
        overflow: "hidden",
      },
      android: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 2,
        marginBottom: 16,
        overflow: "hidden",
      },
    }),
    tableScrollView: {
      flexGrow: 1,
      maxHeight: "70%",
    },
    actionContainer: {
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 8,
      minWidth: 160,
      borderLeftWidth: 2,
      borderLeftColor: "#ddd",
      borderStyle: "dotted",
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
      gap: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyState: {
      padding: 16,
      alignItems: "center",
    },
    mobileTableRow: {
      flexDirection: "row",
      backgroundColor: "white",
      borderBottomWidth: 2,
      borderBottomColor: "#ddd",
      borderStyle: "dotted",
      minHeight: 48,
    },
    mobileCell: {
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    mobileLabel: {
      fontSize: 12,
      color: "#666",
      marginBottom: 4,
    },
    mobileValue: {
      fontSize: 14,
      color: "#333",
      marginBottom: 8,
    },
    mobileHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    mobileActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: "#e0e0e0",
      paddingTop: 8,
    },
    mobileFilters: {
      padding: 16,
      gap: 8,
    },
    mobileSearchbar: {
      marginBottom: 8,
    },
    mobileFilterRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    mobileTableHeader: {
      flexDirection: "row",
      backgroundColor: theme.colors.primary,
      borderBottomWidth: 2,
      borderBottomColor: "rgba(255,255,255,0.3)",
      borderStyle: "dotted",
    },
    mobileHeaderCell: {
      padding: 12,
      color: theme.colors.onPrimary,
      fontWeight: "bold",
      textAlign: "center",
      borderRightWidth: 2,
      borderRightColor: "rgba(255,255,255,0.3)",
      borderStyle: "dotted",
    },
    mobileTableCell: {
      padding: 8,
      textAlign: "center",
      borderRightWidth: 2,
      borderRightColor: "#ddd",
      borderStyle: "dotted",
      justifyContent: "center",
    },
    statusContainer: {
      width: 160,
      padding: 8,
      borderRightWidth: 2,
      borderRightColor: "#ddd",
      borderStyle: "dotted",
      alignItems: "center",
      justifyContent: "center",
    },
    actionsContainer: {
      width: 160,
      padding: 8,
      borderRightWidth: 1,
      borderRightColor: "#ddd",
      borderStyle: "dotted",
    },
    mobileTableContainer: {
      minWidth: 980,
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
    return `ORD-${String(num).padStart(3, "0")}`;
  };

  const handleEdit = (order: Order) => {
    setActiveDropdown(null);
    setSelectedOrder(order);
    setFormVisible(true);
  };

  const handleDelete = (orderId: string) => {
    const confirmDelete = () => {
      try {
        setOrders(orders.filter((order) => order.id !== orderId));
      } catch (error) {
        console.error("Error deleting order:", error);
        Alert.alert("Error", "Failed to delete order");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this order?")) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Order",
        "Are you sure you want to delete this order?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: confirmDelete,
            style: "destructive",
          },
        ]
      );
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

  const handleFormClose = () => {
    setFormVisible(false);
    setSelectedOrder(null);
  };

  const handleFormSubmit = (orderData: Partial<Order>) => {
    try {
      const newOrder: Order = {
        id: selectedOrder?.id || formatOrderNumber(orders.length + 1),
        clientName: orderData.clientName || "",
        clientContact: orderData.clientContact || "",
        address: orderData.address || "",
        orderDate: orderData.orderDate || new Date().toISOString(),
        paymentMethod: orderData.paymentMethod || "Cash",
        paymentStatus: orderData.paymentStatus || "Pending",
        items: orderData.items || [],
        discount: orderData.discount || 0,
        totalOrderItems:
          orderData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        grandTotal: calculateGrandTotal(
          orderData.items || [],
          orderData.discount || 0
        ),
        status: orderData.paymentStatus || "Pending",
        category: orderData.category || "default",
      };

      if (selectedOrder) {
        // Update existing order
        setOrders(
          orders.map((order) =>
            order.id === selectedOrder.id ? newOrder : order
          )
        );
      } else {
        // Add new order
        setOrders([newOrder, ...orders]);
      }

      setFormVisible(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error submitting order:", error);
      Alert.alert("Error", "Failed to save order");
    }
  };

  // Helper function for grand total calculation
  const calculateGrandTotal = (items: Order["items"], discount: number) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    return subtotal - (discount || 0);
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isFormVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <IconButton
              icon="close"
              iconColor="white"
              style={[styles.closeButton, styles.closeIcon]}
              onPress={() => setFormVisible(false)}
            />
            <OrderForm
              onSubmit={handleFormSubmit}
              onClose={() => setFormVisible(false)}
              initialData={selectedOrder}
            />
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Manage Orders
        </Text>
      </View>

      {isMobile ? (
        <View style={styles.mobileFilters}>
          <Searchbar
            placeholder="Search orders..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.mobileSearchbar}
          />
          <View style={styles.mobileFilterRow}>
            <Menu
              visible={isCategoryMenuVisible}
              onDismiss={() => setIsCategoryMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setIsCategoryMenuVisible(true)}
                >
                  {categoryFilter === "all" ? "All Categories" : "Category"}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setCategoryFilter("all");
                  setIsCategoryMenuVisible(false);
                }}
                title="All Categories"
              />
              {categories.map((cat) => (
                <Menu.Item
                  key={cat.id}
                  onPress={() => {
                    setCategoryFilter(cat.id);
                    setIsCategoryMenuVisible(false);
                  }}
                  title={cat.name}
                />
              ))}
            </Menu>
            <SegmentedButtons
              value={timeFilter}
              onValueChange={setTimeFilter}
              buttons={[
                { value: "today", label: "Today" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
              ]}
            />
          </View>
        </View>
      ) : (
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
      )}

      {isMobile ? (
        <View style={styles.tableWrapper}>
          <ScrollView horizontal>
            <View style={styles.mobileTableContainer}>
              <FlatList
                data={getFilteredOrders()}
                keyExtractor={(item) => item.id}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={() => (
                  <View style={styles.mobileTableHeader}>
                    <Text style={[styles.mobileHeaderCell, { width: 100 }]}>
                      Order No.
                    </Text>
                    <Text style={[styles.mobileHeaderCell, { width: 100 }]}>
                      Date
                    </Text>
                    <Text style={[styles.mobileHeaderCell, { width: 140 }]}>
                      Client
                    </Text>
                    <Text style={[styles.mobileHeaderCell, { width: 120 }]}>
                      Contact
                    </Text>
                    <Text style={[styles.mobileHeaderCell, { width: 80 }]}>
                      Items
                    </Text>
                    <Text style={[styles.mobileHeaderCell, { width: 100 }]}>
                      Mode
                    </Text>
                    <Text style={[styles.mobileHeaderCell, { width: 160 }]}>
                      Payment Status
                    </Text>
                    <Text style={[styles.mobileHeaderCell, { width: 200 }]}>
                      Actions
                    </Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <View style={styles.mobileTableRow}>
                    <Text style={[styles.mobileTableCell, { width: 100 }]}>
                      {item.id}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 100 }]}>
                      {new Date(item.orderDate).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 140 }]}>
                      {item.clientName}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 120 }]}>
                      {item.clientContact}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 80 }]}>
                      {item.totalOrderItems}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 100 }]}>
                      {item.paymentMethod}
                    </Text>
                    <View style={styles.statusContainer}>
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
                    <View style={styles.actionsContainer}>
                      <View style={styles.actionButtons}>
                        <IconButton
                          icon="eye"
                          size={20}
                          onPress={() => handleViewDetails(item)}
                        />
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => handleEdit(item)}
                        />
                        <IconButton
                          icon="printer"
                          size={20}
                          onPress={() => handlePrint(item)}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          iconColor="#e74c3c"
                          onPress={() => handleDelete(item.id)}
                        />
                      </View>
                    </View>
                  </View>
                )}
                ListFooterComponent={() => (
                  <View style={styles.tableFooter}>
                    <Text>
                      Showing {getFilteredOrders().length} of {orders.length}{" "}
                      orders
                    </Text>
                  </View>
                )}
              />
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 0.6 }]}>Order No.</Text>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>Order Date</Text>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>Client Name</Text>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>Contact</Text>
            <Text style={[styles.headerCell, { flex: 0.4 }]}>Items</Text>
            <Text style={[styles.headerCell, { flex: 0.6 }]}>Mode</Text>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>
              Payment Status
            </Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Actions</Text>
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
                    <IconButton
                      icon="eye"
                      size={20}
                      onPress={() => handleViewDetails(item)}
                    />
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEdit(item)}
                    />
                    <IconButton
                      icon="printer"
                      size={20}
                      onPress={() => handlePrint(item)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor="#e74c3c"
                      onPress={() => handleDelete(item.id)}
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
      )}
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
              <IconButton
                icon="close"
                iconColor="white"
                style={[styles.closeButton, styles.closeIcon]}
                onPress={() => setDetailsVisible(false)}
              />
              <View style={styles.modalHeader}>
                <Title>Order Details - {selectedOrderDetails.id}</Title>
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
