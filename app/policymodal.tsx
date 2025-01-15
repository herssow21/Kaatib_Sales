import { ScrollView } from "react-native";
import { Text, Button } from "react-native-paper";
import { router } from "expo-router";

export default function PolicyModal() {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>
        Terms and Privacy Policy
      </Text>
      <Text style={{ marginBottom: 16 }}>
        {/* Add your policy content here */}
        Your terms and privacy policy content goes here...
      </Text>
      <Button mode="contained" onPress={() => router.back()}>
        Close
      </Button>
    </ScrollView>
  );
}
