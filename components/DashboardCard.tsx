import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import type { MaterialIcons as MaterialIconsType } from "@expo/vector-icons";

interface DashboardCardProps {
  title: string;
  amount: number;
  icon: keyof typeof MaterialIconsType.glyphMap;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  amount,
  icon,
  color,
}) => {
  const theme = useTheme();

  const formattedAmount =
    title === "Total Sales" ? `$${amount.toFixed(2)}` : amount.toString();

  const styles = StyleSheet.create({
    card: {
      marginBottom: 16,
      borderRadius: 12,
      elevation: 4,
    },
    cardContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    leftContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconContainer: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: color,
    },
    cardTitle: {
      opacity: 0.9,
      fontWeight: "bold",
    },
    amount: {
      fontWeight: "bold",
      color: color,
    },
  });

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={icon} size={24} color="#fff" />
          </View>
          <Text variant="titleMedium" style={styles.cardTitle}>
            {title}
          </Text>
        </View>
        <Text variant="headlineMedium" style={styles.amount}>
          {formattedAmount}
        </Text>
      </Card.Content>
    </Card>
  );
};

export default DashboardCard;
