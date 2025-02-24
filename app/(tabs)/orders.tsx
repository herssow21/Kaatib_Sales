import React, { useState, useMemo } from "react";
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isTimeMenuVisible, setTimeMenuVisible] = useState(false);
  const [isSortMenuVisible, setSortMenuVisible] = useState(false);

  const isMobile = Platform.OS === "android" || Platform.OS === "ios";

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return {
          backgroundColor: "#dcfce7",
          color: "#166534",
          borderColor: "#86efac",
        };
      case "Partial":
        return {
          backgroundColor: "#fff7ed",
          color: "#9a3412",
          borderColor: "#fdba74",
        };
      default:
        return {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        };
    }
  };

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
      paddingVertical: 8,
      paddingHorizontal: 8,
      width: "100%",
    },
    headerCell: {
      color: theme.colors.onPrimary,
      fontSize: 13,
      fontWeight: "600",
      textAlign: "left",
      paddingHorizontal: 6,
      borderRightWidth: 2,
      borderRightColor: "rgba(255,255,255,0.3)",
      borderStyle: "dotted",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      paddingVertical: 2,
      paddingHorizontal: 8,
      alignItems: "center",
      backgroundColor: "white",
      width: "100%",
    },
    tableCell: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      justifyContent: "center",
      borderRightWidth: 2,
      borderRightColor: "#ddd",
      borderStyle: "dotted",
    },
    tableCellText: {
      fontSize: 13,
      color: "#374151",
    },
    statusBadge: {
      paddingHorizontal: 4,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
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
      justifyContent: "flex-end",
      gap: 4,
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
      gap: 2,
      justifyContent: "flex-start",
    },
    emptyState: {
      padding: 16,
      alignItems: "center",
    },
    mobileTableRow: {
      flexDirection: "row",
      backgroundColor: "white",
      width: "100%",
      borderBottomWidth: 2,
      borderBottomColor: "#ddd",
      borderStyle: "dotted",
      minHeight: 40,
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
      width: "100%",
      borderBottomWidth: 2,
      borderBottomColor: "rgba(255,255,255,0.3)",
      borderStyle: "dotted",
    },
    mobileHeaderCell: {
      padding: 8,
      color: theme.colors.onPrimary,
      fontWeight: "bold",
      textAlign: "center",
      borderRightWidth: 2,
      borderRightColor: "rgba(255,255,255,0.3)",
      borderStyle: "dotted",
    },
    mobileTableCell: {
      padding: 4,
      textAlign: "center",
      borderRightWidth: 2,
      borderRightColor: "#ddd",
      borderStyle: "dotted",
      justifyContent: "center",
    },
    statusContainer: {
      width: 100,
      padding: 8,
      borderRightWidth: 2,
      borderRightColor: "#ddd",
      borderStyle: "dotted",
    },
    actionsCell: {
      width: "16%",
      borderRightWidth: 0,
      paddingRight: 8,
      paddingLeft: 8,
    },
    mobileTableContainer: {
      minWidth: 980,
      width: "100%",
    },
    filterButton: {
      height: 40,
      justifyContent: "center",
    },
    webFilters: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
      height: 48,
    },
    sortButton: {
      marginVertical: 8,
    },
    orderNoCell: { width: "10%" },
    categoryCell: { width: "10%", alignItems: "center" },
    dateCell: { width: "10%" },
    clientCell: { width: "15%" },
    contactCell: { width: "11%" },
    itemsCell: { width: "8%", alignItems: "center" },
    modeCell: { width: "7%" },
    statusCell: { width: "13%" },
  });

  const getFilteredOrders = () => {
    let filtered = [...orders];

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((order) =>
        order.items.some((orderItem) => {
          const inventoryItem = inventoryItems.find(
            (invItem) =>
              invItem.name.toLowerCase() === orderItem.product.toLowerCase()
          );
          return (
            inventoryItem?.category.toLowerCase() ===
            selectedCategory.toLowerCase()
          );
        })
      );
    }

    // Apply search filter first - this should search through ALL orders
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.clientName.toLowerCase().includes(query) ||
          order.clientContact.toLowerCase().includes(query)
      );
    } else {
      // Only apply time filter if there's no search query
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate);
        switch (timeFilter) {
          case "today":
            return orderDate >= startOfDay;
          case "week":
            return orderDate >= startOfWeek;
          case "month":
            return orderDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );
        case "name":
          return a.clientName.localeCompare(b.clientName);
        case "status":
          return a.paymentStatus.localeCompare(b.paymentStatus);
        case "paymentMode":
          return a.paymentMethod.localeCompare(b.paymentMethod);
        case "category":
          const getCategoryString = (order) => {
            return order.items
              .map((item) => {
                const inventoryItem = inventoryItems.find(
                  (inv) => inv.name.toLowerCase() === item.product.toLowerCase()
                );
                return inventoryItem?.category || "";
              })
              .filter(Boolean)
              .join(",");
          };
          return getCategoryString(a).localeCompare(getCategoryString(b));
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

  const getCategoryIcon = (order: Order) => {
    const categories = order.items
      .map((item) => {
        const inventoryItem = inventoryItems.find(
          (inv) => inv.name.toLowerCase() === item.product.toLowerCase()
        );
        return inventoryItem?.category || "";
      })
      .filter(Boolean);

    const uniqueCategories = [...new Set(categories)];

    if (uniqueCategories.length === 0) {
      return (
        <Text style={{ color: "#666", fontSize: 14, textAlign: "center" }}>
          -
        </Text>
      );
    }

    return (
      <View style={{ flexDirection: "row", gap: 4, justifyContent: "center" }}>
        {uniqueCategories.map((category, index) => {
          const letter = category.charAt(0).toUpperCase();
          const colors = {
            N: { bg: "#e3f2fd", text: "#1565c0" }, // Normal
            E: { bg: "#fce7f3", text: "#9d174d" }, // Express
          };
          const colorSet = colors[letter] || { bg: "#f3f4f6", text: "#4b5563" };

          return (
            <Text
              key={index}
              style={{
                backgroundColor: colorSet.bg,
                color: colorSet.text,
                fontSize: Platform.OS === "android" ? 12 : 14,
                fontWeight: "600",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                textAlign: "center",
                minWidth: 28,
                elevation: Platform.OS === "android" ? 2 : 0,
              }}
            >
              {letter}
            </Text>
          );
        })}
      </View>
    );
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((order) =>
        order.items.some((orderItem) => {
          const inventoryItem = inventoryItems.find(
            (invItem) =>
              invItem.name.toLowerCase() === orderItem.product.toLowerCase()
          );
          return (
            inventoryItem?.category.toLowerCase() ===
            selectedCategory.toLowerCase()
          );
        })
      );
    }

    // Apply other filters (time, search, etc.)
    if (timeFilter !== "all") {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate);
        switch (timeFilter) {
          case "today":
            return orderDate >= startOfDay;
          case "week":
            return orderDate >= startOfWeek;
          case "month":
            return orderDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.clientName.toLowerCase().includes(query) ||
          order.clientContact.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [orders, selectedCategory, timeFilter, searchQuery, inventoryItems]);

  // Add "All Orders" option to time period picker
  const timePeriods = [
    { label: "All Orders", value: "all" },
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
  ];

  const getSortedOrders = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return sortOrder === "desc"
            ? new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
            : new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();

        case "name":
          return sortOrder === "desc"
            ? b.clientName.localeCompare(a.clientName)
            : a.clientName.localeCompare(b.clientName);

        case "status":
          return sortOrder === "desc"
            ? b.paymentStatus.localeCompare(a.paymentStatus)
            : a.paymentStatus.localeCompare(b.paymentStatus);

        case "paymentMode":
          return sortOrder === "desc"
            ? b.paymentMethod.localeCompare(a.paymentMethod)
            : a.paymentMethod.localeCompare(b.paymentMethod);

        case "category":
          const getCategoryString = (order: Order) => {
            return order.items
              .map((item) => {
                const inventoryItem = inventoryItems.find(
                  (inv) => inv.name.toLowerCase() === item.product.toLowerCase()
                );
                return inventoryItem?.category || "";
              })
              .filter(Boolean)
              .join(",");
          };
          const categoryA = getCategoryString(a);
          const categoryB = getCategoryString(b);
          return sortOrder === "desc"
            ? categoryB.localeCompare(categoryA)
            : categoryA.localeCompare(categoryB);

        default:
          return 0;
      }
    });
  };

  const displayOrders = getSortedOrders(filteredOrders);

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
                  {selectedCategory === "all" ? "All Categories" : "Category"}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setSelectedCategory("all");
                  setIsCategoryMenuVisible(false);
                }}
                title="All Categories"
              />
              {categories.map((category) => (
                <Menu.Item
                  key={category.id}
                  onPress={() => {
                    setSelectedCategory(category.name);
                    setIsCategoryMenuVisible(false);
                  }}
                  title={category.name}
                />
              ))}
            </Menu>
            <Menu
              visible={isTimeMenuVisible}
              onDismiss={() => setTimeMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setTimeMenuVisible(true)}
                  style={styles.filterButton}
                >
                  {timePeriods.find((p) => p.value === timeFilter)?.label ||
                    "Select Period"}
                </Button>
              }
            >
              {timePeriods.map((period) => (
                <Menu.Item
                  key={period.value}
                  onPress={() => {
                    setTimeFilter(period.value);
                    setTimeMenuVisible(false);
                  }}
                  title={period.label}
                />
              ))}
            </Menu>
          </View>
        </View>
      ) : (
        <View style={styles.filterContainer}>
          <View style={styles.filtersRow}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
              style={styles.filterPicker}
            >
              <Picker.Item label="All Categories" value="all" />
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.name}
                />
              ))}
            </Picker>

            {Platform.OS === "web" ? (
              <View style={styles.webFilters}>
                <Picker
                  selectedValue={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                  style={styles.filterPicker}
                >
                  <Picker.Item label="Sort by Date" value="date" />
                  <Picker.Item label="Sort by Name" value="name" />
                  <Picker.Item label="Sort by Status" value="status" />
                  <Picker.Item
                    label="Sort by Payment Mode"
                    value="paymentMode"
                  />
                  <Picker.Item label="Sort by Category" value="category" />
                </Picker>
                <IconButton
                  icon={
                    sortOrder === "desc" ? "sort-descending" : "sort-ascending"
                  }
                  onPress={() =>
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                  }
                />
              </View>
            ) : (
              <Menu
                visible={isSortMenuVisible}
                onDismiss={() => setSortMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setSortMenuVisible(true)}
                    style={styles.sortButton}
                  >
                    {`Sort by ${
                      sortBy.charAt(0).toUpperCase() + sortBy.slice(1)
                    }`}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setSortBy("date");
                    setSortMenuVisible(false);
                  }}
                  title="Sort by Date"
                />
                <Menu.Item
                  onPress={() => {
                    setSortBy("name");
                    setSortMenuVisible(false);
                  }}
                  title="Sort by Name"
                />
                <Menu.Item
                  onPress={() => {
                    setSortBy("status");
                    setSortMenuVisible(false);
                  }}
                  title="Sort by Status"
                />
                <Menu.Item
                  onPress={() => {
                    setSortBy("paymentMode");
                    setSortMenuVisible(false);
                  }}
                  title="Sort by Payment Mode"
                />
                <Menu.Item
                  onPress={() => {
                    setSortBy("category");
                    setSortMenuVisible(false);
                  }}
                  title="Sort by Category"
                />
              </Menu>
            )}

            <Picker
              selectedValue={timeFilter}
              onValueChange={setTimeFilter}
              style={styles.filterPicker}
            >
              {timePeriods.map((period) => (
                <Picker.Item
                  key={period.value}
                  label={period.label}
                  value={period.value}
                />
              ))}
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
                data={displayOrders}
                keyExtractor={(item) => item.id}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={() => (
                  <View style={styles.mobileTableHeader}>
                    <Text style={[styles.mobileHeaderCell, { width: 100 }]}>
                      Order No.
                    </Text>
                    <Text style={[styles.mobileHeaderCell, { width: 100 }]}>
                      Category
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
                    <Text style={[styles.mobileHeaderCell, { width: 100 }]}>
                      Status
                    </Text>
                    <Text style={[styles.mobileHeaderCell, { width: 160 }]}>
                      Actions
                    </Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <View style={styles.mobileTableRow}>
                    <View style={[styles.mobileTableCell, { width: 100 }]}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={styles.tableCellText}>{item.id}</Text>
                      </View>
                    </View>
                    <View style={[styles.mobileTableCell, { width: 100 }]}>
                      <View style={{ flexDirection: "row", margin: 4 }}>
                        {getCategoryIcon(item)}
                      </View>
                    </View>
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
                    <View style={[styles.statusContainer, { width: 100 }]}>
                      <Text
                        style={[
                          styles.statusBadge,
                          getPaymentStatusStyle(item.paymentStatus),
                        ]}
                      >
                        {item.paymentStatus}
                      </Text>
                    </View>
                    <View style={styles.actionContainer}>
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
                      Showing {displayOrders.length} of {orders.length} orders
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
            <Text style={[styles.headerCell, styles.orderNoCell]}>
              Order No.
            </Text>
            <Text style={[styles.headerCell, styles.categoryCell]}>
              Category
            </Text>
            <Text style={[styles.headerCell, styles.dateCell]}>Date</Text>
            <Text style={[styles.headerCell, styles.clientCell]}>
              Client Name
            </Text>
            <Text style={[styles.headerCell, styles.contactCell]}>Contact</Text>
            <Text style={[styles.headerCell, styles.itemsCell]}>Items</Text>
            <Text style={[styles.headerCell, styles.modeCell]}>Mode</Text>
            <Text style={[styles.headerCell, styles.statusCell]}>Status</Text>
            <Text style={[styles.headerCell, styles.actionsCell]}>Actions</Text>
          </View>

          <FlatList
            data={displayOrders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.orderNoCell]}>
                  <Text style={styles.tableCellText}>{item.id}</Text>
                </View>
                <View style={[styles.tableCell, styles.categoryCell]}>
                  {getCategoryIcon(item)}
                </View>
                <View style={[styles.tableCell, styles.dateCell]}>
                  <Text style={styles.tableCellText}>
                    {new Date(item.orderDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.clientCell]}>
                  <Text style={styles.tableCellText} numberOfLines={1}>
                    {item.clientName}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.contactCell]}>
                  <Text style={styles.tableCellText} numberOfLines={1}>
                    {item.clientContact}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.itemsCell]}>
                  <Text style={styles.tableCellText}>
                    {item.totalOrderItems}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.modeCell]}>
                  <Text style={styles.tableCellText} numberOfLines={1}>
                    {item.paymentMethod}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.statusCell]}>
                  <Text
                    style={[
                      styles.statusBadge,
                      getPaymentStatusStyle(item.paymentStatus),
                    ]}
                  >
                    {item.paymentStatus}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.actionsCell]}>
                  <View style={styles.actionButtons}>
                    <IconButton
                      icon="eye"
                      size={18}
                      onPress={() => handleViewDetails(item)}
                    />
                    <IconButton
                      icon="pencil"
                      size={18}
                      onPress={() => handleEdit(item)}
                    />
                    <IconButton
                      icon="printer"
                      size={18}
                      onPress={() => handlePrint(item)}
                    />
                    <IconButton
                      icon="delete"
                      size={18}
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
                  Showing {displayOrders.length} of {orders.length} orders
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
