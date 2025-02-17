const Order = {
  id: "",
  clientName: "",
  grandTotal: 0,
  status: "",
  // Add other properties as needed
};

export default Order; // Default export

export interface Order {
  id: string;
  clientName: string;
  grandTotal: number;
  status: string;
  // Add other properties as needed
} 