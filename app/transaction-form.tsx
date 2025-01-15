import { View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { router } from "expo-router";

export default function TransactionForm() {
  return (
    <View style={{ padding: 16 }}>
      <TextInput
        mode="outlined"
        label="Transaction Name"
        style={{ marginBottom: 16 }}
      />
      {/* Add more form fields */}
      <Button mode="contained" onPress={() => router.back()}>
        Save Transaction
      </Button>
    </View>
  );
}
