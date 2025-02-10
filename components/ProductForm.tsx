import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { nanoid } from "nanoid";

const ProductForm: React.FC<{
  initialData?: any;
  onSubmit: (data: any) => void;
  categories: { id: string; name: string }[];
}> = ({ initialData, onSubmit, categories }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price || 0);
  const [quantity, setQuantity] = useState(initialData?.quantity || 0);
  const [category, setCategory] = useState(initialData?.category || "");

  const handleSubmit = () => {
    const itemData = {
      id: initialData?.id || nanoid(),
      name,
      price,
      quantity,
      category,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
    };
    onSubmit(itemData);
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
        onChangeText={(text) => setPrice(parseFloat(text))}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Quantity"
        value={quantity.toString()}
        onChangeText={(text) => setQuantity(parseInt(text, 10))}
        keyboardType="numeric"
        style={styles.input}
      />
      <Picker
        selectedValue={category}
        onValueChange={setCategory}
        style={styles.input}
      >
        <Picker.Item label="Select Category" value="" />
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
        ))}
      </Picker>
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
