import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, useWindowDimensions } from "react-native";
import {
  Text,
  TextInput,
  Button,
  IconButton,
  Modal,
  Portal,
  Divider,
  useTheme,
  Menu,
  Surface,
  HelperText,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

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
  avatar?: string;
  assignedStore?: string;
  password?: string;
}

const initialEmployee: Omit<Employee, "id"> = {
  name: "",
  email: "",
  employeeId: "",
  branch: "",
  joined: "",
  commissionRate: "0",
  avatar: undefined,
  assignedStore: "",
  password: "",
};

export function EmployeeManagement() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<Omit<Employee, "id">>(initialEmployee);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [branchMenuVisible, setBranchMenuVisible] = useState(false);

  const isWeb = width >= 768;
  const modalWidth = isWeb ? Math.min(600, width * 0.8) : "90%";

  function resetForm() {
    setForm(initialEmployee);
    setEditingEmployee(null);
    setShowPassword(false);
  }

  function handleAddOrUpdate() {
    if (!form.name.trim() || !form.email.trim() || !form.employeeId.trim() || !form.password.trim()) {
      return;
    }
    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id ? { ...editingEmployee, ...form } : emp
        )
      );
    } else {
      setEmployees((prev) => [
        ...prev,
        {
          ...form,
          id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        },
      ]);
    }
    setModalVisible(false);
    resetForm();
  }

  function handleEdit(emp: Employee) {
    setEditingEmployee(emp);
    setForm({ ...emp });
    setModalVisible(true);
  }

  function handleDelete(emp: Employee) {
    setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
  }

  function handleAssignStore(emp: Employee, store: string) {
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, assignedStore: store } : e))
    );
    setMenuVisible(null);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, isWeb && styles.headerWeb]}>
        <Text variant="headlineMedium">Employee Management</Text>
        <Button
          mode="contained"
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          Add Employee
        </Button>
      </View>

      <ScrollView style={styles.scrollView}>
        {employees.map((emp) => (
          <Surface key={emp.id} style={styles.employeeCard} elevation={2}>
            <View style={styles.row}>
              <Image
                source={
                  emp.avatar
                    ? { uri: emp.avatar }
                    : require("../assets/images/avatar-placeholder.png")
                }
                style={styles.avatar}
              />
              <View style={styles.infoCol}>
                <Text style={styles.name}>{emp.name}</Text>
                <Text style={styles.role}>{emp.email}</Text>
                <Text style={styles.meta}>
                  ID: {emp.employeeId} | Branch: {emp.branch}
                </Text>
                {emp.joined && (
                  <Text style={styles.meta}>
                    Joined: {emp.joined} | Sales Rank: #{emp.salesRank} of{" "}
                    {emp.totalSalesPeople}
                  </Text>
                )}
                <Text style={styles.meta}>
                  Sales Period: {emp.salesPeriod} | Commission:{" "}
                  {emp.commissionRate}%
                </Text>
                <Text style={styles.meta}>
                  Assigned Store: {emp.assignedStore || "-"}
                </Text>
              </View>
              <Menu
                visible={menuVisible === emp.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => setMenuVisible(emp.id)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => handleEdit(emp)}
                  title="Edit"
                  leadingIcon="pencil"
                />
                <Menu.Item
                  onPress={() => handleDelete(emp)}
                  title="Delete"
                  leadingIcon="delete"
                  titleStyle={{ color: theme.colors.error }}
                />
                <Divider />
                <Menu.Item
                  title="Assign to Store"
                  leadingIcon="store"
                  onPress={() => {}}
                  disabled
                />
                {["Main Store", "Branch A", "Branch B"].map((store) => (
                  <Menu.Item
                    key={store}
                    title={store}
                    onPress={() => handleAssignStore(emp, store)}
                  />
                ))}
              </Menu>
            </View>
          </Surface>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            resetForm();
          }}
          contentContainerStyle={[
            styles.modalContent,
            { width: modalWidth },
          ]}
        >
          <ScrollView style={styles.modalScrollView}>
            <Text style={styles.modalTitle}>
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </Text>
            <TextInput
              label="Name"
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Email"
              value={form.email}
              onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />
            <TextInput
              label="Employee ID"
              value={form.employeeId}
              onChangeText={(v) => setForm((f) => ({ ...f, employeeId: v }))}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Password"
              value={form.password}
              onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            <Menu
              visible={branchMenuVisible}
              onDismiss={() => setBranchMenuVisible(false)}
              anchor={
                <TextInput
                  label="Branch"
                  value={form.branch}
                  onPressIn={() => setBranchMenuVisible(true)}
                  style={styles.input}
                  mode="outlined"
                  right={<TextInput.Icon icon="chevron-down" />}
                  editable={false}
                />
              }
            >
              {["Main Store", "Branch A", "Branch B"].map((store) => (
                <Menu.Item
                  key={store}
                  title={store}
                  onPress={() => {
                    setForm((f) => ({ ...f, branch: store }));
                    setBranchMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
            <TextInput
              label="Joined Date (Optional)"
              value={form.joined}
              onChangeText={(v) => setForm((f) => ({ ...f, joined: v }))}
              style={styles.input}
              mode="outlined"
              placeholder="e.g. Jan 2023"
            />
            <TextInput
              label="Commission Rate"
              value={form.commissionRate}
              onChangeText={(v) => {
                // Only allow numbers
                const numericValue = v.replace(/[^0-9]/g, "");
                setForm((f) => ({ ...f, commissionRate: numericValue }));
              }}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              right={<TextInput.Affix text="%" />}
            />
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddOrUpdate}
                style={styles.modalButton}
              >
                {editingEmployee ? "Update" : "Add"}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerWeb: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  scrollView: {
    flex: 1,
  },
  employeeCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  role: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: "80%",
    alignSelf: "center",
  },
  modalScrollView: {
    maxHeight: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default EmployeeManagement;
