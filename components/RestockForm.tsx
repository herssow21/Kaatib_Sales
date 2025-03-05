import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Button, Checkbox } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker"; // Import DocumentPicker
import type { InventoryItem } from "../app/types";

interface RestockFormProps {
  items: InventoryItem[];
  onSubmit: (
    selectedItems: {
      id: string;
      quantity: number;
      buyingPrice: number;
      sellingPrice: number;
    }[]
  ) => void;
  onClose: () => void;
}

const RestockForm: React.FC<RestockFormProps> = ({
  items,
  onSubmit,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    {
      id: string;
      quantity: number;
      buyingPrice: number;
      sellingPrice: number;
    }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newQuantity, setNewQuantity] = useState(0);
  const [newBuyingPrice, setNewBuyingPrice] = useState("");
  const [newSellingPrice, setNewSellingPrice] = useState("");
  const [applyImmediately, setApplyImmediately] = useState(false);
  const [isBuyingPriceEditable, setIsBuyingPriceEditable] = useState(false);
  const [isSellingPriceEditable, setIsSellingPriceEditable] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null); // For file/image attachment

  const filteredItems = items
    .filter((item) => item.type === "product") // Only include products
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleItemSelect = (itemId: string) => {
    if (selectedItems.find((item) => item.id === itemId)) {
      setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
    } else {
      const selectedItem = items.find((item) => item.id === itemId);
      if (selectedItem) {
        setSelectedItems([
          ...selectedItems,
          {
            id: selectedItem.id,
            quantity: 0,
            buyingPrice: selectedItem.buyingPrice,
            sellingPrice: selectedItem.sellingPrice,
          },
        ]);
      }
    }
  };

  const handleViewRestockList = () => {
    setModalVisible(true);
  };

  const handleApplyChanges = () => {
    const updatedItems = selectedItems.map((item) => ({
      ...item,
      quantity: newQuantity,
      buyingPrice: parseFloat(newBuyingPrice),
      sellingPrice: parseFloat(newSellingPrice),
    }));
    onSubmit(updatedItems);
    setModalVisible(false);
  };

  const handleFileSelection = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*", // Allow all file types
    });
    if (result.type === "success") {
      setReceiptImage(result.uri); // Store the file URI
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Bulk Restock
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Search Item"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          right={<TextInput.Icon icon="magnify" />}
        />
        <Button
          mode="contained"
          onPress={handleViewRestockList}
          style={styles.viewButton}
        >
          View Restock List{" "}
          {selectedItems.length > 0 && `(${selectedItems.length})`}
        </Button>
      </View>

      <ScrollView style={styles.itemList}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 0.5 }]}>Item</Text>
          <Text style={[styles.headerCell, { flex: 0.25 }]}>Current Stock</Text>
        </View>

        {filteredItems.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Checkbox
              status={
                selectedItems.some((selected) => selected.id === item.id)
                  ? "checked"
                  : "unchecked"
              }
              onPress={() => handleItemSelect(item.id)}
            />
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.name}</Text>
            <Text style={[styles.cell, { flex: 0.25 }]}>{item.quantity}</Text>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, styles.boldTitle]}>
              Update Stock Information
            </Text>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={{ color: "white" }}>✖</Text>
            </Button>
          </View>

          <View style={styles.toggleContainer}>
            <Checkbox
              status={isBuyingPriceEditable ? "checked" : "unchecked"}
              onPress={() => setIsBuyingPriceEditable(!isBuyingPriceEditable)}
            />
            <Text>Change Buying Price</Text>
            <Checkbox
              status={isSellingPriceEditable ? "checked" : "unchecked"}
              onPress={() => setIsSellingPriceEditable(!isSellingPriceEditable)}
            />
            <Text>Change Selling Price</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 0.5 }]}>Item</Text>
            <Text style={[styles.headerCell, { flex: 0.25 }]}>In Stock</Text>
            <Text style={[styles.headerCell, { flex: 0.25 }]}>Qty</Text>
            <Text style={[styles.headerCell, { flex: 0.25 }]}>
              Buying Price
            </Text>
            <Text style={[styles.headerCell, { flex: 0.25 }]}>
              Selling Price
            </Text>
            <Text style={[styles.headerCell, { flex: 0.25 }]}>Total</Text>
          </View>

          {selectedItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 0.5 }]}>{item.name}</Text>
              <Text style={[styles.cell, { flex: 0.25 }]}>{item.quantity}</Text>
              <TextInput
                style={[styles.cell, { flex: 0.25, margin: 5 }]}
                keyboardType="numeric"
                onChangeText={(text) => setNewQuantity(parseInt(text) || 0)}
              />
              <TextInput
                style={[styles.cell, { flex: 0.25, margin: 5 }]}
                keyboardType="numeric"
                editable={isBuyingPriceEditable}
                value={newBuyingPrice}
                onChangeText={setNewBuyingPrice}
              />
              <TextInput
                style={[styles.cell, { flex: 0.25, margin: 5 }]}
                keyboardType="numeric"
                editable={isSellingPriceEditable}
                value={newSellingPrice}
                onChangeText={setNewSellingPrice}
              />
              <Text style={[styles.cell, { flex: 0.25 }]}>
                {newQuantity * parseFloat(item.buyingPrice.toString())}
              </Text>
            </View>
          ))}

          <View style={styles.immediateUpdateContainer}>
            <Checkbox
              status={applyImmediately ? "checked" : "unchecked"}
              onPress={() => setApplyImmediately(!applyImmediately)}
            />
            <Text>Apply new buying/selling prices immediately</Text>
          </View>

          <Text style={styles.attachmentLabel}>
            Add files/image of Receipt or Goods Received Note
          </Text>
          <TouchableOpacity
            style={styles.receiptInput}
            onPress={handleFileSelection}
          >
            <Text>Click to find file or drop here</Text>
          </TouchableOpacity>
          <Button
            mode="contained"
            onPress={handleApplyChanges}
            style={styles.applyButton}
          >
            Save New Stock
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
    backgroundColor: "white",
  },
  title: {
    marginBottom: 16,
    fontWeight: "bold",
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  searchInput: {
    flex: 1,
  },
  viewButton: {
    minWidth: 150,
  },
  itemList: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerCell: {
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  cell: {
    fontSize: 14,
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  boldTitle: {
    fontWeight: "bold",
  },
  applyButton: {
    backgroundColor: "#d9534f", // Red color for the button
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "red",
    color: "white",
    alignSelf: "flex-end",
    marginTop: 20,
    borderRadius: 90, // Make it circular
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  immediateUpdateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  receiptInput: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentLabel: {
    marginTop: 20,
    fontWeight: "bold",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
});

export default RestockForm;
