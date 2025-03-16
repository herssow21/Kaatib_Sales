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
  futureBuyingPrice?: number;
  futureSellingPrice?: number;
}

type InventoryContextType = {
  items: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  handleSale: (itemId: string, quantitySold: number) => void;
  handleOrderSale: (orderItems: { itemId: string; quantity: number }[]) => void;
};

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
          existingItem.name.toLowerCase() === item.name.toLowerCase() &&
          existingItem.category === item.category
      );

      if (exists) {
        showError("An item with this name already exists in this category.");
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

  const updateItem = (updatedItem: InventoryItem) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleSale = (itemId: string, quantitySold: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity - quantitySold);

          // Check if stock is depleted and there are future prices to apply
          const shouldUpdatePrices =
            newQuantity === 0 &&
            (item.futureBuyingPrice !== undefined ||
              item.futureSellingPrice !== undefined);

          return {
            ...item,
            quantity: newQuantity,
            // Apply future prices if stock depleted
            ...(shouldUpdatePrices && {
              buyingPrice: item.futureBuyingPrice || item.buyingPrice,
              sellingPrice: item.futureSellingPrice || item.sellingPrice,
              futureBuyingPrice: undefined,
              futureSellingPrice: undefined,
            }),
          };
        }
        return item;
      })
    );
  };

  const handleOrderSale = (
    orderItems: { itemId: string; quantity: number }[]
  ) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        const soldItem = orderItems.find(
          (orderItem) => orderItem.itemId === item.id
        );
        if (soldItem) {
          const newQuantity = Math.max(0, item.quantity - soldItem.quantity);
          console.log(
            `Updating ${item.name} from ${item.quantity} to ${newQuantity}`
          ); // Debug log

          const shouldUpdatePrices =
            newQuantity === 0 &&
            (item.futureBuyingPrice !== undefined ||
              item.futureSellingPrice !== undefined);

          return {
            ...item,
            quantity: newQuantity,
            ...(shouldUpdatePrices && {
              buyingPrice: item.futureBuyingPrice || item.buyingPrice,
              sellingPrice: item.futureSellingPrice || item.sellingPrice,
              futureBuyingPrice: undefined,
              futureSellingPrice: undefined,
            }),
          };
        }
        return item;
      });

      return updatedItems;
    });
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        addItem,
        editItem,
        removeItem,
        updateItem,
        handleSale,
        handleOrderSale,
      }}
    >
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
