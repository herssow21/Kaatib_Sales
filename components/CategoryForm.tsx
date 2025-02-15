import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Alert } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { useCategoryContext } from "../contexts/CategoryContext";
import { generateId } from "../utils/idGenerator";

const CategoryForm: React.FC<{
  initialData?: { id?: string; name: string };
  onClose: () => void;
}> = ({ initialData, onClose }) => {
  const { categories, addCategory, editCategory, removeCategory } =
    useCategoryContext();
  const [categoryName, setCategoryName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [initialDataState, setInitialData] = useState<{
    id?: string;
    name: string;
  } | null>(null);

  // Set category name when initialData changes
  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.name);
      setIsEditing(true);
    } else {
      // Reset the form when initialData is null
      setCategoryName("");
      setIsEditing(false);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!categoryName.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    // Check for duplicates
    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (isEditing) {
      // If editing, allow the same name
      if (isDuplicate && categoryName !== initialData?.name) {
        Alert.alert("Error", "Category name already exists");
        return;
      }
      if (initialData) {
        // Only update if the name has changed
        if (categoryName !== initialData.name) {
          editCategory({ id: initialData.id, name: categoryName });
          Alert.alert("Success", "Category updated successfully.");
        } else {
          Alert.alert("Info", "No changes made to the category.");
        }
      }
    } else {
      // If adding, prevent duplicates
      if (isDuplicate) {
        Alert.alert("Error", "Category name already exists");
        return;
      }
      addCategory({ id: generateId(), name: categoryName });
      Alert.alert("Success", "Category created successfully.");
    }

    setCategoryName(""); // Reset the input field
    onClose(); // Close the form after submission
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this category?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            removeCategory(id);
            Alert.alert("Success", "Category deleted successfully.");
          },
        },
      ]
    );
  };

  const handleEdit = (item: { id: string; name: string }) => {
    setCategoryName(item.name);
    setIsEditing(true);
    // Set initialData to the item being edited
    setInitialData(item);
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
          {isEditing ? "Update Category" : "Add Category"}
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
