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