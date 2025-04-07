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
import { generateId } from "../utils/idGenerator";
import { globalStyles } from "../theme/globalStyles";
import { spacing, colors, borderRadius } from "../theme/theme";
import { orderFormStyles } from "../styles/components/OrderForm";

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

const calculateGrandTotal = (
  items: Array<{ quantity: number; rate: number }>,
  discount: number
) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  return subtotal - (discount || 0);
};

interface FormErrors {
  clientName?: string;
  clientContact?: string;
  items?: string;
  [key: string]: string | undefined;
}

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onClose,
  initialData = null,
  orders,
}) => {
  const theme = useTheme();
  const { items: inventoryItems, handleOrderSale } = useInventoryContext();
  const { categories } = useCategoryContext();
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
  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    if (field === "rate" || field === "quantity") {
      // Remove non-numeric characters except decimal point
      let numericValue = value.replace(/[^0-9.]/g, "");

      // Handle leading zeros
      if (
        numericValue.length > 1 &&
        numericValue.startsWith("0") &&
        !numericValue.startsWith("0.")
      ) {
        numericValue = numericValue.replace(/^0+/, "");
      }

      // Ensure only one decimal point
      const parts = numericValue.split(".");
      if (parts.length > 2) {
        numericValue = parts[0] + "." + parts.slice(1).join("");
      }

      // Limit to 2 decimal places
      if (parts.length === 2) {
        numericValue = parts[0] + "." + parts[1].slice(0, 2);
      }

      // If the value is empty or just a decimal point, set it to "0"
      if (numericValue === "" || numericValue === ".") {
        numericValue = "0";
      }

      newItems[index] = {
        ...newItems[index],
        [field]: parseFloat(numericValue),
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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Please enter client name";
    }

    if (!formData.clientContact.trim()) {
      newErrors.clientContact = "Please enter client contact";
    }

    if (formData.items.length === 0) {
      newErrors.items = "Please add at least one item";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Check stock availability only for products (not services)
      const insufficientStock = formData.items.some((item) => {
        const inventoryItem = inventoryItems.find(
          (i) => i.name === item.product
        );
        // Only check stock for products, not services
        return (
          inventoryItem &&
          inventoryItem.type === "product" &&
          inventoryItem.quantity < item.quantity
        );
      });

      if (insufficientStock) {
        showError("Not enough stock for one or more products");
        return;
      }

      // Create order items array for handleOrderSale
      const orderItems = formData.items
        .map((item) => {
          const inventoryItem = inventoryItems.find(
            (i) => i.name === item.product
          );
          return {
            itemId: inventoryItem?.id || "",
            quantity: item.quantity,
            previousQuantity: initialData
              ? initialData.items.find((i) => i.product === item.product)
                  ?.quantity
              : undefined,
          };
        })
        .filter((item) => item.itemId); // Filter out any items not found in inventory

      // Update inventory stock using handleOrderSale
      handleOrderSale(orderItems);

      const newOrder = {
        id: initialData?.id || generateId(),
        ...formData,
        category: selectedCategory || "default",
        status: initialData?.status || "Pending",
        totalOrderItems: formData.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        grandTotal: calculateGrandTotal(formData.items, formData.discount),
      };

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
    <View style={orderFormStyles.productSelectionContainer}>
      <Picker
        selectedValue={selectedProduct}
        onValueChange={(value) => handleProductChange(value, index)}
        style={orderFormStyles.picker}
      >
        <Picker.Item label="Select a product/service" value="" />
        {filteredItems.map((item) => (
          <Picker.Item
            key={item.id}
            label={`${item.name} (${item.category})`}
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

  const handleQuantityChange = (itemId: string, text: string) => {
    // Remove non-numeric characters except decimal point
    let numericValue = text.replace(/[^0-9.]/g, "");

    // Handle leading zeros
    if (
      numericValue.length > 1 &&
      numericValue.startsWith("0") &&
      !numericValue.startsWith("0.")
    ) {
      numericValue = numericValue.replace(/^0+/, "");
    }

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      numericValue = parts[0] + "." + parts[1].slice(0, 2);
    }

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product === itemId
          ? { ...item, quantity: parseFloat(numericValue) }
          : item
      ),
    }));
  };

  const handlePriceChange = (
    itemId: string,
    text: string,
    type: "buying" | "selling"
  ) => {
    // Remove non-numeric characters except decimal point
    let numericValue = text.replace(/[^0-9.]/g, "");

    // Handle leading zeros
    if (
      numericValue.length > 1 &&
      numericValue.startsWith("0") &&
      !numericValue.startsWith("0.")
    ) {
      numericValue = numericValue.replace(/^0+/, "");
    }

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      numericValue = parts[0] + "." + parts[1].slice(0, 2);
    }

    if (type === "buying") {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.product === itemId
            ? { ...item, rate: parseFloat(numericValue) }
            : item
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.product === itemId
            ? { ...item, rate: parseFloat(numericValue) }
            : item
        ),
      }));
    }
  };

  const handleDiscountChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    let numericValue = text.replace(/[^0-9.]/g, "");

    // Handle leading zeros
    if (
      numericValue.length > 1 &&
      numericValue.startsWith("0") &&
      !numericValue.startsWith("0.")
    ) {
      numericValue = numericValue.replace(/^0+/, "");
    }

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      numericValue = parts[0] + "." + parts[1].slice(0, 2);
    }

    const numValue = numericValue === "" ? 0 : parseFloat(numericValue);
    setFormData((prev) => ({
      ...prev,
      discount: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handlePaidAmountChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    let numericValue = text.replace(/[^0-9.]/g, "");

    // Handle leading zeros
    if (
      numericValue.length > 1 &&
      numericValue.startsWith("0") &&
      !numericValue.startsWith("0.")
    ) {
      numericValue = numericValue.replace(/^0+/, "");
    }

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      numericValue = parts[0] + "." + parts[1].slice(0, 2);
    }

    const numValue = numericValue === "" ? 0 : parseFloat(numericValue);
    setAmountPaid(isNaN(numValue) ? 0 : numValue);
  };

  return (
    <ScrollView style={orderFormStyles.container}>
      <Text style={orderFormStyles.title}>
        {initialData ? "Edit Order" : "Add New Order"}
      </Text>
      <View style={orderFormStyles.topSection}>
        <View style={orderFormStyles.inputGroup}>
          <Text style={orderFormStyles.label}>Order Date</Text>
          <View style={orderFormStyles.dateInputContainer}>
            <TextInput
              value={orderDate}
              onFocus={toggleDatePicker}
              style={orderFormStyles.dateInput}
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
        <View style={orderFormStyles.inputGroup}>
          <Text style={orderFormStyles.label}>Client Contact</Text>
          <TextInput
            value={formData.clientContact}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, "");
              if (numericValue.length <= 10) {
                setFormData((prev) => ({
                  ...prev,
                  clientContact: numericValue,
                }));
                setErrors((prev) => ({ ...prev, clientContact: undefined }));
              }
            }}
            style={orderFormStyles.input}
            keyboardType="numeric"
            mode="outlined"
            maxLength={10}
          />
          {errors.clientContact && (
            <Text style={orderFormStyles.errorText}>
              {errors.clientContact}
            </Text>
          )}
        </View>
        <View style={orderFormStyles.inputGroup}>
          <Text style={orderFormStyles.label}>Client Name</Text>
          <TextInput
            value={formData.clientName}
            onChangeText={(value) => {
              setFormData((prev) => ({ ...prev, clientName: value }));
              setErrors((prev) => ({ ...prev, clientName: undefined }));
            }}
            style={orderFormStyles.input}
            mode="outlined"
          />
          {errors.clientName && (
            <Text style={orderFormStyles.errorText}>{errors.clientName}</Text>
          )}
        </View>
        <View style={orderFormStyles.inputGroup}>
          <Text style={orderFormStyles.label}>
            Address/Descriptions (Optional)
          </Text>
          <TextInput
            value={formData.address}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, address: value }))
            }
            style={orderFormStyles.input}
            mode="outlined"
          />
        </View>
      </View>

      <View style={orderFormStyles.searchSection}>
        <Text style={orderFormStyles.label}>Search Products/Services</Text>
        <TextInput
          mode="outlined"
          placeholder="Type to search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={orderFormStyles.searchInput}
        />
      </View>

      {formData.items.map((item, index) => (
        <View key={index} style={orderFormStyles.itemContainer}>
          {renderProductSelection(index, item.product)}
          <View style={orderFormStyles.formGroup}>
            <Text style={orderFormStyles.label}>Rate</Text>
            <TextInput
              mode="outlined"
              value={item.rate?.toString() || "0"}
              onChangeText={(value) => handleItemChange(index, "rate", value)}
              keyboardType="numeric"
              style={orderFormStyles.input}
            />
          </View>
          <View style={orderFormStyles.formGroup}>
            <Text style={orderFormStyles.label}>Quantity</Text>
            <TextInput
              mode="outlined"
              value={item.quantity?.toString() || "1"}
              onChangeText={(value) =>
                handleItemChange(index, "quantity", value)
              }
              keyboardType="numeric"
              style={orderFormStyles.input}
            />
          </View>
          <TouchableOpacity
            style={orderFormStyles.deleteButton}
            onPress={() => handleDeleteItem(index)}
          >
            <MaterialIcons name="delete" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      <Button
        mode="outlined"
        onPress={handleAddItem}
        style={orderFormStyles.addButton}
      >
        Add Another Product/Service
      </Button>

      <View style={orderFormStyles.bottomSection}>
        <View style={orderFormStyles.leftColumn}>
          <View style={orderFormStyles.inputGroup}>
            <View style={orderFormStyles.discountRow}>
              <Text style={orderFormStyles.label}>Discount</Text>
              <TextInput
                value={formData.discount?.toString() || "0"}
                onChangeText={handleDiscountChange}
                keyboardType="numeric"
                style={orderFormStyles.discountInput}
                mode="outlined"
              />
            </View>
          </View>
          <View style={orderFormStyles.alignRow}>
            <Text style={orderFormStyles.label}>Subtotal:</Text>
            <Text>
              KES{" "}
              {formData.items.reduce(
                (acc, item) => acc + item.rate * item.quantity,
                0
              )}
            </Text>
          </View>
          <View style={orderFormStyles.alignRow}>
            <Text style={orderFormStyles.label}>Order Discount:</Text>
            <Text>KES {formData.discount}</Text>
          </View>
          <View style={orderFormStyles.alignRow}>
            <Text style={orderFormStyles.grandTotalLabel}>Grand Total:</Text>
            <Text style={orderFormStyles.grandTotalValue}>
              KES{" "}
              {formData.items.reduce(
                (acc, item) => acc + item.rate * item.quantity,
                0
              ) - (formData.discount ? formData.discount : 0)}
            </Text>
          </View>

          <View style={orderFormStyles.alignRow}>
            <Text style={orderFormStyles.label}>Balance:</Text>
            <Text style={orderFormStyles.grandTotalValue}>
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

        <View style={orderFormStyles.rightColumn}>
          <View style={orderFormStyles.alignRow}>
            <Text style={orderFormStyles.label}>Amount Paid:</Text>
            <TextInput
              mode="outlined"
              value={amountPaid.toString()}
              onChangeText={handlePaidAmountChange}
              keyboardType="numeric"
              style={orderFormStyles.amountPaidInput}
            />
          </View>

          <Text style={orderFormStyles.label}>Payment Method</Text>
          <Picker
            selectedValue={formData.paymentMethod}
            onValueChange={(itemValue) =>
              setFormData((prev) => ({ ...prev, paymentMethod: itemValue }))
            }
            style={orderFormStyles.picker}
          >
            <Picker.Item label="Cash" value="Cash" />
            <Picker.Item label="Credit" value="Credit" />
            <Picker.Item label="Debit" value="Debit" />
          </Picker>
          <Text style={orderFormStyles.label}>Payment Status</Text>
          <Picker
            selectedValue={formData.paymentStatus}
            onValueChange={(itemValue) =>
              setFormData((prev) => ({ ...prev, paymentStatus: itemValue }))
            }
            style={orderFormStyles.picker}
          >
            <Picker.Item label="No Payment" value="No Payment" />
            <Picker.Item label="Partial" value="Partial" />
            <Picker.Item label="Completed" value="Completed" />
            <Picker.Item label="Closed" value="Closed" />
          </Picker>
        </View>
      </View>

      <View style={orderFormStyles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleReset}
          style={[orderFormStyles.button, orderFormStyles.actionButton]}
        >
          Reset
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[orderFormStyles.button, orderFormStyles.actionButton]}
        >
          Save Order
        </Button>
      </View>
      {/* <Button onPress={handleClose}>Cancel</Button> */}

      {errors.items && (
        <Text style={[orderFormStyles.errorText, { textAlign: "center" }]}>
          {errors.items}
        </Text>
      )}
    </ScrollView>
  );
};

export default OrderForm;
