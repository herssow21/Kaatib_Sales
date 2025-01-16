import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Alert } from "react-native";
import { TextInput, Button, Text, useTheme, Card } from "react-native-paper";
import { useCategoryContext } from "../contexts/CategoryContext";
import { nanoid } from "nanoid";

const CategoryForm: React.FC<{
  initialData?: { id?: string; name: string };
  onClose: () => void;
}> = ({ initialData, onClose }) => {
  const theme = useTheme();
  const { categories, addCategory, editCategory, removeCategory } =
    useCategoryContext();
  const [categoryName, setCategoryName] = useState("");

  // Set category name when initialData changes
  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.name);
    } else {
      setCategoryName("");
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (categoryName.trim()) {
      // Check for duplicate categories
      const isDuplicate = categories.some(
        (cat) =>
          cat.name.toLowerCase() === categoryName.toLowerCase() &&
          cat.id !== initialData?.id
      );

      if (isDuplicate) {
        Alert.alert("Duplicate Category", "This category already exists.");
        return;
      }

      if (initialData) {
        // Update existing category
        editCategory({ id: initialData.id!, name: categoryName });
        Alert.alert("Success", "Category updated successfully.");
      } else {
        // Add new category
        addCategory({ id: nanoid(), name: categoryName });
        Alert.alert("Success", "Category added successfully.");
      }
      setCategoryName(""); // Clear input after submission
      onClose(); // Close the modal
    } else {
      Alert.alert("Input Error", "Category name cannot be empty.");
    }
  };

  const handleEdit = (item: { id: string; name: string }) => {
    setCategoryName(item.name); // Populate input for editing
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
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
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.categoryItem}>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryText}>{item.name}</Text>
              <View style={styles.actions}>
                <Button
                  onPress={() => handleEdit(item)}
                  mode="outlined"
                  style={styles.actionButton}
                >
                  Edit
                </Button>
                <Button
                  onPress={() => {
                    removeCategory(item.id);
                    Alert.alert("Success", "Category deleted successfully.");
                  }}
                  mode="outlined"
                  style={styles.actionButton}
                >
                  Delete
                </Button>
              </View>
            </View>
          </Card>
        )}
      />
      <Button mode="text" onPress={onClose} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginRight: 8, // Space between input and button
  },
  button: {
    marginTop: 0, // Reset margin for button
  },
  categoryItem: {
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
  },
  categoryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
  },
  cancelButton: {
    marginTop: 16,
    backgroundColor: "#f8d7da", // Change to a more interesting color
    borderRadius: 8,
  },
  cancelText: {
    color: "#e03f3e", // Change to a more interesting color
    fontWeight: "bold", // Make the font bold
  },
});

export default CategoryForm;
