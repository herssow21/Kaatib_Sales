import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  useWindowDimensions,
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
} from "react-native-paper";
import { useInventoryContext } from "../../contexts/InventoryContext";
import { useCategoryContext } from "../../contexts/CategoryContext";
import CategoryForm from "../../components/CategoryForm";
import ProductForm from "../../components/ProductForm";
import * as DocumentPicker from "expo-document-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
}

const InventoryScreen = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { items, addItem, editItem, removeItem } = useInventoryContext();
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
    (total, item) => total + item.price * (item.quantity || 0),
    0
  );
  const totalStockValue = estimatedSales;

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
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeItem(id);
            // Optional: Add feedback
            Alert.alert("Success", "Item deleted successfully");
          },
        },
      ],
      { cancelable: true }
    );
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
      maxHeight: "70vh",
    },
  });

  return (
    <View style={styles.container}>
      {isMobile ? (
        <>
          <View style={styles.mobileHeader}>
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
              style={styles.mobileButton}
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

          <ScrollView horizontal style={styles.mobileStatsScroll}>
            <View style={styles.mobileStatsContainer}>
              <Card style={styles.mobileStatBox}>
                <Card.Content>
                  <Text style={styles.statLabel}>Total Items</Text>
                  <Text style={styles.statValue}>{totalItems}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.mobileStatBox}>
                <Card.Content>
                  <Text style={styles.statLabel}>Total Stock Count</Text>
                  <Text style={styles.statValue}>{totalStockCount}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.mobileStatBox}>
                <Card.Content>
                  <Text style={styles.statLabel}>Estimated Sales</Text>
                  <Text style={styles.statValue}>
                    KES {estimatedSales.toFixed(2)}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={styles.mobileStatBox}>
                <Card.Content>
                  <Text style={styles.statLabel}>Total Stock Value</Text>
                  <Text style={styles.statValue}>
                    KES {totalStockValue.toFixed(2)}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          </ScrollView>

          <View style={styles.mobileFilters}>
            <TextInput
              mode="outlined"
              placeholder="Search Items"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.mobileSearchInput}
            />
            <View style={styles.mobileFilterRow}>
              <Text style={styles.filterLabel}>Sort By:</Text>
              <View style={styles.filterButtons}>
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
              <View style={styles.mobileTableHeader}>
                <Text style={[styles.mobileTableCell, { width: 40 }]}>#</Text>
                <Text style={[styles.mobileTableCell, { width: 120 }]}>
                  Item
                </Text>
                <Text style={[styles.mobileTableCell, { width: 100 }]}>
                  Category
                </Text>
                <Text style={[styles.mobileTableCell, { width: 80 }]}>
                  Stock
                </Text>
                <Text style={[styles.mobileTableCell, { width: 100 }]}>
                  Buy Price
                </Text>
                <Text style={[styles.mobileTableCell, { width: 100 }]}>
                  Sell Price
                </Text>
                <Text style={[styles.mobileTableCell, { width: 100 }]}>
                  Value
                </Text>
                <Text style={[styles.mobileTableCell, { width: 100 }]}>
                  Actions
                </Text>
              </View>
              <ScrollView>
                {sortedItems.map((item, index) => (
                  <View key={item.id} style={styles.mobileTableRow}>
                    <Text style={[styles.mobileTableCell, { width: 40 }]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 120 }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 100 }]}>
                      {item.category}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 80 }]}>
                      {item.quantity}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 100 }]}>
                      KES {item.buyingPrice.toFixed(2)}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 100 }]}>
                      KES {item.sellingPrice.toFixed(2)}
                    </Text>
                    <Text style={[styles.mobileTableCell, { width: 100 }]}>
                      KES {item.stockValue.toFixed(2)}
                    </Text>
                    <View
                      style={[
                        styles.mobileTableCell,
                        { width: 100, flexDirection: "row" },
                      ]}
                    >
                      <Button
                        mode="text"
                        onPress={() => {
                          setSelectedItem(item);
                          setItemModalVisible(true);
                        }}
                        icon={() => (
                          <MaterialCommunityIcons
                            name="pencil"
                            size={20}
                            color={theme.colors.primary}
                          />
                        )}
                      />
                      <Button
                        mode="text"
                        onPress={() => handleDeleteItem(item.id)}
                        icon={() => (
                          <MaterialCommunityIcons
                            name="delete"
                            size={20}
                            color={theme.colors.error}
                          />
                        )}
                      >
                        {/* Empty children prop */}
                      </Button>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text variant="headlineMedium">Inventory List</Text>
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setBulkRestoreModalVisible(true)}
                style={styles.button}
              >
                Bulk Restock
              </Button>
              <Button
                mode="outlined"
                onPress={() => setCategoryModalVisible(true)}
                style={styles.button}
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
          <View style={styles.statsContainer}>
            <Card style={styles.statBox}>
              <Card.Content>
                <Text style={styles.statLabel}>Total Items</Text>
                <Text style={styles.statValue}>{totalItems}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statBox}>
              <Card.Content>
                <Text style={styles.statLabel}>Total Stock Count</Text>
                <Text style={styles.statValue}>{totalStockCount}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statBox}>
              <Card.Content>
                <Text style={styles.statLabel}>Estimated Sales</Text>
                <Text style={styles.statValue}>
                  KES {estimatedSales.toFixed(2)}
                </Text>
              </Card.Content>
            </Card>
            <Card style={styles.statBox}>
              <Card.Content>
                <Text style={styles.statLabel}>Total Stock Value</Text>
                <Text style={styles.statValue}>
                  KES {totalStockValue.toFixed(2)}
                </Text>
              </Card.Content>
            </Card>
          </View>
          <View style={styles.filterContainer}>
            <TextInput
              mode="outlined"
              placeholder="Search Items"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            <View style={styles.filtersRow}>
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
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>#</Text>
                  <Text
                    style={[styles.tableHeaderCell, styles.sortableHeader]}
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
                    style={[styles.tableHeaderCell, styles.sortableHeader]}
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
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 0.5 }]}>
                        {index + 1}
                      </Text>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={styles.tableCell}>{item.category}</Text>
                      <Text style={styles.tableCell}>{item.quantity}</Text>
                      <Text style={styles.tableCell}>
                        KES{" "}
                        {item.buyingPrice
                          ? item.buyingPrice.toFixed(2)
                          : "0.00"}
                      </Text>
                      <Text style={styles.tableCell}>
                        KES{" "}
                        {item.sellingPrice
                          ? item.sellingPrice.toFixed(2)
                          : "0.00"}
                      </Text>
                      <Text style={styles.tableCell}>
                        KES{" "}
                        {item.stockValue ? item.stockValue.toFixed(2) : "0.00"}
                      </Text>
                      <View style={styles.actionsContainer}>
                        <Button
                          mode="text"
                          onPress={() => {
                            setSelectedItem(item);
                            setItemModalVisible(true);
                          }}
                          icon={() => (
                            <MaterialCommunityIcons
                              name="pencil"
                              size={20}
                              color={theme.colors.primary}
                            />
                          )}
                        />
                        <Button
                          mode="text"
                          onPress={() => handleDeleteItem(item.id)}
                          icon={() => (
                            <MaterialCommunityIcons
                              name="delete"
                              size={20}
                              color={theme.colors.error}
                            />
                          )}
                        >
                          {/* Empty children prop */}
                        </Button>
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
        onDismiss={() => setCategoryModalVisible(false)}
      >
        <CategoryForm
          initialData={selectedItem}
          onClose={() => setCategoryModalVisible(false)}
        />
      </Modal>

      {/* Item Modal */}
      <Modal
        visible={isItemModalVisible}
        onDismiss={() => setItemModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ProductForm
          initialData={selectedItem}
          categories={categories}
          onClose={() => setItemModalVisible(false)}
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
            };
            if (selectedItem) {
              editItem(itemData);
            } else {
              addItem(itemData);
            }
            setItemModalVisible(false);
          }}
        />
      </Modal>

      {/* Bulk Restore Modal */}
      <Modal
        visible={isBulkRestoreModalVisible}
        onDismiss={() => setBulkRestoreModalVisible(false)}
      >
        <View style={styles.bulkRestoreContainer}>
          <Text>Upload Excel File for Bulk Restore</Text>
          <Button onPress={handleBulkRestore}>Upload</Button>
          <Button onPress={() => setBulkRestoreModalVisible(false)}>
            Cancel
          </Button>
        </View>
      </Modal>
    </View>
  );
};

export default InventoryScreen;
