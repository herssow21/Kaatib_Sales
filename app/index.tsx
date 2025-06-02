import { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Platform,
  Dimensions,
  useColorScheme,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { width } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const handleSubmit = () => {
    // TODO: Implement actual authentication
    router.replace({
      pathname: "/(tabs)/dashboard" as const,
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.containerDark]}
    >
      <View
        style={[styles.contentContainer, isWeb && styles.contentContainerWeb]}
      >
        {isWeb && (
          <View
            style={[
              styles.leftContainer,
              isDarkMode && styles.leftContainerDark,
            ]}
          >
            <View style={styles.logoAndTitleContainer}>
              <View style={styles.packageIconBackground}>
                <Feather name="package" size={32} color="white" />
              </View>
              <View>
                <Text
                  style={[styles.leftTitle, isDarkMode && styles.leftTitleDark]}
                >
                  Kaatib Inventory
                </Text>
                <Text
                  style={[
                    styles.leftSubtitle,
                    isDarkMode && styles.leftSubtitleDark,
                  ]}
                >
                  Sales & Inventory Management
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.leftDescription,
                isDarkMode && styles.leftDescriptionDark,
              ]}
            >
              Streamline your business operations with our comprehensive
              inventory and sales management platform.
            </Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.trendingUpIconBackground}>
                  <Feather name="trending-up" size={24} color="green" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.featureTitle,
                      isDarkMode && styles.featureTitleDark,
                    ]}
                  >
                    Real-time Analytics
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      isDarkMode && styles.featureDescriptionDark,
                    ]}
                  >
                    Track sales performance and inventory levels in real-time
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.packageFeatureIconBackground}>
                  <Feather name="package" size={24} color="blue" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.featureTitle,
                      isDarkMode && styles.featureTitleDark,
                    ]}
                  >
                    Inventory Control
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      isDarkMode && styles.featureDescriptionDark,
                    ]}
                  >
                    Manage stock levels, track products, and automate reordering
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.shieldIconBackground}>
                  <Feather name="shield" size={24} color="purple" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.featureTitle,
                      isDarkMode && styles.featureTitleDark,
                    ]}
                  >
                    Secure & Reliable
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      isDarkMode && styles.featureDescriptionDark,
                    ]}
                  >
                    Enterprise-grade security with 99.9% uptime guarantee
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        <View
          style={[
            styles.formContainer,
            isWeb && styles.formContainerWeb,
            isDarkMode && styles.formContainerDark,
          ]}
        >
          {!isWeb && (
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <Text
            style={[
              styles.title,
              isWeb && styles.titleWeb,
              isDarkMode && styles.titleDark,
            ]}
          >
            {isLogin ? "Welcome Back" : "Join Us"}
          </Text>
          <Text
            style={[
              styles.subtitle,
              isWeb && styles.subtitleWeb,
              isDarkMode && styles.subtitleDark,
            ]}
          >
            {isLogin
              ? "Sign in to your account to continue"
              : "Create an account to get started"}
          </Text>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, isDarkMode && styles.inputDark]}
            keyboardType="email-address"
            autoCapitalize="none"
            theme={{
              colors: {
                primary: isDarkMode ? "#fff" : "#000",
                background: isDarkMode ? "#3a3a3a" : "#fff",
                text: isDarkMode ? "#fff" : "#000",
                placeholder: isDarkMode ? "#ddd" : "#555",
                outline: isDarkMode ? "#555" : "#ccc",
              },
            }}
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, isDarkMode && styles.inputDark]}
            theme={{
              colors: {
                primary: isDarkMode ? "#fff" : "#000",
                background: isDarkMode ? "#3a3a3a" : "#fff",
                text: isDarkMode ? "#fff" : "#000",
                placeholder: isDarkMode ? "#ddd" : "#555",
                outline: isDarkMode ? "#555" : "#ccc",
              },
            }}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            labelStyle={isDarkMode && { color: "#fff" }}
          >
            {isLogin ? "Login" : "Sign Up"}
          </Button>
          <Button
            mode="text"
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
            labelStyle={isDarkMode && { color: "#fff" }}
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
            labelStyle={isDarkMode && { color: "#fff" }}
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
  containerDark: {
    backgroundColor: "#121212",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  contentContainerWeb: {
    flexDirection: "row",
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  leftContainer: {
    flex: 1,
    padding: 60,
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
    height: "100%",
    maxWidth: "50%",
  },
  leftContainerDark: {
    backgroundColor: "#1e1e1e",
  },
  logoAndTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  leftLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  leftTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
    marginLeft: 10,
    color: "#000",
  },
  leftTitleDark: {
    color: "#fff",
  },
  leftSubtitle: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
  },
  leftSubtitleDark: {
    color: "#bbb",
  },
  leftDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 40,
    lineHeight: 24,
  },
  leftDescriptionDark: {
    color: "#ccc",
  },
  featuresContainer: {
    // Styles for the container of feature items
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  featureIconPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    marginRight: 15,
    marginTop: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  featureTitleDark: {
    color: "#fff",
  },
  featureDescription: {
    fontSize: 14,
    color: "#555",
  },
  featureDescriptionDark: {
    color: "#bbb",
  },
  formContainer: {
    flex: 1,
  },
  formContainerWeb: {
    width: "50%",
    padding: 65,
    maxWidth: undefined,
    backgroundColor: "#fff",
    borderRadius: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  formContainerDark: {
    backgroundColor: "#1e1e1e",
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
    marginBottom: 20,
    color: "#000",
  },
  titleWeb: {
    marginBottom: 20,
    textAlign: "left",
  },
  titleDark: {
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitleWeb: {
    textAlign: "left",
    marginBottom: 30,
  },
  subtitleDark: {
    color: "#bbb",
  },
  input: {
    marginBottom: 16,
  },
  inputDark: {},
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
  packageIconBackground: {
    backgroundColor: "#f00",
    padding: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  trendingUpIconBackground: {
    backgroundColor: "#d0f0c0",
    padding: 8,
    borderRadius: 6,
    marginRight: 15,
    marginTop: 4,
  },
  packageFeatureIconBackground: {
    backgroundColor: "#c0d0f0",
    padding: 8,
    borderRadius: 6,
    marginRight: 15,
    marginTop: 4,
  },
  shieldIconBackground: {
    backgroundColor: "#e0c0f0",
    padding: 8,
    borderRadius: 6,
    marginRight: 15,
    marginTop: 4,
  },
});
