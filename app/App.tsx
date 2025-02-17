import React from "react";
import { View, Text } from "react-native";
import { OrderProvider } from "../contexts/OrderContext";
import Orders from "./(tabs)/orders";

const App = () => {
  return (
    <OrderProvider>
      <Orders />
    </OrderProvider>
  );
};

export default App;
