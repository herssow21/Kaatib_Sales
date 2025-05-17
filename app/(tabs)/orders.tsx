import React, { useState, useMemo, useCallback } from "react";
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
import {
  Portal,
  Dialog,
  Text,
  Searchbar,
  FAB,
  useTheme,
  Button,
  Title,
  IconButton,
  Menu,
  SegmentedButtons,
  TextInput,
  DataTable,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import OrderForm from "../../components/OrderForm";
import { useCategoryContext } from "../../contexts/CategoryContext";
import { type Order } from "../types";
import { MaterialIcons } from "@expo/vector-icons";

import { useInventoryContext } from "../../contexts/InventoryContext";
import { useAlertContext } from "../../contexts/AlertContext";
import { printReceipt } from "../../utils/printReceipt";
import ThermalPrinter from "../../utils/ThermalPrinter";
import { useThemeContext } from "../../contexts/ThemeContext";

export default function Orders() {
  const { theme, isDarkMode } = useThemeContext
    ? useThemeContext()
    : { theme: useTheme(), isDarkMode: false };
  const colors = theme.colors as any;
  const { categories } = useCategoryContext();
  const {
    items: inventoryItems,
    updateItem,
    removeItem,
  } = useInventoryContext();
  const { showError, showWarning, showSuccess } = useAlertContext();
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
  const [printerConfig, setPrinterConfig] = useState({
    ip: "192.168.1.100",
    port: 9100,
    width: 48, // Default width for 58mm printer (32 or 48 chars per line)
  });
  const [isPrinterDialogVisible, setIsPrinterDialogVisible] = useState(false);

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
      backgroundColor: isDarkMode ? colors.background : "#f5f5f5",
    },
    header: {
      padding: 16,
      backgroundColor: isDarkMode
        ? colors.headerBackground
        : theme.colors.primary,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    headerText: {
      fontWeight: "bold",
      fontSize: 24,
      color: isDarkMode ? colors.headerText : theme.colors.onPrimary,
    },
    tableContainer: {
      borderRadius: 8,
      backgroundColor: isDarkMode ? colors.card : "white",
      elevation: 2,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: isDarkMode
        ? colors.headerBackground
        : theme.colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 8,
      width: "100%",
    },
    headerCell: {
      color: isDarkMode ? colors.headerText : theme.colors.onPrimary,
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
      borderBottomColor: isDarkMode ? colors.divider : "#e5e7eb",
      paddingVertical: 2,
      paddingHorizontal: 8,
      alignItems: "center",
      backgroundColor: isDarkMode ? colors.background : "white",
      width: "100%",
    },
    tableCell: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      justifyContent: "center",
      borderRightWidth: 2,
      borderRightColor: isDarkMode ? colors.divider : "#ddd",
      borderStyle: "dotted",
    },
    tableCellText: {
      fontSize: 13,
      color: isDarkMode ? "#fff" : "#374151",
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
      borderTopColor: isDarkMode ? colors.divider : "#e0e0e0",
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
        backgroundColor: isDarkMode ? colors.modalBackground : "white",
        borderRadius: 20,
        padding: 20,
        maxHeight: "90%",
      },
      android: {
        backgroundColor: isDarkMode ? colors.modalBackground : "white",
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
      backgroundColor: isDarkMode ? colors.background : "#f8f9fa",
      borderRadius: 8,
      color: isDarkMode ? "#fff" : "#222",
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: isDarkMode ? colors.background : "white",
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
      backgroundColor: isDarkMode ? colors.surfaceVariant : "#fff",
      color: isDarkMode ? "#fff" : "#222",
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
        backgroundColor: isDarkMode ? colors.card : "white",
        borderRadius: 8,
        margin: 16,
        overflow: "hidden",
      },
      android: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.card : "white",
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
      backgroundColor: isDarkMode ? colors.card : "#f8f9fa",
      borderRadius: 8,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? colors.divider : "#e0e0e0",
    },
    detailsFooter: {
      marginTop: 16,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? colors.divider : "#e0e0e0",
    },
    grandTotal: {
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 8,
      color: isDarkMode ? "#fff" : "#222",
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
      backgroundColor: isDarkMode ? colors.card : "white",
      width: "100%",
      borderBottomWidth: 2,
      borderBottomColor: isDarkMode ? colors.divider : "#ddd",
      borderStyle: "dotted",
      minHeight: 40,
    },
    mobileCell: {
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    mobileLabel: {
      fontSize: 12,
      color: isDarkMode ? "#fff" : "#666",
      marginBottom: 4,
    },
    mobileValue: {
      fontSize: 14,
      color: isDarkMode ? "#fff" : "#333",
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
      borderTopColor: isDarkMode ? colors.divider : "#e0e0e0",
      paddingTop: 8,
    },
    mobileFilters: {
      padding: 16,
      gap: 8,
    },
    mobileSearchbar: {
      marginBottom: 8,
      backgroundColor: isDarkMode ? colors.surfaceVariant : "#fff",
      color: isDarkMode ? "#fff" : "#222",
    },
    mobileFilterRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    mobileTableHeader: {
      flexDirection: "row",
      backgroundColor: isDarkMode
        ? colors.headerBackground
        : theme.colors.primary,
      width: "100%",
      borderBottomWidth: 2,
      borderBottomColor: "rgba(255,255,255,0.3)",
      borderStyle: "dotted",
    },
    mobileHeaderCell: {
      padding: 8,
      color: isDarkMode ? colors.headerText : theme.colors.onPrimary,
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
      borderRightColor: isDarkMode ? colors.divider : "#ddd",
      borderStyle: "dotted",
      justifyContent: "center",
    },
    statusContainer: {
      width: 100,
      padding: 8,
      borderRightWidth: 2,
      borderRightColor: isDarkMode ? colors.divider : "#ddd",
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
      backgroundColor: isDarkMode ? colors.background : "#fff",
      borderColor: isDarkMode ? "#fff" : "#e0e0e0",
      borderWidth: 1,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 6,
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
        showError("Failed to delete order");
      }
    };

    showWarning(
      "Are you sure you want to delete this order?",
      "Delete",
      confirmDelete
    );
  };

  const handlePrint = useCallback(
    async (order: Order) => {
      if (Platform.OS === "android") {
        try {
          // For Android, try Bluetooth printing first
          await ThermalPrinter.print({
            payload: await printReceipt(order, "Admin"),
          });
          showSuccess("Receipt printed successfully!");
        } catch (error) {
          console.error("Print error:", error);
          if (error.message?.includes("No Bluetooth printers found")) {
            showError(
              "No Bluetooth printer found. Please pair a printer first."
            );
          } else {
            showError(
              "Failed to print receipt. Please check printer connection."
            );
          }
        }
      } else {
        // For iOS/Web, show printer configuration dialog for TCP printing
        setSelectedOrder(order);
        setIsPrinterDialogVisible(true);
      }
    },
    [showSuccess, showError]
  );

  const handlePrinterConfigSave = useCallback(async () => {
    if (!selectedOrder) return;

    // Validate IP address format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(printerConfig.ip)) {
      showError("Please enter a valid IP address");
      return;
    }

    // Validate port number
    if (printerConfig.port < 0 || printerConfig.port > 65535) {
      showError("Please enter a valid port number (0-65535)");
      return;
    }

    try {
      // First try to test the printer connection with a test print
      const testString = "Printer Test\n\n\n";
      await ThermalPrinter.print({
        payload: testString,
        host: printerConfig.ip,
        port: printerConfig.port,
        timeout: 5000,
        width: printerConfig.width,
      });

      // If test successful, print the actual receipt
      await ThermalPrinter.print({
        payload: await printReceipt(selectedOrder, "Admin", printerConfig),
        host: printerConfig.ip,
        port: printerConfig.port,
        timeout: 5000,
        width: printerConfig.width,
      });

      showSuccess("Receipt printed successfully!");
      setIsPrinterDialogVisible(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Print error:", error);
      if (error.message?.includes("ETIMEDOUT")) {
        showError(
          "Printer connection timed out. Please check if the printer is turned on and connected to the network."
        );
      } else if (error.message?.includes("ECONNREFUSED")) {
        showError("Connection refused. Please verify the IP address and port.");
      } else {
        showError(
          "Failed to connect to printer. Please check printer settings and ensure it's powered on."
        );
      }
    }
  }, [selectedOrder, printerConfig, showSuccess, showError]);

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
      showError("Failed to save order");
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

  const handleEditItem = (item) => {
    // Implement your edit logic here
    console.log("Edit item:", item);
  };

  const handleDeleteItem = (item) => {
    // Implement your delete logic here
    removeItem(item.id);
  };

  const PrinterConfigDialog = ({ visible, onDismiss, onSave }) => (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Printer Configuration</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Printer IP Address"
            placeholder="e.g., 192.168.1.100"
            value={printerConfig.ip}
            onChangeText={(text) =>
              setPrinterConfig((prev) => ({ ...prev, ip: text }))
            }
            style={{ marginBottom: 16 }}
          />
          <TextInput
            mode="outlined"
            label="Printer Port"
            placeholder="Default: 9100"
            value={printerConfig.port.toString()}
            onChangeText={(text) =>
              setPrinterConfig((prev) => ({
                ...prev,
                port: parseInt(text) || 9100,
              }))
            }
            keyboardType="numeric"
            style={{ marginBottom: 16 }}
          />
          <SegmentedButtons
            value={printerConfig.width.toString()}
            onValueChange={(value) =>
              setPrinterConfig((prev) => ({
                ...prev,
                width: parseInt(value),
              }))
            }
            buttons={[
              {
                value: "32",
                label: "58mm",
              },
              {
                value: "48",
                label: "80mm",
              },
            ]}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={onSave} mode="contained">
            Save & Print
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Order Management
        </Text>
        <View
          style={[
            styles.actionContainer,
            isMobile && {
              flexDirection: "row",
              width: "100%",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
            },
          ]}
        >
          <Button
            icon="refresh"
            mode="outlined"
            onPress={() => {
              /* TODO: implement refresh */
            }}
            textColor={isDarkMode ? colors.primary : colors.text}
            style={[
              {
                borderColor: colors.primary,
                borderRadius: 8,
                marginRight: 2,
                backgroundColor: isDarkMode ? undefined : colors.surfaceVariant,
              },
              isMobile && { flex: 1, minWidth: 0, marginRight: 0 },
            ]}
          >
            Refresh
          </Button>
          <Button
            icon="download"
            mode="outlined"
            onPress={() => {
              /* TODO: implement export */
            }}
            style={[
              {
                borderColor: colors.white,
                borderRadius: 8,
                marginRight: 2,
                backgroundColor: colors.primary,
              },
              isMobile && { flex: 1, minWidth: 0, marginRight: 0 },
            ]}
            labelStyle={{ color: colors.onPrimary, fontWeight: "bold" }}
          >
            Export
          </Button>
          <Button
            icon="plus"
            mode="contained"
            onPress={() => setFormVisible(true)}
            style={[
              {
                backgroundColor: isDarkMode ? undefined : colors.surfaceVariant,
                borderRadius: 8,
              },
              isMobile && { flex: 1, minWidth: 0 },
            ]}
            textColor={isDarkMode ? colors.white : colors.text}
          >
            Create Order
          </Button>
        </View>
      </View>

      {/* Main Card */}
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 22,
          color: colors.text,
          margin: 10,
        }}
      >
        Orders
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          marginBottom: 18,
          marginLeft: 12,
        }}
      >
        View and manage all customer orders in one place.
      </Text>

      {/* Filters and Search */}
      {isMobile ? (
        <>
          {/* Filters Row: All Categories, Sort, Time - in one row, working dropdowns */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 54,
              width: "80%",
            }}
          >
            {/* All Categories Filter */}
            <Menu
              visible={isCategoryMenuVisible}
              onDismiss={() => setIsCategoryMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setIsCategoryMenuVisible(true)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    borderColor: colors.outline,
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    minHeight: 40,
                  }}
                  textColor={colors.text}
                  icon="chevron-down"
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  {(selectedCategory === "all"
                    ? "All Categories"
                    : selectedCategory
                  ).length > 12
                    ? (selectedCategory === "all"
                        ? "All Categories"
                        : selectedCategory
                      ).substring(0, 11) + "..."
                    : selectedCategory === "all"
                    ? "All Categories"
                    : selectedCategory}
                </Button>
              }
              theme={{ colors: { surface: colors.surface } }}
            >
              <Menu.Item
                onPress={() => {
                  setSelectedCategory("all");
                  setIsCategoryMenuVisible(false);
                }}
                title="All Categories"
                titleStyle={{ color: colors.text }}
              />
              {categories.map((cat) => (
                <Menu.Item
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategory(cat.name);
                    setIsCategoryMenuVisible(false);
                  }}
                  title={cat.name}
                  titleStyle={{ color: colors.text }}
                />
              ))}
            </Menu>
            {/* Sort Filter */}
            <Menu
              visible={isSortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setSortMenuVisible(true)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    borderColor: colors.outline,
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    minHeight: 40,
                  }}
                  textColor={colors.text}
                  icon="chevron-down"
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  {(sortBy === "date"
                    ? "Newest First"
                    : sortBy === "name"
                    ? "Customer"
                    : sortBy === "status"
                    ? "Status"
                    : sortBy === "paymentMode"
                    ? "Payment"
                    : "Category"
                  ).length > 12
                    ? (sortBy === "date"
                        ? "Newest First"
                        : sortBy === "name"
                        ? "Customer"
                        : sortBy === "status"
                        ? "Status"
                        : sortBy === "paymentMode"
                        ? "Payment"
                        : "Category"
                      ).substring(0, 11) + "..."
                    : sortBy === "date"
                    ? "Newest First"
                    : sortBy === "name"
                    ? "Customer"
                    : sortBy === "status"
                    ? "Status"
                    : sortBy === "paymentMode"
                    ? "Payment"
                    : "Category"}
                </Button>
              }
              theme={{ colors: { surface: colors.surface } }}
            >
              <Menu.Item
                onPress={() => {
                  setSortBy("date");
                  setSortMenuVisible(false);
                }}
                title="Newest First"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("name");
                  setSortMenuVisible(false);
                }}
                title="Customer"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("status");
                  setSortMenuVisible(false);
                }}
                title="Status"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("paymentMode");
                  setSortMenuVisible(false);
                }}
                title="Payment"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("category");
                  setSortMenuVisible(false);
                }}
                title="Category"
                titleStyle={{ color: colors.text }}
              />
            </Menu>
            {/* Time Filter */}
            <Menu
              visible={isTimeMenuVisible}
              onDismiss={() => setTimeMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setTimeMenuVisible(true)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    borderColor: colors.outline,
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    minHeight: 40,
                  }}
                  textColor={colors.text}
                  icon="chevron-down"
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  {(timeFilter === "today"
                    ? "Today"
                    : timeFilter === "week"
                    ? "This Week"
                    : timeFilter === "month"
                    ? "This Month"
                    : "All"
                  ).length > 12
                    ? (timeFilter === "today"
                        ? "Today"
                        : timeFilter === "week"
                        ? "This Week"
                        : timeFilter === "month"
                        ? "This Month"
                        : "All"
                      ).substring(0, 11) + "..."
                    : timeFilter === "today"
                    ? "Today"
                    : timeFilter === "week"
                    ? "This Week"
                    : timeFilter === "month"
                    ? "This Month"
                    : "All"}
                </Button>
              }
              theme={{ colors: { surface: colors.surface } }}
            >
              <Menu.Item
                onPress={() => {
                  setTimeFilter("today");
                  setTimeMenuVisible(false);
                }}
                title="Today"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setTimeFilter("week");
                  setTimeMenuVisible(false);
                }}
                title="This Week"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setTimeFilter("month");
                  setTimeMenuVisible(false);
                }}
                title="This Month"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setTimeFilter("all");
                  setTimeMenuVisible(false);
                }}
                title="All"
                titleStyle={{ color: colors.text }}
              />
            </Menu>
          </View>
          {/* Search bar and filter icon in a row, 80% width */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              marginBottom: 8,
            }}
          >
            <TextInput
              placeholder="Search orders by ID, client, or product..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                backgroundColor: colors.inputBackground,
                borderRadius: 8,
              }}
              mode="outlined"
              theme={{ colors: { ...colors, primary: colors.primary } }}
              left={
                <TextInput.Icon icon="magnify" color={colors.placeholder} />
              }
            />
            <IconButton
              icon="filter-variant"
              onPress={() => {}}
              style={{
                marginLeft: 4,
                backgroundColor: colors.surfaceVariant,
                borderRadius: 8,
              }}
              iconColor={colors.textSecondary}
            />
          </View>
        </>
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
            width: "100%",
          }}
        >
          {/* Filters group */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Menu
              visible={isCategoryMenuVisible}
              onDismiss={() => setIsCategoryMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setIsCategoryMenuVisible(true)}
                  style={{
                    borderColor: colors.outline,
                    borderRadius: 8,
                    minWidth: 140,
                  }}
                  textColor={colors.text}
                  icon="chevron-down"
                >
                  {selectedCategory === "all"
                    ? "All Categories"
                    : selectedCategory}
                </Button>
              }
              theme={{ colors: { surface: colors.surface } }}
            >
              <Menu.Item
                onPress={() => {
                  setSelectedCategory("all");
                  setIsCategoryMenuVisible(false);
                }}
                title="All Categories"
                titleStyle={{ color: colors.text }}
              />
              {categories.map((cat) => (
                <Menu.Item
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategory(cat.name);
                    setIsCategoryMenuVisible(false);
                  }}
                  title={cat.name}
                  titleStyle={{ color: colors.text }}
                />
              ))}
            </Menu>
            <Menu
              visible={isSortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setSortMenuVisible(true)}
                  style={{
                    borderColor: colors.outline,
                    borderRadius: 8,
                    minWidth: 140,
                  }}
                  textColor={colors.text}
                  icon="chevron-down"
                >
                  {sortBy === "date"
                    ? "Newest First"
                    : sortBy === "name"
                    ? "Customer"
                    : sortBy === "status"
                    ? "Status"
                    : sortBy === "paymentMode"
                    ? "Payment"
                    : "Category"}
                </Button>
              }
              theme={{ colors: { surface: colors.surface } }}
            >
              <Menu.Item
                onPress={() => {
                  setSortBy("date");
                  setSortMenuVisible(false);
                }}
                title="Newest First"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("name");
                  setSortMenuVisible(false);
                }}
                title="Customer"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("status");
                  setSortMenuVisible(false);
                }}
                title="Status"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("paymentMode");
                  setSortMenuVisible(false);
                }}
                title="Payment"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("category");
                  setSortMenuVisible(false);
                }}
                title="Category"
                titleStyle={{ color: colors.text }}
              />
            </Menu>
            <Menu
              visible={isTimeMenuVisible}
              onDismiss={() => setTimeMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setTimeMenuVisible(true)}
                  style={{
                    borderColor: colors.outline,
                    borderRadius: 8,
                    minWidth: 120,
                  }}
                  textColor={colors.text}
                  icon="chevron-down"
                >
                  {timeFilter === "today"
                    ? "Today"
                    : timeFilter === "week"
                    ? "This Week"
                    : timeFilter === "month"
                    ? "This Month"
                    : "All"}
                </Button>
              }
              theme={{ colors: { surface: colors.surface } }}
            >
              <Menu.Item
                onPress={() => {
                  setTimeFilter("today");
                  setTimeMenuVisible(false);
                }}
                title="Today"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setTimeFilter("week");
                  setTimeMenuVisible(false);
                }}
                title="This Week"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setTimeFilter("month");
                  setTimeMenuVisible(false);
                }}
                title="This Month"
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => {
                  setTimeFilter("all");
                  setTimeMenuVisible(false);
                }}
                title="All"
                titleStyle={{ color: colors.text }}
              />
            </Menu>
          </View>
          {/* Search bar fills remaining space */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TextInput
              placeholder="Search orders by ID, client, or product..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                backgroundColor: colors.inputBackground,
                borderRadius: 8,
              }}
              mode="outlined"
              theme={{ colors: { ...colors, primary: colors.primary } }}
              left={
                <TextInput.Icon icon="magnify" color={colors.placeholder} />
              }
            />
            <IconButton
              icon="filter-variant"
              onPress={() => {}}
              style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: 8,
              }}
              iconColor={colors.textSecondary}
            />
          </View>
        </View>
      )}
      {/* Orders List or Table comes directly below search bar */}
      {isMobile ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          style={{ width: "100%", marginBottom: 16 }}
        >
          <View style={{ minWidth: 900, height: 450, flex: 1 }}>
            <DataTable
              style={{
                backgroundColor: colors.surface,
                borderRadius: 10,
                marginTop: 12,
                borderWidth: 1,
                borderColor: colors.outline,
                overflow: "hidden",
                minWidth: 900,
              }}
            >
              <DataTable.Header
                style={{ backgroundColor: colors.surfaceVariant }}
              >
                <DataTable.Title style={{ width: 120 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    Order ID
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ width: 100 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    Category
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ width: 100 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    Date
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ width: 120 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    Client
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ width: 100 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    Contact
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ width: 80 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    Items
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ width: 100 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    Amount
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ width: 100 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    Status
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ width: 175 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    Actions
                  </Text>
                </DataTable.Title>
              </DataTable.Header>
              <ScrollView
                style={{ height: 350 }}
                showsVerticalScrollIndicator={true}
              >
                {displayOrders.length === 0 ? (
                  <DataTable.Row>
                    <DataTable.Cell
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 900,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: 16,
                            textAlign: "center",
                          }}
                        >
                          No orders found
                        </Text>
                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: 14,
                            textAlign: "center",
                          }}
                        >
                          Create a new order or adjust your filters
                        </Text>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ) : (
                  displayOrders.map((order) => (
                    <DataTable.Row
                      key={order.id}
                      style={{ backgroundColor: colors.surface }}
                    >
                      <DataTable.Cell style={{ width: 120 }}>
                        <Text style={{ color: colors.text, textAlign: "left" }}>
                          {order.id}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        {getCategoryIcon(order)}
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        <Text style={{ color: colors.text, textAlign: "left" }}>
                          {new Date(order.orderDate).toLocaleDateString()}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 120 }}>
                        <Text style={{ color: colors.text, textAlign: "left" }}>
                          {order.clientName}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        <Text style={{ color: colors.text, textAlign: "left" }}>
                          {order.clientContact}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 80 }}>
                        <Text style={{ color: colors.text, textAlign: "left" }}>
                          {order.totalOrderItems}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        <Text style={{ color: colors.text, textAlign: "left" }}>
                          {order.grandTotal}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        <Text style={{ color: colors.text, textAlign: "left" }}>
                          {order.paymentStatus}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 175 }}>
                        <View style={{ flexDirection: "row", gap: 4 }}>
                          <IconButton
                            icon="eye"
                            size={18}
                            onPress={() => handleViewDetails(order)}
                            iconColor={colors.text}
                          />
                          <IconButton
                            icon="printer"
                            size={18}
                            onPress={() => handlePrint(order)}
                            iconColor={colors.text}
                          />
                          <IconButton
                            icon="pencil"
                            size={18}
                            onPress={() => handleEdit(order)}
                            iconColor={colors.text}
                          />
                          <IconButton
                            icon="delete"
                            size={18}
                            onPress={() => handleDelete(order.id)}
                            iconColor={colors.error}
                          />
                        </View>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))
                )}
              </ScrollView>
            </DataTable>
            <DataTable.Pagination
              page={0}
              numberOfPages={1}
              label={`Showing ${displayOrders.length} of ${orders.length} orders`}
              style={{
                backgroundColor: colors.surfaceVariant,
                borderTopWidth: 1,
                borderTopColor: colors.divider,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              }}
              theme={{
                colors: {
                  surface: colors.surfaceVariant,
                  text: colors.text,
                  primary: colors.primary,
                  outline: colors.outline,
                },
              }}
              onPageChange={() => {}}
              showFastPaginationControls={false}
              numberOfItemsPerPage={displayOrders.length}
              onItemsPerPageChange={() => {}}
              selectPageDropdownLabel={"Rows per page"}
            />
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 10,
            marginTop: 12,
            borderWidth: 1,
            borderColor: colors.outline,
            overflow: "hidden",
            marginBottom: 32,
          }}
        >
          {/* Table Header */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.surfaceVariant,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <Text
              style={{
                flex: 1.2,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "left",
              }}
            >
              Order ID
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "left",
              }}
            >
              Category
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "left",
              }}
            >
              Date
            </Text>
            <Text
              style={{
                flex: 1.2,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "left",
              }}
            >
              Client
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "left",
              }}
            >
              Contact
            </Text>
            <Text
              style={{
                flex: 0.8,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "left",
              }}
            >
              Items
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "left",
              }}
            >
              Amount
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "left",
              }}
            >
              Status
            </Text>
            <Text
              style={{
                flex: 1.5,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "left",
              }}
            >
              Actions
            </Text>
          </View>
          {/* Table Rows */}
          {displayOrders.length === 0 ? (
            <View style={{ alignItems: "center", padding: 32 }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  marginBottom: 4,
                }}
              >
                No orders found
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Create a new order or adjust your filters
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ height: 320 }}
              showsVerticalScrollIndicator={true}
            >
              {displayOrders.map((order) => (
                <View
                  key={order.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    style={{
                      flex: 1.2,
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    {order.id}
                  </Text>
                  <Text
                    style={{ flex: 1, color: colors.text, textAlign: "left" }}
                  >
                    {getCategoryIcon(order)}
                  </Text>
                  <Text
                    style={{ flex: 1, color: colors.text, textAlign: "left" }}
                  >
                    {new Date(order.orderDate).toLocaleDateString()}
                  </Text>
                  <Text
                    style={{
                      flex: 1.2,
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    {order.clientName}
                  </Text>
                  <Text
                    style={{ flex: 1, color: colors.text, textAlign: "left" }}
                  >
                    {order.clientContact}
                  </Text>
                  <Text
                    style={{
                      flex: 0.8,
                      color: colors.text,
                      textAlign: "left",
                    }}
                  >
                    {order.totalOrderItems}
                  </Text>
                  <Text
                    style={{ flex: 1, color: colors.text, textAlign: "left" }}
                  >
                    {order.grandTotal}
                  </Text>
                  <Text
                    style={{ flex: 1, color: colors.text, textAlign: "left" }}
                  >
                    {order.paymentStatus}
                  </Text>
                  <View style={{ flex: 1.5, flexDirection: "row", gap: 4 }}>
                    <IconButton
                      icon="eye"
                      size={18}
                      onPress={() => handleViewDetails(order)}
                      iconColor={colors.text}
                    />
                    <IconButton
                      icon="printer"
                      size={18}
                      onPress={() => handlePrint(order)}
                      iconColor={colors.text}
                    />
                    <IconButton
                      icon="pencil"
                      size={18}
                      onPress={() => handleEdit(order)}
                      iconColor={colors.text}
                    />
                    <IconButton
                      icon="delete"
                      size={18}
                      onPress={() => handleDelete(order.id)}
                      iconColor={colors.error}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          {/* Table Footer (pagination/info) outside the scroll area */}
          <View
            style={{
              padding: 12,
              backgroundColor: colors.surfaceVariant,
              borderTopWidth: 1,
              borderTopColor: colors.divider,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Showing {displayOrders.length} of {orders.length} orders
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <Button onPress={() => {}} disabled={true}>
                Previous
              </Button>
              <Button onPress={() => {}} disabled={false}>
                Next
              </Button>
            </View>
          </View>
        </View>
      )}

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
              orders={orders}
            />
          </View>
        </View>
      </Modal>

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
                      <Text>Address/Descriptions: {item.address}</Text>
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
      <PrinterConfigDialog
        visible={isPrinterDialogVisible}
        onDismiss={() => {
          setIsPrinterDialogVisible(false);
          setSelectedOrder(null);
        }}
        onSave={handlePrinterConfigSave}
      />
    </View>
  );
}
