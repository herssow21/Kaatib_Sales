import React, { createContext, useContext, useState } from "react";
import { nanoid } from "nanoid";

interface InventoryItem {
  id: string;
  name: string;
  quantity?: number;
  price: number;
  category?: string;
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
    setItems((prevItems) => [...prevItems, { ...item, id: nanoid() }]);
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
