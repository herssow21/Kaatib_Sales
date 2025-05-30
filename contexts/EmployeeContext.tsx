import React, { createContext, useContext, useState } from "react";

interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  branch: string;
  joined?: string;
  salesRank: number;
  totalSalesPeople: number;
  salesPeriod: string;
  commissionRate: string;
  phone?: string;
  avatar?: string;
  assignedStore?: string;
  password?: string;
  role: string;
  address: string;
}

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  editEmployee: (id: string, employee: Employee) => void;
  removeEmployee: (id: string) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const addEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
  };

  const editEmployee = (id: string, employee: Employee) => {
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? employee : emp)));
  };

  const removeEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        addEmployee,
        editEmployee,
        removeEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployeeContext() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error(
      "useEmployeeContext must be used within an EmployeeProvider"
    );
  }
  return context;
}
