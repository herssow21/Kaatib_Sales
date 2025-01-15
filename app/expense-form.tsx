import React from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button, useTheme } from "react-native-paper";
import { router } from "expo-router";

export default function ExpenseForm() {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    button: {
      marginTop: 16,
      backgroundColor: theme.colors.secondary,
    },
  });

  const handleSubmit = () => {
    // TODO: Implement expense creation logic
    router.back();
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Expense Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
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
        Save Expense
      </Button>
    </View>
  );
}
