import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
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
  updateItem: (updatedItem: InventoryItem) => void;
}

const RestockForm: React.FC<RestockFormProps> = ({
  items,
  onSubmit,
  onClose,
  updateItem,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    {
      id: string;
      name: string;
      quantity: number;
      buyingPrice: number;
      sellingPrice: number;
      currentStock: number;
    }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [newBuyingPrices, setNewBuyingPrices] = useState<{
    [key: string]: string;
  }>({});
  const [newSellingPrices, setNewSellingPrices] = useState<{
    [key: string]: string;
  }>({});
  const [applyImmediately, setApplyImmediately] = useState(false);
  const [isBuyingPriceEditable, setIsBuyingPriceEditable] = useState(false);
  const [isSellingPriceEditable, setIsSellingPriceEditable] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);

  const filteredItems = items
    .filter((item) => item.type === "product")
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleItemSelect = (itemId: string) => {
    const selectedItem = items.find((item) => item.id === itemId);
    if (selectedItem) {
      if (selectedItems.find((item) => item.id === itemId)) {
        setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
      } else {
        setSelectedItems([
          ...selectedItems,
          {
            id: selectedItem.id,
            name: selectedItem.name,
            quantity: 0,
            buyingPrice: selectedItem.buyingPrice,
            sellingPrice: selectedItem.sellingPrice,
            currentStock: selectedItem.quantity,
          },
        ]);
      }
    }
  };

  const handleViewRestockList = () => {
    setModalVisible(true);
  };

  const handleApplyChanges = () => {
    const updatedItems = selectedItems.map((item) => {
      const existingItem = items.find((i) => i.id === item.id);
      if (existingItem) {
        const quantityToAdd = quantities[item.id] || 0;
        const updatedQuantity = existingItem.quantity + quantityToAdd;

        // Handle price updates based on applyImmediately checkbox
        let updatedBuyingPrice = existingItem.buyingPrice;
        let updatedSellingPrice = existingItem.sellingPrice;

        if (isBuyingPriceEditable) {
          const newBuyingPrice =
            parseFloat(newBuyingPrices[item.id]) || existingItem.buyingPrice;
          if (applyImmediately) {
            updatedBuyingPrice = newBuyingPrice;
          } else {
            // Store new price to apply after current stock is depleted
            updatedBuyingPrice =
              existingItem.quantity === 0
                ? newBuyingPrice
                : existingItem.buyingPrice;
            // Store the future price in a new field
            existingItem.futureBuyingPrice = newBuyingPrice;
          }
        }

        if (isSellingPriceEditable) {
          const newSellingPrice =
            parseFloat(newSellingPrices[item.id]) || existingItem.sellingPrice;
          if (applyImmediately) {
            updatedSellingPrice = newSellingPrice;
          } else {
            // Store new price to apply after current stock is depleted
            updatedSellingPrice =
              existingItem.quantity === 0
                ? newSellingPrice
                : existingItem.sellingPrice;
            // Store the future price in a new field
            existingItem.futureSellingPrice = newSellingPrice;
          }
        }

        return {
          ...existingItem,
          quantity: updatedQuantity,
          buyingPrice: updatedBuyingPrice,
          sellingPrice: updatedSellingPrice,
          futureBuyingPrice: existingItem.futureBuyingPrice,
          futureSellingPrice: existingItem.futureSellingPrice,
        };
      }
      return item;
    });

    try {
      updatedItems.forEach((updatedItem) => {
        updateItem(updatedItem);
      });
      Alert.alert("Success", "Stock updated successfully!");
      onSubmit(updatedItems);
    } catch (error) {
      Alert.alert("Error", "Failed to update stock. Please try again.");
    }

    setModalVisible(false);
  };

  const handleFileSelection = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
    });
    if (result.type === "success") {
      setReceiptImage(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.modalTitle}>
          Bulk Restock
        </Text>
        <Button mode="outlined" onPress={onClose} style={styles.closeButton}>
          Close
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Search Item"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          right={<TextInput.Icon icon="magnify" />}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 0.2 }]}>Select</Text>
          <Text style={[styles.headerCell, { flex: 0.5 }]}>Item</Text>
          <Text style={[styles.headerCell, { flex: 0.3 }]}>Current Stock</Text>
        </View>

        {filteredItems.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <View style={{ flex: 0.2, alignItems: "center" }}>
              <Checkbox
                status={
                  selectedItems.some((selected) => selected.id === item.id)
                    ? "checked"
                    : "unchecked"
                }
                onPress={() => handleItemSelect(item.id)}
              />
            </View>
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.name}</Text>
            <Text style={[styles.cell, { flex: 0.3 }]}>{item.quantity}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleViewRestockList}
          style={styles.viewButton}
        >
          View Restock List{" "}
          {selectedItems.length > 0 && `(${selectedItems.length})`}
        </Button>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Update Stock Information</Text>
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

          <View style={styles.tableWrapper}>
            {Platform.OS === "web" ? (
              // Web Layout
              <View style={styles.tableContent}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, { flex: 1, minWidth: 200 }]}>
                    Item
                  </Text>
                  <Text
                    style={[styles.headerCell, { flex: 0.5, minWidth: 100 }]}
                  >
                    In Stock
                  </Text>
                  <Text
                    style={[styles.headerCell, { flex: 0.5, minWidth: 100 }]}
                  >
                    Qty
                  </Text>
                  <Text
                    style={[styles.headerCell, { flex: 0.6, minWidth: 120 }]}
                  >
                    Buy Price
                  </Text>
                  <Text
                    style={[styles.headerCell, { flex: 0.6, minWidth: 120 }]}
                  >
                    Sell Price
                  </Text>
                  <Text
                    style={[styles.headerCell, { flex: 0.8, minWidth: 150 }]}
                  >
                    Total Value
                  </Text>
                </View>

                <ScrollView style={styles.tableBody}>
                  {selectedItems.map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.cell, { flex: 1, minWidth: 200 }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.cell, { flex: 0.5, minWidth: 100 }]}>
                        {item.currentStock}
                      </Text>
                      <View style={[styles.cell, { flex: 0.5, minWidth: 100 }]}>
                        <TextInput
                          style={styles.input}
                          keyboardType="number-pad"
                          returnKeyType="done"
                          value={quantities[item.id]?.toString() || "0"}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9]/g, "");
                            setQuantities({
                              ...quantities,
                              [item.id]: parseInt(numericValue) || 0,
                            });
                          }}
                        />
                      </View>
                      <View style={[styles.cell, { flex: 0.6, minWidth: 120 }]}>
                        <TextInput
                          style={styles.input}
                          keyboardType="number-pad"
                          returnKeyType="done"
                          editable={isBuyingPriceEditable}
                          value={
                            isBuyingPriceEditable
                              ? newBuyingPrices[item.id] ||
                                item.buyingPrice.toString()
                              : item.buyingPrice.toString()
                          }
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9.]/g, "");
                            setNewBuyingPrices((prev) => ({
                              ...prev,
                              [item.id]: numericValue,
                            }));
                          }}
                        />
                      </View>
                      <View style={[styles.cell, { flex: 0.6, minWidth: 120 }]}>
                        <TextInput
                          style={styles.input}
                          keyboardType="number-pad"
                          returnKeyType="done"
                          editable={isSellingPriceEditable}
                          value={
                            isSellingPriceEditable
                              ? newSellingPrices[item.id] ||
                                item.sellingPrice.toString()
                              : item.sellingPrice.toString()
                          }
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9.]/g, "");
                            setNewSellingPrices((prev) => ({
                              ...prev,
                              [item.id]: numericValue,
                            }));
                          }}
                        />
                      </View>
                      <Text style={[styles.cell, { flex: 0.8, minWidth: 150 }]}>
                        {quantities[item.id] *
                          (isBuyingPriceEditable && newBuyingPrices[item.id]
                            ? parseFloat(newBuyingPrices[item.id])
                            : parseFloat(item.buyingPrice.toString())) || 0}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              // Mobile Layout
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.mobileTableContent}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { width: 200 }]}>
                      Item
                    </Text>
                    <Text style={[styles.headerCell, { width: 100 }]}>
                      In Stock
                    </Text>
                    <Text style={[styles.headerCell, { width: 100 }]}>Qty</Text>
                    <Text style={[styles.headerCell, { width: 120 }]}>
                      Buy Price
                    </Text>
                    <Text style={[styles.headerCell, { width: 120 }]}>
                      Sell Price
                    </Text>
                    <Text style={[styles.headerCell, { width: 150 }]}>
                      Total Value
                    </Text>
                  </View>

                  <ScrollView style={styles.tableBody}>
                    {selectedItems.map((item) => (
                      <View key={item.id} style={styles.tableRow}>
                        <Text style={[styles.cell, { width: 200 }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.cell, { width: 100 }]}>
                          {item.currentStock}
                        </Text>
                        <View style={[styles.cell, { width: 100 }]}>
                          <TextInput
                            style={styles.mobileInput}
                            keyboardType="numeric"
                            returnKeyType="done"
                            value={quantities[item.id]?.toString() || "0"}
                            onChangeText={(text) => {
                              const numericValue = text.replace(/[^0-9]/g, "");
                              setQuantities({
                                ...quantities,
                                [item.id]: parseInt(numericValue) || 0,
                              });
                            }}
                          />
                        </View>
                        <View style={[styles.cell, { width: 120 }]}>
                          <TextInput
                            style={styles.mobileInput}
                            keyboardType="numeric"
                            returnKeyType="done"
                            editable={isBuyingPriceEditable}
                            value={
                              isBuyingPriceEditable
                                ? newBuyingPrices[item.id] ||
                                  item.buyingPrice.toString()
                                : item.buyingPrice.toString()
                            }
                            onChangeText={(text) => {
                              const numericValue = text.replace(/[^0-9.]/g, "");
                              setNewBuyingPrices((prev) => ({
                                ...prev,
                                [item.id]: numericValue,
                              }));
                            }}
                          />
                        </View>
                        <View style={[styles.cell, { width: 120 }]}>
                          <TextInput
                            style={styles.mobileInput}
                            keyboardType="numeric"
                            returnKeyType="done"
                            editable={isSellingPriceEditable}
                            value={
                              isSellingPriceEditable
                                ? newSellingPrices[item.id] ||
                                  item.sellingPrice.toString()
                                : item.sellingPrice.toString()
                            }
                            onChangeText={(text) => {
                              const numericValue = text.replace(/[^0-9.]/g, "");
                              setNewSellingPrices((prev) => ({
                                ...prev,
                                [item.id]: numericValue,
                              }));
                            }}
                          />
                        </View>
                        <Text style={[styles.cell, { width: 150 }]}>
                          {quantities[item.id] *
                            (isBuyingPriceEditable && newBuyingPrices[item.id]
                              ? parseFloat(newBuyingPrices[item.id])
                              : parseFloat(item.buyingPrice.toString())) || 0}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>
            )}
          </View>

          <View style={styles.footer}>
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
  modalTitle: {
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
  scrollContainer: {
    flexGrow: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerCell: {
    padding: 16,
    fontWeight: "bold",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
    minHeight: 50,
  },
  cell: {
    padding: 8,
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    width: "100%",
  },
  modalHeader: {
    width: "100%",
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  closeButtonText: {
    color: "#FF6B6B",
    fontSize: 22,
    fontWeight: "bold",
  },

  applyButton: {
    backgroundColor: "#d9534f", // Red color for the button
    marginTop: 20,
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
    gap: 8,
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 20,
  },
  cellContainer: {
    flex: 1,
    padding: 8,
  },
  tableContainer: {
    minWidth: "100%",
  },
  horizontalScroll: {
    flex: 1,
  },
  tableWrapper: {
    flex: 1,
    width: "100%",
  },
  tableContent: {
    flex: 1,
    width: "100%",
  },
  tableBody: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 8,
    height: 36,
    width: "100%",
    backgroundColor: "white",
    textAlign: "right",
  },
  mobileTableContent: {
    minWidth: Platform.OS === "web" ? "100%" : "auto",
  },
  mobileInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 8,
    height: 36,
    minWidth: 80,
    backgroundColor: "white",
    textAlign: "right",
  },
});

export default RestockForm;
