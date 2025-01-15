import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  Button,
  TextInput,
  useTheme,
  Card,
  Modal,
} from "react-native-paper";
import { useInventoryContext } from "../../contexts/InventoryContext";
import CategoryForm from "../../components/CategoryForm";
import ProductForm from "../../components/ProductForm";
import * as DocumentPicker from "expo-document-picker";
import { nanoid } from "nanoid";

const InventoryScreen = () => {
  const theme = useTheme();
  const { items, addItem, editItem } = useInventoryContext();

  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isItemModalVisible, setItemModalVisible] = useState(false);
  const [isBulkRestoreModalVisible, setBulkRestoreModalVisible] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemType, setItemType] = useState("product");

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

  const handleBulkRestore = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    if (result.type === "success") {
      console.log(result.uri);
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
            mode="contained"
            onPress={() => {
              setSelectedItem(null);
              setItemModalVisible(true);
            }}
            style={styles.button}
          >
            Create an Item
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedCategory(null);
              setCategoryModalVisible(true);
            }}
            style={styles.button}
          >
            Create Category
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
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Item</Text>
          <Text style={styles.tableHeaderText}>Stock Count</Text>
          <Text style={styles.tableHeaderText}>Buying Price</Text>
          <Text style={styles.tableHeaderText}>Selling Price</Text>
          <Text style={styles.tableHeaderText}>Stock Value</Text>
        </View>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items available in inventory.</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text>{item.name}</Text>
              <Text>{item.quantity}</Text>
              <Text>KES {item.price.toFixed(2)}</Text>
              <Text>KES {(item.price * (item.quantity || 0)).toFixed(2)}</Text>
              <Text>KES {(item.price * (item.quantity || 0)).toFixed(2)}</Text>
              <Button
                onPress={() => {
                  setSelectedItem(item);
                  setItemModalVisible(true);
                }}
              >
                Edit
              </Button>
            </View>
          ))
        )}
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={isCategoryModalVisible}
        onDismiss={() => setCategoryModalVisible(false)}
      >
        <CategoryForm
          initialData={selectedCategory}
          onClose={() => setCategoryModalVisible(false)}
        />
      </Modal>

      {/* Item Modal */}
      <Modal
        visible={isItemModalVisible}
        onDismiss={() => setItemModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text>Select Item Type:</Text>
          <Button onPress={() => setItemType("product")}>Product</Button>
          <Button onPress={() => setItemType("service")}>Service</Button>
          {itemType === "product" ? (
            <ProductForm
              initialData={selectedItem}
              onSubmit={(data) => {
                const itemData = {
                  id: selectedItem ? selectedItem.id : nanoid(),
                  name: data.name,
                  price: data.price,
                  quantity: data.quantity !== undefined ? data.quantity : 0,
                  category: data.category,
                };

                if (selectedItem) {
                  editItem(itemData);
                } else {
                  addItem(itemData);
                }
                setItemModalVisible(false);
              }}
            />
          ) : (
            <View>
              <TextInput
                mode="outlined"
                label="Service Title"
                onChangeText={(text) =>
                  setSelectedItem({ ...selectedItem, name: text })
                }
              />
              <TextInput
                mode="outlined"
                label="Charges"
                keyboardType="numeric"
                onChangeText={(text) =>
                  setSelectedItem({ ...selectedItem, price: parseFloat(text) })
                }
              />
              <Text>Select Category:</Text>
              <Button onPress={() => setCategoryModalVisible(true)}>
                Select Category
              </Button>
            </View>
          )}
        </View>
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
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableHeaderText: {
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#666",
  },
  bulkRestoreContainer: {
    padding: 16,
  },
  modalContainer: {
    padding: 16,
  },
});

export default InventoryScreen;
