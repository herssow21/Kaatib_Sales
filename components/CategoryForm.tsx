import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Alert, Platform } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { useCategoryContext } from "../contexts/CategoryContext";
import { generateId } from "../utils/idGenerator";

const CategoryForm: React.FC<{
  initialData?: { id?: string; name: string };
  onClose: () => void;
}> = ({ initialData, onClose }) => {
  const { categories, addCategory, editCategory, removeCategory } =
    useCategoryContext();
  const [categoryName, setCategoryName] = useState(initialData?.name || "");
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.name);
      setEditingItem(
        initialData.id
          ? {
              id: initialData.id,
              name: initialData.name,
            }
          : null
      );
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!categoryName.trim()) {
      if (Platform.OS === "web") {
        window.alert("Category name is required");
      } else {
        Alert.alert("Error", "Category name is required");
      }
      return;
    }

    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === categoryName.trim().toLowerCase() &&
        cat.id !== editingItem?.id
    );

    if (isDuplicate) {
      if (Platform.OS === "web") {
        window.alert("Category name already exists");
      } else {
        Alert.alert("Error", "Category name already exists");
      }
      return;
    }

    try {
      if (editingItem?.id) {
        editCategory({
          id: editingItem.id,
          name: categoryName.trim(),
        });
      } else {
        addCategory({
          id: generateId(),
          name: categoryName.trim(),
        });
      }
      setCategoryName("");
      setEditingItem(null);
      onClose();
    } catch (error) {
      console.error("Error submitting category:", error);
      if (Platform.OS === "web") {
        window.alert("Failed to save category");
      } else {
        Alert.alert("Error", "Failed to save category");
      }
    }
  };

  const handleDelete = (id: string) => {
    const confirmDelete = () => {
      try {
        removeCategory(id);
        Alert.alert("Success", "Category deleted successfully");
      } catch (error) {
        console.error("Error deleting category:", error);
        Alert.alert("Error", "Failed to delete category");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this category?")) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Category",
        "Are you sure you want to delete this category?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", onPress: confirmDelete, style: "destructive" },
        ]
      );
    }
  };

  const handleEdit = (item: { id: string; name: string }) => {
    setCategoryName(item.name);
    setEditingItem(item);
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
          {editingItem ? "Update Category" : "Add Category"}
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
                  onPress={() => handleDelete(item.id)}
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
