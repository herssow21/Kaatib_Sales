import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Platform, Modal } from "react-native";
import {
  Text,
  Searchbar,
  FAB,
  List,
  useTheme,
  Button,
  Card,
} from "react-native-paper";
import { router } from "expo-router";
import OrderForm from "../../components/OrderForm";
import { Order } from "../types";

export default function Orders() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFormVisible, setFormVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Platform.OS === "ios" ? 16 : 8,
    },
    header: {
      padding: 16,
      paddingBottom: 8,
      backgroundColor: theme.colors.primary,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    headerText: {
      fontWeight: "bold",
      fontSize: 24,
      color: theme.colors.onPrimary,
    },
    subHeaderText: {
      fontSize: 16,
      color: theme.colors.onPrimary,
    },
    searchbar: {
      margin: 16,
      borderRadius: 8,
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
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "white",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#E03F3E",
      margin: 16,
      maxWidth: "99%",
      alignSelf: "center",
    },
    noOrdersContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    makeSaleButton: {
      marginTop: 16,
      backgroundColor: "#E0403F",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      elevation: 2,
    },
    orderCard: {
      margin: 8,
      borderRadius: 8,
      elevation: 2,
    },
    orderStatus: {
      fontWeight: "bold",
      color: theme.colors.secondary,
    },
  });

  const handleAddOrder = (order: Order) => {
    setOrders([...orders, order]);
    setFormVisible(false);
  };

  return (
    <View style={styles.container}>
      <Modal visible={isFormVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <OrderForm
            onSubmit={(order) =>
              handleAddOrder({ ...order, id: Date.now().toString() })
            }
            onClose={() => setFormVisible(false)}
          />
          <Button mode="outlined" onPress={() => setFormVisible(false)}>
            Close
          </Button>
        </View>
      </Modal>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Orders
        </Text>
        <Text style={styles.subHeaderText}>Manage your orders efficiently</Text>
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
          {orders.length === 0 ? (
            <View style={styles.noOrdersContainer}>
              <Text style={styles.emptyText}>Sorry, No Orders Made</Text>
              <Button
                mode="contained"
                onPress={() => setFormVisible(true)}
                style={styles.makeSaleButton}
              >
                Make Sale
              </Button>
            </View>
          ) : (
            orders.map((order, index) => (
              <Card key={index} style={styles.orderCard}>
                <Card.Content>
                  <Text variant="titleMedium">{order.clientName}</Text>
                  <Text style={styles.orderStatus}>Status: {order.status}</Text>
                  <Text>Total: KES {order.grandTotal}</Text>
                </Card.Content>
              </Card>
            ))
          )}
        </List.Section>
      </ScrollView>
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setFormVisible(true)}
        label="Add Order"
      />
    </View>
  );
}
