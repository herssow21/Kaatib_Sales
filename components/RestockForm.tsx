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
import * as DocumentPicker from "expo-document-picker";
import type { InventoryItem as BaseInventoryItem } from "../app/types";
import { WebView } from "react-native-webview";
import { useAlertContext } from "../contexts/AlertContext";
import { useInventoryContext } from "../contexts/InventoryContext";
import { getRestockFormStyles } from "../styles/components/RestockForm";

interface InventoryItem extends BaseInventoryItem {
  pendingSellingPrice?: number;
  pendingPriceActivationQuantity?: number;
  currentStock: number;
}

type FormItemBase = Omit<InventoryItem, "quantity" | "stockValue">;

interface FormItem extends FormItemBase {
  currentStock: number;
}

interface RestockFormProps {
  items: InventoryItem[];
  onSubmit: (selectedItems: InventoryItem[]) => void;
  onClose: () => void;
}

interface FieldErrors {
  quantity?: string;
  buyingPrice?: string;
  sellingPrice?: string;
}

interface FormErrors {
  [key: string]: FieldErrors;
  general?: FieldErrors;
}

const RestockForm: React.FC<RestockFormProps> = ({
  items,
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const { showSuccess, showError } = useAlertContext();
  const { handleRestock } = useInventoryContext();
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
  const [errors, setErrors] = useState<FormErrors>({ general: {} });
  const [applyImmediately, setApplyImmediately] = useState(false);
  const [isBuyingPriceEditable, setIsBuyingPriceEditable] = useState(false);
  const [isSellingPriceEditable, setIsSellingPriceEditable] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isFilePreviewVisible, setIsFilePreviewVisible] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const windowWidth = Dimensions.get("window").width;
  const styles = getRestockFormStyles(theme);

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

  const resetForm = () => {
    setSelectedItems([]);
    setQuantities({});
    setNewBuyingPrices({});
    setNewSellingPrices({});
    setApplyImmediately(false);
    setIsBuyingPriceEditable(false);
    setIsSellingPriceEditable(false);
    setReceiptImage(null);
    setReceiptFileName(null);
    setSearchQuery("");
    setErrors({ general: {} });
  };

  const validateInputs = () => {
    const newErrors: FormErrors = { general: {} };
    let hasErrors = false;

    selectedItems.forEach((item) => {
      const itemErrors: FieldErrors = {};

      // Validate quantity
      if (!quantities[item.id] && quantities[item.id] !== 0) {
        itemErrors.quantity = "Please enter a quantity";
        hasErrors = true;
      } else if (quantities[item.id] <= 0) {
        itemErrors.quantity = "Quantity must be greater than 0";
        hasErrors = true;
      }

      // Validate buying price if editable
      if (isBuyingPriceEditable && newBuyingPrices[item.id]) {
        const buyingPrice = parseFloat(newBuyingPrices[item.id]);
        if (isNaN(buyingPrice) || buyingPrice <= 0) {
          itemErrors.buyingPrice = "Please enter a valid buying price";
          hasErrors = true;
        }
      }

      // Validate selling price if editable
      if (isSellingPriceEditable && newSellingPrices[item.id]) {
        const sellingPrice = parseFloat(newSellingPrices[item.id]);
        const buyingPrice = newBuyingPrices[item.id]
          ? parseFloat(newBuyingPrices[item.id])
          : item.buyingPrice;

        if (isNaN(sellingPrice) || sellingPrice <= 0) {
          itemErrors.sellingPrice = "Please enter a valid selling price";
          hasErrors = true;
        } else if (sellingPrice < buyingPrice) {
          itemErrors.sellingPrice =
            "Selling price cannot be less than buying price";
          hasErrors = true;
        }
      }

      if (Object.keys(itemErrors).length > 0) {
        newErrors[item.id] = itemErrors;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleApplyChanges = () => {
    try {
      if (!validateInputs()) {
        return;
      }

      const updates = selectedItems.map((item) => {
        const quantity = parseInt(String(quantities[item.id] || "0"));
        const newBuyingPrice = parseFloat(newBuyingPrices[item.id] || "0");
        const newSellingPrice = parseFloat(newSellingPrices[item.id] || "0");
        const applyPriceImmediately = applyImmediately;

        // Only update buying price if explicitly changed
        const updatedBuyingPrice =
          newBuyingPrice > 0 ? newBuyingPrice : item.buyingPrice;

        // Calculate new quantity
        const newQuantity = item.currentStock + quantity;

        // Calculate new stock value
        const newStockValue = newQuantity * updatedBuyingPrice;

        // Create updated item
        const updatedItem: InventoryItem = {
          ...item,
          quantity: newQuantity,
          stockValue: newStockValue,
          buyingPrice: updatedBuyingPrice,
          sellingPrice:
            newSellingPrice > 0 ? newSellingPrice : item.sellingPrice,
          pendingSellingPrice: applyPriceImmediately
            ? undefined
            : newSellingPrice > 0
            ? newSellingPrice
            : undefined,
          pendingPriceActivationQuantity: applyPriceImmediately
            ? undefined
            : newSellingPrice > 0
            ? item.currentStock
            : undefined,
        };

        return updatedItem;
      });

      // Filter out any null updates
      const validUpdates = updates.filter(
        (update): update is InventoryItem => update !== null
      );

      if (validUpdates.length === 0) {
        setErrors((prev) => ({
          ...prev,
          general: { quantity: "No valid updates to apply" },
        }));
        return;
      }

      // Update inventory
      validUpdates.forEach((item) => {
        handleRestock(
          item.id,
          item.quantity - item.currentStock, // Calculate the quantity to add
          item.buyingPrice,
          item.sellingPrice,
          applyImmediately
        );
      });

      // Close modal first
      setModalVisible(false);

      // Reset form
      resetForm();

      // Show success message after a short delay to ensure modal is closed
      setTimeout(() => {
        showSuccess("Inventory updated successfully!");
      }, 100);
    } catch (error) {
      console.error("Error applying changes:", error);
      setErrors((prev) => ({
        ...prev,
        general: { quantity: "Failed to update inventory" },
      }));
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

    // Limit to 2 decimal places
    if (parts.length === 2) {
      numericValue = parts[0] + "." + parts[1].slice(0, 2);
    }

    // If the value is empty or just a decimal point, set it to "0"
    if (numericValue === "" || numericValue === ".") {
      numericValue = "0";
    }

    setQuantities((prev) => ({
      ...prev,
      [itemId]: parseFloat(numericValue),
    }));
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

    // Limit to 2 decimal places
    if (parts.length === 2) {
      numericValue = parts[0] + "." + parts[1].slice(0, 2);
    }

    // If the value is empty or just a decimal point, set it to "0"
    if (numericValue === "" || numericValue === ".") {
      numericValue = "0";
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
      pointerEvents="box-none"
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

  // Update the input rendering to show error messages
  const renderInput = (
    item: FormItem,
    value: string,
    onChange: (text: string) => void,
    placeholder: string,
    type: "quantity" | "buyingPrice" | "sellingPrice"
  ) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          errors[item.id]?.[type] && { borderColor: theme.colors.error },
          Platform.OS === "web" && {
            width: measureTextWidth(value || placeholder),
          },
        ]}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder={placeholder}
        error={!!errors[item.id]?.[type]}
      />
      {errors[item.id]?.[type] && (
        <Text style={styles.errorText}>{errors[item.id]?.[type]}</Text>
      )}
    </View>
  );

  // Update the table cell rendering to use the new input component
  const renderTableCell = (item: FormItem) => (
    <>
      <View style={[styles.cell, { flex: 0.15 }]}>
        <TextInput
          style={[
            styles.input,
            errors[item.id]?.quantity && { borderColor: theme.colors.error },
            Platform.OS === "web" && {
              width: measureTextWidth(quantities[item.id]?.toString() || "0"),
            },
          ]}
          value={quantities[item.id]?.toString() || ""}
          onChangeText={(text) => {
            handleQuantityChange(item.id, text);
            // Clear error when user starts typing
            setErrors((prev) => ({
              ...prev,
              [item.id]: { ...prev[item.id], quantity: undefined },
            }));
          }}
          keyboardType="numeric"
          placeholder="0"
          error={!!errors[item.id]?.quantity}
        />
        {errors[item.id]?.quantity && (
          <Text style={styles.errorText}>{errors[item.id]?.quantity}</Text>
        )}
      </View>
      {isBuyingPriceEditable && (
        <View style={[styles.cell, { flex: 0.25 }]}>
          <TextInput
            style={[
              styles.input,
              errors[item.id]?.buyingPrice && {
                borderColor: theme.colors.error,
              },
              Platform.OS === "web" && {
                width: measureTextWidth(newBuyingPrices[item.id] || "0.00"),
              },
            ]}
            value={newBuyingPrices[item.id] || ""}
            onChangeText={(text) => {
              handlePriceChange(item.id, text, "buying");
              // Clear error when user starts typing
              setErrors((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], buyingPrice: undefined },
              }));
            }}
            keyboardType="numeric"
            placeholder="0.00"
            error={!!errors[item.id]?.buyingPrice}
          />
          {errors[item.id]?.buyingPrice && (
            <Text style={styles.errorText}>{errors[item.id]?.buyingPrice}</Text>
          )}
        </View>
      )}
      {isSellingPriceEditable && (
        <View style={[styles.cell, { flex: 0.25 }]}>
          <TextInput
            style={[
              styles.input,
              errors[item.id]?.sellingPrice && {
                borderColor: theme.colors.error,
              },
              Platform.OS === "web" && {
                width: measureTextWidth(newSellingPrices[item.id] || "0.00"),
              },
            ]}
            value={newSellingPrices[item.id] || ""}
            onChangeText={(text) => {
              handlePriceChange(item.id, text, "selling");
              // Clear error when user starts typing
              setErrors((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], sellingPrice: undefined },
              }));
            }}
            keyboardType="numeric"
            placeholder="0.00"
            error={!!errors[item.id]?.sellingPrice}
          />
          {errors[item.id]?.sellingPrice && (
            <Text style={styles.errorText}>
              {errors[item.id]?.sellingPrice}
            </Text>
          )}
        </View>
      )}
    </>
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
        pointerEvents="box-none"
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
                          {renderTableCell(item)}
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
                            {renderTableCell(item)}
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </ScrollView>
                )}
              </View>

              {errors.general?.quantity && (
                <Text
                  style={[
                    styles.errorText,
                    { textAlign: "center", marginBottom: 16 },
                  ]}
                >
                  {errors.general.quantity}
                </Text>
              )}

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

export default RestockForm;
