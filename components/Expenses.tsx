import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, useTheme, Surface } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
}

const Expenses: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with actual data later
  const expenses: Expense[] = [
    {
      id: "1",
      title: "Rent",
      description: "Monthly apartment rent",
      amount: 650.0,
      date: "4/1/2025",
    },
    {
      id: "2",
      title: "Shopping",
      description: "New clothes",
      amount: 210.3,
      date: "4/2/2025",
    },
    {
      id: "3",
      title: "Transport",
      description: "Uber rides",
      amount: 45.0,
      date: "4/3/2025",
    },
  ];

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const highestExpense = expenses.reduce(
    (max, expense) => (expense.amount > max.amount ? expense : max),
    expenses[0]
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Expenses</Text>

      <View style={styles.summaryContainer}>
        <Surface style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>${totalExpenses.toFixed(2)}</Text>
          <Text style={styles.summaryPeriod}>This Month</Text>
        </Surface>

        <Surface
          style={[
            styles.summaryCard,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: "#fff" }]}>
            Highest Expense
          </Text>
          <Text style={[styles.summaryAmount, { color: "#fff" }]}>
            ${highestExpense.amount.toFixed(2)}
          </Text>
          <Text style={[styles.summaryPeriod, { color: "#fff" }]}>
            {highestExpense.title}
          </Text>
        </Surface>
      </View>

      <View style={styles.expensesSection}>
        <Text style={styles.sectionTitle}>All Expenses</Text>

        <View style={styles.searchContainer}>
          <TextInput
            mode="outlined"
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            left={<TextInput.Icon icon="magnify" />}
            style={styles.searchInput}
          />
          <MaterialIcons
            name="add-circle"
            size={48}
            color={theme.colors.primary}
            style={styles.addButton}
          />
        </View>

        {expenses.map((expense) => (
          <Surface key={expense.id} style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
              <View>
                <Text style={styles.expenseTitle}>{expense.title}</Text>
                <Text style={styles.expenseDescription}>
                  {expense.description}
                </Text>
                <Text style={styles.expenseDate}>{expense.date}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                ${expense.amount.toFixed(2)}
              </Text>
            </View>
          </Surface>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1B1B1B",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#fff",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B1B1B",
    marginBottom: 4,
  },
  summaryPeriod: {
    fontSize: 14,
    color: "#666",
  },
  expensesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1B1B1B",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
  },
  addButton: {
    marginLeft: 8,
  },
  expenseCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 1,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B1B1B",
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: "#999",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B1B1B",
  },
});

export default Expenses;
