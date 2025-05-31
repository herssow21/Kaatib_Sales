import { useState } from "react";
import { StyleSheet, View, Image, Platform, Dimensions } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { width } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";

  const handleSubmit = () => {
    // TODO: Implement actual authentication
    router.replace({
      pathname: "/(tabs)/dashboard" as const,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[styles.contentContainer, isWeb && styles.contentContainerWeb]}
      >
        {isWeb && (
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/images/login-image.png")}
              style={styles.loginImage}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={[styles.formContainer, isWeb && styles.formContainerWeb]}>
          {!isWeb && (
            <Image
              source={require("../assets/images/login-image.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <Text style={[styles.title, isWeb && styles.titleWeb]}>
            Kaatib Sales
          </Text>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  contentContainerWeb: {
    flexDirection: "row",
    padding: 0,
    alignItems: "stretch",
  },
  imageContainer: {
    flex: 1,
    width: "40%",
    alignItems: "center",
  },
  loginImage: {
    width: "50%",
    height: "70%",
  },
  formContainer: {
    flex: 1,
  },
  formContainerWeb: {
    width: "60%",
    padding: 65,
    maxWidth: undefined,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
  titleWeb: {
    marginBottom: 20,
    textAlign: "left",
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
