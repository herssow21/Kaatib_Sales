import React, { createContext, useContext, useState } from "react";
import { generateId } from "../utils/idGenerator";

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
      const newCategory = { ...category, id: generateId() };
      setCategories((prevCategories) => [...prevCategories, newCategory]);
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  };

  const editCategory = (updatedCategory: Category) => {
    try {
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === updatedCategory.id
            ? { ...cat, name: updatedCategory.name }
            : cat
        )
      );
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  };

  const removeCategory = (id: string) => {
    try {
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== id)
      );
    } catch (error) {
      console.error("Error removing category:", error);
      throw error;
    }
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
