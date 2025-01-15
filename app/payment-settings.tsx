import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, List, useTheme } from "react-native-paper";

export default function PaymentSettings() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
    },
    headerText: {
      fontWeight: "bold",
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Payment Settings
        </Text>
      </View>
      <List.Section>
        <List.Item
          title="No payment methods"
          description="Payment methods will appear here"
        />
      </List.Section>
    </ScrollView>
  );
}
