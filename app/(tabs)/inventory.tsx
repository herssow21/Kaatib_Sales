import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import {
  Text,
  Button,
  TextInput,
  useTheme,
  Card,
  Modal,
} from "react-native-paper";
import { useInventoryContext } from "../../contexts/InventoryContext";
import { useCategoryContext } from "../../contexts/CategoryContext";
import CategoryForm from "../../components/CategoryForm";
import ProductForm from "../../components/ProductForm";
import * as DocumentPicker from "expo-document-picker";
import { nanoid } from "nanoid/non-secure";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number; // This can be the base price or a different field
  category: string;
  createdAt: string;
  buyingPrice: number; // Add this if it's part of your data structure
  sellingPrice: number; // Add this if it's part of your data structure
  stockValue: number; // Add this if it's part of your data structure
}

const InventoryScreen = () => {
  const theme = useTheme();
  const { items, addItem, editItem } = useInventoryContext();
  const { categories } = useCategoryContext();

  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isItemModalVisible, setItemModalVisible] = useState(false);
  const [isBulkRestoreModalVisible, setBulkRestoreModalVisible] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "ascending",
  });

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

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = [...items].sort((a, b) => {
    if (sortConfig.direction === "ascending") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    } else {
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
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
      <TextInput
        mode="outlined"
        placeholder="Search Items"
        style={styles.searchInput}
      />
      <ScrollView>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items available in inventory.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text
                style={styles.tableHeaderCell}
                onPress={() => handleSort("name")}
              >
                Item
              </Text>
              <Text
                style={styles.tableHeaderCell}
                onPress={() => handleSort("quantity")}
              >
                Stock Count
              </Text>
              <Text
                style={styles.tableHeaderCell}
                onPress={() => handleSort("buyingPrice")}
              >
                Buying Price
              </Text>
              <Text
                style={styles.tableHeaderCell}
                onPress={() => handleSort("sellingPrice")}
              >
                Selling Price
              </Text>
              <Text
                style={styles.tableHeaderCell}
                onPress={() => handleSort("stockValue")}
              >
                Stock Value
              </Text>
            </View>
            {sortedItems.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.name}</Text>
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
                <Button
                  onPress={() => {
                    setSelectedItem(item);
                    setItemModalVisible(true);
                  }}
                >
                  Edit
                </Button>
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
      >
        <ProductForm
          initialData={selectedItem}
          categories={categories}
          onSubmit={(data) => {
            const itemData: InventoryItem = {
              id: selectedItem ? selectedItem.id : nanoid(),
              name: data.name,
              quantity: data.quantity || 0,
              category: data.category,
              buyingPrice: data.buyingPrice || 0,
              sellingPrice: data.sellingPrice || 0,
              stockValue: (data.quantity || 0) * (data.sellingPrice || 0),
              price: data.price || 0,
              createdAt: new Date().toISOString(),
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
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 2,
  },
  statText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  searchInput: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#666",
  },
  modalContainer: {
    padding: 16,
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
});

export default InventoryScreen;
