import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Order {
  id: string;
  date: string;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  totalOrders: number;
  recentOrders: Order[];
}

export interface CustomerLookupContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  getCustomerByPhone: (phone: string) => Customer | undefined;
  getCustomerByEmail: (email: string) => Customer | undefined;
  saveCustomers: (customers: Customer[]) => Promise<void>;
  addOrderToCustomer: (customerId: string, order: Order) => Promise<void>;
  createCustomer: (
    customerData: Omit<Customer, "id" | "totalOrders" | "recentOrders">
  ) => Promise<Customer>;
}

export const CustomerLookupContext =
  createContext<CustomerLookupContextType | null>(null);

const CUSTOMERS_STORAGE_KEY = "@kaatib_sales_customers";

export const CustomerLookupProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [phoneMap, setPhoneMap] = useState<Map<string, Customer>>(new Map());
  const [emailMap, setEmailMap] = useState<Map<string, Customer>>(new Map());

  // Load saved customers on mount
  useEffect(() => {
    loadSavedCustomers();
  }, []);

  // Update maps when customers change
  useEffect(() => {
    const newPhoneMap = new Map(
      customers.map((customer) => [customer.phone.replace(/\D/g, ""), customer])
    );
    setPhoneMap(newPhoneMap);

    const newEmailMap = new Map(
      customers.map((customer) => [
        customer.email?.toLowerCase() || "",
        customer,
      ])
    );
    setEmailMap(newEmailMap);
  }, [customers]);

  const loadSavedCustomers = async () => {
    try {
      const savedCustomers = await AsyncStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const saveCustomers = async (updatedCustomers: Customer[]) => {
    try {
      await AsyncStorage.setItem(
        CUSTOMERS_STORAGE_KEY,
        JSON.stringify(updatedCustomers)
      );
      setCustomers(updatedCustomers);
      console.log("Saved customers:", updatedCustomers);
    } catch (error) {
      console.error("Error saving customers:", error);
    }
  };

  const getCustomerByPhone = (phone: string) => {
    if (!phone) return undefined;
    const cleanedPhone = phone.replace(/\D/g, "");
    return phoneMap.get(cleanedPhone);
  };

  const getCustomerByEmail = (email: string) => {
    if (!email) return undefined;
    const normalizedEmail = email.toLowerCase();
    return emailMap.get(normalizedEmail);
  };

  const addOrderToCustomer = async (customerId: string, order: Order) => {
    const updatedCustomers = customers.map((customer) => {
      if (customer.id === customerId) {
        const recentOrders = [order, ...(customer.recentOrders || [])].slice(
          0,
          5
        );
        return {
          ...customer,
          totalOrders: customer.totalOrders + 1,
          recentOrders,
        };
      }
      return customer;
    });
    await saveCustomers(updatedCustomers);
  };

  const createCustomer = async (
    customerData: Omit<Customer, "id" | "totalOrders" | "recentOrders">
  ) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Math.random().toString(36).substr(2, 9),
      totalOrders: 0,
      recentOrders: [],
    };

    const updatedCustomers = [...customers, newCustomer];
    await saveCustomers(updatedCustomers);
    console.log("Created new customer:", newCustomer);
    return newCustomer;
  };

  const contextValue: CustomerLookupContextType = {
    customers,
    setCustomers,
    getCustomerByPhone,
    getCustomerByEmail,
    saveCustomers,
    addOrderToCustomer,
    createCustomer,
  };

  return (
    <CustomerLookupContext.Provider value={contextValue}>
      {children}
    </CustomerLookupContext.Provider>
  );
};

export const useCustomerLookup = (): CustomerLookupContextType => {
  const context = useContext(CustomerLookupContext);
  if (!context) {
    throw new Error(
      "useCustomerLookup must be used within a CustomerLookupProvider"
    );
  }
  return context;
};
