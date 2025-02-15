import React, { useState } from "react";
import { View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { router } from "expo-router";
import { useInventoryContext } from "../contexts/InventoryContext";
import { nanoid } from "nanoid";

export default function TransactionForm() {
  const { addItem } = useInventoryContext();
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");

  const handleSubmit = () => {
    if (itemName.trim() && itemPrice && itemQuantity) {
      addItem({
        id: nanoid(),
        name: itemName,
        price: parseFloat(itemPrice),
        quantity: parseInt(itemQuantity, 10),
        category: "default",
        createdAt: new Date().toISOString(),
        buyingPrice: parseFloat(itemPrice),
        sellingPrice: parseFloat(itemPrice),
        stockValue: parseFloat(itemPrice) * parseInt(itemQuantity, 10),
      });
      router.back();
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        mode="outlined"
        label="Item Name"
        value={itemName}
        onChangeText={setItemName}
        style={{ marginBottom: 16 }}
      />
      <TextInput
        mode="outlined"
        label="Price"
        value={itemPrice}
        onChangeText={setItemPrice}
        keyboardType="decimal-pad"
        style={{ marginBottom: 16 }}
      />
      <TextInput
        mode="outlined"
        label="Quantity"
        value={itemQuantity}
        onChangeText={setItemQuantity}
        keyboardType="numeric"
        style={{ marginBottom: 16 }}
      />
      <Button mode="contained" onPress={handleSubmit}>
        Save Item
      </Button>
    </View>
  );
}
