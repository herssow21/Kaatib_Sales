import { useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    // TODO: Implement actual authentication
    router.replace({
      pathname: "/(tabs)/dashboard" as const,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Kaatib Inventory</Text>
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          {isLogin ? "Login" : "Sign Up"}
        </Button>
        <Button
          mode="text"
          onPress={() => setIsLogin(!isLogin)}
          style={styles.switchButton}
        >
          {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
        </Button>
        <Button
          mode="text"
          onPress={() =>
            router.push({
              pathname: "/policymodal",
            })
          }
          style={styles.policyButton}
        >
          Terms & Privacy Policy
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    padding: 4,
  },
  switchButton: {
    marginTop: 16,
  },
  policyButton: {
    marginTop: 8,
  },
});
