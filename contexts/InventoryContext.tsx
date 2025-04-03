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
  totalSold?: number; // for products
  totalOrdered?: number; // for services
}

interface Order {
  id: string;
  items: Array<{ product: string; quantity: number; rate: number }>;
  clientName: string;
  clientContact: string;
  address: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
  discount: number;
  totalOrderItems: number;
  grandTotal: number;
  status: string;
  category: string;
}

type InventoryContextType = {
  items: InventoryItem[];
  orders?: Order[];
  addItem: (item: InventoryItem) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  removeItem: (id: string) => void;
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
  const [orders, setOrders] = useState<Order[]>([]);

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
        id: item.id || generateId(),
        totalSold: item.totalSold || 0,
        totalOrdered: item.totalOrdered || 0,
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

  const deleteItem = removeItem; // alias for consistency

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
          const currentTotalSold = item.totalSold || 0;
          const currentTotalOrdered = item.totalOrdered || 0;

          // Check if stock is depleted and there are future prices to apply
          const shouldUpdatePrices =
            newQuantity === 0 &&
            (item.futureBuyingPrice !== undefined ||
              item.futureSellingPrice !== undefined);

          return {
            ...item,
            quantity: newQuantity,
            // Update the appropriate total counter
            ...(item.type === "product"
              ? { totalSold: currentTotalSold + quantitySold }
              : { totalOrdered: currentTotalOrdered + quantitySold }),
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
          // For products, update quantity and stock value
          if (item.type === "product") {
            const newQuantity = Math.max(0, item.quantity - soldItem.quantity);
            const currentTotalSold = item.totalSold || 0;

            const shouldUpdatePrices =
              newQuantity === 0 &&
              (item.futureBuyingPrice !== undefined ||
                item.futureSellingPrice !== undefined);

            return {
              ...item,
              quantity: newQuantity,
              totalSold: currentTotalSold + soldItem.quantity,
              ...(shouldUpdatePrices && {
                buyingPrice: item.futureBuyingPrice || item.buyingPrice,
                sellingPrice: item.futureSellingPrice || item.sellingPrice,
                futureBuyingPrice: undefined,
                futureSellingPrice: undefined,
              }),
            };
          }
          // For services, only update total orders
          else {
            const currentTotalOrdered = item.totalOrdered || 0;
            return {
              ...item,
              totalOrdered: currentTotalOrdered + soldItem.quantity,
            };
          }
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
        orders,
        addItem,
        updateItem,
        deleteItem,
        removeItem,
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
