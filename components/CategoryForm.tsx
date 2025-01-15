import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button, useTheme } from "react-native-paper";
import { useCategoryContext } from "../contexts/CategoryContext";
import { nanoid } from "nanoid";

const CategoryForm: React.FC<{
  initialData?: { id?: string; name: string };
  onClose: () => void;
}> = ({ initialData, onClose }) => {
  const theme = useTheme();
  const { addCategory, editCategory } = useCategoryContext();
  const [categoryName, setCategoryName] = useState(initialData?.name || "");

  const handleSubmit = () => {
    if (categoryName.trim()) {
      if (initialData) {
        editCategory({ id: initialData.id!, name: categoryName });
      } else {
        addCategory({ id: nanoid(), name: categoryName });
      }
      setCategoryName(""); // Clear input after submission
      onClose(); // Close the modal
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
        {initialData ? "Update Category" : "Add Category"}
      </Button>
      <Button mode="text" onPress={onClose} style={styles.button}>
        Cancel
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
