import React from "react";
import { View, Text } from "react-native";
import { OrderProvider } from "../contexts/OrderContext";
import { CategoryProvider } from "../contexts/CategoryContext";
import Orders from "./(tabs)/orders";

const App = () => {
  return (
    <OrderProvider>
      <CategoryProvider>
        <Orders />
      </CategoryProvider>
    </OrderProvider>
  );
};

export default App;
