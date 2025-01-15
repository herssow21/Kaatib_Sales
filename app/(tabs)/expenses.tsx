import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { Text, Card, FAB, Searchbar, useTheme, Chip } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
}

export default function Expenses() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Platform.OS === "ios" ? 16 : 8,
    },
    header: {
      padding: 16,
      paddingBottom: 8,
    },
    headerText: {
      fontWeight: "bold",
    },
    totalExpenses: {
      padding: 16,
      backgroundColor: theme.colors.primaryContainer,
      margin: 16,
      borderRadius: 12,
    },
    expenseAmount: {
      color: theme.colors.error,
      fontWeight: "bold",
    },
  });

  // Mock data
  const mockExpenses: Expense[] = [
    {
      id: "1",
      title: "Office Supplies",
      amount: 150.0,
      date: "2024-03-15",
      category: "Supplies",
    },
    {
      id: "2",
      title: "Utility Bills",
      amount: 250.0,
      date: "2024-03-14",
      category: "Utilities",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Expenses
        </Text>
      </View>
      <View style={styles.totalExpenses}>
        <Text variant="titleMedium" style={{ opacity: 0.7 }}>
          Total Expenses
        </Text>
        <Text
          variant="headlineLarge"
          style={[styles.expenseAmount, { color: theme.colors.primary }]}
        >
          $400.00
        </Text>
      </View>
    </View>
  );
}
