import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ViewStyle,
  TextStyle,
  Alert,
} from "react-native";
import {
  Text,
  TextInput,
  useTheme,
  Surface,
  Button,
  Portal,
  Dialog,
  List,
  IconButton,
  Divider,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { formatMoney } from "../../utils/formatters";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { useThemeContext } from "../../contexts/ThemeContext";

interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface ExpenseFormData {
  title: string;
  amount: string;
  category: string;
  description: string;
}

const INITIAL_CATEGORIES = [
  "Rent",
  "Food",
  "Transport",
  "Shopping",
  "Utilities",
  "Entertainment",
  "Others",
];

export default function Expenses() {
  const { theme, isDarkMode } = useThemeContext
    ? useThemeContext()
    : { theme: useTheme(), isDarkMode: false };
  const colors = theme.colors as any;
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: "",
    amount: "",
    category: "",
    description: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [expensesList, setExpensesList] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<
    "today" | "week" | "month" | "all"
  >("today");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const getFilteredExpenses = () => {
    const now = new Date();

    switch (dateFilter) {
      case "today":
        const todayStr = now.toLocaleDateString();
        return expensesList.filter((expense) => {
          return expense.date === todayStr;
        });

      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);

        return expensesList.filter((expense) => {
          // Parse the date string to a Date object
          const parts = expense.date.split("/");
          // Handle different date formats (MM/DD/YYYY or DD/MM/YYYY)
          const month = parseInt(parts[0]) - 1; // Month is 0-indexed
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          const expenseDate = new Date(year, month, day);

          return expenseDate >= weekStart;
        });

      case "month":
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return expensesList.filter((expense) => {
          // Parse the date string to extract month and year
          const parts = expense.date.split("/");
          // Handle different date formats (MM/DD/YYYY or DD/MM/YYYY)
          const month = parseInt(parts[0]) - 1; // Month is 0-indexed
          const year = parseInt(parts[2]);

          return month === currentMonth && year === currentYear;
        });

      case "all":
      default:
        return expensesList;
    }
  };

  const filteredByDateExpenses = getFilteredExpenses();

  const getFilterTitle = () => {
    switch (dateFilter) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "all":
        return "All Time";
      default:
        return "This Month";
    }
  };

  const totalExpenses = filteredByDateExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const highestExpense =
    filteredByDateExpenses.length > 0
      ? filteredByDateExpenses.reduce(
          (max, expense) => (expense.amount > max.amount ? expense : max),
          filteredByDateExpenses[0]
        )
      : { amount: 0, title: "No expenses" };

  const filteredExpenses = filteredByDateExpenses.filter(
    (expense) =>
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExpense = () => {
    setFormData({ title: "", amount: "", category: "", description: "" });
    setErrors({});
    setShowAddExpense(true);
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));
    setErrors((prev) => ({ ...prev, title: undefined }));
  };

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    let numericValue = value.replace(/[^0-9.]/g, "");

    // Handle leading zeros
    if (
      numericValue.length > 1 &&
      numericValue.startsWith("0") &&
      !numericValue.startsWith("0.")
    ) {
      numericValue = numericValue.replace(/^0+/, "");
    }

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      numericValue = parts[0] + "." + parts[1].slice(0, 2);
    }

    setFormData((prev) => ({ ...prev, amount: numericValue }));
    setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Please enter a valid amount";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const now = new Date();
      const newExpense: Expense = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: now.toLocaleDateString(),
        category: formData.category,
      };

      setExpensesList((prev) => [newExpense, ...prev]);
      setShowAddExpense(false);
      setFormData({ title: "", amount: "", category: "", description: "" });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Rent: "#FF6B6B",
      Food: "#4ECDC4",
      Transport: "#45B7D1",
      Shopping: "#96CEB4",
      Utilities: "#FFEEAD",
      Entertainment: "#D4A5A5",
      Others: "#9FA8DA",
    };
    return colors[category] || colors.Others;
  };

  const handleDeleteCategory = (category: string) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Are you sure you want to delete the "${category}" category?`
        )
      ) {
        deleteCategory(category);
      }
    } else {
      Alert.alert(
        "Delete Category",
        `Are you sure you want to delete the "${category}" category?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteCategory(category),
          },
        ]
      );
    }
  };

  const deleteCategory = (category: string) => {
    if (formData.category === category) {
      setFormData((prev) => ({ ...prev, category: "" }));
    }
    setCategories((prev) => prev.filter((c) => c !== category));
  };

  const handleDeleteExpense = (id: string) => {
    if (Platform.OS === "web") {
      setShowDeleteConfirm(true);
      setExpenseToDelete(id);
    } else {
      Alert.alert(
        "Delete Expense",
        "Are you sure you want to delete this expense?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setExpensesList((prev) =>
                prev.filter((expense) => expense.id !== id)
              );
            },
          },
        ]
      );
    }
  };

  const renderExpenseCard = (expense: Expense) => {
    const isExpanded = expandedExpenseId === expense.id;

    return (
      <View style={styles.expenseCardContainer}>
        <Surface
          style={[styles.expenseCard, isExpanded && styles.expandedCard]}
        >
          <TouchableOpacity
            style={styles.expenseContent}
            onPress={() => {
              if (isExpanded) {
                setExpandedExpenseId(null);
              } else {
                setExpandedExpenseId(expense.id);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.expenseHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.expenseTitle}>{expense.title}</Text>
                <View
                  style={[
                    styles.categoryContainer,
                    {
                      backgroundColor: `${getCategoryColor(
                        expense.category
                      )}20`,
                      marginLeft: 8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: getCategoryColor(expense.category) },
                    ]}
                  >
                    {expense.category}
                  </Text>
                </View>
              </View>
              <Text style={styles.expenseAmount}>
                {formatMoney(expense.amount)}
              </Text>
            </View>
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseDate}>{expense.date}</Text>
              {expense.description && (
                <Text style={styles.expenseDescription} numberOfLines={1}>
                  {expense.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Surface>
        {isExpanded && (
          <TouchableOpacity
            style={styles.deleteAction}
            onPress={() => {
              setExpandedExpenseId(null);
              handleDeleteExpense(expense.id);
            }}
          >
            <MaterialIcons name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFilterOptions = () => {
    if (Platform.OS === "web") {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <Button
            mode={dateFilter === "today" ? "contained" : "outlined"}
            onPress={() => setDateFilter("today")}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
            compact
          >
            Today
          </Button>
          <Button
            mode={dateFilter === "week" ? "contained" : "outlined"}
            onPress={() => setDateFilter("week")}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
            compact
          >
            This Week
          </Button>
          <Button
            mode={dateFilter === "month" ? "contained" : "outlined"}
            onPress={() => setDateFilter("month")}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
            compact
          >
            This Month
          </Button>
          <Button
            mode={dateFilter === "all" ? "contained" : "outlined"}
            onPress={() => setDateFilter("all")}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
            compact
          >
            All Time
          </Button>
        </ScrollView>
      );
    }

    return (
      <Button
        mode="outlined"
        onPress={() => setShowFilterMenu(true)}
        style={styles.mobileFilterButton}
        icon="calendar"
      >
        {getFilterTitle()}
      </Button>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : "#fff",
      padding: 16,
    },
    pageTitle: {
      fontSize: 32,
      fontWeight: "bold",
      color: isDarkMode ? "#fff" : "#222",
      marginBottom: 24,
    },
    summaryContainer: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 24,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      marginRight: 8,
      elevation: 2,
      borderLeftWidth: 6,
      borderLeftColor: colors.primary,
      borderColor: isDarkMode ? colors.divider : "#e0e0e0",
      borderWidth: 1,
    },
    summaryLabel: {
      fontSize: 16,
      color: "#7f8c8d",
      fontWeight: "500",
    },
    summaryAmount: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginTop: 8,
      marginBottom: 4,
    },
    amountText: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#2c3e50",
    },
    currencySymbol: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#2c3e50",
      marginRight: 2,
    },
    summaryPeriod: {
      fontSize: 14,
      color: "#7f8c8d",
    },
    expensesSection: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : "#fff",
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      borderColor: isDarkMode ? colors.divider : "#e0e0e0",
      borderWidth: 1,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDarkMode ? "#fff" : "#222",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    filterButton: {
      backgroundColor: isDarkMode ? colors.background : "#fff",
      borderColor: isDarkMode ? "#fff" : "#e0e0e0",
      borderWidth: 1,
      marginRight: 8,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    filterButtonLabel: {
      color: isDarkMode ? "#fff" : "#222",
      fontWeight: "bold",
    },
    searchInput: {
      marginBottom: 12,
      backgroundColor: colors.surfaceVariant,
      color: colors.onSurface,
    },
    expensesListWrapper: {
      flex: 1,
      marginTop: 8,
    },
    expensesList: {
      flex: 1,
    },
    expensesListContent: {
      paddingBottom: 32,
    },
    expenseCardContainer: {
      marginBottom: 16,
    },
    expenseCard: {
      backgroundColor: isDarkMode ? colors.card : "#fff",
      borderRadius: 10,
      padding: 16,
      elevation: 2,
      borderColor: isDarkMode ? colors.divider : "#e0e0e0",
      borderWidth: 1,
    },
    expandedCard: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    expenseContent: {
      flexDirection: "column",
    },
    expenseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    expenseTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#fff" : "#222",
    },
    categoryContainer: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      backgroundColor: isDarkMode ? colors.surfaceVariant : "#f1f5f9",
    },
    categoryText: {
      fontSize: 14,
      fontWeight: "500",
      color: isDarkMode ? "#fff" : "#222",
    },
    expenseAmount: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.error,
    },
    expenseDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    expenseDate: {
      fontSize: 13,
      color: isDarkMode ? "#fff" : "#666",
    },
    expenseDescription: {
      fontSize: 13,
      color: isDarkMode ? "#fff" : "#666",
      marginLeft: 8,
      flex: 1,
    },
    deleteAction: {
      position: "absolute",
      right: 16,
      top: 16,
      backgroundColor: colors.error,
      borderRadius: 20,
      padding: 4,
      zIndex: 2,
    },
    emptyState: {
      alignItems: "center",
      marginTop: 32,
    },
    emptyStateText: {
      fontSize: 16,
      color: isDarkMode ? "#fff" : colors.onSurfaceVariant,
    },
    footer: {
      marginTop: 16,
      alignItems: "center",
    },
    footerText: {
      color: isDarkMode ? "#fff" : "#666",
    },
    seeMore: {
      color: colors.primary,
      textDecorationLine: "underline",
      marginLeft: 4,
    },
    dialog: {
      backgroundColor: isDarkMode ? colors.modalBackground : "#fff",
    },
    webDialog: {
      minWidth: 400,
      maxWidth: 500,
      alignSelf: "center",
    },
    dialogTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDarkMode ? "#fff" : "#222",
      marginBottom: 12,
    },
    dialogInput: {
      backgroundColor: colors.inputBackground,
      color: colors.modalText,
      marginBottom: 12,
    },
    dialogActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
    },
    dialogButton: {
      marginLeft: 8,
    },
    errorText: {
      color: colors.error,
      marginTop: -8,
      marginBottom: 8,
      marginLeft: 4,
      fontSize: 12,
    },
    filterContainer: {
      flexGrow: 0,
      marginRight: 8,
    } as ViewStyle,
    mobileFilterButton: {
      marginRight: 8,
      borderColor: "#DC2626",
    } as ViewStyle,
    filterDialog: {
      borderRadius: 12,
      backgroundColor: "#fff",
    } as ViewStyle,
    categoryButton: {
      backgroundColor: isDarkMode ? colors.inputBackground : "#fff",
      borderWidth: 1,
      borderColor: errors.category
        ? colors.error
        : isDarkMode
        ? "#fff"
        : "#666",
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      minHeight: 48,
      justifyContent: "center",
      alignItems: "flex-start",
      width: "100%",
    },
    categoryButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#fff" : "#1B1B1B",
    },
    formInput: {
      marginBottom: 16,
      backgroundColor: isDarkMode ? colors.inputBackground : "#fff",
      color: isDarkMode ? "#fff" : "#1B1B1B",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Expenses</Text>

      <View style={styles.summaryContainer}>
        <Surface
          style={[
            styles.summaryCard,
            { borderLeftColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <View style={styles.summaryAmount}>
            <Text style={styles.amountText}>
              <Text style={styles.currencySymbol}>$</Text>
              {totalExpenses.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <Text style={styles.summaryPeriod}>{getFilterTitle()}</Text>
        </Surface>

        <Surface
          style={[
            styles.summaryCard,
            { backgroundColor: "#DC2626", borderLeftColor: "#b91c1c" },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: "#fff" }]}>
            Highest Expense
          </Text>
          <View style={styles.summaryAmount}>
            <Text style={[styles.amountText, { color: "#fff" }]}>
              <Text style={[styles.currencySymbol, { color: "#fff" }]}>$</Text>
              {highestExpense.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <Text style={[styles.summaryPeriod, { color: "#fff" }]}>
            {highestExpense.title}
          </Text>
        </Surface>
      </View>

      <View style={styles.expensesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Expenses</Text>
          <View style={styles.headerActions}>
            {renderFilterOptions()}
            <IconButton
              icon="plus"
              mode="contained"
              containerColor="#DC2626"
              iconColor="#fff"
              size={20}
              onPress={() => setShowAddExpense(true)}
            />
          </View>
        </View>

        <TextInput
          placeholder="Search expenses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          left={<TextInput.Icon icon="magnify" />}
          style={styles.searchInput}
        />

        <View style={styles.expensesListWrapper}>
          <ScrollView
            style={styles.expensesList}
            contentContainerStyle={styles.expensesListContent}
            showsVerticalScrollIndicator={true}
          >
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <View key={expense.id}>{renderExpenseCard(expense)}</View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? "No matching expenses found"
                    : dateFilter === "today"
                    ? "No expenses for today"
                    : dateFilter === "week"
                    ? "No expenses for this week"
                    : dateFilter === "month"
                    ? "No expenses for this month"
                    : "No expenses to show"}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Showing {filteredExpenses.length} of {filteredByDateExpenses.length}{" "}
            expenses
            {filteredExpenses.length < filteredByDateExpenses.length && " | "}
            {filteredExpenses.length < filteredByDateExpenses.length && (
              <Text style={styles.seeMore} onPress={() => setSearchQuery("")}>
                See more
              </Text>
            )}
          </Text>
        </View>
      </View>

      <Portal>
        <Dialog
          visible={showAddExpense}
          onDismiss={() => setShowAddExpense(false)}
          style={[styles.dialog, Platform.OS === "web" && styles.webDialog]}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Add New Expense
          </Dialog.Title>
          <Divider style={styles.divider} />
          <Dialog.Content style={styles.dialogContent}>
            <View style={styles.formContainer}>
              <TextInput
                label="Expense Title"
                value={formData.title}
                onChangeText={handleTitleChange}
                mode="outlined"
                style={styles.formInput}
                inputStyle={{ color: styles.formInput.color }}
                error={!!errors.title}
                autoComplete="off"
                textContentType="none"
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}

              <TextInput
                label="Amount"
                value={formData.amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                mode="outlined"
                style={styles.formInput}
                inputStyle={{ color: styles.formInput.color }}
                error={!!errors.amount}
                autoComplete="off"
                textContentType="none"
                caretHidden={false}
              />
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}

              <TouchableOpacity
                onPress={() => setShowCategories(true)}
                style={styles.categoryButton}
              >
                <Text style={styles.categoryButtonText}>
                  {formData.category || "Select Category"}
                </Text>
              </TouchableOpacity>
              {errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}

              <TextInput
                label="Description (Optional)"
                value={formData.description}
                onChangeText={handleDescriptionChange}
                mode="outlined"
                style={styles.formInput}
                multiline
                numberOfLines={3}
                autoComplete="off"
                textContentType="none"
              />
            </View>
          </Dialog.Content>
          <Divider style={styles.divider} />
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddExpense(false)}
              style={styles.dialogButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[styles.dialogButton, { backgroundColor: "#DC2626" }]}
            >
              Add Expense
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showCategories}
          onDismiss={() => setShowCategories(false)}
          style={[Platform.OS === "web" && styles.categoryDialog]}
        >
          <Dialog.Title>Select Category</Dialog.Title>
          <Dialog.Content>
            {categories.map((category) => (
              <List.Item
                key={category}
                title={category}
                left={(props) => (
                  <View
                    {...props}
                    style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(category) },
                    ]}
                  />
                )}
                right={(props) =>
                  category !== "Others" && (
                    <IconButton
                      {...props}
                      icon="delete"
                      iconColor="#DC2626"
                      onPress={() => handleDeleteCategory(category)}
                    />
                  )
                }
                onPress={() => {
                  setFormData((prev) => ({ ...prev, category }));
                  setErrors((prev) => ({ ...prev, category: undefined }));
                  setShowCategories(false);
                }}
                style={styles.categoryItem}
              />
            ))}
          </Dialog.Content>
        </Dialog>

        <Dialog
          visible={showNewCategory}
          onDismiss={() => setShowNewCategory(false)}
          style={[Platform.OS === "web" && styles.categoryDialog]}
        >
          <Dialog.Title>Create New Category</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Category Name"
              value={newCategory}
              onChangeText={(text) => {
                setNewCategory(text);
                setCategoryError("");
              }}
              mode="outlined"
              style={styles.formInput}
              error={!!categoryError}
            />
            {categoryError && (
              <Text style={styles.errorText}>{categoryError}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowNewCategory(false)}>Cancel</Button>
            <Button
              onPress={() => {
                const trimmedCategory = newCategory.trim();
                if (!trimmedCategory) {
                  setCategoryError("Category name is required");
                  return;
                }
                if (categories.includes(trimmedCategory)) {
                  setCategoryError("Category already exists");
                  return;
                }
                setCategories((prev) => [...prev, trimmedCategory]);
                setFormData((prev) => ({ ...prev, category: trimmedCategory }));
                setNewCategory("");
                setShowNewCategory(false);
                setShowCategories(false);
              }}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showDeleteConfirm}
          onDismiss={() => {
            setShowDeleteConfirm(false);
            setExpenseToDelete(null);
          }}
          style={[styles.dialog, Platform.OS === "web" && styles.webDialog]}
        >
          <Dialog.Title style={styles.dialogTitle}>Delete Expense</Dialog.Title>
          <Divider style={styles.divider} />
          <Dialog.Content style={styles.dialogContent}>
            <Text style={styles.confirmationText}>
              Are you sure you want to delete this expense?
            </Text>
          </Dialog.Content>
          <Divider style={styles.divider} />
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowDeleteConfirm(false);
                setExpenseToDelete(null);
              }}
              style={styles.dialogButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                if (expenseToDelete) {
                  setExpensesList((prev) =>
                    prev.filter((expense) => expense.id !== expenseToDelete)
                  );
                  setShowDeleteConfirm(false);
                  setExpenseToDelete(null);
                }
              }}
              style={[styles.dialogButton, { backgroundColor: "#DC2626" }]}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showFilterMenu}
          onDismiss={() => setShowFilterMenu(false)}
          style={styles.filterDialog}
        >
          <Dialog.Title>Select Time Period</Dialog.Title>
          <Dialog.Content>
            <List.Item
              title="Today"
              onPress={() => {
                setDateFilter("today");
                setShowFilterMenu(false);
              }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    dateFilter === "today"
                      ? "radiobox-marked"
                      : "radiobox-blank"
                  }
                />
              )}
            />
            <List.Item
              title="This Week"
              onPress={() => {
                setDateFilter("week");
                setShowFilterMenu(false);
              }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    dateFilter === "week" ? "radiobox-marked" : "radiobox-blank"
                  }
                />
              )}
            />
            <List.Item
              title="This Month"
              onPress={() => {
                setDateFilter("month");
                setShowFilterMenu(false);
              }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    dateFilter === "month"
                      ? "radiobox-marked"
                      : "radiobox-blank"
                  }
                />
              )}
            />
            <List.Item
              title="All Time"
              onPress={() => {
                setDateFilter("all");
                setShowFilterMenu(false);
              }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    dateFilter === "all" ? "radiobox-marked" : "radiobox-blank"
                  }
                />
              )}
            />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}
