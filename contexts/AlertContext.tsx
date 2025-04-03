import React, { createContext, useContext, ReactNode } from "react";
import { useAlert } from "../hooks/useAlert";
import CustomAlert from "../components/common/CustomAlert";

interface AlertContextType {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (
    message: string,
    confirmText: string,
    onConfirm: () => void,
    title?: string
  ) => void;
  showInfo: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const { alertProps, showSuccess, showError, showWarning, showInfo } =
    useAlert();

  return (
    <AlertContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      <CustomAlert {...alertProps} />
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlertContext must be used within an AlertProvider");
  }
  return context;
}
