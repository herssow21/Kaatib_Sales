import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
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
  Snackbar,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
}

const initialEmployee: Omit<Employee, "id"> = {
  name: "",
  email: "",
  employeeId: "",
  branch: "",
  joined: "",
  commissionRate: "0",
  phone: "",
  avatar: undefined,
  assignedStore: "",
  password: "",
  salesRank: 0,
  totalSalesPeople: 0,
  salesPeriod: "",
};

interface FormErrors {
  name?: string;
  email?: string;
  employeeId?: string;
  password?: string;
  branch?: string;
  commissionRate?: string;
  phone?: string;
}

function validatePhoneNumber(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 0) return "Phone number is required";
  if (digits.startsWith("0")) {
    if (digits.length !== 10)
      return "Phone number must be 10 digits when starting with 0";
  } else {
    if (digits.length !== 9)
      return "Phone number must be 9 digits when not starting with 0";
  }
  return undefined;
}

const reddish = "#D32F2F";

export function EmployeeManagement() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<Omit<Employee, "id">>(initialEmployee);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [branchMenuVisible, setBranchMenuVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<
    "success" | "error" | "warning"
  >("success");

  const isMobile = width < 500;
  const isWeb = width >= 768;
  const modalWidth = isWeb ? Math.min(600, width * 0.8) : "90%";

  function resetForm() {
    setForm(initialEmployee);
    setEditingEmployee(null);
    setShowPassword(false);
    setErrors({});
  }

  function handleAddOrUpdate() {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    } else if (!/^[A-Za-z0-9-]{3,}$/.test(form.employeeId)) {
      newErrors.employeeId =
        "Employee ID must be at least 3 characters and can only contain letters, numbers, and hyphens";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[A-Z])/.test(form.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[a-z])/.test(form.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/(?=.*\d)/.test(form.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!form.branch.trim()) {
      newErrors.branch = "Branch is required";
    }

    if (!form.commissionRate.trim()) {
      newErrors.commissionRate = "Commission rate is required";
    } else {
      const rate = Number(form.commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.commissionRate = "Commission rate must be between 0 and 100";
      }
    }

    if (!form.phone || !form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneError = validatePhoneNumber(form.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbarMessage("Please fix the errors in the form");
      setSnackbarType("error");
      setSnackbarVisible(true);
      return;
    }

    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id ? { ...editingEmployee, ...form } : emp
        )
      );
      setSnackbarMessage("Employee updated successfully");
      setSnackbarType("success");
    } else {
      setEmployees((prev) => [
        ...prev,
        {
          ...form,
          id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        },
      ]);
      setSnackbarMessage("Employee added successfully");
      setSnackbarType("success");
    }
    setSnackbarVisible(true);
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
    setSnackbarMessage("Employee deleted successfully");
    setSnackbarType("warning");
    setSnackbarVisible(true);
  }

  function handleAssignStore(emp: Employee, store: string) {
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, assignedStore: store } : e))
    );
    setMenuVisible(null);
  }

  return (
    <View
      style={[
        styles.container,
        isMobile && styles.containerMobile,
        { backgroundColor: theme.dark ? theme.colors.background : "#f5f5f5" },
      ]}
    >
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        {isMobile ? (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => router.back()}
                style={[styles.backButton, styles.backButtonMobile]}
                iconColor="#fff"
              />
              <Text style={[styles.headerText, styles.headerTextMobile]}>
                Employee Management
              </Text>
            </View>
            <Text style={[styles.subHeaderText, { marginBottom: 8 }]}>
              Manage your employee information and track their assignments
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
              style={[styles.addButton, styles.addButtonMobile]}
              contentStyle={[
                styles.addButtonContent,
                styles.addButtonContentMobile,
              ]}
              icon="account-plus"
              labelStyle={{ fontSize: 16, color: "#fff", fontWeight: "600" }}
            >
              Add New Employee
            </Button>
          </>
        ) : (
          <>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => router.back()}
              style={[styles.backButton]}
              iconColor="#fff"
            />
            <View style={[styles.headerContent, styles.headerContentRow]}>
              <Text style={styles.headerText}>Employee Management</Text>
              <Text style={[styles.subHeaderText, styles.subHeaderTextRight]}>
                Manage your employee information and track their assignments
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
              style={[styles.addButton]}
              contentStyle={[styles.addButtonContent]}
              icon="account-plus"
              labelStyle={{ fontSize: 16, color: "#fff", fontWeight: "600" }}
            >
              Add New Employee
            </Button>
          </>
        )}
      </View>

      <ScrollView
        style={[styles.scrollView, isMobile && styles.scrollViewMobile]}
      >
        {employees.map((emp) => (
          <Surface
            key={emp.id}
            style={[
              styles.employeeCard,
              isMobile && styles.employeeCardMobile,
              { backgroundColor: theme.dark ? theme.colors.surface : "#fff" },
            ]}
            elevation={2}
          >
            <View style={styles.row}>
              <Image
                source={
                  emp.avatar
                    ? { uri: emp.avatar }
                    : require("../assets/images/avatar-placeholder.png")
                }
                style={[styles.avatar, isMobile && styles.avatarMobile]}
              />
              <View style={styles.infoCol}>
                <Text
                  style={[
                    styles.name,
                    isMobile && styles.nameMobile,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {emp.name}
                </Text>
                <Text
                  style={[
                    styles.role,
                    isMobile && styles.roleMobile,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {emp.email}
                </Text>
                <Text
                  style={[
                    styles.meta,
                    isMobile && styles.metaMobile,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  ID: {emp.employeeId} | Branch: {emp.branch}
                </Text>
                {emp.joined && (
                  <Text
                    style={[
                      styles.meta,
                      isMobile && styles.metaMobile,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Joined: {emp.joined} | Sales Rank: #{emp.salesRank} of{" "}
                    {emp.totalSalesPeople}
                  </Text>
                )}
                <Text
                  style={[
                    styles.meta,
                    isMobile && styles.metaMobile,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Sales Period: {emp.salesPeriod} | Commission:{" "}
                  {emp.commissionRate}%
                </Text>
                <Text
                  style={[
                    styles.meta,
                    isMobile && styles.metaMobile,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
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
            {
              width: modalWidth,
              marginTop: 40,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
              borderWidth: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            },
          ]}
        >
          <ScrollView style={styles.modalScrollView}>
            <Text
              style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            >
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </Text>
            <TextInput
              label="Name *"
              value={form.name}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, name: v }));
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                },
              ]}
              mode="outlined"
              error={!!errors.name}
              left={<TextInput.Icon icon="account" />}
              placeholder="Enter employee's full name"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            <TextInput
              label="Phone *"
              value={form.phone}
              onChangeText={(v) => {
                let digits = v.replace(/\D/g, "");
                if (digits.startsWith("0")) {
                  digits = digits.slice(0, 10);
                } else {
                  digits = digits.slice(0, 9);
                }
                setForm((f) => ({ ...f, phone: digits }));
                if (errors.phone)
                  setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                },
              ]}
              mode="outlined"
              keyboardType="phone-pad"
              error={!!errors.phone}
              left={<TextInput.Icon icon="phone" />}
              placeholder="e.g. 0123456789 or 123456789"
              maxLength={10}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
            <TextInput
              label="Email *"
              value={form.email}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, email: v }));
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                },
              ]}
              mode="outlined"
              keyboardType="email-address"
              error={!!errors.email}
              left={<TextInput.Icon icon="email" />}
              placeholder="e.g. employee@company.com"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            <TextInput
              label="Employee ID *"
              value={form.employeeId}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, employeeId: v }));
                if (errors.employeeId)
                  setErrors((prev) => ({ ...prev, employeeId: undefined }));
              }}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                },
              ]}
              mode="outlined"
              error={!!errors.employeeId}
              left={<TextInput.Icon icon="badge-account" />}
              placeholder="e.g. EMP-001"
            />
            {errors.employeeId && (
              <Text style={styles.errorText}>{errors.employeeId}</Text>
            )}
            <TextInput
              label="Password *"
              value={form.password}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, password: v }));
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                },
              ]}
              mode="outlined"
              secureTextEntry={!showPassword}
              error={!!errors.password}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              placeholder="Enter a strong password"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            <Menu
              visible={branchMenuVisible}
              onDismiss={() => setBranchMenuVisible(false)}
              anchor={
                <TextInput
                  label="Branch *"
                  value={form.branch}
                  onPressIn={() => setBranchMenuVisible(true)}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.onSurface,
                    },
                  ]}
                  mode="outlined"
                  error={!!errors.branch}
                  left={<TextInput.Icon icon="store" />}
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
                    if (errors.branch)
                      setErrors((prev) => ({ ...prev, branch: undefined }));
                  }}
                />
              ))}
            </Menu>
            {errors.branch && (
              <Text style={styles.errorText}>{errors.branch}</Text>
            )}
            <TextInput
              label="Joined Date (Optional)"
              value={form.joined}
              onChangeText={(v) => setForm((f) => ({ ...f, joined: v }))}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                },
              ]}
              mode="outlined"
              placeholder="e.g. Jan 2023"
              left={<TextInput.Icon icon="calendar" />}
            />
            <TextInput
              label="Commission Rate *"
              value={form.commissionRate}
              onChangeText={(v) => {
                const numericValue = v.replace(/[^0-9]/g, "").slice(0, 3);
                setForm((f) => ({ ...f, commissionRate: numericValue }));
                if (errors.commissionRate)
                  setErrors((prev) => ({ ...prev, commissionRate: undefined }));
              }}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                },
              ]}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.commissionRate}
              left={
                <TextInput.Icon
                  icon="percent"
                  size={18}
                  style={{
                    marginLeft: 2,
                    marginRight: -8,
                    alignSelf: "center",
                  }}
                />
              }
              right={
                <TextInput.Affix
                  text="%"
                  textStyle={{ fontSize: 16, color: "#888" }}
                />
              }
              placeholder="e.g. 10"
              maxLength={3}
            />
            {errors.commissionRate && (
              <Text style={styles.errorText}>{errors.commissionRate}</Text>
            )}
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
                {editingEmployee ? "Save Changes" : "Add Employee"}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
        }}
        style={[
          styles.snackbar,
          {
            backgroundColor:
              snackbarType === "error"
                ? "#FF0000"
                : snackbarType === "warning"
                ? "#FFA000"
                : "#4CAF50",
          },
        ]}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerMobile: {
    padding: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 24,
  },
  headerMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 24,
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
  },
  headerContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  subHeaderText: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
    marginBottom: 16,
  },
  subHeaderTextRight: {
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewMobile: {
    paddingHorizontal: 0,
  },
  employeeCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  employeeCardMobile: {
    padding: 10,
    marginBottom: 10,
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
  avatarMobile: {
    width: 48,
    height: 48,
    marginRight: 8,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nameMobile: {
    fontSize: 16,
  },
  role: {
    fontSize: 14,
    marginBottom: 4,
  },
  roleMobile: {
    fontSize: 12,
  },
  meta: {
    fontSize: 12,
    marginBottom: 2,
  },
  metaMobile: {
    fontSize: 10,
  },
  modalContent: {
    padding: 24,
    margin: 20,
    borderRadius: 12,
    maxHeight: "80%",
    width: "90%",
    maxWidth: 500,
    alignSelf: "center",
    elevation: 4,
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
  backButton: {
    marginRight: 8,
    backgroundColor: reddish,
    borderRadius: 24,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  backButtonMobile: {
    marginRight: 0,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 8,
    marginBottom: 8,
  },
  headerTextMobile: {
    fontSize: 18,
    marginLeft: 8,
    marginBottom: 0,
    alignSelf: "center",
    fontWeight: "bold",
  },
  addButton: {
    borderRadius: 8,
    elevation: 2,
    backgroundColor: reddish,
  },
  addButtonMobile: {
    width: "100%",
    marginTop: 8,
    alignSelf: "stretch",
    backgroundColor: reddish,
    marginBottom: 8,
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 48,
  },
  addButtonContentMobile: {
    justifyContent: "center",
    paddingHorizontal: 0,
    height: 40,
  },
  errorText: {
    color: "#FF0000",
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
    fontSize: 12,
  },
  snackbar: {
    margin: 16,
    borderRadius: 8,
  },
});

export default EmployeeManagement;
