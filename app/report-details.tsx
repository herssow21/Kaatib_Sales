import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";

export default function ReportDetails() {
  const { type } = useLocalSearchParams();
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
    content: {
      padding: 16,
    },
  });

  const getReportTitle = () => {
    switch (type) {
      case "sales":
        return "Sales Report";
      case "inventory":
        return "Inventory Report";
      case "financial":
        return "Financial Report";
      default:
        return "Report";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          {getReportTitle()}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Add your report details here */}
        <Text variant="bodyMedium">Report details will be displayed here.</Text>
      </View>
    </ScrollView>
  );
}
