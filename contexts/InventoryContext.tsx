import React, { createContext, useContext, useState } from "react";
import { generateId } from "../utils/idGenerator";

interface InventoryItem {
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

  const addItem = (item: InventoryItem) => {
    const newItem = {
      ...item,
      id: generateId(),
      // For services: set charges as sellingPrice, others as 0 or dash
      ...(item.type === "service" && {
        sellingPrice: item.charges || 0,
        quantity: 0,
        buyingPrice: 0,
        stockValue: 0,
      }),
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const editItem = (updatedItem: InventoryItem) => {
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
