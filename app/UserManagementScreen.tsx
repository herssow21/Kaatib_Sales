import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, List, Button } from "react-native-paper";

const UserManagementScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for users/customers
  const users = [
    { id: 1, name: "John Doe", contact: "1234567890" },
    { id: 2, name: "Jane Smith", contact: "0987654321" },
    // Add more users/customers here
  ];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        label="Search Users/Customers"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      <ScrollView>
        {filteredUsers.map((user) => (
          <List.Item
            key={user.id}
            title={user.name}
            description={user.contact}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        ))}
      </ScrollView>
      <Button mode="contained" onPress={() => console.log("Add User")}>
        Add User
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchInput: {
    marginBottom: 16,
  },
});

export default UserManagementScreen;
