import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, TextInput, Button, Checkbox } from "react-native-paper";
import type { InventoryItem } from "../app/types";

interface RestockFormProps {
  items: InventoryItem[];
  onSubmit: (selectedItems: { id: string; quantity: number }[]) => void;
  onClose: () => void;
}

const RestockForm: React.FC<RestockFormProps> = ({
  items,
  onSubmit,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    { id: string; quantity: number }[]
  >([]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemSelect = (itemId: string) => {
    if (selectedItems.find((item) => item.id === itemId)) {
      setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
    } else {
      setSelectedItems([...selectedItems, { id: itemId, quantity: 0 }]);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: string) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: parseInt(quantity) || 0 }
          : item
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Bulk Restock
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Search Item"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          right={<TextInput.Icon icon="magnify" />}
        />
        <Button
          mode="contained"
          onPress={() => onSubmit(selectedItems)}
          style={styles.viewButton}
        >
          View Restock List{" "}
          {selectedItems.length > 0 && `(${selectedItems.length})`}
        </Button>
      </View>

      <ScrollView style={styles.itemList}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 0.1 }]}>#</Text>
          <Text style={[styles.headerCell, { flex: 0.3 }]}>Item</Text>
          <Text style={[styles.headerCell, { flex: 0.3 }]}>
            Current Buying Price
          </Text>
          <Text style={[styles.headerCell, { flex: 0.3 }]}>In stock</Text>
        </View>

        {filteredItems.map((item, index) => (
          <View key={item.id} style={styles.tableRow}>
            <Checkbox.Android
              status={
                selectedItems.find((i) => i.id === item.id)
                  ? "checked"
                  : "unchecked"
              }
              onPress={() => handleItemSelect(item.id)}
              style={{ flex: 0.1 }}
            />
            <Text style={[styles.cell, { flex: 0.3 }]}>{item.name}</Text>
            <Text style={[styles.cell, { flex: 0.3 }]}>{item.buyingPrice}</Text>
            <Text style={[styles.cell, { flex: 0.3 }]}>{item.quantity}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  searchInput: {
    flex: 1,
  },
  viewButton: {
    minWidth: 150,
  },
  itemList: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerCell: {
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  cell: {
    fontSize: 14,
  },
});

export default RestockForm;
