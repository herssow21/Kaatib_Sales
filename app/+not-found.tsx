import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-paper";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen name="not-found" options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" asChild>
          <Button mode="contained">Go to home screen</Button>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
