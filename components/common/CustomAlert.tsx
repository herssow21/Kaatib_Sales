import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { Portal, Dialog, Button, useTheme, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type AlertType = "success" | "error" | "warning" | "info";

interface CustomAlertProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  onConfirm?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  onDismiss,
  title,
  message,
  type = "info",
  confirmText,
  onConfirm,
}) => {
  const theme = useTheme();

  const getDialogIcon = (type: AlertType) => {
    switch (type) {
      case "success":
        return "check-circle-outline";
      case "error":
        return "alert-circle-outline";
      case "warning":
        return "alert-outline";
      case "info":
      default:
        return "information-outline";
    }
  };

  const getDialogColor = (type: AlertType) => {
    switch (type) {
      case "success":
        return theme.colors.primary;
      case "error":
        return theme.colors.error;
      case "warning":
        return "#FF9800";
      case "info":
      default:
        return theme.colors.primary;
    }
  };

  const getBackgroundColor = (type: AlertType) => {
    switch (type) {
      case "success":
        return "rgba(76, 175, 80, 0.08)";
      case "error":
        return "rgba(244, 67, 54, 0.08)";
      case "warning":
        return "rgba(255, 152, 0, 0.08)";
      case "info":
      default:
        return "rgba(33, 150, 243, 0.08)";
    }
  };

  return (
    <Portal>
      <View style={styles.container} pointerEvents="box-none">
        <Dialog
          visible={visible}
          onDismiss={onDismiss}
          style={[
            styles.dialog,
            {
              backgroundColor: "white",
              borderLeftWidth: 4,
              borderLeftColor: getDialogColor(type),
            },
          ]}
        >
          <View style={styles.dialogHeader}>
            <MaterialCommunityIcons
              name={getDialogIcon(type)}
              size={28}
              color={getDialogColor(type)}
              style={styles.dialogIcon}
            />
            <Text
              variant="titleMedium"
              style={[styles.dialogTitle, { color: getDialogColor(type) }]}
            >
              {title}
            </Text>
          </View>
          <Dialog.Content style={styles.dialogContent}>
            <Text variant="bodyMedium" style={styles.dialogMessage}>
              {message}
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            {onConfirm ? (
              <>
                <Button
                  onPress={onDismiss}
                  mode="text"
                  compact
                  textColor={theme.colors.backdrop}
                >
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    onConfirm();
                    onDismiss();
                  }}
                  mode="contained"
                  compact
                  buttonColor={getDialogColor(type)}
                  style={styles.confirmButton}
                >
                  {confirmText || "Confirm"}
                </Button>
              </>
            ) : (
              <Button
                onPress={onDismiss}
                mode="text"
                compact
                textColor={getDialogColor(type)}
              >
                OK
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
    elevation: 999999,
  },
  alertBox: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    minWidth: 300,
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  dialog: {
    maxWidth: Platform.OS === "web" ? 400 : "85%",
    width: Platform.OS === "web" ? 400 : undefined,
    alignSelf: "center",
    borderRadius: 8,
    elevation: 24,
    zIndex: 999999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  dialogHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  dialogContent: {
    backgroundColor: "white",
  },
  dialogIcon: {
    marginRight: 12,
  },
  dialogTitle: {
    fontWeight: "600",
    flex: 1,
  },
  dialogMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 4,
    color: "rgba(0, 0, 0, 0.87)",
  },
  dialogActions: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  confirmButton: {
    minWidth: 100,
  },
});

export default CustomAlert;
