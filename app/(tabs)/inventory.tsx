import React from "react";
import { View, FlatList, Text } from "react-native";
import { useCategoryContext } from "../../contexts/CategoryContext";

// Define the interface for the category
interface Category {
  id: string;
  name: string;
}

const CategoriesScreen = () => {
  const { categories } = useCategoryContext();

  return (
    <View>
      <Text style={{ fontWeight: "bold", margin: 10 }}>Categories:</Text>
      <FlatList
        data={categories}
        keyExtractor={(item: Category) => item.id} // Explicitly typing 'item' here
        renderItem={(
          { item }: { item: Category } // Explicitly typing 'item' in renderItem
        ) => (
          <View>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const Inventory = () => {
  return <CategoriesScreen />;
};

export default Inventory;
