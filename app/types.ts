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
  address: string;
  items: any[];
  discount: number;
  id: string;
  orderDate: string | Date;
  clientName: string;
  clientContact: ReactNode;
  totalOrderItems: number;
  paymentStatus: string;
  paymentMethod: ReactNode;
  grandTotal: number;
  status: string;
  category: string;
  // Add other properties as needed
}

export type RouteNames = 
  | "Home"
  | "Profile"
  | "UserManagementScreen"
  | "OtherRoutes"; 