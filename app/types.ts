import { ReactNode } from "react";

const Order = {
  id: "",
  clientName: "",
  grandTotal: 0,
  status: "",
  category: "",
  // Add other properties as needed
};

export default Order; // Default export

export interface Order {
  category: string;
  id: string;
  clientName: string;
  clientContact: string;
  address: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
  totalOrderItems: number;
  items: {
    product: string;
    quantity: number;
    rate: number;
  }[];
  discount: number;
  grandTotal: number;
  status: string;
}

export type RouteNames = 
  | "Home"
  | "Profile"
  | "UserManagementScreen"
  | "OtherRoutes";

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  measuringUnit: string;
  stockValue: number;
  createdAt: string;
  price: number;
  type: 'product' | 'service';
  charges?: number;
}