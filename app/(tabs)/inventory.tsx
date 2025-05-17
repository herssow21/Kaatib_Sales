import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  Platform,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Button,
  TextInput,
  Card,
  Modal,
  SegmentedButtons,
  Menu,
  IconButton,
  DataTable,
  Divider,
  FAB,
} from "react-native-paper";
import { useInventoryContext } from "../../contexts/InventoryContext";
import { useCategoryContext } from "../../contexts/CategoryContext";
import { useAlertContext } from "../../contexts/AlertContext";
import CategoryForm from "../../components/CategoryForm";
import ProductForm from "../../components/ProductForm";
import * as DocumentPicker from "expo-document-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatMoney } from "../../utils/formatters";
import RestockForm from "../../components/RestockForm";
import { useThemeContext } from "../../contexts/ThemeContext";
import { CustomColors } from "../../types/theme";

function generateSimpleId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  createdAt: string;
  buyingPrice: number;
  sellingPrice: number;
  stockValue: number;
  measuringUnit?: string;
  price: number;
  type: "product" | "service";
  charges?: number;
}

// Define ProductInventoryItem by extending InventoryItem and adding currentStock
interface ProductInventoryItem extends InventoryItem {
  type: "product";
  currentStock: number;
  measuringUnit: string;
}

const InventoryScreen = () => {
  const { theme, isDarkMode } = useThemeContext();
  const colors = theme.colors as CustomColors;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { items, addItem, updateItem, handleSale, deleteItem } =
    useInventoryContext();
  const { categories } = useCategoryContext();
  const { showSuccess, showError, showWarning, showInfo } = useAlertContext();

  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isItemModalVisible, setItemModalVisible] = useState(false);
  const [isBulkRestoreModalVisible, setBulkRestoreModalVisible] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [isMenuVisible, setMenuVisible] = useState<string | null>(null);
  const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalItems = items.length;
  const totalStockCount = items.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );
  const estimatedSales = items.reduce(
    (total, item) => total + item.sellingPrice * (item.quantity || 0),
    0
  );
  const totalStockValue = items.reduce(
    (total, item) => total + item.buyingPrice * (item.quantity || 0),
    0
  );

  const sortOptions = [
    { label: "Most Recent", value: "recent" },
    { label: "Most Relevant", value: "relevant" },
    { label: "Highest Price", value: "highPrice" },
    { label: "Lowest Price", value: "lowPrice" },
  ];

  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.type === "product" &&
            item.quantity?.toString().includes(query)) ||
          item.sellingPrice?.toString().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    return filtered.sort((a, b) => {
      const direction = sortConfig.direction === "ascending" ? 1 : -1;

      switch (sortConfig.key) {
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "category":
          return direction * a.category.localeCompare(b.category);
        case "quantity":
          const aQty = a.type === "service" ? -1 : a.quantity || 0;
          const bQty = b.type === "service" ? -1 : b.quantity || 0;
          return direction * (aQty - bQty);
        case "buyingPrice":
          const aBuy = a.type === "service" ? -1 : a.buyingPrice || 0;
          const bBuy = b.type === "service" ? -1 : b.buyingPrice || 0;
          return direction * (aBuy - bBuy);
        case "sellingPrice":
          return direction * ((a.sellingPrice || 0) - (b.sellingPrice || 0));
        case "stockValue":
          const aValue = a.type === "service" ? -1 : a.stockValue || 0;
          const bValue = b.type === "service" ? -1 : b.stockValue || 0;
          return direction * (aValue - bValue);
        case "createdAt":
          return (
            direction *
            (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          );
        default:
          return 0;
      }
    });
  }, [items, searchQuery, selectedCategory, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    switch (value) {
      case "recent":
        setSortConfig({ key: "createdAt", direction: "descending" });
        break;
      case "relevant":
        setSortConfig({ key: "name", direction: "ascending" });
        break;
      case "highPrice":
        setSortConfig({ key: "sellingPrice", direction: "descending" });
        break;
      case "lowPrice":
        setSortConfig({ key: "sellingPrice", direction: "ascending" });
        break;
      default:
        break;
    }
  };

  const handleDeleteItem = (item: InventoryItem) => {
    const confirmDelete = () => {
      try {
        deleteItem(item.id);
        showSuccess("Item deleted successfully");
      } catch (error) {
        console.error("Error deleting item:", error);
        showError("Failed to delete item");
      }
    };

    if (Platform.OS === "web") {
      showWarning(
        "Are you sure you want to delete this item?",
        "Delete",
        confirmDelete
      );
    } else {
      Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: confirmDelete,
          style: "destructive",
        },
      ]);
    }
  };

  const handleViewItem = (item: InventoryItem) => {
    const message = `Name: ${item.name}
Category: ${item.category}
Type: ${item.type}
Quantity: ${item.quantity}
Buying Price: KES ${item.buyingPrice}
Selling Price: KES ${item.sellingPrice}
Stock Value: KES ${item.stockValue}`;

    showInfo(message, "Item Details");
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemModalVisible(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: isMobile ? 8 : 16,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      marginBottom: 16,
      gap: isMobile ? 8 : 0,
    },
    headerTitle: {
      color: colors.text,
      fontWeight: "bold",
      fontSize: isMobile ? 20 : 24,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 8,
      marginTop: isMobile ? 8 : 0,
      justifyContent: isMobile ? "flex-start" : "flex-end",
    },
    createItemButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    createItemButtonLabel: {
      color: colors.onPrimary,
      fontWeight: "bold",
    },
    searchAndFilters: {
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? 12 : 16,
      marginBottom: 16,
      alignItems: isMobile ? "stretch" : "center",
    },
    searchInput: {
      flex: isMobile ? undefined : 1,
    },
    filterButtonsContainer: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    filterButton: {
      borderColor: colors.outline,
    },
    filterButtonSelected: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primary,
    },
    filterButtonLabel: {
      color: colors.text,
    },
    filterButtonSelectedLabel: {
      color: colors.primary,
    },
    statsContainer: {
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-around",
      marginBottom: 1,
      gap: isMobile ? 8 : 16,
    },
    statCard: {
      flex: 1,
      padding: isMobile ? 5 : 10,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    statTitle: {
      fontSize: isMobile ? 15 : 16,
      color: colors.text,
      textAlign: "center",
    },
    statValue: {
      fontSize: isMobile ? 28 : 24,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
    },
    tableHeader: {
      backgroundColor: colors.surfaceVariant,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    headerCellText: {
      color: colors.text,
      fontWeight: "bold",
      fontSize: 14,
    },
    tableRow: {
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.surface,
    },
    cellText: {
      color: colors.onSurface,
      fontSize: 14,
    },
    serviceCellText: {
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    actionsCell: {
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.modalBackground,
      padding: 16,
      margin: isMobile ? 10 : 20,
      borderRadius: 8,
      maxHeight: "90%",
      alignSelf: "center",
      width: isMobile ? "95%" : "45%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.modalText,
      textAlign: "center",
    },
    nameColumn: { flex: isMobile ? 3 : 2.5 },
    categoryColumn: { flex: isMobile ? 1 : 1.5 },
    quantityColumn: { flex: 1, justifyContent: "flex-start" },
    priceColumn: { flex: 1.5, justifyContent: "flex-start" },
    stockValueColumn: { flex: 1.5, justifyContent: "flex-start" },
    actionsColumn: { flex: isMobile ? 0.7 : 1, justifyContent: "flex-start" },
  });

  const textInputTheme = {
    colors: {
      primary: colors.primary,
      text: colors.onSurface,
      placeholder: colors.placeholder,
      background: colors.inputBackground,
      surface: colors.inputBackground,
      onSurface: colors.onSurface,
      outline: colors.outline,
      accent: colors.primary,
      error: colors.error,
      disabled: colors.disabled,
    },
  };

  const itemsPerPageOptions = [5, 10, 15, 20].filter(
    (ipp) => ipp <= totalItems || ipp === 5
  );
  if (!itemsPerPageOptions.includes(itemsPerPage) && totalItems > 0) {
    setItemsPerPage(itemsPerPageOptions[0] || 5);
  }

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, totalItems);
  const paginatedItems = filteredAndSortedItems.slice(from, to);

  const renderItemActions = (item: InventoryItem) => (
    <Menu
      visible={isMenuVisible === item.id}
      onDismiss={() => setMenuVisible(null)}
      anchor={
        <IconButton
          icon="dots-vertical"
          onPress={() => setMenuVisible(item.id)}
          iconColor={colors.text}
        />
      }
      theme={{ colors: { surface: colors.surface } }}
    >
      <Menu.Item
        onPress={() => {
          handleViewItem(item);
          setMenuVisible(null);
        }}
        title="View Details"
        titleStyle={{ color: colors.text }}
      />
      <Menu.Item
        onPress={() => {
          handleEditItem(item);
          setMenuVisible(null);
        }}
        title="Edit Item"
        titleStyle={{ color: colors.text }}
      />
      <Divider style={{ backgroundColor: colors.divider }} />
      <Menu.Item
        onPress={() => {
          handleDeleteItem(item);
          setMenuVisible(null);
        }}
        title="Delete Item"
        titleStyle={{ color: colors.error }}
      />
    </Menu>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, isMobile && { marginTop: 24 }]}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Inventory Management
        </Text>
        <View
          style={[
            styles.buttonContainer,
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
            icon="plus"
            mode="outlined"
            onPress={() => setCategoryModalVisible(true)}
            textColor={colors.primary}
            style={[
              { borderColor: colors.primary, borderRadius: 8 },
              isMobile && { flex: 1, minWidth: 0, paddingHorizontal: 0 },
            ]}
          >
            Create Category
          </Button>
          <Button
            icon="plus-circle"
            mode="contained"
            onPress={() => {
              setSelectedItem(null);
              setItemModalVisible(true);
            }}
            style={[
              styles.createItemButton,
              isMobile && { flex: 1, minWidth: 0, paddingHorizontal: 0 },
            ]}
            labelStyle={styles.createItemButtonLabel}
          >
            Create Item
          </Button>
          <Button
            icon="package-variant-plus"
            mode="outlined"
            onPress={() => setBulkRestoreModalVisible(true)}
            textColor={colors.primary}
            style={[
              { borderColor: colors.primary, borderRadius: 8 },
              isMobile && { flex: 1, minWidth: 0, paddingHorizontal: 0 },
            ]}
          >
            Bulk Restock
          </Button>
        </View>
      </View>

      <View style={styles.searchAndFilters}>
        <TextInput
          label="Search items by name, category, qty, price..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          mode="outlined"
          theme={textInputTheme}
          left={<TextInput.Icon icon="magnify" color={colors.placeholder} />}
          right={
            searchQuery ? (
              <TextInput.Icon
                icon="close-circle"
                onPress={() => setSearchQuery("")}
                color={colors.placeholder}
              />
            ) : null
          }
        />
        <View style={styles.filterButtonsContainer}>
          <Menu
            visible={isCategoryMenuVisible}
            onDismiss={() => setIsCategoryMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setIsCategoryMenuVisible(true)}
                icon="filter-variant"
                style={styles.filterButton}
                labelStyle={styles.filterButtonLabel}
                textColor={colors.text}
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
            <Divider style={{ backgroundColor: colors.divider }} />
            <Menu.Item
              onPress={() => {
                setCategoryModalVisible(true);
                setIsCategoryMenuVisible(false);
              }}
              title="Create Category"
              leadingIcon="plus"
              titleStyle={{ color: colors.primary }}
            />
          </Menu>
          <SegmentedButtons
            value={selectedSort}
            onValueChange={handleSortChange}
            buttons={sortOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
              style:
                selectedSort === opt.value
                  ? styles.filterButtonSelected
                  : [
                      styles.filterButton,
                      { backgroundColor: colors.surfaceVariant },
                    ],
              labelStyle:
                selectedSort === opt.value
                  ? styles.filterButtonSelectedLabel
                  : [
                      styles.filterButtonLabel,
                      { color: colors.onSurfaceVariant },
                    ],
            }))}
            style={{ flex: isMobile ? 1 : undefined }}
          />
        </View>
      </View>

      {isMobile ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: width * 0.05,
            alignItems: "center",
          }}
          style={{ marginBottom: 0, marginTop: 0, height: 4 }}
        >
          {[
            { title: "Total Items", value: totalItems },
            { title: "Stock Count", value: totalStockCount },
            { title: "Est. Sales Value", value: formatMoney(estimatedSales) },
            { title: "Total Stock Value", value: formatMoney(totalStockValue) },
          ].map((stat) => (
            <Card
              key={stat.title}
              style={[
                styles.statCard,
                {
                  width: width * 0.85,
                  maxHeight: 120,
                  marginTop: 2,
                  marginBottom: 5,
                  marginRight: 5,
                  marginLeft: 0,
                  alignSelf: "center",
                  justifyContent: "center",
                  backgroundColor: colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                  borderRadius: 8,
                  padding: 0,
                  elevation: 1,
                  shadowColor: colors.text,
                  shadowOpacity: 0.08,
                  shadowRadius: 2,
                  shadowOffset: { width: 0, height: 1 },
                  flexDirection: "column",
                  alignItems: "center",
                },
              ]}
            >
              <Card.Content
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  paddingVertical: 0,
                  paddingHorizontal: 0,
                }}
              >
                <Text style={styles.statTitle}>{stat.title}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statTitle}>Total Items</Text>
              <Text style={styles.statValue}>{totalItems}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statTitle}>Stock Count</Text>
              <Text style={styles.statValue}>{totalStockCount}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statTitle}>Est. Sales Value</Text>
              <Text style={styles.statValue}>
                {formatMoney(estimatedSales)}
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statTitle}>Total Stock Value</Text>
              <Text style={styles.statValue}>
                {formatMoney(totalStockValue)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      {isMobile ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          style={{ flex: 1 }}
        >
          <View style={{ minWidth: 900, flex: 1 }}>
            <DataTable
              style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                elevation: 1,
                minWidth: 900,
              }}
            >
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title
                  onPress={() => handleSort("name")}
                  style={styles.nameColumn}
                >
                  <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                    Name{" "}
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                </DataTable.Title>
                <DataTable.Title
                  onPress={() => handleSort("category")}
                  style={styles.categoryColumn}
                >
                  <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                    Category{" "}
                    {sortConfig.key === "category" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={styles.quantityColumn}>
                  <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                    In-Stock{" "}
                    {sortConfig.key === "quantity" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={styles.priceColumn}>
                  <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                    Buying Price
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={styles.priceColumn}>
                  <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                    Selling Price
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={styles.stockValueColumn}>
                  <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                    Stock Value{" "}
                    {sortConfig.key === "stockValue" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={[styles.actionsColumn]}>
                  <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                    Actions
                  </Text>
                </DataTable.Title>
              </DataTable.Header>
              <ScrollView style={{ maxHeight: 420 }}>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <DataTable.Row
                      key={item.id}
                      style={styles.tableRow}
                      onPress={() => handleViewItem(item)}
                    >
                      <DataTable.Cell style={styles.nameColumn}>
                        <Text style={[styles.cellText, { textAlign: "left" }]}>
                          {item.name}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.categoryColumn}>
                        <Text style={[styles.cellText, { textAlign: "left" }]}>
                          {item.category}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.quantityColumn}>
                        <Text
                          style={[
                            item.type === "service"
                              ? styles.serviceCellText
                              : styles.cellText,
                            { textAlign: "left" },
                          ]}
                        >
                          {item.type === "service" ? "N/A" : item.quantity}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.priceColumn}>
                        <Text style={[styles.cellText, { textAlign: "left" }]}>
                          {formatMoney(item.buyingPrice)}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.priceColumn}>
                        <Text style={[styles.cellText, { textAlign: "left" }]}>
                          {formatMoney(item.sellingPrice)}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.stockValueColumn}>
                        <Text
                          style={[
                            item.type === "service"
                              ? styles.serviceCellText
                              : styles.cellText,
                            { textAlign: "left" },
                          ]}
                        >
                          {item.type === "service"
                            ? "N/A"
                            : formatMoney(item.stockValue || 0)}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.actionsCell}>
                        {renderItemActions(item)}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))
                ) : (
                  <Card
                    style={{
                      marginTop: 1,
                      backgroundColor: colors.surface,
                      borderRadius: 0,
                    }}
                  >
                    <Card.Content
                      style={{ alignItems: "center", paddingVertical: 20 }}
                    >
                      <MaterialCommunityIcons
                        name="package-variant-closed"
                        size={48}
                        color={colors.textSecondary}
                        style={{ marginBottom: 12 }}
                      />
                      <Text
                        style={{
                          color: colors.textSecondary,
                          textAlign: "center",
                          fontSize: 16,
                          fontWeight: "bold",
                        }}
                      >
                        No Inventory Items
                      </Text>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          textAlign: "center",
                          marginTop: 4,
                        }}
                      >
                        Add items to your inventory to see them listed here.
                      </Text>
                      {searchQuery && (
                        <Text
                          style={{
                            color: colors.textSecondary,
                            textAlign: "center",
                            fontSize: 12,
                            marginTop: 8,
                          }}
                        >
                          Try adjusting your search query or filters.
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                )}
              </ScrollView>
              <DataTable.Pagination
                page={page}
                numberOfPages={Math.ceil(
                  filteredAndSortedItems.length / itemsPerPage
                )}
                onPageChange={(p) => setPage(p)}
                label={`${from + 1}-${to} of ${filteredAndSortedItems.length}`}
                numberOfItemsPerPageList={
                  itemsPerPageOptions.length > 0
                    ? itemsPerPageOptions
                    : [5, 10, 15]
                }
                numberOfItemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                showFastPaginationControls
                selectPageDropdownLabel={"Rows per page"}
                theme={{
                  colors: {
                    surface: colors.surfaceVariant,
                    text: colors.text,
                    primary: colors.primary,
                    outline: colors.outline,
                  },
                }}
                style={{
                  backgroundColor: colors.surface,
                  marginTop: 0,
                  borderTopWidth: 1,
                  borderTopColor: colors.divider,
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              />
            </DataTable>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <DataTable
            style={{
              backgroundColor: colors.surface,
              borderRadius: 8,
              elevation: 1,
              minWidth: 900,
            }}
          >
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title
                onPress={() => handleSort("name")}
                style={styles.nameColumn}
              >
                <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                  Name{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </Text>
              </DataTable.Title>
              <DataTable.Title
                onPress={() => handleSort("category")}
                style={styles.categoryColumn}
              >
                <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                  Category{" "}
                  {sortConfig.key === "category" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </Text>
              </DataTable.Title>
              <DataTable.Title style={styles.quantityColumn}>
                <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                  In-Stock{" "}
                  {sortConfig.key === "quantity" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </Text>
              </DataTable.Title>
              <DataTable.Title style={styles.priceColumn}>
                <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                  Buying Price
                </Text>
              </DataTable.Title>
              <DataTable.Title style={styles.priceColumn}>
                <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                  Selling Price
                </Text>
              </DataTable.Title>
              <DataTable.Title style={styles.stockValueColumn}>
                <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                  Stock Value{" "}
                  {sortConfig.key === "stockValue" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </Text>
              </DataTable.Title>
              <DataTable.Title style={[styles.actionsColumn]}>
                <Text style={[styles.headerCellText, { textAlign: "left" }]}>
                  Actions
                </Text>
              </DataTable.Title>
            </DataTable.Header>
            <ScrollView style={{ maxHeight: 420 }}>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <DataTable.Row
                    key={item.id}
                    style={styles.tableRow}
                    onPress={() => handleViewItem(item)}
                  >
                    <DataTable.Cell style={styles.nameColumn}>
                      <Text style={[styles.cellText, { textAlign: "left" }]}>
                        {item.name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.categoryColumn}>
                      <Text style={[styles.cellText, { textAlign: "left" }]}>
                        {item.category}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.quantityColumn}>
                      <Text
                        style={[
                          item.type === "service"
                            ? styles.serviceCellText
                            : styles.cellText,
                          { textAlign: "left" },
                        ]}
                      >
                        {item.type === "service" ? "N/A" : item.quantity}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.priceColumn}>
                      <Text style={[styles.cellText, { textAlign: "left" }]}>
                        {formatMoney(item.buyingPrice)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.priceColumn}>
                      <Text style={[styles.cellText, { textAlign: "left" }]}>
                        {formatMoney(item.sellingPrice)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.stockValueColumn}>
                      <Text
                        style={[
                          item.type === "service"
                            ? styles.serviceCellText
                            : styles.cellText,
                          { textAlign: "left" },
                        ]}
                      >
                        {item.type === "service"
                          ? "N/A"
                          : formatMoney(item.stockValue || 0)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.actionsCell}>
                      {renderItemActions(item)}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))
              ) : (
                <Card
                  style={{
                    marginTop: 1,
                    backgroundColor: colors.surface,
                    borderRadius: 0,
                  }}
                >
                  <Card.Content
                    style={{ alignItems: "center", paddingVertical: 20 }}
                  >
                    <MaterialCommunityIcons
                      name="package-variant-closed"
                      size={48}
                      color={colors.textSecondary}
                      style={{ marginBottom: 12 }}
                    />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      No Inventory Items
                    </Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        textAlign: "center",
                        marginTop: 4,
                      }}
                    >
                      Add items to your inventory to see them listed here.
                    </Text>
                    {searchQuery && (
                      <Text
                        style={{
                          color: colors.textSecondary,
                          textAlign: "center",
                          fontSize: 12,
                          marginTop: 8,
                        }}
                      >
                        Try adjusting your search query or filters.
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              )}
            </ScrollView>
            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(
                filteredAndSortedItems.length / itemsPerPage
              )}
              onPageChange={(p) => setPage(p)}
              label={`${from + 1}-${to} of ${filteredAndSortedItems.length}`}
              numberOfItemsPerPageList={
                itemsPerPageOptions.length > 0
                  ? itemsPerPageOptions
                  : [5, 10, 15]
              }
              numberOfItemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              showFastPaginationControls
              selectPageDropdownLabel={"Rows per page"}
              theme={{
                colors: {
                  surface: colors.surfaceVariant,
                  text: colors.text,
                  primary: colors.primary,
                  outline: colors.outline,
                },
              }}
              style={{
                backgroundColor: colors.surface,
                marginTop: 0,
                borderTopWidth: 1,
                borderTopColor: colors.divider,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              }}
            />
          </DataTable>
        </ScrollView>
      )}

      <Modal
        visible={isItemModalVisible}
        onDismiss={() => setItemModalVisible(false)}
      >
        <View
          style={{
            maxHeight: "60%",
            minWidth: 320,
            width: "100%",
            maxWidth: 500,
            alignSelf: "center",
            backgroundColor: colors.modalBackground,
            borderRadius: 8,
            padding: 0,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <ProductForm
              initialData={selectedItem}
              onSubmit={(data) => {
                if (selectedItem) {
                  updateItem(data.id, data);
                  showSuccess("Item updated successfully!");
                } else {
                  addItem(data);
                  showSuccess("Item created successfully!");
                }
                setItemModalVisible(false);
                setSelectedItem(null);
              }}
              categories={categories}
              onClose={() => setItemModalVisible(false)}
            />
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={isCategoryModalVisible}
        onDismiss={() => setCategoryModalVisible(false)}
      >
        <ScrollView>
          <CategoryForm
            initialData={undefined}
            onClose={() => setCategoryModalVisible(false)}
          />
        </ScrollView>
      </Modal>

      <Modal
        visible={isBulkRestoreModalVisible}
        onDismiss={() => setBulkRestoreModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <RestockForm
            items={
              items
                .filter((item) => item.type === "product")
                .map((item) => ({
                  ...item,
                  type: "product",
                  measuringUnit: item.measuringUnit || "unit",
                  currentStock: item.quantity || 0,
                })) as ProductInventoryItem[]
            }
            onSubmit={(restockData) => {
              showSuccess("Items restocked successfully!");
              setBulkRestoreModalVisible(false);
            }}
            onClose={() => setBulkRestoreModalVisible(false)}
          />
        </ScrollView>
      </Modal>
    </View>
  );
};

export default InventoryScreen;
