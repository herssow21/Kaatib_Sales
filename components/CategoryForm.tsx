import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button, useTheme } from "react-native-paper";
import { useCategoryContext } from "../contexts/CategoryContext";
import { nanoid } from "nanoid"; // For generating unique IDs

const CategoryForm: React.FC = () => {
  const theme = useTheme();
  const { addCategory } = useCategoryContext();
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = () => {
    if (categoryName.trim()) {
      addCategory({ id: nanoid(), name: categoryName });
      setCategoryName(""); // Clear input after submission
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Add Category
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

export default CategoryForm;
