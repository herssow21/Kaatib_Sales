import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
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
import { customAlphabet } from "nanoid/non-secure";
const generateId = customAlphabet("1234567890abcdef", 10);

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

  return (
    <View style={styles.container}>
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
            <Text style={styles.statText}>{totalItems} Items</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statBox}>
          <Card.Content>
            <Text style={styles.statText}>
              {totalStockCount} Total Stock Count
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statBox}>
          <Card.Content>
            <Text style={styles.statText}>
              KES {estimatedSales.toFixed(2)} Estimated Sales
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statBox}>
          <Card.Content>
            <Text style={styles.statText}>
              KES {totalStockValue.toFixed(2)} Total Stock Value
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
          <Text style={styles.emptyText}>No items available in inventory.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
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
            {sortedItems.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.name}</Text>
                <Text style={styles.tableCell}>{item.category}</Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCell}>
                  KES {item.buyingPrice ? item.buyingPrice.toFixed(2) : "0.00"}
                </Text>
                <Text style={styles.tableCell}>
                  KES{" "}
                  {item.sellingPrice ? item.sellingPrice.toFixed(2) : "0.00"}
                </Text>
                <Text style={styles.tableCell}>
                  KES {item.stockValue ? item.stockValue.toFixed(2) : "0.00"}
                </Text>
                <View style={styles.actionsContainer}>
                  <Button
                    mode="text"
                    onPress={() => {
                      setSelectedItem(item);
                      setItemModalVisible(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="text"
                    textColor={theme.colors.error}
                    onPress={() => {
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
                              removeItem(item.id);
                              Alert.alert(
                                "Success",
                                "Item deleted successfully"
                              );
                            },
                          },
                        ],
                        { cancelable: true }
                      );
                    }}
                  >
                    Delete
                  </Button>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
              id: selectedItem ? selectedItem.id : generateId(),
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
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 2,
    padding: 8,
  },
  statText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
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
});

export default InventoryScreen;
