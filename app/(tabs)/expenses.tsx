import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { Text, Searchbar, useTheme } from "react-native-paper";
import { useInventoryContext } from "../../contexts/InventoryContext";

export default function Expenses() {
  const theme = useTheme();
  const { items } = useInventoryContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Platform.OS === "ios" ? 16 : 8,
    },
    searchbar: {
      margin: 16,
    },
  });
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search items..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <ScrollView>
        {filteredItems.map((item) => (
          <View key={item.id}>
            <Text>{item.name}</Text>
            <Text>{item.price}</Text>
            <Text>{item.quantity}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
