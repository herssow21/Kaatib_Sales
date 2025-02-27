import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert, Platform } from "react-native";
import { TextInput, Button, SegmentedButtons, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { generateId } from "../utils/idGenerator";

const ProductForm: React.FC<{
  initialData?: any;
  onSubmit: (data: any) => void;
  categories: { id: string; name: string }[];
  onClose: () => void;
}> = ({ initialData, onSubmit, categories, onClose }) => {
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

  const showError = (message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("Error", message);
    }
  };

  const handleSubmit = () => {
    try {
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
        return; // Keep the modal open
      }

      // Additional mobile-specific logic can be added here

      onSubmit(itemData);
    } catch (error) {
      console.error("Item submission error:", error);
      showError("Failed to submit item. Please try again.");
    }
  };

  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    setter(numericValue);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Create New {itemType === "product" ? "Product" : "Service"}
        </Text>

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
              <Text style={styles.label}>Service Name</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter service name"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Service Charges</Text>
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
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter product name"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Buying Price</Text>
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
              <Text style={styles.label}>Selling Price</Text>
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
              <Text style={styles.label}>Measuring Unit</Text>
              <TextInput
                mode="outlined"
                placeholder="e.g., kg, liter, piece"
                value={measuringUnit}
                onChangeText={setMeasuringUnit}
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Count</Text>
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
          <Text style={styles.label}>Category</Text>
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

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 8,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    marginBottom: 24,
    fontWeight: "bold",
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
  },
  picker: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    height: 50,
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
    backgroundColor: "#000",
  },
  cancelButton: {
    borderColor: "#ccc",
  },
  cancelText: {
    color: "#666",
  },
});

export default ProductForm;
