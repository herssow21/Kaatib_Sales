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
      {visible && (
        <View style={[StyleSheet.absoluteFill, styles.container]}>
          <View
            style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}
            pointerEvents="auto"
          >
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
                  size={24}
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
                      style={styles.actionButton}
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
                      buttonColor={getDialogColor(type)}
                      style={[styles.actionButton, styles.confirmButton]}
                    >
                      {confirmText || "Confirm"}
                    </Button>
                  </>
                ) : (
                  <Button
                    onPress={onDismiss}
                    mode="contained"
                    buttonColor={getDialogColor(type)}
                    style={[styles.actionButton, styles.okButton]}
                  >
                    OK
                  </Button>
                )}
              </Dialog.Actions>
            </Dialog>
          </View>
        </View>
      )}
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
    zIndex: 999999,
    elevation: 999999,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
    elevation: 999999,
  },
  dialog: {
    position: "relative",
    maxWidth: Platform.OS === "web" ? 400 : "90%",
    width: Platform.OS === "web" ? 400 : undefined,
    minWidth: Platform.OS === "web" ? undefined : 280,
    alignSelf: "center",
    borderRadius: 12,
    elevation: 999999,
    zIndex: 999999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    margin: 20,
  },
  dialogHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  dialogIcon: {
    marginRight: 12,
  },
  dialogTitle: {
    flex: 1,
    fontWeight: "600",
    fontSize: 18,
  },
  dialogContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  dialogMessage: {
    color: "#333",
    fontSize: 16,
    lineHeight: 22,
  },
  dialogActions: {
    padding: 12,
    marginTop: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  actionButton: {
    minWidth: 90,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButton: {
    paddingHorizontal: 16,
  },
  okButton: {
    minWidth: 120,
    paddingVertical: 6,
    marginLeft: 0,
  },
});

export default CustomAlert;
