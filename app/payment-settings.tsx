import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  List,
  useTheme,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  IconButton,
  Dialog,
} from "react-native-paper";
import {
  usePaymentMethods,
  PaymentMethod,
} from "../contexts/PaymentMethodsContext";

export default function PaymentSettings() {
  const theme = useTheme();
  const { methods, addMethod, editMethod, deleteMethod } = usePaymentMethods();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState<{ type: string; details: string }>({
    type: "",
    details: "",
  });
  const [formErrors, setFormErrors] = useState<{
    type?: string;
    details?: string;
  }>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    method: PaymentMethod | null;
  }>({ open: false, method: null });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
    },
    headerText: {
      fontWeight: "bold",
    },
    fab: {
      position: "absolute",
      right: 24,
      bottom: 32,
      backgroundColor: "#D32F2F",
    },
    modalContent: {
      backgroundColor: "#fff",
      padding: 24,
      margin: 24,
      borderRadius: 12,
      maxWidth: 400,
      alignSelf: "center",
    },
    input: {
      marginBottom: 16,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 8,
    },
    methodActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 13,
      marginBottom: 8,
      marginLeft: 2,
    },
    dialogContent: {
      paddingBottom: 8,
    },
  });

  function openAdd() {
    setEditing(null);
    setForm({ type: "", details: "" });
    setFormErrors({});
    setModalVisible(true);
  }

  function openEdit(method: PaymentMethod) {
    setEditing(method);
    setForm({ type: method.type, details: method.details });
    setFormErrors({});
    setModalVisible(true);
  }

  function validateForm() {
    const errors: { type?: string; details?: string } = {};
    if (!form.type.trim()) {
      errors.type = "Type is required";
    } else if (form.type.trim().length < 2) {
      errors.type = "Type must be at least 2 characters";
    } else if (
      methods.some(
        (m) =>
          m.type.trim().toLowerCase() === form.type.trim().toLowerCase() &&
          (!editing || m.id !== editing.id)
      )
    ) {
      errors.type = "This payment type already exists";
    }
    if (
      form.details &&
      form.details.trim().length > 0 &&
      form.details.trim().length < 2
    ) {
      errors.details = "Details must be at least 2 characters if provided";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSave() {
    if (!validateForm()) return;
    if (editing) {
      editMethod(editing.id, form);
    } else {
      addMethod(form);
    }
    setModalVisible(false);
  }

  function handleDelete(method: PaymentMethod) {
    setDeleteDialog({ open: true, method });
  }

  function confirmDelete() {
    if (deleteDialog.method) {
      deleteMethod(deleteDialog.method.id);
    }
    setDeleteDialog({ open: false, method: null });
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerText}>
            Payment Settings
          </Text>
        </View>
        <List.Section>
          {methods.length === 0 ? (
            <List.Item
              title="No payment methods"
              description="Payment methods will appear here"
            />
          ) : (
            methods.map((method) => (
              <List.Item
                key={method.id}
                title={method.type}
                description={method.details}
                right={() => (
                  <View style={styles.methodActions}>
                    <IconButton
                      icon="pencil"
                      onPress={() => openEdit(method)}
                    />
                    <IconButton
                      icon="delete"
                      onPress={() => handleDelete(method)}
                      color="#D32F2F"
                    />
                  </View>
                )}
              />
            ))
          )}
        </List.Section>
      </ScrollView>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}>
            {editing ? "Edit Payment Method" : "Add Payment Method"}
          </Text>
          <TextInput
            label="Type (e.g. Card, Bank, Wallet)"
            value={form.type}
            onChangeText={(v) => {
              setForm((f) => ({ ...f, type: v }));
              if (formErrors.type)
                setFormErrors((e) => ({ ...e, type: undefined }));
            }}
            style={styles.input}
            mode="outlined"
            error={!!formErrors.type}
          />
          {formErrors.type && (
            <Text style={styles.errorText}>{formErrors.type}</Text>
          )}
          <TextInput
            label="Details (e.g. **** 1234, Bank Name) (Optional)"
            value={form.details}
            onChangeText={(v) => {
              setForm((f) => ({ ...f, details: v }));
              if (formErrors.details)
                setFormErrors((e) => ({ ...e, details: undefined }));
            }}
            style={styles.input}
            mode="outlined"
            error={!!formErrors.details}
          />
          {formErrors.details && (
            <Text style={styles.errorText}>{formErrors.details}</Text>
          )}
          <View style={styles.actionRow}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSave}>
              {editing ? "Save" : "Add"}
            </Button>
          </View>
        </Modal>
        <Dialog
          visible={deleteDialog.open}
          onDismiss={() => setDeleteDialog({ open: false, method: null })}
        >
          <Dialog.Title>Delete Payment Method</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text>
              Are you sure you want to delete
              <Text style={{ fontWeight: "bold", color: theme.colors.error }}>
                {" "}
                {deleteDialog.method?.type}{" "}
              </Text>
              payment method?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDeleteDialog({ open: false, method: null })}
            >
              Cancel
            </Button>
            <Button onPress={confirmDelete} textColor={theme.colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={openAdd}
        label="Add New Method"
      />
    </View>
  );
}
