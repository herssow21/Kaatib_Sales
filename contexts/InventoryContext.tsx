import React, { createContext, useContext, useState } from "react";
import { generateId } from "../utils/idGenerator";
import { Alert, Platform } from "react-native";
import { PaperProvider, Portal } from "react-native-paper";

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
  pendingSellingPrice?: number;
  pendingPriceActivationQuantity?: number;
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

export interface InventoryContextType {
  items: InventoryItem[];
  orders?: Order[];
  addItem: (item: Omit<InventoryItem, "id">) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  removeItem: (id: string) => void;
  handleSale: (itemId: string, quantitySold: number) => void;
  handleOrderSale: (
    orderItems: {
      itemId: string;
      quantity: number;
      previousQuantity?: number;
    }[]
  ) => void;
  handleRestock: (
    itemId: string,
    quantity: number,
    newBuyingPrice: number | undefined,
    newSellingPrice: number | undefined,
    applyPriceImmediately: boolean
  ) => void;
}

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

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          // If quantity is 0 and there's a pending selling price, apply it
          if (
            updatedItem.quantity === 0 &&
            item.pendingSellingPrice !== undefined
          ) {
            return {
              ...updatedItem,
              sellingPrice: item.pendingSellingPrice,
              pendingSellingPrice: undefined,
              pendingPriceActivationQuantity: undefined,
            };
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleSale = (itemId: string, quantitySold: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity - quantitySold);
          const currentTotalSold = item.totalSold || 0;
          const currentTotalOrdered = item.totalOrdered || 0;

          // Check if we've depleted the initial stock and should apply pending price
          const shouldUpdatePrice =
            item.pendingSellingPrice !== undefined &&
            item.pendingPriceActivationQuantity !== undefined &&
            newQuantity <= item.pendingPriceActivationQuantity;

          return {
            ...item,
            quantity: newQuantity,
            stockValue: newQuantity * item.buyingPrice,
            // Update the appropriate total counter
            ...(item.type === "product"
              ? { totalSold: currentTotalSold + quantitySold }
              : { totalOrdered: currentTotalOrdered + quantitySold }),
            // Apply pending price if initial stock is depleted
            ...(shouldUpdatePrice && {
              sellingPrice: item.pendingSellingPrice,
              pendingSellingPrice: undefined,
              pendingPriceActivationQuantity: undefined,
            }),
          };
        }
        return item;
      })
    );
  };

  const handleOrderSale = (
    orderItems: {
      itemId: string;
      quantity: number;
      previousQuantity?: number;
    }[]
  ) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        const soldItem = orderItems.find(
          (orderItem) => orderItem.itemId === item.id
        );
        if (soldItem) {
          if (item.type === "product") {
            if (soldItem.previousQuantity !== undefined) {
              // This is an edit - first restore the previous quantity
              const originalStock = item.quantity + soldItem.previousQuantity;
              // Then deduct the new quantity
              const newQuantity = originalStock - soldItem.quantity;

              if (newQuantity < 0) {
                throw new Error(`Not enough stock for ${item.name}`);
              }

              // Check if we should apply pending price
              // This happens when the new quantity is less than or equal to the pending activation quantity
              const shouldUpdatePrice =
                item.pendingSellingPrice !== undefined &&
                item.pendingPriceActivationQuantity !== undefined &&
                newQuantity <= item.pendingPriceActivationQuantity;

              return {
                ...item,
                quantity: newQuantity,
                totalSold:
                  (item.totalSold || 0) +
                  soldItem.quantity -
                  (soldItem.previousQuantity || 0),
                stockValue: newQuantity * item.buyingPrice,
                ...(shouldUpdatePrice && {
                  sellingPrice: item.pendingSellingPrice,
                  pendingSellingPrice: undefined,
                  pendingPriceActivationQuantity: undefined,
                }),
              };
            } else {
              // This is a new order
              const newQuantity = item.quantity - soldItem.quantity;

              if (newQuantity < 0) {
                throw new Error(`Not enough stock for ${item.name}`);
              }

              // Check if we should apply pending price
              const shouldUpdatePrice =
                item.pendingSellingPrice !== undefined &&
                item.pendingPriceActivationQuantity !== undefined &&
                newQuantity <= item.pendingPriceActivationQuantity;

              return {
                ...item,
                quantity: newQuantity,
                stockValue: newQuantity * item.buyingPrice,
                totalSold: (item.totalSold || 0) + soldItem.quantity,
                ...(shouldUpdatePrice && {
                  sellingPrice: item.pendingSellingPrice,
                  pendingSellingPrice: undefined,
                  pendingPriceActivationQuantity: undefined,
                }),
              };
            }
          } else {
            // For services
            const currentTotalOrdered = item.totalOrdered || 0;
            if (soldItem.previousQuantity !== undefined) {
              return {
                ...item,
                totalOrdered: Math.max(
                  0,
                  currentTotalOrdered +
                    soldItem.quantity -
                    soldItem.previousQuantity
                ),
              };
            } else {
              return {
                ...item,
                totalOrdered: currentTotalOrdered + soldItem.quantity,
              };
            }
          }
        }
        return item;
      });

      return updatedItems;
    });
  };

  const handleRestock = (
    itemId: string,
    quantity: number,
    newBuyingPrice: number | undefined,
    newSellingPrice: number | undefined,
    applyPriceImmediately: boolean
  ) => {
    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === itemId) {
          const currentQuantity = item.quantity;
          const updatedQuantity = currentQuantity + quantity;

          // Calculate weighted average buying price if new buying price is provided
          const weightedBuyingPrice = newBuyingPrice
            ? (currentQuantity * item.buyingPrice + quantity * newBuyingPrice) /
              updatedQuantity
            : item.buyingPrice;

          if (applyPriceImmediately) {
            // Apply new prices immediately to all stock
            return {
              ...item,
              quantity: updatedQuantity,
              buyingPrice: weightedBuyingPrice,
              sellingPrice: newSellingPrice || item.sellingPrice,
              stockValue: updatedQuantity * weightedBuyingPrice,
              pendingSellingPrice: undefined,
              pendingPriceActivationQuantity: undefined,
            };
          } else {
            // Apply new selling price only to new stock and forward
            return {
              ...item,
              quantity: updatedQuantity,
              buyingPrice: weightedBuyingPrice,
              stockValue: updatedQuantity * weightedBuyingPrice,
              // Keep current selling price for existing stock
              sellingPrice: item.sellingPrice,
              // Set new selling price as pending for new stock
              pendingSellingPrice: newSellingPrice,
              // Set activation quantity to current quantity (before restock)
              pendingPriceActivationQuantity: currentQuantity,
            };
          }
        }
        return item;
      });
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
        handleRestock,
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
