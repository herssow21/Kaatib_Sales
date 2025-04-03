import { useState, useCallback } from "react";
import { AlertType } from "../components/common/CustomAlert";

interface AlertConfig {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  onConfirm?: () => void;
}

export function useAlert() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = useCallback((newConfig: AlertConfig) => {
    setConfig(newConfig);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const showSuccess = useCallback(
    (message: string, title: string = "Success") => {
      showAlert({ title, message, type: "success" });
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string, title: string = "Error") => {
      showAlert({ title, message, type: "error" });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (
      message: string,
      confirmText: string,
      onConfirm: () => void,
      title: string = "Warning"
    ) => {
      showAlert({
        title,
        message,
        type: "warning",
        confirmText,
        onConfirm,
      });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, title: string = "Info") => {
      showAlert({ title, message, type: "info" });
    },
    [showAlert]
  );

  return {
    alertProps: {
      visible,
      onDismiss: hideAlert,
      ...config,
    },
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
