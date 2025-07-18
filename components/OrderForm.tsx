import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import { TextInput, Button, Text, Title, useTheme } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { useInventoryContext } from "../contexts/InventoryContext";
import { useCategoryContext } from "../contexts/CategoryContext";
import { useAlertContext } from "../contexts/AlertContext";
import { useCustomerLookup } from "../contexts/CustomerLookupContext";
import { generateId } from "../utils/idGenerator";
import { globalStyles } from "../theme/globalStyles";
import { spacing, colors, borderRadius } from "../theme/theme";
import { orderFormStyles } from "../styles/components/OrderForm";
import { usePaymentMethods } from "../contexts/PaymentMethodsContext";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

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

interface FieldErrors {
  quantity?: string;
  clientName?: string;
  clientContact?: string;
  items?: string;
  message?: string;
}

interface FormErrors {
  [key: string]: FieldErrors;
  general?: FieldErrors;
}

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onClose,
  initialData = null,
  orders,
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { items: inventoryItems, handleOrderSale } = useInventoryContext();
  const { categories } = useCategoryContext();
  const { showError, showSuccess, showWarning } = useAlertContext();
  const { getCustomerByPhone, createCustomer, addOrderToCustomer } =
    useCustomerLookup();
  const { methods } = usePaymentMethods();
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
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");

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
    if (balance <= 0 && grandTotal > 0) {
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
      newErrors.clientName = { message: "Please enter client name" };
    }

    if (!formData.clientContact.trim()) {
      newErrors.clientContact = { message: "Please enter client contact" };
    }

    // Check if any items have been added
    if (formData.items.length === 0) {
      newErrors.items = { message: "Please add at least one item" };
    } else {
      // Check if any items have a product selected and valid quantity
      const hasValidItems = formData.items.some(
        (item) => item.product.trim() && item.quantity > 0
      );

      if (!hasValidItems) {
        newErrors.items = {
          message:
            "Please select at least one product/service and enter a valid quantity",
        };
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      // Check if any items have a product selected and valid quantity
      const validItems = formData.items.filter(
        (item) => item.product.trim() && item.quantity > 0
      );

      if (validItems.length === 0) {
        setErrors((prev) => ({
          ...prev,
          items: {
            message:
              "Please select at least one product/service and enter a valid quantity",
          },
        }));
        return;
      }

      // Check stock availability
      const insufficientStockItems = validItems.filter((item) => {
        const inventoryItem = inventoryItems.find(
          (i) => i.name === item.product
        );
        return (
          inventoryItem &&
          inventoryItem.type === "product" &&
          inventoryItem.quantity < item.quantity
        );
      });

      if (insufficientStockItems.length > 0) {
        const newErrors: FormErrors = {};
        insufficientStockItems.forEach((item) => {
          newErrors[item.product] = {
            quantity: "Not enough stock available",
          };
        });
        setErrors(newErrors);
        return;
      }

      // Create order items array for handleOrderSale
      const orderItems = validItems
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
        items: validItems, // Only include valid items
        category: selectedCategory || "default",
        status: initialData?.status || "Pending",
        totalOrderItems: validItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        grandTotal: calculateGrandTotal(validItems, formData.discount),
      };

      // Check if customer exists, if not create them
      let customer = getCustomerByPhone(formData.clientContact);
      if (!customer) {
        customer = await createCustomer({
          name: formData.clientName,
          phone: formData.clientContact,
          address: formData.address || "",
        });
      }

      // Add order to customer's recent orders
      await addOrderToCustomer(customer.id, {
        id: newOrder.id,
        date: newOrder.orderDate,
        total: newOrder.grandTotal,
      });

      onSubmit(newOrder);
      setFormData(initialFormState); // Reset form
      showSuccess(
        `Order for ${formData.clientName} ${
          initialData ? "updated" : "added"
        } successfully!`
      );
    } catch (error) {
      console.error("Error creating order:", error);
      setErrors((prev) => ({
        ...prev,
        general: { message: "Failed to create order" },
      }));
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

  const handleClientContactChange = (value: string) => {
    // Only allow numbers and limit to 10 digits
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 10) {
      // Try to find customer by phone number
      const customer = getCustomerByPhone(numericValue);

      if (customer) {
        // Update all customer-related fields at once
        setFormData((prev) => ({
          ...prev,
          clientContact: numericValue,
          clientName: customer.name ?? "",
          address: customer.address ?? "",
        }));

        // Clear any related errors
        setErrors((prev) => ({
          ...prev,
          clientContact: undefined,
          clientName: undefined,
        }));
      } else {
        // If no customer found, only update the contact number
        setFormData((prev) => ({
          ...prev,
          clientContact: numericValue,
        }));
      }
    }
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      clientName: value,
    }));
    setErrors((prev) => ({
      ...prev,
      clientName: undefined,
    }));
  };

  // Create a custom theme that handles dark mode text colors
  const customInputTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      onSurfaceVariant: isDark ? "#FFFFFF" : "#000000", // Label color in normal state
      onSurface: isDark ? "#FFFFFF" : "#000000", // Label color when focused
      error: theme.colors.error, // Keep the error color for borders
      outline: isDark ? "#666666" : "#CCCCCC", // Normal border color
      primary: isDark ? "#FFFFFF" : "#000000", // Label and border color when focused
      text: isDark ? "#FFFFFF" : "#000000", // Input text color
    },
  };

  // Helper function to get text color based on dark mode
  const getTextColor = (isDark: boolean) => ({
    color: isDark ? "#FFFFFF" : "#000000",
  });

  return (
    <ScrollView style={orderFormStyles.container}>
      <Text style={[orderFormStyles.title, getTextColor(isDark)]}>
        {initialData ? "Edit Order" : "Add New Order"}
      </Text>
      <View style={orderFormStyles.topSection}>
        <View style={orderFormStyles.inputGroup}>
          <TextInput
            label="Order Date"
            value={orderDate}
            onFocus={toggleDatePicker}
            style={[orderFormStyles.dateInput, { backgroundColor: "#fff" }]}
            mode="outlined"
            editable={false}
            theme={customInputTheme}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            right={
              <TextInput.Icon
                icon={() => (
                  <MaterialIcons
                    name="calendar-today"
                    size={24}
                    color={isDark ? "#FFFFFF" : "#000000"}
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

        <View style={orderFormStyles.inputGroup}>
          <TextInput
            label="Client Contact"
            value={formData.clientContact}
            onChangeText={handleClientContactChange}
            style={orderFormStyles.input}
            keyboardType="numeric"
            mode="outlined"
            maxLength={10}
            error={!!errors.clientContact}
            theme={customInputTheme}
          />
          {errors.clientContact && (
            <Text style={orderFormStyles.errorText}>
              {errors.clientContact.message}
            </Text>
          )}
        </View>

        <View style={orderFormStyles.inputGroup}>
          <TextInput
            label="Client Name"
            value={formData.clientName}
            onChangeText={handleNameChange}
            style={orderFormStyles.input}
            mode="outlined"
            error={!!errors.clientName}
            theme={customInputTheme}
          />
          {errors.clientName && (
            <Text style={orderFormStyles.errorText}>
              {errors.clientName.message}
            </Text>
          )}
        </View>

        <View style={orderFormStyles.inputGroup}>
          <TextInput
            label="Address/Descriptions (Optional)"
            value={formData.address}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, address: value }))
            }
            style={orderFormStyles.input}
            mode="outlined"
            theme={customInputTheme}
          />
        </View>
      </View>

      <View style={orderFormStyles.searchSection}>
        <TextInput
          label="Search Products/Services"
          mode="outlined"
          placeholder="Type to search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={orderFormStyles.searchInput}
          theme={customInputTheme}
        />
      </View>

      {formData.items.map((item, index) => (
        <View key={index} style={orderFormStyles.itemContainer}>
          {renderProductSelection(index, item.product)}
          <View style={orderFormStyles.formGroup}>
            <TextInput
              label="Rate"
              mode="outlined"
              value={item.rate?.toString() || "0"}
              onChangeText={(value) => handleItemChange(index, "rate", value)}
              keyboardType="numeric"
              style={orderFormStyles.input}
              theme={customInputTheme}
            />
          </View>
          <View style={orderFormStyles.formGroup}>
            <TextInput
              label="Quantity"
              mode="outlined"
              value={item.quantity?.toString() || "1"}
              onChangeText={(value) => {
                handleItemChange(index, "quantity", value);
                setErrors((prev) => ({
                  ...prev,
                  [item.product]: {
                    ...prev[item.product],
                    quantity: undefined,
                  },
                }));
              }}
              keyboardType="numeric"
              style={[
                orderFormStyles.input,
                errors[item.product]?.quantity && {
                  borderColor: theme.colors.error,
                },
              ]}
              error={!!errors[item.product]?.quantity}
              theme={customInputTheme}
            />
            {errors[item.product]?.quantity && (
              <Text style={orderFormStyles.errorText}>
                {errors[item.product]?.quantity}
              </Text>
            )}
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
              <TextInput
                label="Discount"
                value={formData.discount?.toString() || "0"}
                onChangeText={handleDiscountChange}
                keyboardType="numeric"
                style={orderFormStyles.discountInput}
                mode="outlined"
                theme={customInputTheme}
              />
            </View>
          </View>
          <View style={orderFormStyles.alignRow}>
            <Text style={[orderFormStyles.label, getTextColor(isDark)]}>
              Subtotal:
            </Text>
            <Text style={getTextColor(isDark)}>
              KES{" "}
              {formData.items.reduce(
                (acc, item) => acc + item.rate * item.quantity,
                0
              )}
            </Text>
          </View>
          <View style={orderFormStyles.alignRow}>
            <Text style={[orderFormStyles.label, getTextColor(isDark)]}>
              Order Discount:
            </Text>
            <Text style={getTextColor(isDark)}>KES {formData.discount}</Text>
          </View>
          <View style={orderFormStyles.alignRow}>
            <Text
              style={[orderFormStyles.grandTotalLabel, getTextColor(isDark)]}
            >
              Grand Total:
            </Text>
            <Text
              style={[orderFormStyles.grandTotalValue, getTextColor(isDark)]}
            >
              KES{" "}
              {formData.items.reduce(
                (acc, item) => acc + item.rate * item.quantity,
                0
              ) - (formData.discount ? formData.discount : 0)}
            </Text>
          </View>

          <View style={orderFormStyles.alignRow}>
            <Text style={[orderFormStyles.label, getTextColor(isDark)]}>
              Balance:
            </Text>
            <Text
              style={[orderFormStyles.grandTotalValue, getTextColor(isDark)]}
            >
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
            <TextInput
              label="Amount Paid"
              mode="outlined"
              value={amountPaid.toString()}
              onChangeText={handlePaidAmountChange}
              keyboardType="numeric"
              style={orderFormStyles.amountPaidInput}
              theme={customInputTheme}
            />
          </View>

          <Text style={[orderFormStyles.label, getTextColor(isDark)]}>
            Payment Method
          </Text>
          <Picker
            selectedValue={formData.paymentMethod}
            onValueChange={(itemValue) =>
              setFormData((prev) => ({ ...prev, paymentMethod: itemValue }))
            }
            style={[orderFormStyles.picker, getTextColor(isDark)]}
          >
            {methods.map((method) => (
              <Picker.Item
                key={method.id}
                label={method.type}
                value={method.type}
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            ))}
          </Picker>
          <Text style={[orderFormStyles.label, getTextColor(isDark)]}>
            Payment Status
          </Text>
          <Picker
            selectedValue={formData.paymentStatus}
            onValueChange={(itemValue) =>
              setFormData((prev) => ({ ...prev, paymentStatus: itemValue }))
            }
            style={[orderFormStyles.picker, getTextColor(isDark)]}
          >
            <Picker.Item
              label="No Payment"
              value="No Payment"
              color={isDark ? "#FFFFFF" : "#000000"}
            />
            <Picker.Item
              label="Partial"
              value="Partial"
              color={isDark ? "#FFFFFF" : "#000000"}
            />
            <Picker.Item
              label="Completed"
              value="Completed"
              color={isDark ? "#FFFFFF" : "#000000"}
            />
            <Picker.Item
              label="Closed"
              value="Closed"
              color={isDark ? "#FFFFFF" : "#000000"}
            />
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

      {errors.items && (
        <Text style={[orderFormStyles.errorText, { textAlign: "center" }]}>
          {errors.items.message}
        </Text>
      )}
    </ScrollView>
  );
};

export default OrderForm;
