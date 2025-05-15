import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Searchbar,
  IconButton,
  Portal,
  Modal,
  useTheme,
} from "react-native-paper";
import { useThemeContext } from "../contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export default function ExpensesScreen() {
  const { theme, isDarkMode } = useThemeContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: "",
    amount: 0,
    category: "",
  });

  // ... existing functions ...

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: theme.colors.headerBackground,
      elevation: 2,
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
    headerContent: {
      flex: 1,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.headerText,
    },
    subHeaderText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    addButtonContainer: {
      padding: 16,
      paddingTop: 8,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    addButton: {
      borderRadius: 8,
      elevation: 2,
      backgroundColor: theme.colors.buttonBackground,
    },
    addButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      height: 48,
    },
    addButtonText: {
      marginLeft: 12,
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.buttonText,
    },
    searchContainer: {
      padding: 16,
      paddingTop: 0,
    },
    searchInput: {
      backgroundColor: theme.colors.searchBackground,
      color: theme.colors.searchText,
    },
    expenseList: {
      padding: 16,
    },
    expenseCard: {
      marginBottom: 16,
      backgroundColor: theme.colors.listBackground,
      borderRadius: 8,
      elevation: 2,
      borderColor: theme.colors.listBorder,
      borderWidth: 1,
    },
    expenseContent: {
      padding: 16,
    },
    expenseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    expenseTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.listText,
    },
    expenseAmount: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.error,
    },
    expenseDetails: {
      marginBottom: 12,
    },
    expenseDetail: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.colors.listTextSecondary,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.listText,
    },
    expenseActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      paddingTop: 12,
    },
    actionButton: {
      marginLeft: 8,
    },
    modalContent: {
      backgroundColor: theme.colors.modalBackground,
      padding: 24,
      margin: 20,
      borderRadius: 12,
      maxHeight: "80%",
      width: "90%",
      maxWidth: 500,
      alignSelf: "center",
      elevation: 4,
      borderColor: theme.colors.modalBorder,
      borderWidth: 1,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: theme.colors.modalText,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.modalText,
    },
    errorText: {
      color: theme.colors.error,
      marginTop: -12,
      marginBottom: 12,
      marginLeft: 4,
      fontSize: 12,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
    },
    modalButton: {
      marginLeft: 8,
    },
    snackbar: {
      margin: 16,
      borderRadius: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={{ color: theme.colors.onBackground }}
        >
          Expenses Management
        </Text>
        <Button
          mode="contained"
          onPress={() => setIsAddModalVisible(true)}
          style={styles.addButton}
        >
          Add Expense
        </Button>
      </View>

      <Searchbar
        placeholder="Search expenses..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[
          styles.searchBar,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
        iconColor={theme.colors.onSurfaceVariant}
        inputStyle={{ color: theme.colors.onSurfaceVariant }}
        placeholderTextColor={theme.colors.placeholder}
      />

      <ScrollView style={styles.expenseList}>
        {filteredExpenses.map((expense) => (
          <Card
            key={expense.id}
            style={[styles.expenseCard, { backgroundColor: theme.colors.card }]}
          >
            <Card.Content>
              <View style={styles.expenseHeader}>
                <View>
                  <Text
                    variant="titleMedium"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {expense.description}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {expense.category}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEdit(expense)}
                    iconColor={theme.colors.primary}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(expense.id)}
                    iconColor={theme.colors.error}
                  />
                </View>
              </View>
              <View style={styles.expenseDetails}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {expense.date}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.error }}
                >
                  ${expense.amount.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Add Expense Modal */}
      <Portal>
        <Modal
          visible={isAddModalVisible}
          onDismiss={() => setIsAddModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.modalBackground },
          ]}
        >
          <Text
            variant="headlineSmall"
            style={[styles.modalTitle, { color: theme.colors.onSurface }]}
          >
            Add New Expense
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.onSurface,
              },
            ]}
            placeholder="Description"
            placeholderTextColor={theme.colors.placeholder}
            value={newExpense.description}
            onChangeText={(text) =>
              setNewExpense({ ...newExpense, description: text })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.onSurface,
              },
            ]}
            placeholder="Category"
            placeholderTextColor={theme.colors.placeholder}
            value={newExpense.category}
            onChangeText={(text) =>
              setNewExpense({ ...newExpense, category: text })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.onSurface,
              },
            ]}
            placeholder="Amount"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="numeric"
            value={newExpense.amount?.toString()}
            onChangeText={(text) =>
              setNewExpense({
                ...newExpense,
                amount: parseFloat(text) || 0,
              })
            }
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setIsAddModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddExpense}
              style={styles.modalButton}
            >
              Add
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Edit Expense Modal */}
      <Portal>
        <Modal
          visible={isEditModalVisible}
          onDismiss={() => setIsEditModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.modalBackground },
          ]}
        >
          <Text
            variant="headlineSmall"
            style={[styles.modalTitle, { color: theme.colors.onSurface }]}
          >
            Edit Expense
          </Text>
          {selectedExpense && (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.onSurface,
                  },
                ]}
                placeholder="Description"
                placeholderTextColor={theme.colors.placeholder}
                value={selectedExpense.description}
                onChangeText={(text) =>
                  setSelectedExpense({ ...selectedExpense, description: text })
                }
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.onSurface,
                  },
                ]}
                placeholder="Category"
                placeholderTextColor={theme.colors.placeholder}
                value={selectedExpense.category}
                onChangeText={(text) =>
                  setSelectedExpense({ ...selectedExpense, category: text })
                }
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.onSurface,
                  },
                ]}
                placeholder="Amount"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="numeric"
                value={selectedExpense.amount.toString()}
                onChangeText={(text) =>
                  setSelectedExpense({
                    ...selectedExpense,
                    amount: parseFloat(text) || 0,
                  })
                }
              />
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleUpdateExpense}
                  style={styles.modalButton}
                >
                  Update
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}
