import React, { createContext, useContext, useState } from "react";
import { generateId } from "../utils/idGenerator";
import { Alert, Platform } from "react-native";

interface InventoryItem {
  measuringUnit: string;
  price: number;
  id: string;
  name: string;
  type: "product" | "service";
  category: string;
  createdAt: string;
  charges?: number; // for services
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  stockValue: number;
}

interface InventoryContextType {
  items: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  editItem: (updatedItem: InventoryItem) => void;
  removeItem: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const showError = (message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("Error", message);
    }
  };

  const addItem = (item: InventoryItem) => {
    try {
      const exists = items.some(
        (existingItem) =>
          existingItem.name.toLowerCase() === item.name.toLowerCase()
      );

      if (exists) {
        showError("An item with this name already exists.");
        return; // Prevent adding the item but keep the form open
      }

      if (item.sellingPrice < item.buyingPrice) {
        showError("Selling price cannot be lower than buying price.");
        return; // Prevent adding the item but keep the form open
      }

      const newItem = {
        ...item,
        id: generateId(),
        ...(item.type === "service" && {
          sellingPrice: item.charges || 0,
          quantity: 0,
          buyingPrice: 0,
          stockValue: 0,
        }),
      };
      setItems((prevItems) => [...prevItems, newItem]);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const editItem = (updatedItem: InventoryItem) => {
    // Check for duplicates when editing
    const exists = items.some(
      (item) =>
        item.name.toLowerCase() === updatedItem.name.toLowerCase() &&
        item.id !== updatedItem.id // Ensure we don't compare with itself
    );

    if (exists) {
      showError("An item with this name already exists.");
      return; // Prevent renaming to an existing item
    }

    setItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <InventoryContext.Provider value={{ items, addItem, editItem, removeItem }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error(
      "useInventoryContext must be used within an InventoryProvider"
    );
  }
  return context;
};
