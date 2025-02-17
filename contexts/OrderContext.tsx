import React, { createContext, useContext, useState } from "react";

interface Order {
  name: string;
  amount: number;
  id: string;
  date: string;
  clientName: string;
  clientContact: string;
  address?: string;
  products: { name: string; rate: number; quantity: number; total: number }[];
  subTotal: number;
  discount: number;
  grandTotal: number;
  payment: string;
  status: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (order: Order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
};
