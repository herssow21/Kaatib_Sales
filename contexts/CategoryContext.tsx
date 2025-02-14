import React, { createContext, useContext, useState } from "react";
import { nanoid } from "nanoid";
import { Alert } from "react-native";

interface Category {
  id: string;
  name: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Category) => void;
  editCategory: (updatedCategory: Category) => void;
  removeCategory: (id: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const addCategory = (category: Category) => {
    try {
      setCategories((prevCategories) => [
        ...prevCategories,
        { ...category, id: nanoid() },
      ]);
    } catch (error) {
      console.log("Error adding category:", error);
      Alert.alert("Error", "Failed to add category");
    }
  };

  const editCategory = (updatedCategory: Category) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
  };

  const removeCategory = (id: string) => {
    setCategories((prevCategories) =>
      prevCategories.filter((cat) => cat.id !== id)
    );
  };

  return (
    <CategoryContext.Provider
      value={{ categories, addCategory, editCategory, removeCategory }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error(
      "useCategoryContext must be used within a CategoryProvider"
    );
  }
  return context;
};
