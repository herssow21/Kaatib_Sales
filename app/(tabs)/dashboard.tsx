import React from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { Text, useTheme } from "react-native-paper";
import DashboardCard from "../../components/DashboardCard";
import { useInventoryContext } from "../../contexts/InventoryContext";

export default function Dashboard() {
  const theme = useTheme();
  const { items } = useInventoryContext();

  const totalSales = items.reduce(
    (total, item) => total + item.price * (item.quantity || 0),
    0
  );
  const totalOrders = items.length;
  const activeUsers = 10;
  const lowStock = items.filter(
    (item) => item.quantity && item.quantity < 5
  ).length;

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
      fontSize: 24,
    },
    scrollContent: {
      padding: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Dashboard
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <DashboardCard
          title="Total Sales"
          amount={totalSales}
          icon="attach-money"
          color="#e03f3e"
        />
        <DashboardCard
          title="Total Orders"
          amount={totalOrders}
          icon="shopping-cart"
          color="#e03f3e"
        />
        <DashboardCard
          title="Active Users"
          amount={activeUsers}
          icon="people"
          color="#e03f3e"
        />
        <DashboardCard
          title="Low Stock Items"
          amount={lowStock}
          icon="warning"
          color="#e03f3e"
        />
      </ScrollView>
    </View>
  );
}
