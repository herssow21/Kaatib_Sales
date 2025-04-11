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
  const theme = useTheme();
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

  const componentStyles = StyleSheet.create({
    ...styles,
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
  });

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

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Expenses</Text>

      <View style={styles.summaryContainer}>
        <Surface
          style={[
            componentStyles.summaryCard as ViewStyle,
            { borderLeftColor: theme.colors.primary },
          ]}
        >
          <Text style={componentStyles.summaryLabel}>Total Expenses</Text>
          <View style={componentStyles.summaryAmount as ViewStyle}>
            <Text style={componentStyles.amountText}>
              <Text style={componentStyles.currencySymbol}>$</Text>
              {totalExpenses.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <Text style={componentStyles.summaryPeriod}>{getFilterTitle()}</Text>
        </Surface>

        <Surface
          style={[
            componentStyles.summaryCard as ViewStyle,
            { backgroundColor: "#DC2626", borderLeftColor: "#b91c1c" },
          ]}
        >
          <Text
            style={[
              componentStyles.summaryLabel as TextStyle,
              { color: "#fff" },
            ]}
          >
            Highest Expense
          </Text>
          <View style={componentStyles.summaryAmount as ViewStyle}>
            <Text
              style={[
                componentStyles.amountText as TextStyle,
                { color: "#fff" },
              ]}
            >
              <Text
                style={[
                  componentStyles.currencySymbol as TextStyle,
                  { color: "#fff" },
                ]}
              >
                $
              </Text>
              {highestExpense.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <Text
            style={[
              componentStyles.summaryPeriod as TextStyle,
              { color: "#fff" },
            ]}
          >
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
                style={[styles.formInput, { backgroundColor: "#fff" }]}
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
                style={[styles.formInput, { backgroundColor: "#fff" }]}
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
                style={[
                  styles.categoryButton,
                  errors.category && styles.categoryButtonError,
                ]}
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
          style={[Platform.OS === "web" && componentStyles.categoryDialog]}
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
                      componentStyles.categoryDot,
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
                style={componentStyles.categoryItem}
              />
            ))}
          </Dialog.Content>
        </Dialog>

        <Dialog
          visible={showNewCategory}
          onDismiss={() => setShowNewCategory(false)}
          style={[Platform.OS === "web" && componentStyles.categoryDialog]}
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
              style={componentStyles.formInput}
              error={!!categoryError}
            />
            {categoryError && (
              <Text style={componentStyles.errorText}>{categoryError}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  pageTitle: {
    fontSize: Platform.OS === "web" ? 24 : 32,
    fontWeight: "bold",
    color: "#1B1B1B",
    marginBottom: Platform.OS === "web" ? 12 : 24,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Platform.OS === "web" ? 12 : 24,
    gap: 12,
    ...(Platform.OS === "web" && {
      maxHeight: 80,
    }),
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
    borderLeftWidth: 4,
    borderLeftColor: "#666",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  summaryAmount: {
    flexDirection: "row",
    justifyContent: Platform.OS === "web" ? "flex-end" : "flex-start",
    alignItems: "center",
    marginBottom: 4,
  },
  amountText: {
    fontSize: Platform.OS === "web" ? 24 : 20,
    fontWeight: "bold",
    color: "#1B1B1B",
  },
  summaryPeriod: {
    fontSize: 12,
    color: "#666",
  },
  expensesSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: Platform.OS === "web" ? 8 : 16,
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
    color: "#1B1B1B",
  },
  searchInput: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  expensesListWrapper: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === "web" && {
      height: 400, // Fixed height for web to ensure scrolling works properly
    }),
  },
  expensesList: {
    flex: 1,
    width: "100%",
  },
  expensesListContent: {
    paddingBottom: 16,
  },
  expenseCardContainer: {
    position: "relative",
    marginBottom: 6,
    flexDirection: "row",
  },
  expenseCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseContent: {
    padding: 10,
    paddingBottom: 14,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1B1B",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B1B1B",
  },
  expenseDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  categoryContainer: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  expenseDescription: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    marginLeft: 10,
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerText: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },
  seeMore: {
    color: "#DC2626",
    textDecorationLine: "underline",
  },
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: "90%",
  },
  dialogTitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#1B1B1B",
  },
  dialogContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  formContainer: {
    gap: 8,
  },
  formInput: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  divider: {
    backgroundColor: "#eee",
  },
  dialogActions: {
    padding: 16,
    justifyContent: "space-between",
  },
  dialogButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  categoryItem: {
    paddingVertical: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 8,
    padding: 12,
  },
  categoryButtonError: {
    borderColor: "#DC2626",
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B1B1B",
  },
  currencySymbol: {
    fontSize: 16,
    color: "#1B1B1B",
    marginRight: 2,
  },
  webDialog: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  categoryDialog: {
    maxWidth: 300,
    alignSelf: "center",
  },
  deleteAction: {
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    marginLeft: 1,
    borderRadius: 12,
  },
  expandedCard: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  confirmationText: {
    fontSize: 16,
    color: "#1B1B1B",
    textAlign: "center",
    paddingVertical: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  filterContainer: {
    flexGrow: 0,
    marginRight: 8,
  } as ViewStyle,
  filterButton: {
    marginRight: 4,
    borderColor: "#DC2626",
  } as ViewStyle,
  filterButtonLabel: {
    fontSize: 12,
    marginVertical: 0,
  } as TextStyle,
  mobileFilterButton: {
    marginRight: 8,
    borderColor: "#DC2626",
  } as ViewStyle,
  filterDialog: {
    borderRadius: 12,
    backgroundColor: "#fff",
  } as ViewStyle,
});
