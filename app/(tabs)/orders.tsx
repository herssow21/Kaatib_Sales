import { useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { Text, Searchbar, FAB, List, useTheme } from "react-native-paper";
import { router } from "expo-router";

interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
}

export default function Orders() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

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
    searchbar: {
      margin: 16,
    },
    content: {
      flex: 1,
    },
    emptyText: {
      textAlign: "center",
      padding: 16,
      color: "#666",
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Orders
        </Text>
      </View>
      <Searchbar
        placeholder="Search orders..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <ScrollView style={styles.content}>
        <List.Section>
          <List.Subheader>Recent Orders</List.Subheader>
          <Text style={styles.emptyText}>No orders found</Text>
        </List.Section>
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: "/transaction-form",
          })
        }
      />
    </View>
  );
}
