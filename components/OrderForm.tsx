import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { TextInput, Button, Text, Title, useTheme } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { useInventoryContext } from "../contexts/InventoryContext";
import { useCategoryContext } from "../contexts/CategoryContext";
import { useAlertContext } from "../contexts/AlertContext";

interface OrderItem {
  product: string;
  rate: number;
  quantity: number;
}

interface Order {
  id: string;
  category: string;
  orderDate: string;
  clientName: string;
  clientContact: string;
  address: string;
  items: OrderItem[];
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
}

// Mock function to simulate fetching client data
const fetchClientByContact = (contact: string) => {
  const clients = [
    { contact: "1234567890", name: "John Doe" },
    { contact: "0987654321", name: "Jane Smith" },
  ];
  return clients.find((client) => client.contact === contact);
};

interface OrderFormProps {
  onSubmit: (order: Order) => void;
  onClose: () => void;
  initialData?: Order | null;
  orders: Order[];
}

const initialFormState = {
  clientName: "",
  clientContact: "",
  address: "",
  orderDate: new Date().toISOString(),
  paymentMethod: "Cash",
  paymentStatus: "No Payment",
  items: [
    {
      product: "",
      quantity: 1,
      rate: 0,
    },
  ],
  discount: 0,
};

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onClose,
  initialData = null,
  orders,
}) => {
  const { items: inventoryItems, updateItem } = useInventoryContext();
  const { categories } = useCategoryContext();
  const theme = useTheme();
  const { showError, showSuccess, showWarning } = useAlertContext();
  const [formData, setFormData] = useState(initialData || initialFormState);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    initialData?.category || ""
  );
  const [amountPaid, setAmountPaid] = useState(0);
  const [product, setProduct] = useState("");
  const [rate, setRate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderDate, setOrderDate] = useState(
    initialData?.orderDate || new Date().toISOString().split("T")[0]
  );

  const filteredItems = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Replace the static products array
  const products = inventoryItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.sellingPrice,
  }));

  useEffect(() => {
    // Check if the client exists when the contact changes
    const client = fetchClientByContact(formData.clientContact);
    if (client) {
      setFormData((prev) => ({ ...prev, clientName: client.name }));
    } else {
      setFormData((prev) => ({ ...prev, clientName: "" }));
    }
  }, [formData.clientContact]);

  useEffect(() => {
    if (initialData && initialData.orderDate) {
      setOrderDate(new Date(initialData.orderDate).toISOString().split("T")[0]);
    }
  }, [initialData]);

  useEffect(() => {
    const grandTotal =
      formData.items.reduce((acc, item) => acc + item.rate * item.quantity, 0) -
      (formData.discount || 0);

    const balance = grandTotal - amountPaid;

    let newStatus = "No Payment";
    if (balance === 0 && grandTotal > 0) {
      newStatus = "Completed";
    } else if (amountPaid > 0 && balance > 0) {
      newStatus = "Partial";
    }

    setFormData((prev) => ({
      ...prev,
      paymentStatus: newStatus,
    }));
  }, [amountPaid, formData.items, formData.discount]);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date();
    setOrderDate(currentDate.toISOString().split("T")[0]);
    setFormData((prev) => ({
      ...prev,
      orderDate: currentDate.toISOString().split("T")[0],
    }));
    setShowDatePicker(false);
  };

  const toggleDatePicker = () => {
    setShowDatePicker((prev) => !prev);
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product: "", rate: 0, quantity: 0 }],
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    if (field === "rate" || field === "quantity") {
      const numValue = value === "" ? 0 : Number(value);
      newItems[index] = {
        ...newItems[index],
        [field]: isNaN(numValue) ? 0 : numValue,
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const validatePhoneNumber = (phone: string) => {
    // Check if phone starts with 0 (10 digits) or not (9 digits)
    if (phone.startsWith("0")) {
      return phone.length === 10 && /^0[17]\d{8}$/.test(phone);
    }
    return phone.length === 9 && /^[17]\d{8}$/.test(phone);
  };

  const handleSubmit = () => {
    try {
      // Validation checks
      if (!formData.clientName.trim()) {
        showError("Client name is required");
        return;
      }

      if (!formData.clientContact.trim()) {
        showError("Client contact is required");
        return;
      }

      if (!validatePhoneNumber(formData.clientContact)) {
        showError("Please enter a valid phone number");
        return;
      }

      if (formData.items.length === 0) {
        showError("Please add at least one item");
        return;
      }

      const total = formData.items.reduce(
        (acc, item) => acc + item.rate * item.quantity,
        0
      );

      const newOrder: Order = {
        id: `ORD-${(orders?.length || 0 + 1).toString().padStart(3, "0")}`,
        orderDate: formData.orderDate,
        clientName: formData.clientName.trim(),
        clientContact: formData.clientContact,
        address: formData.address.trim(),
        items: formData.items,
        discount: formData.discount,
        grandTotal: total - formData.discount,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        category: selectedCategory || "default",
        status: "Pending",
      };

      // Check stock availability
      const insufficientStock = formData.items.some((item) => {
        const inventoryItem = inventoryItems.find(
          (i) => i.name === item.product
        );
        return inventoryItem && inventoryItem.quantity < item.quantity;
      });

      if (insufficientStock) {
        showError("Not enough stock for one or more items");
        return;
      }

      // Update inventory stock based on the order items
      formData.items.forEach((item) => {
        const inventoryItem = inventoryItems.find(
          (i) => i.name === item.product
        );
        if (inventoryItem) {
          const updatedQuantity = inventoryItem.quantity - item.quantity;
          updateItem({ ...inventoryItem, quantity: updatedQuantity });
        }
      });

      onSubmit(newOrder);
      setFormData(initialFormState); // Reset form
      showSuccess(
        `Order for ${formData.clientName} ${
          initialData ? "updated" : "added"
        } successfully!`
      );
    } catch (error) {
      console.error("Order submission error:", error);
      showError("Failed to submit order");
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    onClose();
  };

  const handleOpenModal = () => {
    setFormData(initialFormState);
    handleAddItem();
  };

  const handleProductChange = (selectedProduct: string, index: number) => {
    const selectedItem = inventoryItems.find(
      (item) => item.name === selectedProduct
    );

    if (selectedItem) {
      const updatedItems = [...formData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        product: selectedProduct,
        rate:
          selectedItem.type === "service"
            ? selectedItem.charges
            : selectedItem.sellingPrice,
        quantity: 1, // Set default quantity to 1
      };
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    }
  };

  const renderProductSelection = (index: number, selectedProduct: string) => (
    <View style={styles.productSelectionContainer}>
      <Picker
        selectedValue={selectedProduct}
        onValueChange={(value) => handleProductChange(value, index)}
        style={styles.picker}
      >
        <Picker.Item label="Select a product/service" value="" />
        {filteredItems.map((item) => (
          <Picker.Item
            key={item.id}
            label={`${item.name} (${item.type})`}
            value={item.name}
          />
        ))}
      </Picker>
    </View>
  );

  const handleViewItem = (item: OrderItem) => {
    Alert.alert(
      "Item Details",
      `Product: ${item.product}\nRate: ${item.rate}\nQuantity: ${item.quantity}`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Create New Order</Title>
      <View style={styles.topSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Order Date</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              value={orderDate}
              onFocus={toggleDatePicker}
              style={styles.dateInput}
              mode="outlined"
              editable={false}
              right={
                <TextInput.Icon
                  icon={() => (
                    <MaterialIcons
                      name="calendar-today"
                      size={24}
                      color="black"
                      onPress={toggleDatePicker}
                    />
                  )}
                />
              }
            />
            {showDatePicker && (
              <DateTimePicker
                value={new Date(orderDate)}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Client Contact</Text>
          <TextInput
            value={formData.clientContact}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, "");
              if (numericValue.length <= 10) {
                setFormData((prev) => ({
                  ...prev,
                  clientContact: numericValue,
                }));
              }
            }}
            style={styles.input}
            keyboardType="numeric"
            mode="outlined"
            maxLength={10}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Client Name</Text>
          <TextInput
            value={formData.clientName}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, clientName: value }))
            }
            style={styles.input}
            mode="outlined"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address/Descriptions (Optional)</Text>
          <TextInput
            value={formData.address}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, address: value }))
            }
            style={styles.input}
            mode="outlined"
          />
        </View>
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.label}>Search Products/Services</Text>
        <TextInput
          mode="outlined"
          placeholder="Type to search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {formData.items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          {renderProductSelection(index, item.product)}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Rate</Text>
            <TextInput
              mode="outlined"
              value={item.rate?.toString() || "0"}
              editable={false}
              style={styles.input}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              mode="outlined"
              value={item.quantity?.toString() || "1"}
              onChangeText={(value) =>
                handleItemChange(index, "quantity", parseInt(value))
              }
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(index)}
          >
            <MaterialIcons name="delete" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      <Button mode="outlined" onPress={handleAddItem} style={styles.addButton}>
        Add Another Product/Service
      </Button>

      <View style={styles.bottomSection}>
        <View style={styles.leftColumn}>
          <View style={styles.inputGroup}>
            <View style={styles.discountRow}>
              <Text style={styles.label}>Discount</Text>
              <TextInput
                value={formData.discount.toString()}
                onChangeText={(value) => {
                  const numValue = value.replace(/[^0-9.]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    discount: parseFloat(numValue),
                  }));
                }}
                keyboardType="numeric"
                style={styles.discountInput}
                mode="outlined"
              />
            </View>
          </View>
          <View style={styles.alignRow}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text>
              KES{" "}
              {formData.items.reduce(
                (acc, item) => acc + item.rate * item.quantity,
                0
              )}
            </Text>
          </View>
          <View style={styles.alignRow}>
            <Text style={styles.label}>Order Discount:</Text>
            <Text>KES {formData.discount}</Text>
          </View>
          <View style={styles.alignRow}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>
              KES{" "}
              {formData.items.reduce(
                (acc, item) => acc + item.rate * item.quantity,
                0
              ) - (formData.discount ? formData.discount : 0)}
            </Text>
          </View>

          <View style={styles.alignRow}>
            <Text style={styles.label}>Balance:</Text>
            <Text style={styles.grandTotalValue}>
              KES{" "}
              {formData.items.reduce(
                (acc, item) => acc + item.rate * item.quantity,
                0
              ) -
                (formData.discount ? formData.discount : 0) -
                amountPaid}
            </Text>
          </View>
        </View>

        <View style={styles.rightColumn}>
          <View style={styles.alignRow}>
            <Text style={styles.label}>Amount Paid:</Text>
            <TextInput
              mode="outlined"
              value={amountPaid.toString()}
              onChangeText={(value) => setAmountPaid(parseFloat(value) || 0)}
              keyboardType="numeric"
              style={styles.amountPaidInput}
            />
          </View>

          <Text style={styles.label}>Payment Method</Text>
          <Picker
            selectedValue={formData.paymentMethod}
            onValueChange={(itemValue) =>
              setFormData((prev) => ({ ...prev, paymentMethod: itemValue }))
            }
            style={styles.picker}
          >
            <Picker.Item label="Cash" value="Cash" />
            <Picker.Item label="Credit" value="Credit" />
            <Picker.Item label="Debit" value="Debit" />
          </Picker>
          <Text style={styles.label}>Payment Status</Text>
          <Picker
            selectedValue={formData.paymentStatus}
            onValueChange={(itemValue) =>
              setFormData((prev) => ({ ...prev, paymentStatus: itemValue }))
            }
            style={styles.picker}
          >
            <Picker.Item label="No Payment" value="No Payment" />
            <Picker.Item label="Partial" value="Partial" />
            <Picker.Item label="Completed" value="Completed" />
            <Picker.Item label="Closed" value="Closed" />
          </Picker>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleReset}
          style={[styles.button, styles.actionButton]}
        >
          Reset
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.button, styles.actionButton]}
        >
          Save Order
        </Button>
      </View>
      {/* <Button onPress={handleClose}>Cancel</Button> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: "#fff",
    borderRadius: 0,
    elevation: 0,
    width: "100%",
    height: "100%",
  },
  title: {
    marginBottom: 5,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  topSection: {
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "left",
  },
  input: {
    height: 40,
    marginBottom: 8,
    cursor: "pointer",
  },
  discountInput: {
    width: Platform.OS === "android" ? "50%" : "40%",
    height: 40,
    marginBottom: 8,
  },
  productLabel: {
    marginTop: 16,
    fontWeight: "bold",
  },
  productName: {
    fontSize: 12,
    color: "#666",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  formGroup: {
    flex: 1,
    marginRight: 8,
  },
  picker: {
    minHeight: 40,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButton: {
    marginBottom: 12,
  },
  addButton: {
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Platform.OS === "android" ? 13 : 2,
    marginTop: Platform.OS === "android" ? 13 : 0,
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  alignRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginTop: 12,
  },
  grandTotalLabel: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "left",
    fontSize: 18,
    color: "#2c3e50",
  },
  grandTotalValue: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#2c3e50",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  calendarIcon: {
    cursor: "pointer",
  },
  amountPaidInput: {
    width: Platform.OS === "android" ? "50%" : "40%",
    height: 40,
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
  },
  bottomSection: {
    flexDirection: Platform.OS === "android" ? "column" : "row",
    justifyContent: "space-between",
    marginTop: 12,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  leftColumn: {
    width: Platform.OS === "android" ? "98%" : "48%",
  },
  rightColumn: {
    width: Platform.OS === "android" ? "98%" : "48%",
  },
  searchSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  searchInput: {
    backgroundColor: "white",
  },
  productSelectionContainer: {
    flex: 1,
    marginRight: 8,
  },
  datePickerInput: {
    height: 40,
    marginBottom: 8,
    cursor: "pointer",
  },
  webPickerContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "white",
    zIndex: 9999,
    borderRadius: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  webDatePickerContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "white",
    zIndex: 1001,
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginTop: 4,
  },
  webDatePicker: {
    width: 320,
    height: 320,
  },
  datePickerButton: {
    width: "100%",
    cursor: "pointer",
  },
  viewButton: {
    marginLeft: 8,
  },
});

export default OrderForm;
