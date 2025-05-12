import React, { createContext, useContext, useState, ReactNode } from "react";

export interface PaymentMethod {
  id: string;
  type: string;
  details: string;
}

interface PaymentMethodsContextProps {
  methods: PaymentMethod[];
  addMethod: (method: Omit<PaymentMethod, "id">) => void;
  editMethod: (id: string, method: Omit<PaymentMethod, "id">) => void;
  deleteMethod: (id: string) => void;
}

const PaymentMethodsContext = createContext<PaymentMethodsContextProps | undefined>(undefined);

const defaultMethods: PaymentMethod[] = [
  { id: "pm_cash", type: "Cash", details: "Pay with cash" },
  { id: "pm_credit", type: "Credit", details: "Credit card" },
  { id: "pm_debit", type: "Debit", details: "Debit card" },
];

export function PaymentMethodsProvider({ children }: { children: ReactNode }) {
  const [methods, setMethods] = useState<PaymentMethod[]>(defaultMethods);

  function addMethod(method: Omit<PaymentMethod, "id">) {
    setMethods((prev) => [
      ...prev,
      { id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...method },
    ]);
  }

  function editMethod(id: string, method: Omit<PaymentMethod, "id">) {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, ...method } : m)));
  }

  function deleteMethod(id: string) {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <PaymentMethodsContext.Provider value={{ methods, addMethod, editMethod, deleteMethod }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  const ctx = useContext(PaymentMethodsContext);
  if (!ctx) throw new Error("usePaymentMethods must be used within PaymentMethodsProvider");
  return ctx;
} 