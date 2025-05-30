import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useWindowDimensions } from "react-native";
import { generateId } from "../utils/idGenerator";
import { useAlertContext } from "../contexts/AlertContext";

const ProductForm: React.FC<{
  initialData?: any;
  onSubmit: (data: any) => void;
  categories: { id: string; name: string }[];
  onClose: () => void;
}> = ({ initialData, onSubmit, categories, onClose }) => {
  const theme = useTheme();
  const { showError, showSuccess, showWarning } = useAlertContext();
  const [itemType, setItemType] = useState(initialData?.type || "product");
  const [name, setName] = useState(initialData?.name || "");
  const [buyingPrice, setBuyingPrice] = useState(
    initialData?.buyingPrice?.toString() || ""
  );
  const [sellingPrice, setSellingPrice] = useState(
    initialData?.sellingPrice?.toString() || ""
  );
  const [measuringUnit, setMeasuringUnit] = useState(
    initialData?.measuringUnit || ""
  );
  const [productCount, setProductCount] = useState(
    initialData?.quantity?.toString() || ""
  );
  const [serviceCharges, setServiceCharges] = useState(
    initialData?.charges?.toString() || ""
  );
  const [category, setCategory] = useState(initialData?.category || "");

  const handleSubmit = () => {
    try {
      // Validate required fields
      const requiredFields = [];
      if (!name.trim()) requiredFields.push("Name");
      if (!category) requiredFields.push("Category");

      if (itemType === "product") {
        if (!productCount) requiredFields.push("Product Count");
        if (!buyingPrice) requiredFields.push("Buying Price");
        if (!sellingPrice) requiredFields.push("Selling Price");
        if (!measuringUnit.trim()) requiredFields.push("Measuring Unit");
      } else {
        if (!serviceCharges) requiredFields.push("Service Charges");
      }

      if (requiredFields.length > 0) {
        showError(
          `Please fill in all required fields: ${requiredFields.join(", ")}`
        );
        return;
      }

      const itemData = {
        id: initialData?.id || generateId(),
        name: name.trim(),
        type: itemType,
        category,
        createdAt: new Date().toISOString(),
        ...(itemType === "product"
          ? {
              quantity: parseInt(productCount) || 0,
              buyingPrice: parseFloat(buyingPrice) || 0,
              sellingPrice: parseFloat(sellingPrice) || 0,
              measuringUnit: measuringUnit.trim(),
              stockValue:
                (parseFloat(buyingPrice) || 0) * (parseInt(productCount) || 0),
              price: parseFloat(sellingPrice) || 0,
            }
          : {
              charges: parseFloat(serviceCharges) || 0,
              sellingPrice: parseFloat(serviceCharges) || 0,
              quantity: 0,
              buyingPrice: 0,
              stockValue: 0,
              price: parseFloat(serviceCharges) || 0,
            }),
      };

      // Check for selling price lower than buying price
      if (itemData.sellingPrice < itemData.buyingPrice) {
        showError("Selling price cannot be lower than buying price.");
        return;
      }

      const confirmMessage = initialData
        ? `Are you sure you want to update ${itemType} "${name}"?\n\nCurrent Details:\n- Category: ${
            initialData.category
          }\n- ${
            itemType === "product"
              ? `Quantity: ${initialData.quantity}\n- Buying Price: ${initialData.buyingPrice}\n- Selling Price: ${initialData.sellingPrice}`
              : `Charges: ${initialData.charges}`
          }\n\nNew Details:\n- Category: ${category}\n- ${
            itemType === "product"
              ? `Quantity: ${productCount}\n- Buying Price: ${buyingPrice}\n- Selling Price: ${sellingPrice}`
              : `Charges: ${serviceCharges}`
          }`
        : `Are you sure you want to create new ${itemType} "${name}"?\n\nDetails:\n- Category: ${category}\n- ${
            itemType === "product"
              ? `Quantity: ${productCount}\n- Buying Price: ${buyingPrice}\n- Selling Price: ${sellingPrice}\n- Measuring Unit: ${measuringUnit}`
              : `Charges: ${serviceCharges}`
          }`;

      showWarning(confirmMessage, initialData ? "Update" : "Create", () => {
        onSubmit(itemData);
        showSuccess(
          `${itemType} "${name}" ${
            initialData ? "updated" : "created"
          } successfully!`
        );
      });
    } catch (error) {
      console.error("Item submission error:", error);
      showError("Failed to submit item. Please try again.");
    }
  };

  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    setter(numericValue);
  };

  const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    container: {
      backgroundColor: theme.colors.background,
      padding: 24,
      borderRadius: 8,
      maxWidth: 500,
      width: "100%",
      alignSelf: "center",
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      position: "relative",
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      right: -12,
      top: -12,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      backgroundColor: theme.colors.error,
    },
    closeButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
      textAlign: "center",
    },
    title: {
      marginBottom: 24,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    segmentedButtons: {
      marginBottom: 24,
      backgroundColor: theme.colors.surface,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      marginBottom: 8,
      fontWeight: "500",
      color: theme.colors.onSurfaceVariant,
    },
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.onSurface,
      borderColor: theme.colors.outline,
    },
    picker: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 4,
      height: 50,
      color: theme.colors.onSurface,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 24,
    },
    button: {
      minWidth: 100,
      borderRadius: 4,
    },
    createButton: {
      backgroundColor: theme.colors.primary,
    },
    cancelButton: {
      borderColor: theme.colors.outline,
    },
    cancelText: {
      color: theme.colors.onSurfaceVariant,
    },
    required: {
      color: theme.colors.error,
      fontSize: 14,
      marginLeft: 4,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            {initialData ? "Edit" : "Create New"}{" "}
            {itemType === "product" ? "Product" : "Service"}
          </Text>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <SegmentedButtons
          value={itemType}
          onValueChange={setItemType}
          buttons={[
            { value: "product", label: "Product" },
            { value: "service", label: "Service" },
          ]}
          style={styles.segmentedButtons}
        />

        {itemType === "service" ? (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Service Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="Enter service name"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Service Charges <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="0"
                value={serviceCharges}
                onChangeText={(val) =>
                  handleNumericInput(val, setServiceCharges)
                }
                keyboardType="numeric"
                style={[styles.input, { height: 40 }]}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Product Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="Enter product name"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Buying Price <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="0"
                value={buyingPrice}
                onChangeText={(val) => handleNumericInput(val, setBuyingPrice)}
                keyboardType="numeric"
                style={[styles.input, { height: 40 }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Selling Price <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="0"
                value={sellingPrice}
                onChangeText={(val) => handleNumericInput(val, setSellingPrice)}
                keyboardType="numeric"
                style={[styles.input, { height: 40 }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Measuring Unit <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="e.g., kg, liter, piece"
                value={measuringUnit}
                onChangeText={setMeasuringUnit}
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Product Count <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="0"
                value={productCount}
                onChangeText={(val) => handleNumericInput(val, setProductCount)}
                keyboardType="numeric"
                style={[styles.input, { height: 40 }]}
              />
            </View>
          </>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            <Picker.Item label="Select a category" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
            ))}
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={onClose}
            style={[styles.button, styles.cancelButton]}
            labelStyle={styles.cancelText}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, styles.createButton]}
          >
            {initialData ? "Update Item" : "Create Item"}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductForm;
