import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { TextInput, Button, Text, Title } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { useInventoryContext } from "../contexts/InventoryContext";

interface OrderItem {
  product: string;
  rate: number;
  quantity: number;
}

interface Order {
  orderDate: string;
  clientName: string;
  clientContact: string;
  address: string;
  items: OrderItem[];
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  status: string;
}

// Mock function to simulate fetching client data
const fetchClientByContact = (contact: string) => {
  const clients = [
    { contact: "1234567890", name: "John Doe" },
    { contact: "0987654321", name: "Jane Smith" },
  ];
  return clients.find((client) => client.contact === contact);
};

const OrderForm: React.FC<{
  onSubmit: (order: Order) => void;
  onClose: () => void;
}> = ({ onSubmit, onClose }) => {
  const { items: inventoryItems } = useInventoryContext();
  const [orderDate, setOrderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { product: "", rate: 0, quantity: 0 },
  ]);
  const [discount, setDiscount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [status, setStatus] = useState("Partial");

  // Replace the static products array
  const products = inventoryItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.sellingPrice,
  }));

  useEffect(() => {
    // Check if the client exists when the contact changes
    const client = fetchClientByContact(clientContact);
    if (client) {
      setClientName(client.name);
    } else {
      setClientName("");
    }
  }, [clientContact]);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || orderDate;
    setShowDatePicker(false);
    setOrderDate(currentDate);
  };

  const handleAddItem = () => {
    setItems([...items, { product: "", rate: 0, quantity: 0 }]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "rate" || field === "quantity") {
      const numValue = value === "" ? 0 : Number(value);
      newItems[index] = {
        ...newItems[index],
        [field]: isNaN(numValue) ? 0 : numValue,
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleReset = () => {
    setItems([{ product: "", rate: 0, quantity: 0 }]);
    setDiscount("");
    setClientName("");
    setClientContact("");
    setAddress("");
    setPaymentMethod("Cash");
    setStatus("Partial");
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const validatePhoneNumber = (phone: string) => {
    // Check if phone starts with 0 (10 digits) or not (9 digits)
    if (phone.startsWith("0")) {
      return phone.length === 10 && /^0[17]\d{8}$/.test(phone);
    }
    return phone.length === 9 && /^[17]\d{8}$/.test(phone);
  };

  const showError = (message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("Error", message);
    }
  };

  const handleSubmit = () => {
    if (!clientName.trim()) {
      showError("Client name is required");
      return;
    }

    if (!clientContact.trim()) {
      showError("Client contact is required");
      return;
    }

    if (!validatePhoneNumber(clientContact)) {
      showError("Please enter a valid Kenyan phone number");
      return;
    }

    if (items.length === 0) {
      showError("Please add at least one item");
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.product) {
        showError("Please select a product for all items");
        return;
      }
      if (isNaN(item.rate) || item.rate <= 0) {
        showError("Please enter valid rates for all items");
        return;
      }
      if (isNaN(item.quantity) || item.quantity <= 0) {
        showError("Please enter valid quantities for all items");
        return;
      }
    }

    // Handle discount
    const discountValue = discount ? parseFloat(discount) : 0;
    const total = items.reduce(
      (acc, item) => acc + item.rate * item.quantity,
      0
    );

    const order = {
      orderDate: orderDate.toISOString().split("T")[0],
      clientName: clientName.trim(),
      clientContact,
      address: address.trim(),
      items,
      discount: discountValue,
      grandTotal: total - discountValue,
      paymentMethod,
      status,
    };

    try {
      onSubmit(order);
      onClose();
    } catch (error) {
      showError("Failed to create order. Please try again.");
    }
  };

  const DateInput = ({
    value,
    onChange,
  }: {
    value: Date;
    onChange: (date: Date) => void;
  }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleChange = (event: any, selectedDate?: Date) => {
      setShowPicker(Platform.OS === "web");
      if (selectedDate) {
        onChange(selectedDate);
      }
    };

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Order Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <TextInput
            mode="outlined"
            style={styles.datePickerInput}
            value={value.toLocaleDateString()}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </TouchableOpacity>
        {showPicker && (
          <View
            style={
              Platform.OS === "web" ? styles.webPickerContainer : undefined
            }
          >
            <DateTimePicker
              testID="dateTimePicker"
              value={value}
              mode="date"
              onChange={handleChange}
              display={Platform.OS === "web" ? "inline" : "default"}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Create New Order</Title>
      <View style={styles.topSection}>
        <DateInput value={orderDate} onChange={setOrderDate} />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Client Contact</Text>
          <TextInput
            value={clientContact}
            onChangeText={(value) => {
              // Allow only numeric input and limit to 10 digits
              const numericValue = value.replace(/[^0-9]/g, "");
              if (numericValue.length <= 10) {
                setClientContact(numericValue);
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
            value={clientName}
            onChangeText={setClientName}
            style={styles.input}
            mode="outlined"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address (Optional)</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            mode="outlined"
          />
        </View>
      </View>

      {items.map((item, index) => (
        <View key={index} style={styles.productRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product</Text>
            <Picker
              selectedValue={item.product}
              onValueChange={(value) =>
                handleItemChange(index, "product", value)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select a product" value="" />
              {products.map((product) => (
                <Picker.Item
                  key={product.id}
                  label={product.name}
                  value={product.name}
                />
              ))}
            </Picker>
            <Text style={styles.productName}>
              {item.product.length >= 5 ? item.product : ""}
            </Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rate</Text>
            <TextInput
              value={item.rate.toString()}
              onChangeText={(value) =>
                handleItemChange(index, "rate", parseFloat(value))
              }
              keyboardType="numeric"
              style={styles.rowInput}
              mode="outlined"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              value={item.quantity.toString()}
              onChangeText={(value) =>
                handleItemChange(index, "quantity", parseInt(value))
              }
              keyboardType="numeric"
              style={styles.rowInput}
              mode="outlined"
            />
          </View>
          <TouchableOpacity onPress={() => handleDeleteItem(index)}>
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
                value={discount}
                onChangeText={(value) => {
                  const numValue = value.replace(/[^0-9.]/g, "");
                  setDiscount(numValue);
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
              {items.reduce((acc, item) => acc + item.rate * item.quantity, 0)}
            </Text>
          </View>
          <View style={styles.alignRow}>
            <Text style={styles.label}>Order Discount:</Text>
            <Text>KES {discount}</Text>
          </View>
          <View style={styles.alignRow}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>
              KES{" "}
              {items.reduce((acc, item) => acc + item.rate * item.quantity, 0) -
                (discount ? parseFloat(discount) : 0)}
            </Text>
          </View>
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.label}>Payment Method</Text>
          <Picker
            selectedValue={paymentMethod}
            onValueChange={(itemValue) => setPaymentMethod(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Cash" value="Cash" />
            <Picker.Item label="Credit" value="Credit" />
            <Picker.Item label="Debit" value="Debit" />
          </Picker>
          <Text style={styles.label}>Payment Status</Text>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Partial" value="Partial" />
            <Picker.Item label="Completed" value="Completed" />
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
    flexDirection: "column",
    marginBottom: 12,
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
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  rowInput: {
    height: 40,
    marginHorizontal: 4,
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
  dateButton: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    textAlign: "left",
  },
  picker: {
    marginBottom: 12,
    flex: 1,
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
});

export default OrderForm;
