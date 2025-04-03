import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Switch,
  Image,
  Dimensions,
  Linking,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Checkbox,
  useTheme,
} from "react-native-paper";
import * as DocumentPicker from "expo-document-picker"; // Import DocumentPicker
import type { InventoryItem } from "../app/types";
import { WebView } from "react-native-webview";
import { useAlertContext } from "../contexts/AlertContext";

interface FormItem extends Omit<InventoryItem, "quantity"> {
  currentStock: number;
}

interface RestockFormProps {
  items: InventoryItem[];
  onSubmit: (selectedItems: InventoryItem[]) => void;
  onClose: () => void;
  updateItem: (updatedItem: InventoryItem) => void;
}

const RestockForm: React.FC<RestockFormProps> = ({
  items,
  onSubmit,
  onClose,
  updateItem,
}) => {
  const theme = useTheme();
  const { showSuccess, showError } = useAlertContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<FormItem[]>([]);
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
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isFilePreviewVisible, setIsFilePreviewVisible] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const windowWidth = Dimensions.get("window").width;

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
        const { quantity, ...itemWithoutQuantity } = selectedItem;
        setSelectedItems([
          ...selectedItems,
          {
            ...itemWithoutQuantity,
            currentStock: quantity,
          },
        ]);
      }
    }
  };

  const handleViewRestockList = () => {
    setModalVisible(true);
  };

  const convertFormItemToInventoryItem = (
    formItem: FormItem,
    updatedQuantity: number
  ): InventoryItem => {
    return {
      ...formItem,
      quantity: updatedQuantity,
      stockValue: updatedQuantity * formItem.buyingPrice,
    };
  };

  const handleApplyChanges = () => {
    const hasEmptyQuantities = selectedItems.some(
      (item) => !quantities[item.id] && quantities[item.id] !== 0
    );

    if (hasEmptyQuantities) {
      showError("Please enter quantity for all selected items.");
      return;
    }

    const updatedItems = selectedItems.map((formItem) => {
      const existingItem = items.find((i) => i.id === formItem.id);
      return convertFormItemToInventoryItem(formItem, formItem.currentStock);
    });

    try {
      updatedItems.forEach((updatedItem) => {
        updateItem(updatedItem);
      });

      showSuccess("Stock updated successfully!");
      onSubmit(updatedItems);
      setModalVisible(false);
    } catch (error) {
      showError("Failed to update stock. Please try again.");
    }
  };

  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        setReceiptImage(file.uri);
        setReceiptFileName(file.name);
      }
    } catch (error) {
      showError("Failed to upload receipt");
    }
  };

  const handleQuantityChange = (itemId: string, text: string) => {
    // Remove non-numeric characters
    let numericValue = text.replace(/[^0-9]/g, "");

    // Handle leading zeros
    if (numericValue.length > 1 && numericValue.startsWith("0")) {
      numericValue = numericValue.replace(/^0+/, "");
    }

    setQuantities({
      ...quantities,
      [itemId]: parseInt(numericValue || "0", 10),
    });
  };

  const handlePriceChange = (
    itemId: string,
    text: string,
    type: "buying" | "selling"
  ) => {
    // Remove non-numeric characters except decimal point
    let numericValue = text.replace(/[^0-9.]/g, "");

    // Handle leading zeros
    if (
      numericValue.length > 1 &&
      numericValue.startsWith("0") &&
      !numericValue.startsWith("0.")
    ) {
      numericValue = numericValue.replace(/^0+/, "");
    }

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }

    if (type === "buying") {
      setNewBuyingPrices((prev) => ({
        ...prev,
        [itemId]: numericValue,
      }));
    } else {
      setNewSellingPrices((prev) => ({
        ...prev,
        [itemId]: numericValue,
      }));
    }
  };

  // Add a function to measure text width
  const measureTextWidth = (text: string) => {
    const baseWidth = 80; // minimum width
    const charWidth = 8; // approximate width per character
    return Math.max(baseWidth, text.length * charWidth);
  };

  const handleFilePreview = () => {
    if (receiptImage) {
      if (Platform.OS === "web") {
        // For web, open in new tab
        window.open(receiptImage, "_blank");
      } else {
        // For mobile, show in modal
        setIsFilePreviewVisible(true);
      }
    }
  };

  const FilePreviewModal = () => (
    <Modal
      visible={isFilePreviewVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsFilePreviewVisible(false)}
    >
      <TouchableOpacity
        style={styles.filePreviewContainer}
        activeOpacity={1}
        onPress={() => setIsFilePreviewVisible(false)}
      >
        <TouchableOpacity
          style={styles.filePreviewContent}
          activeOpacity={1}
          onPress={(e: any) => e.stopPropagation()}
        >
          <TouchableOpacity
            style={[
              styles.closeButtonCircle,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={() => setIsFilePreviewVisible(false)}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          {receiptImage?.toLowerCase().endsWith(".pdf") ? (
            Platform.OS === "web" ? (
              <iframe
                src={receiptImage}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  marginTop: 20,
                }}
                title="PDF Preview"
              />
            ) : (
              <View style={styles.pdfPreviewContainer}>
                <Text style={styles.pdfPreviewText}>
                  PDF files can only be viewed in external viewer.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.pdfOpenButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => {
                    Linking.openURL(receiptImage);
                    setIsFilePreviewVisible(false);
                  }}
                >
                  <Text style={styles.pdfOpenButtonText}>Open PDF</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <Image
              source={{ uri: receiptImage }}
              style={styles.filePreview}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  // Update the Switch components to ensure consistent colors across platforms
  const renderToggle = (
    value: boolean,
    onValueChange: (value: boolean) => void,
    label: string
  ) => (
    <View style={styles.toggleContainer}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.surfaceDisabled,
          true: theme.colors.errorContainer,
        }}
        thumbColor={value ? theme.colors.error : theme.colors.outline}
        ios_backgroundColor={theme.colors.surfaceDisabled}
        style={
          Platform.OS === "web"
            ? {
                transform: [{ scale: 0.8 }],
                marginVertical: -8,
              }
            : undefined
        }
      />
      <Text style={styles.toggleText}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Bulk Restock
        </Text>
        <TouchableOpacity
          style={[
            styles.closeButtonCircle,
            { backgroundColor: theme.colors.error, right: 20 },
          ]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
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
                color={theme.colors.primary}
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Stock Information</Text>
              <TouchableOpacity
                style={[
                  styles.closeButtonCircle,
                  { backgroundColor: theme.colors.error },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.switchesContainer}>
                {renderToggle(
                  applyImmediately,
                  setApplyImmediately,
                  "Apply price changes immediately"
                )}
                {renderToggle(
                  isBuyingPriceEditable,
                  setIsBuyingPriceEditable,
                  "Update buying price"
                )}
                {renderToggle(
                  isSellingPriceEditable,
                  setIsSellingPriceEditable,
                  "Update selling price"
                )}
              </View>

              <View style={styles.tableContainer}>
                {Platform.OS === "web" ? (
                  // Web Layout - Full width
                  <View style={styles.tableContent}>
                    <View style={styles.tableHeader}>
                      <View style={[styles.headerCellContainer, { flex: 0.2 }]}>
                        <Text style={styles.headerCell}>Item</Text>
                      </View>
                      <View
                        style={[styles.headerCellContainer, { flex: 0.15 }]}
                      >
                        <Text style={styles.headerCell}>Current</Text>
                      </View>
                      <View
                        style={[styles.headerCellContainer, { flex: 0.15 }]}
                      >
                        <Text style={styles.headerCell}>Add</Text>
                      </View>
                      {isBuyingPriceEditable && (
                        <View
                          style={[styles.headerCellContainer, { flex: 0.25 }]}
                        >
                          <Text style={styles.headerCell}>Buy Price</Text>
                        </View>
                      )}
                      {isSellingPriceEditable && (
                        <View
                          style={[styles.headerCellContainer, { flex: 0.25 }]}
                        >
                          <Text style={styles.headerCell}>Sell Price</Text>
                        </View>
                      )}
                    </View>

                    <ScrollView style={styles.tableBody}>
                      {selectedItems.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                          <View style={[styles.cell, { flex: 0.2 }]}>
                            <Text numberOfLines={2} style={styles.itemName}>
                              {item.name}
                            </Text>
                          </View>
                          <View style={[styles.cell, { flex: 0.15 }]}>
                            <Text style={styles.currentStock}>
                              {item.currentStock}
                            </Text>
                          </View>
                          <View style={[styles.cell, { flex: 0.15 }]}>
                            <TextInput
                              style={styles.input}
                              value={quantities[item.id]?.toString() || ""}
                              onChangeText={(text) =>
                                handleQuantityChange(item.id, text)
                              }
                              keyboardType="numeric"
                              autoCapitalize="none"
                              autoCorrect={false}
                              blurOnSubmit={false}
                              returnKeyType="next"
                              placeholder="0"
                            />
                          </View>
                          {isBuyingPriceEditable && (
                            <View style={[styles.cell, { flex: 0.25 }]}>
                              <TextInput
                                style={styles.input}
                                value={newBuyingPrices[item.id] || ""}
                                onChangeText={(text) =>
                                  handlePriceChange(item.id, text, "buying")
                                }
                                keyboardType="numeric"
                                autoCapitalize="none"
                                autoCorrect={false}
                                blurOnSubmit={false}
                                returnKeyType="next"
                                placeholder="0.00"
                              />
                            </View>
                          )}
                          {isSellingPriceEditable && (
                            <View style={[styles.cell, { flex: 0.25 }]}>
                              <TextInput
                                style={styles.input}
                                value={newSellingPrices[item.id] || ""}
                                onChangeText={(text) =>
                                  handlePriceChange(item.id, text, "selling")
                                }
                                keyboardType="numeric"
                                autoCapitalize="none"
                                autoCorrect={false}
                                blurOnSubmit={false}
                                returnKeyType="done"
                                placeholder="0.00"
                              />
                            </View>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  // Mobile Layout - Scrollable with fixed widths
                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={styles.mobileTableContent}>
                      <View style={styles.tableHeader}>
                        <View
                          style={[styles.headerCellContainer, { width: 150 }]}
                        >
                          <Text style={styles.headerCell}>Item</Text>
                        </View>
                        <View
                          style={[styles.headerCellContainer, { width: 100 }]}
                        >
                          <Text style={styles.headerCell}>Current</Text>
                        </View>
                        <View
                          style={[styles.headerCellContainer, { width: 100 }]}
                        >
                          <Text style={styles.headerCell}>Add</Text>
                        </View>
                        {isBuyingPriceEditable && (
                          <View
                            style={[styles.headerCellContainer, { width: 120 }]}
                          >
                            <Text style={styles.headerCell}>Buy Price</Text>
                          </View>
                        )}
                        {isSellingPriceEditable && (
                          <View
                            style={[styles.headerCellContainer, { width: 120 }]}
                          >
                            <Text style={styles.headerCell}>Sell Price</Text>
                          </View>
                        )}
                      </View>

                      <ScrollView style={styles.tableBody}>
                        {selectedItems.map((item) => (
                          <View key={item.id} style={styles.tableRow}>
                            <View style={[styles.cell, { width: 150 }]}>
                              <Text numberOfLines={2} style={styles.itemName}>
                                {item.name}
                              </Text>
                            </View>
                            <View style={[styles.cell, { width: 100 }]}>
                              <Text style={styles.currentStock}>
                                {item.currentStock}
                              </Text>
                            </View>
                            <View style={[styles.cell, { width: 100 }]}>
                              <TextInput
                                style={[
                                  styles.input,
                                  {
                                    width: measureTextWidth(
                                      quantities[item.id]?.toString() || "0"
                                    ),
                                  },
                                ]}
                                value={quantities[item.id]?.toString() || ""}
                                onChangeText={(text) =>
                                  handleQuantityChange(item.id, text)
                                }
                                keyboardType="numeric"
                                autoCapitalize="none"
                                autoCorrect={false}
                                blurOnSubmit={false}
                                returnKeyType="next"
                                placeholder="0"
                              />
                            </View>
                            {isBuyingPriceEditable && (
                              <View style={[styles.cell, { width: 120 }]}>
                                <TextInput
                                  style={[
                                    styles.input,
                                    {
                                      width: measureTextWidth(
                                        newBuyingPrices[item.id] || "0.00"
                                      ),
                                    },
                                  ]}
                                  value={newBuyingPrices[item.id] || ""}
                                  onChangeText={(text) =>
                                    handlePriceChange(item.id, text, "buying")
                                  }
                                  keyboardType="numeric"
                                  autoCapitalize="none"
                                  autoCorrect={false}
                                  blurOnSubmit={false}
                                  returnKeyType="next"
                                  placeholder="0.00"
                                />
                              </View>
                            )}
                            {isSellingPriceEditable && (
                              <View style={[styles.cell, { width: 120 }]}>
                                <TextInput
                                  style={[
                                    styles.input,
                                    {
                                      width: measureTextWidth(
                                        newSellingPrices[item.id] || "0.00"
                                      ),
                                    },
                                  ]}
                                  value={newSellingPrices[item.id] || ""}
                                  onChangeText={(text) =>
                                    handlePriceChange(item.id, text, "selling")
                                  }
                                  keyboardType="numeric"
                                  autoCapitalize="none"
                                  autoCorrect={false}
                                  blurOnSubmit={false}
                                  returnKeyType="done"
                                  placeholder="0.00"
                                />
                              </View>
                            )}
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </ScrollView>
                )}
              </View>

              <View style={styles.footer}>
                <Text style={styles.attachmentLabel}>Attachment</Text>
                <TouchableOpacity
                  style={styles.receiptInput}
                  onPress={handleFileSelection}
                >
                  {receiptImage ? (
                    <View style={styles.receiptPreviewContainer}>
                      <Text style={styles.receiptText} numberOfLines={1}>
                        {receiptFileName || receiptImage.split("/").pop()}
                      </Text>
                      <TouchableOpacity
                        onPress={handleFilePreview}
                        style={styles.viewButton}
                      >
                        <Text
                          style={[
                            styles.viewButtonText,
                            { color: theme.colors.primary },
                          ]}
                        >
                          View
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.receiptText}>
                      Add Receipt or Invoice
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleApplyChanges}
                >
                  <Text style={[styles.buttonText, styles.centerText]}>
                    Save & Update Stock
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <FilePreviewModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchesContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 4,
  },
  toggleText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
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
    padding: 8,
    borderRadius: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableContent: {
    flex: 1,
    width: "100%",
  },
  mobileTableContent: {
    minWidth: Platform.OS === "web" ? "100%" : "auto",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerCellContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerCell: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tableBody: {
    flexGrow: 0,
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 8,
    backgroundColor: "white",
  },
  cell: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  currentStock: {
    fontSize: 14,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 32,
    backgroundColor: "white",
    textAlign: "right",
    fontSize: 14,
    minWidth: 80,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    paddingHorizontal: 20,
  },
  attachmentLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  receiptInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  receiptText: {
    color: "#666",
    fontSize: 14,
    flex: 1,
  },
  receiptPreviewContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  centerText: {
    textAlign: "center",
  },
  applyButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 20 : 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  filePreviewContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  filePreviewContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
    padding: 20,
  },
  filePreview: {
    width: "100%",
    height: "100%",
    marginTop: 20,
  },
  webSwitch: {
    cursor: "pointer",
  },
  webSwitchTrack: {
    borderRadius: 12,
    padding: 2,
    width: 44,
    height: 24,
  },
  pdfPreviewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pdfPreviewText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  pdfOpenButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  pdfOpenButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RestockForm;
