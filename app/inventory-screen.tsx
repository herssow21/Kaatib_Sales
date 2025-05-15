import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Searchbar,
  IconButton,
  Portal,
  Modal,
  useTheme,
} from "react-native-paper";
import { useThemeContext } from "../contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

// Add a type for the custom theme colors
interface CustomColors {
  primary: string;
  secondary: string;
  primaryContainer: string;
  secondaryContainer: string;
  background: string;
  surface: string;
  error: string;
  outline: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  onBackground: string;
  onPrimary: string;
  onSecondary: string;
  onError: string;
  elevation: any;
  card: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  modalBackground: string;
  modalBorder: string;
  divider: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
  text?: string;
  textSecondary?: string;
  buttonText?: string;
  buttonBackground?: string;
  buttonBorder?: string;
  headerBackground?: string;
  headerText?: string;
  searchBackground?: string;
  searchText?: string;
  searchPlaceholder?: string;
  listBackground?: string;
  listBorder?: string;
  listText?: string;
  listTextSecondary?: string;
  modalText?: string;
  modalTextSecondary?: string;
  modalOverlay?: string;
}

export default function InventoryScreen() {
  const { theme } = useThemeContext();
  const colors = theme.colors as CustomColors;
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    quantity: 0,
    price: 0,
    category: "",
  });

  // ... existing functions ...

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.headerBackground,
      elevation: 2,
    },
    backButton: {
      marginRight: 8,
      backgroundColor: reddish,
      borderRadius: 24,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
    },
    headerContent: {
      flex: 1,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.headerText,
    },
    subHeaderText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    addButtonContainer: {
      padding: 16,
      paddingTop: 8,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    addButton: {
      borderRadius: 8,
      elevation: 2,
      backgroundColor: colors.buttonBackground,
    },
    addButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      height: 48,
    },
    addButtonText: {
      marginLeft: 12,
      fontSize: 16,
      fontWeight: "600",
      color: colors.buttonText,
    },
    searchContainer: {
      padding: 16,
      paddingTop: 0,
    },
    searchInput: {
      backgroundColor: colors.searchBackground,
      color: colors.searchText,
    },
    productList: {
      padding: 16,
    },
    productCard: {
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      elevation: 2,
      borderColor: colors.cardBorder,
      borderWidth: 1,
    },
    productContent: {
      padding: 16,
    },
    productName: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: colors.listText,
    },
    productDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    productDetail: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: colors.listTextSecondary,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      color: colors.listText,
    },
    productActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 8,
    },
    actionButton: {
      marginLeft: 8,
    },
    modalContent: {
      backgroundColor: colors.modalBackground,
      padding: 24,
      margin: 20,
      borderRadius: 12,
      maxHeight: "80%",
      width: "90%",
      maxWidth: 500,
      alignSelf: "center",
      elevation: 4,
      borderColor: colors.modalBorder,
      borderWidth: 1,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.modalText,
    },
    input: {
      marginBottom: 16,
      backgroundColor: colors.inputBackground,
      color: colors.modalText,
    },
    errorText: {
      color: colors.error,
      marginTop: -12,
      marginBottom: 12,
      marginLeft: 4,
      fontSize: 12,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
    },
    modalButton: {
      marginLeft: 8,
    },
    snackbar: {
      margin: 16,
      borderRadius: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={{ color: colors.onBackground }}
        >
          Inventory Management
        </Text>
        <Button
          mode="contained"
          onPress={() => setIsAddModalVisible(true)}
          style={styles.addButton}
        >
          Add Product
        </Button>
      </View>

      <Searchbar
        placeholder="Search products..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[
          styles.searchContainer,
          { backgroundColor: colors.surfaceVariant },
        ]}
        iconColor={colors.onSurfaceVariant}
        inputStyle={styles.searchInput}
        placeholderTextColor={colors.placeholder}
      />

      <ScrollView style={styles.productList}>
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            style={[styles.productCard, { backgroundColor: colors.card }]}
          >
            <Card.Content>
              <View style={styles.productHeader}>
                <View>
                  <Text
                    variant="titleMedium"
                    style={{ color: colors.onSurface }}
                  >
                    {product.name}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: colors.onSurfaceVariant }}
                  >
                    {product.category}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEdit(product)}
                    iconColor={colors.primary}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(product.id)}
                    iconColor={colors.error}
                  />
                </View>
              </View>
              <View style={styles.productDetails}>
                <Text
                  variant="bodyMedium"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Quantity: {product.quantity}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Price: ${product.price.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Add Product Modal */}
      <Portal>
        <Modal
          visible={isAddModalVisible}
          onDismiss={() => setIsAddModalVisible(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: colors.modalBackground },
          ]}
        >
          <Text
            variant="headlineSmall"
            style={[styles.modalTitle, { color: colors.onSurface }]}
          >
            Add New Product
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.onSurface,
              },
            ]}
            placeholder="Product Name"
            placeholderTextColor={colors.placeholder}
            value={newProduct.name}
            onChangeText={(text) =>
              setNewProduct({ ...newProduct, name: text })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.onSurface,
              },
            ]}
            placeholder="Category"
            placeholderTextColor={colors.placeholder}
            value={newProduct.category}
            onChangeText={(text) =>
              setNewProduct({ ...newProduct, category: text })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.onSurface,
              },
            ]}
            placeholder="Quantity"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            value={newProduct.quantity?.toString()}
            onChangeText={(text) =>
              setNewProduct({
                ...newProduct,
                quantity: parseInt(text) || 0,
              })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.onSurface,
              },
            ]}
            placeholder="Price"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            value={newProduct.price?.toString()}
            onChangeText={(text) =>
              setNewProduct({
                ...newProduct,
                price: parseFloat(text) || 0,
              })
            }
          />
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setIsAddModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddProduct}
              style={styles.modalButton}
            >
              Add
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Edit Product Modal */}
      <Portal>
        <Modal
          visible={isEditModalVisible}
          onDismiss={() => setIsEditModalVisible(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: colors.modalBackground },
          ]}
        >
          <Text
            variant="headlineSmall"
            style={[styles.modalTitle, { color: colors.onSurface }]}
          >
            Edit Product
          </Text>
          {selectedProduct && (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Product Name"
                placeholderTextColor={colors.placeholder}
                value={selectedProduct.name}
                onChangeText={(text) =>
                  setSelectedProduct({ ...selectedProduct, name: text })
                }
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Category"
                placeholderTextColor={colors.placeholder}
                value={selectedProduct.category}
                onChangeText={(text) =>
                  setSelectedProduct({ ...selectedProduct, category: text })
                }
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Quantity"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={selectedProduct.quantity.toString()}
                onChangeText={(text) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    quantity: parseInt(text) || 0,
                  })
                }
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Price"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={selectedProduct.price.toString()}
                onChangeText={(text) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    price: parseFloat(text) || 0,
                  })
                }
              />
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleUpdateProduct}
                  style={styles.modalButton}
                >
                  Update
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}
