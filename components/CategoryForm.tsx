import React, { useState } from "react";
import { StyleSheet, View, FlatList, Platform } from "react-native";
import { TextInput, Button, Text, Card, useTheme } from "react-native-paper";
import { useCategoryContext } from "../contexts/CategoryContext";
import { generateId } from "../utils/idGenerator";
import { TouchableOpacity } from "react-native";
import CustomAlert from "./common/CustomAlert";
import { useAlert } from "../hooks/useAlert";

const CategoryForm: React.FC<{
  initialData?: { id?: string; name: string };
  onClose: () => void;
}> = ({ initialData, onClose }) => {
  const theme = useTheme();
  const { categories, addCategory, editCategory, removeCategory } =
    useCategoryContext();
  const [categoryName, setCategoryName] = useState(initialData?.name || "");
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { alertProps, showSuccess, showError, showWarning } = useAlert();

  const isDuplicateCategory = (name: string, excludeId?: string) => {
    return categories.some(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase() &&
        category.id !== excludeId
    );
  };

  const handleSubmit = () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      showError("Category name is required");
      return;
    }

    try {
      if (editingItem) {
        if (isDuplicateCategory(trimmedName, editingItem.id)) {
          showError("A category with this name already exists");
          return;
        }
        editCategory({
          id: editingItem.id,
          name: trimmedName,
        });
        showSuccess("Category updated successfully");
      } else {
        if (isDuplicateCategory(trimmedName)) {
          showError("A category with this name already exists");
          return;
        }
        addCategory({
          id: generateId(),
          name: trimmedName,
        });
        showSuccess("Category created successfully");
      }
      setCategoryName("");
      setEditingItem(null);
    } catch (error) {
      console.error("Category submission error:", error);
      showError("Failed to save category");
    }
  };

  const handleEdit = (item: { id: string; name: string }) => {
    setEditingItem(item);
    setCategoryName(item.name);
  };

  const handleDelete = (id: string) => {
    showWarning(
      "Are you sure you want to delete this category?",
      "Delete",
      () => {
        try {
          removeCategory(id);
          showSuccess("Category deleted successfully");
        } catch (error) {
          console.error("Category deletion error:", error);
          showError("Failed to delete category");
        }
      }
    );
  };

  return (
    <View style={styles.modalContainer}>
      <CustomAlert {...alertProps} />

      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            {editingItem ? "Edit Category" : "Create Category"}
          </Text>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.inputSection}>
            <TextInput
              mode="outlined"
              label="Category Name"
              value={categoryName}
              onChangeText={setCategoryName}
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
            >
              {editingItem ? "Update Category" : "Add Category"}
            </Button>
          </View>

          <View style={styles.listSection}>
            <Text variant="titleMedium" style={styles.listTitle}>
              Categories
            </Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <Card style={styles.categoryItem}>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryText}>{item.name}</Text>
                    <View style={styles.actions}>
                      <Button
                        onPress={() => handleEdit(item)}
                        mode="outlined"
                        style={styles.actionButton}
                        labelStyle={styles.actionButtonLabel}
                        compact={Platform.OS !== "web"}
                      >
                        Edit
                      </Button>
                      <Button
                        onPress={() => handleDelete(item.id)}
                        mode="outlined"
                        style={[styles.actionButton, styles.deleteButton]}
                        textColor={theme.colors.error}
                        compact={Platform.OS !== "web"}
                        labelStyle={styles.actionButtonLabel}
                      >
                        Delete
                      </Button>
                    </View>
                  </View>
                </Card>
              )}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Platform.OS === "web" ? 20 : 10,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: Platform.OS === "web" ? 24 : 16,
    width: Platform.OS === "web" ? "100%" : "98%",
    maxWidth: Platform.OS === "web" ? 500 : "100%",
    height: Platform.OS === "web" ? "90%" : "95%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
  },
  inputSection: {
    marginBottom: 16,
  },
  listSection: {
    flex: 1,
    marginTop: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
    paddingRight: 40,
  },
  title: {
    fontWeight: "bold",
    fontSize: Platform.OS === "web" ? 24 : 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: -12,
    top: -12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    zIndex: 1000,
  },
  closeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "white",
    height: Platform.OS === "web" ? undefined : 45,
  },
  button: {
    height: Platform.OS === "web" ? undefined : 45,
    justifyContent: "center",
  },
  list: {
    flex: 1,
  },
  categoryItem: {
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    backgroundColor: "#fff",
  },
  categoryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Platform.OS === "web" ? 16 : 12,
    flexWrap: "nowrap",
    minWidth: Platform.OS === "web" ? undefined : 320,
  },
  categoryText: {
    fontSize: Platform.OS === "web" ? 16 : 13,
    flex: 1,
    marginRight: Platform.OS === "web" ? 8 : 4,
  },
  actions: {
    flexDirection: "row",
    gap: Platform.OS === "web" ? 8 : 3,
  },
  actionButton: {
    marginHorizontal: Platform.OS === "web" ? 2 : 3,
    paddingHorizontal: Platform.OS === "web" ? 8 : 6,
    minWidth: Platform.OS === "web" ? undefined : 65,
  },
  deleteButton: {
    borderColor: "transparent",
  },
  listTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  actionButtonLabel: {
    fontSize: Platform.OS === "web" ? 14 : 12,
  },
});

export default CategoryForm;
