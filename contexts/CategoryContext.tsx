import React, { createContext, useContext, useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Category) => void;
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
    setCategories((prevCategories) => [...prevCategories, category]);
  };

  const removeCategory = (id: string) => {
    setCategories((prevCategories) =>
      prevCategories.filter((cat) => cat.id !== id)
    );
  };

  return (
    <CategoryContext.Provider
      value={{ categories, addCategory, removeCategory }}
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
