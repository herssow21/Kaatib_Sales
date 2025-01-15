import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Button, TextInput, useTheme, Card } from "react-native-paper";
import { useInventoryContext } from "../../contexts/InventoryContext";

const InventoryScreen = () => {
  const theme = useTheme();
  const { items } = useInventoryContext();

  const totalItems = items.length;
  const totalStockCount = items.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );
  const estimatedSales = items.reduce(
    (total, item) => total + item.price * (item.quantity || 0),
    0
  );
  const totalStockValue = estimatedSales;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Inventory List</Text>
        <View style={styles.buttonContainer}>
          <Button mode="outlined" style={styles.button}>
            Bulk Restock
          </Button>
          <Button mode="contained" style={styles.button}>
            Create an Item
          </Button>
          <Button mode="contained" style={styles.button}>
            Create Category
          </Button>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <Card style={styles.statBox}>
          <Card.Content>
            <Text style={styles.statText}>{totalItems} Items</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statBox}>
          <Card.Content>
            <Text style={styles.statText}>
              {totalStockCount} Total Stock Count
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statBox}>
          <Card.Content>
            <Text style={styles.statText}>
              KES {estimatedSales.toFixed(2)} Estimated Sales
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statBox}>
          <Card.Content>
            <Text style={styles.statText}>
              KES {totalStockValue.toFixed(2)} Total Stock Value
            </Text>
          </Card.Content>
        </Card>
      </View>
      <TextInput
        mode="outlined"
        placeholder="Search Items"
        style={styles.searchInput}
      />
      <ScrollView>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Item</Text>
          <Text style={styles.tableHeaderText}>Stock Count</Text>
          <Text style={styles.tableHeaderText}>Buying Price</Text>
          <Text style={styles.tableHeaderText}>Selling Price</Text>
          <Text style={styles.tableHeaderText}>Stock Value</Text>
        </View>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items available in inventory.</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text>{item.name}</Text>
              <Text>{item.quantity}</Text>
              <Text>KES {item.price.toFixed(2)}</Text>
              <Text>KES {(item.price * (item.quantity || 0)).toFixed(2)}</Text>
              <Text>KES {(item.price * (item.quantity || 0)).toFixed(2)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 2,
  },
  statText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  searchInput: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableHeaderText: {
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#666",
  },
});

export default InventoryScreen;
