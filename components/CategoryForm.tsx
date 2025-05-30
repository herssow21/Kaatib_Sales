import React, { useState } from "react";
import { StyleSheet, View, FlatList, Platform } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  useTheme,
  IconButton,
} from "react-native-paper";
import { useCategoryContext } from "../contexts/CategoryContext";
import { generateId } from "../utils/idGenerator";
import { TouchableOpacity } from "react-native";
import CustomAlert from "./common/CustomAlert";
import { useAlert } from "../hooks/useAlert";
import { useColorScheme } from "react-native";
import { getCategoryFormStyles } from "../styles/components/CategoryForm";

const CategoryForm: React.FC<{
  initialData?: { id?: string; name: string };
  onClose: () => void;
}> = ({ initialData, onClose }) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getCategoryFormStyles(isDark);
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
    <View style={styles.container}>
      <CustomAlert {...alertProps} />
      <TouchableOpacity
        style={styles.closeButtonContainer}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <View style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </View>
      </TouchableOpacity>
      <View>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            {editingItem ? "Edit Category" : "Create Category"}
          </Text>
        </View>
        <View style={styles.inputSection}>
          <TextInput
            mode="outlined"
            label="Category Name"
            value={categoryName}
            onChangeText={setCategoryName}
            style={styles.input}
            theme={{
              colors: {
                text: styles.input.color,
                background: styles.input.backgroundColor,
                primary: theme.colors.primary,
                placeholder: styles.input.color,
              },
            }}
            placeholderTextColor={styles.input.color}
            underlineColorAndroid="transparent"
            selectionColor={theme.colors.primary}
            textColor={styles.input.color}
          />
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
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
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <Card style={styles.categoryItem}>
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryText}>{item.name}</Text>
                  <View style={styles.actions}>
                    <IconButton
                      icon="pencil"
                      size={22}
                      onPress={() => handleEdit(item)}
                      style={styles.actionButton}
                      iconColor={styles.actionButtonLabel.color}
                      accessibilityLabel="Edit"
                    />
                    <IconButton
                      icon="delete"
                      size={22}
                      onPress={() => handleDelete(item.id)}
                      style={[styles.actionButton, styles.deleteButton]}
                      iconColor={theme.colors.error}
                      accessibilityLabel="Delete"
                    />
                  </View>
                </View>
              </Card>
            )}
          />
        </View>
      </View>
    </View>
  );
};

export default CategoryForm;
