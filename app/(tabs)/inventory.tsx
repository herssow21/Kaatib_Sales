import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import {
  Text,
  Button,
  TextInput,
  useTheme,
  Card,
  Modal,
  SegmentedButtons,
  Menu,
  IconButton,
} from "react-native-paper";
import { useInventoryContext } from "../../contexts/InventoryContext";
import { useCategoryContext } from "../../contexts/CategoryContext";
import CategoryForm from "../../components/CategoryForm";
import ProductForm from "../../components/ProductForm";
import * as DocumentPicker from "expo-document-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatMoney } from "../../utils/formatters";
import RestockForm from "../../components/RestockForm";

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
  charges?: number; // for services
}

const InventoryScreen = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { items, addItem, editItem, removeItem, updateItem, handleSale } =
    useInventoryContext();
  const { categories } = useCategoryContext();

  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isItemModalVisible, setItemModalVisible] = useState(false);
  const [isBulkRestoreModalVisible, setBulkRestoreModalVisible] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);

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

  const handleSort = (key: string) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    switch (value) {
      case "recent":
        handleSort("createdAt");
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

  const handleDeleteItem = (id: string) => {
    const confirmDelete = () => {
      try {
        removeItem(id);
        Alert.alert("Success", "Item deleted successfully");
      } catch (error) {
        console.error("Error deleting item:", error);
        Alert.alert("Error", "Failed to delete item");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this item?")) {
        confirmDelete();
      }
    } else {
      Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: confirmDelete, style: "destructive" },
      ]);
    }
  };

  const sortedItems = [...items]
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "highPrice":
          return b.sellingPrice - a.sellingPrice;
        case "lowPrice":
          return a.sellingPrice - b.sellingPrice;
        default:
          return 0;
      }
    });

  const handleBulkRestore = async () => {
    const result = await DocumentPicker.getDocumentAsync();

    if (result.assets && result.assets[0]) {
      console.log(result.assets[0].uri);
    } else {
      console.error("Document selection failed or was canceled.");
    }
    setBulkRestoreModalVisible(false);
  };

  const processSale = (item: InventoryItem, quantitySold: number) => {
    if (quantitySold > item.quantity) {
      Alert.alert("Error", "Cannot sell more than available stock");
      return;
    }

    try {
      handleSale(item.id, quantitySold);
      Alert.alert("Success", "Sale processed successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to process sale");
      console.error(error);
    }
  };

  const handleViewItem = (item: InventoryItem) => {
    Alert.alert(
      "Item Details",
      `Name: ${item.name}\nStock: ${item.quantity}\nBuying Price: KES ${item.buyingPrice}\nSelling Price: KES ${item.sellingPrice}`
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#fff",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 8,
    },
    button: {
      marginLeft: 8,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 24,
      gap: 8,
    },
    statBox: {
      flex: 1,
      margin: 8,
      backgroundColor: "#fff",
      elevation: 2,
      borderRadius: 8,
      overflow: "hidden",
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    statText: {
      fontSize: 16,
      color: "#2c3e50",
    },
    statLabel: {
      fontSize: 14,
      color: "#7f8c8d",
      marginBottom: 4,
      fontWeight: "500",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#2c3e50",
    },
    filterContainer: {
      marginBottom: 16,
    },
    searchInput: {
      marginBottom: 8,
    },
    filtersRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    categoryDropdown: {
      flex: 1,
      marginRight: 8,
    },
    sortButtons: {
      flex: 1,
    },
    emptyText: {
      textAlign: "center",
      padding: 16,
      color: "#666",
    },
    modalContainer: {
      padding: 16,
      backgroundColor: "transparent",
      maxHeight: "100%",
      marginVertical: 20,
    },
    bulkRestoreContainer: {
      padding: 16,
    },
    tableHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "#f0f0f0",
      padding: 8,
    },
    tableHeaderCell: {
      flex: 1,
      fontWeight: "bold",
      textAlign: "left",
    },
    tableRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
    },
    tableCell: {
      flex: 1,
      textAlign: "left",
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      flex: 1,
    },
    sortableHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    sortIcon: {
      marginLeft: 4,
    },
    mobileHeader: {
      padding: 16,
      flexDirection: "column",
      gap: 16,
    },
    mobileButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 8,
    },
    mobileButton: {
      flex: 1,
    },
    mobileStatsScroll: {
      flexGrow: 0,
    },
    mobileStatsContainer: {
      flexDirection: "row",
      padding: 16,
      gap: 12,
    },
    mobileStatBox: {
      minWidth: 140,
      elevation: 2,
      backgroundColor: "#fff",
      borderRadius: 8,
      overflow: "hidden",
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    mobileFilters: {
      padding: 16,
      gap: 8,
    },
    mobileSearchInput: {
      marginBottom: 8,
    },
    mobileFilterRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      gap: 8,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.primary,
    },
    mobileCardList: {
      flex: 1,
      padding: 8,
    },
    mobileItemCard: {
      marginVertical: 4,
      marginHorizontal: 8,
      elevation: 2,
    },
    mobileItemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    mobileItemName: {
      fontSize: 16,
      fontWeight: "bold",
    },
    mobileItemCategory: {
      fontSize: 14,
      color: "#666",
    },
    mobileItemDetails: {
      gap: 4,
    },
    mobileItemDetail: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    mobileDetailLabel: {
      color: "#666",
    },
    mobileDetailValue: {
      fontWeight: "500",
    },
    mobileItemActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 8,
      gap: 8,
    },
    mobileTableHeader: {
      flexDirection: "row",
      backgroundColor: "#f5f5f5",
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
    },
    mobileTableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      backgroundColor: "white",
    },
    mobileTableCell: {
      padding: 12,
      justifyContent: "center",
    },
    filterButtons: {
      flexDirection: "row",
      gap: 8,
    },
    tableScrollView: {
      maxHeight: "70%",
    },
    tableCellText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#2c3e50",
    },
    actionButtons: {
      flexDirection: "row",
      gap: 8,
    },
  });

  const renderItemActions = (item: InventoryItem) => (
    <View style={styles.actionButtons}>
      <IconButton
        icon="pencil"
        onPress={() => {
          setSelectedItem(item);
          setItemModalVisible(true);
        }}
      />
      <IconButton
        icon="delete"
        onPress={() => {
          Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this item?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", onPress: () => removeItem(item.id) },
            ]
          );
        }}
      />
      <IconButton icon="eye" onPress={() => handleViewItem(item)} />
    </View>
  );

  return (
    <View style={styles.container}>
      {isMobile ? (
        <>
          <View style={{ ...styles.mobileHeader } as const}>
            <Text variant="headlineMedium">Inventory List</Text>
          </View>

          <View style={styles.mobileButtonRow}>
            <Button
              mode="outlined"
              onPress={() => setBulkRestoreModalVisible(true)}
              style={styles.mobileButton}
            >
              Bulk Restock
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setSelectedItem(null);
                setItemModalVisible(true);
              }}
              style={styles.mobileButton as ViewStyle}
            >
              Create Item
            </Button>
            <Button
              mode="outlined"
              onPress={() => setCategoryModalVisible(true)}
              style={styles.mobileButton}
            >
              Categories
            </Button>
          </View>
          <ScrollView horizontal style={styles.mobileStatsScroll as ViewStyle}>
            <View style={styles.mobileStatsContainer as ViewStyle}>
              <Card style={styles.mobileStatBox as ViewStyle}>
                <Card.Content>
                  <Text style={styles.statLabel as TextStyle}>Total Items</Text>
                  <Text style={styles.statValue as TextStyle}>
                    {totalItems}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={styles.mobileStatBox}>
                <Card.Content>
                  <Text style={styles.statLabel}>Total Stock Count</Text>
                  <Text style={styles.statValue}>{totalStockCount}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.mobileStatBox as ViewStyle}>
                <Card.Content>
                  <Text style={styles.statLabel as TextStyle}>
                    Estimated Sales
                  </Text>
                  <Text style={styles.statValue as TextStyle}>
                    {formatMoney(estimatedSales)}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={styles.mobileStatBox}>
                <Card.Content>
                  <Text style={styles.statLabel}>Total Stock Value</Text>
                  <Text style={styles.statValue}>
                    {formatMoney(totalStockValue)}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          </ScrollView>

          <View style={styles.mobileFilters as ViewStyle}>
            <TextInput
              mode="outlined"
              placeholder="Search Items"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.mobileSearchInput}
            />
            <View style={styles.mobileFilterRow as ViewStyle}>
              <Text style={styles.filterLabel as TextStyle}>Sort By:</Text>
              <View style={styles.filterButtons as ViewStyle}>
                <Menu
                  visible={isCategoryMenuVisible}
                  onDismiss={() => setIsCategoryMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setIsCategoryMenuVisible(true)}
                    >
                      {selectedCategory === "all"
                        ? "All Categories"
                        : selectedCategory}
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
                  {categories.map((cat) => (
                    <Menu.Item
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategory(cat.name);
                        setIsCategoryMenuVisible(false);
                      }}
                      title={cat.name}
                    />
                  ))}
                </Menu>
                <Menu
                  visible={isMenuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setMenuVisible(true)}
                    >
                      {sortOptions.find((opt) => opt.value === selectedSort)
                        ?.label || "Sort By"}
                    </Button>
                  }
                >
                  {sortOptions.map((option) => (
                    <Menu.Item
                      key={option.value}
                      onPress={() => {
                        handleSortChange(option.value);
                        setMenuVisible(false);
                      }}
                      title={option.label}
                    />
                  ))}
                </Menu>
              </View>
            </View>
          </View>

          <ScrollView horizontal>
            <View>
              <View style={styles.mobileTableHeader as ViewStyle}>
                <Text
                  style={[styles.mobileTableCell as TextStyle, { width: 40 }]}
                >
                  #
                </Text>
                <Text
                  style={[styles.mobileTableCell as TextStyle, { width: 120 }]}
                >
                  Item
                </Text>
                <Text
                  style={[styles.mobileTableCell as TextStyle, { width: 100 }]}
                >
                  Category
                </Text>
                <Text
                  style={[styles.mobileTableCell as TextStyle, { width: 80 }]}
                >
                  Stock
                </Text>
                <Text
                  style={[styles.mobileTableCell as TextStyle, { width: 100 }]}
                >
                  Buy Price
                </Text>
                <Text style={[styles.mobileTableCell, { width: 100 }]}>
                  Sell Price
                </Text>
                <Text style={[styles.mobileTableCell, { width: 100 }]}>
                  Value
                </Text>
                <Text
                  style={[styles.mobileTableCell as TextStyle, { width: 100 }]}
                >
                  Actions
                </Text>
              </View>
              <ScrollView>
                {sortedItems.map((item, index) => (
                  <View
                    key={item.id}
                    style={styles.mobileTableRow as ViewStyle}
                  >
                    <Text
                      style={[
                        styles.mobileTableCell as TextStyle,
                        { width: 40 },
                      ]}
                    >
                      {index + 1}
                    </Text>
                    <Text
                      style={[
                        styles.mobileTableCell as TextStyle,
                        { width: 120 },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.mobileTableCell as TextStyle,
                        { width: 100 },
                      ]}
                    >
                      {item.category}
                    </Text>
                    <Text
                      style={[
                        styles.mobileTableCell as TextStyle,
                        { width: 80 },
                      ]}
                    >
                      {item.type === "service" ? "-" : item.quantity}
                    </Text>
                    <Text
                      style={[
                        styles.mobileTableCell as TextStyle,
                        { width: 100 },
                      ]}
                    >
                      {item.type === "service"
                        ? "-"
                        : formatMoney(item.buyingPrice || 0)}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 100 }]}>
                      {formatMoney(item.sellingPrice || 0)}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 100 }]}>
                      {item.type === "service"
                        ? "-"
                        : formatMoney(item.stockValue || 0)}
                    </Text>
                    <View
                      style={[
                        styles.mobileTableCell as ViewStyle,
                        { width: 100, flexDirection: "row" },
                      ]}
                    >
                      {renderItemActions(item)}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </>
      ) : (
        <>
          <View style={styles.header as ViewStyle}>
            <Text variant="headlineMedium">Inventory List</Text>
            <View style={styles.buttonContainer as ViewStyle}>
              <Button
                mode="outlined"
                onPress={() => setBulkRestoreModalVisible(true)}
                style={styles.button as ViewStyle}
              >
                Bulk Restock
              </Button>
              <Button
                mode="outlined"
                onPress={() => setCategoryModalVisible(true)}
                style={styles.button as ViewStyle}
              >
                Create Category
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedItem(null);
                  setItemModalVisible(true);
                }}
                style={styles.button}
              >
                Create an Item
              </Button>
            </View>
          </View>
          <View style={styles.statsContainer as ViewStyle}>
            <Card style={styles.statBox as ViewStyle}>
              <Card.Content>
                <Text style={styles.statLabel as TextStyle}>Total Items</Text>
                <Text style={styles.statValue as TextStyle}>{totalItems}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statBox}>
              <Card.Content>
                <Text style={styles.statLabel as TextStyle}>
                  Total Stock Count
                </Text>
                <Text style={styles.statValue as TextStyle}>
                  {totalStockCount}
                </Text>
              </Card.Content>
            </Card>
            <Card style={styles.statBox as ViewStyle}>
              <Card.Content>
                <Text style={styles.statLabel as TextStyle}>
                  Estimated Sales
                </Text>
                <Text style={styles.statValue as TextStyle}>
                  {formatMoney(estimatedSales)}
                </Text>
              </Card.Content>
            </Card>
            <Card style={styles.statBox}>
              <Card.Content>
                <Text style={styles.statLabel as TextStyle}>
                  Total Stock Value
                </Text>
                <Text style={styles.statValue as TextStyle}>
                  {formatMoney(totalStockValue)}
                </Text>
              </Card.Content>
            </Card>
          </View>
          <View style={styles.filterContainer as ViewStyle}>
            <TextInput
              mode="outlined"
              placeholder="Search Items"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput as TextStyle}
            />
            <View style={styles.filtersRow as ViewStyle}>
              <Menu
                visible={isCategoryMenuVisible}
                onDismiss={() => setIsCategoryMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setIsCategoryMenuVisible(true)}
                    style={styles.categoryDropdown}
                  >
                    {selectedCategory === "all"
                      ? "All Categories"
                      : selectedCategory}
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
                {categories.map((cat) => (
                  <Menu.Item
                    key={cat.id}
                    onPress={() => {
                      setSelectedCategory(cat.name);
                      setIsCategoryMenuVisible(false);
                    }}
                    title={cat.name}
                  />
                ))}
              </Menu>
              <SegmentedButtons
                value={selectedSort}
                onValueChange={handleSortChange}
                buttons={sortOptions}
                style={styles.sortButtons}
              />
            </View>
          </View>
          <ScrollView>
            {items.length === 0 ? (
              <Text style={styles.emptyText}>
                No items available in inventory.
              </Text>
            ) : (
              <View>
                <View style={styles.tableHeader as ViewStyle}>
                  <Text
                    style={[styles.tableHeaderCell as TextStyle, { flex: 0.5 }]}
                  >
                    #
                  </Text>
                  <Text
                    style={[
                      styles.tableHeaderCell as TextStyle,
                      styles.sortableHeader as TextStyle,
                    ]}
                    onPress={() => handleSort("name")}
                  >
                    Item{" "}
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                  <Text
                    style={[styles.tableHeaderCell, styles.sortableHeader]}
                    onPress={() => handleSort("category")}
                  >
                    Category{" "}
                    {sortConfig.key === "category" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                  <Text
                    style={[
                      styles.tableHeaderCell as TextStyle,
                      styles.sortableHeader as TextStyle,
                    ]}
                    onPress={() => handleSort("quantity")}
                  >
                    Stock Count{" "}
                    {sortConfig.key === "quantity" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                  <Text
                    style={[styles.tableHeaderCell, styles.sortableHeader]}
                    onPress={() => handleSort("buyingPrice")}
                  >
                    Buying Price{" "}
                    {sortConfig.key === "buyingPrice" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                  <Text
                    style={[styles.tableHeaderCell, styles.sortableHeader]}
                    onPress={() => handleSort("sellingPrice")}
                  >
                    Selling Price{" "}
                    {sortConfig.key === "sellingPrice" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                  <Text
                    style={[styles.tableHeaderCell, styles.sortableHeader]}
                    onPress={() => handleSort("stockValue")}
                  >
                    Stock Value{" "}
                    {sortConfig.key === "stockValue" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </Text>
                  <Text style={styles.tableHeaderCell}>Actions</Text>
                </View>
                <ScrollView style={styles.tableScrollView}>
                  {sortedItems.map((item, index) => (
                    <View key={item.id} style={styles.tableRow as ViewStyle}>
                      <Text
                        style={[styles.tableCell as TextStyle, { flex: 0.5 }]}
                      >
                        {index + 1}
                      </Text>
                      <Text style={styles.tableCell as TextStyle}>
                        {item.name}
                      </Text>
                      <Text style={styles.tableCell as TextStyle}>
                        {item.category}
                      </Text>
                      <Text style={styles.tableCell as TextStyle}>
                        {item.type === "service" ? "-" : item.quantity}
                      </Text>
                      <Text style={styles.tableCell as TextStyle}>
                        {item.type === "service"
                          ? "-"
                          : formatMoney(item.buyingPrice || 0)}
                      </Text>
                      <Text style={styles.tableCell}>
                        {formatMoney(item.sellingPrice || 0)}
                      </Text>
                      <Text style={styles.tableCell}>
                        {item.type === "service"
                          ? "-"
                          : formatMoney(item.stockValue || 0)}
                      </Text>
                      <View style={styles.actionsContainer}>
                        {renderItemActions(item)}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* Category Modal */}
      <Modal
        visible={isCategoryModalVisible}
        onDismiss={() => {
          setCategoryModalVisible(false);
          setSelectedItem(null);
        }}
      >
        <CategoryForm
          onClose={() => {
            setCategoryModalVisible(false);
            setSelectedItem(null);
          }}
        />
      </Modal>

      {/* Item Modal */}
      <Modal
        visible={isItemModalVisible}
        onDismiss={() => {
          setItemModalVisible(false);
          setSelectedItem(null);
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <ProductForm
          initialData={selectedItem}
          categories={categories}
          onClose={() => {
            setItemModalVisible(false);
            setSelectedItem(null);
          }}
          onSubmit={(data) => {
            const itemData: InventoryItem = {
              id: selectedItem ? selectedItem.id : generateSimpleId(),
              name: data.name,
              quantity: data.quantity,
              category: data.category,
              buyingPrice: data.buyingPrice,
              sellingPrice: data.sellingPrice,
              measuringUnit: data.measuringUnit,
              stockValue: data.buyingPrice * data.quantity,
              createdAt: new Date().toISOString(),
              price: data.sellingPrice,
              type: data.type,
              charges: data.charges,
            };
            if (selectedItem) {
              editItem(itemData as Required<InventoryItem>);
            } else {
              addItem(itemData as Required<InventoryItem>);
            }
            setItemModalVisible(false);
          }}
        />
      </Modal>

      {/* Bulk Restore Modal */}
      <Modal
        visible={isBulkRestoreModalVisible}
        onDismiss={() => setBulkRestoreModalVisible(false)}
        contentContainerStyle={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "white",
          padding: Platform.OS === "web" ? 20 : 0,
          margin: Platform.OS === "web" ? 40 : 0,
        }}
      >
        <RestockForm
          items={items}
          onClose={() => setBulkRestoreModalVisible(false)}
          onSubmit={(selectedItems) => {
            console.log("Selected items for restock:", selectedItems);
            setBulkRestoreModalVisible(false);
          }}
          updateItem={updateItem}
        />
      </Modal>
    </View>
  );
};

export default InventoryScreen;
