import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button, useTheme } from "react-native-paper";
import { useInventoryContext } from "../contexts/InventoryContext";

interface ProductFormProps {
  initialData?: {
    id: string;
    name: string;
    price: number;
    quantity?: number;
    category: string;
  };
  onSubmit: (data: {
    id?: string;
    name: string;
    price: number;
    quantity?: number;
    category: string;
  }) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit }) => {
  const theme = useTheme();
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price || 0);
  const [quantity, setQuantity] = useState(initialData?.quantity || 0);
  const [category, setCategory] = useState(initialData?.category || "");

  const handleSubmit = () => {
    onSubmit({
      id: initialData?.id,
      name,
      price,
      quantity: quantity || 0,
      category,
    });
    setName("");
    setPrice(0);
    setQuantity(0);
    setCategory("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Product Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Price"
        value={price.toString()}
        onChangeText={(text) => setPrice(Number(text))}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Quantity"
        value={quantity.toString()}
        onChangeText={(text) => setQuantity(Number(text))}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        {initialData ? "Update Product" : "Add Product"}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default ProductForm;
