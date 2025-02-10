import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { TextInput, Button, SegmentedButtons, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { customAlphabet } from "nanoid/non-secure";

const generateId = customAlphabet("1234567890abcdef", 10);

const ProductForm: React.FC<{
  initialData?: any;
  onSubmit: (data: any) => void;
  categories: { id: string; name: string }[];
  onClose: () => void;
}> = ({ initialData, onSubmit, categories, onClose }) => {
  const [itemType, setItemType] = useState("product");
  const [name, setName] = useState(initialData?.name || "");
  const [buyingPrice, setBuyingPrice] = useState(
    initialData?.buyingPrice?.toString() || "0.00"
  );
  const [sellingPrice, setSellingPrice] = useState(
    initialData?.sellingPrice?.toString() || "0.00"
  );
  const [measuringUnit, setMeasuringUnit] = useState(
    initialData?.measuringUnit || ""
  );
  const [productCount, setProductCount] = useState(
    initialData?.quantity?.toString() || "0"
  );
  const [serviceCharges, setServiceCharges] = useState(
    initialData?.serviceCharges?.toString() || "0.00"
  );
  const [category, setCategory] = useState(initialData?.category || "");

  const handleSubmit = () => {
    const itemData = {
      id: initialData?.id || generateId(),
      name,
      quantity: parseInt(productCount, 10),
      category,
      buyingPrice: parseFloat(buyingPrice),
      sellingPrice: parseFloat(sellingPrice),
      measuringUnit,
      stockValue: parseFloat(buyingPrice) * parseInt(productCount, 10),
      createdAt: new Date().toISOString(),
      price: parseFloat(sellingPrice),
    };
    onSubmit(itemData);
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

        {itemType === "product" ? (
          // Product Form
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
                placeholder="0.00"
                value={buyingPrice}
                onChangeText={setBuyingPrice}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Selling Price</Text>
              <TextInput
                mode="outlined"
                placeholder="0.00"
                value={sellingPrice}
                onChangeText={setSellingPrice}
                keyboardType="decimal-pad"
                style={styles.input}
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
                onChangeText={setProductCount}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </>
        ) : (
          // Service Form
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
                placeholder="0.00"
                value={serviceCharges}
                onChangeText={setServiceCharges}
                keyboardType="decimal-pad"
                style={styles.input}
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
            Create Item
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
