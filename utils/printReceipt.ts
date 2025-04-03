import ThermalPrinter from 'react-native-thermal-printer';
import { Platform } from 'react-native';
import { type Order } from "../app/types";

interface OrderItem {
  product: string;
  rate: number;
  quantity: number;
}

interface PrinterConfig {
  width?: number;
}

const STORE_INFO = {
  name: "ACME STORE",
  address: "123 Main Street, Anytown",
  phone: "(555) 123-4567",
  website: "www.acmestore.com"
};

export async function printReceipt(
  order: Order,
  cashierName: string,
  config: PrinterConfig = { width: 32 }
): Promise<string> {
  const width = config.width || 32;
  const center = (text: string) => {
    const padding = Math.max(0, width - text.length) / 2;
    return " ".repeat(Math.floor(padding)) + text + " ".repeat(Math.ceil(padding));
  };

  const line = "-".repeat(width);
  const doubleLine = "=".repeat(width);

  let receipt = "";
  
  // Header
  receipt += center("KAATIB SALES") + "\n";
  receipt += center("Receipt") + "\n";
  receipt += doubleLine + "\n";
  
  // Order details
  receipt += `Order: ${order.id}\n`;
  receipt += `Date: ${new Date(order.orderDate).toLocaleString()}\n`;
  receipt += line + "\n";
  
  // Customer details
  receipt += `Customer: ${order.clientName}\n`;
  receipt += `Contact: ${order.clientContact}\n`;
  if (order.address) {
    receipt += `Address: ${order.address}\n`;
  }
  receipt += line + "\n";
  
  // Items
  receipt += "Items:\n";
  receipt += line + "\n";
  order.items.forEach((item) => {
    receipt += `${item.product}\n`;
    receipt += `${item.quantity} x ${item.rate} = ${item.quantity * item.rate}\n`;
  });
  receipt += line + "\n";
  
  // Totals
  const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  receipt += `Subtotal: ${subtotal}\n`;
  if (order.discount > 0) {
    receipt += `Discount: ${order.discount}\n`;
  }
  receipt += `Grand Total: ${order.grandTotal}\n`;
  receipt += line + "\n";
  
  // Payment details
  receipt += `Payment Method: ${order.paymentMethod}\n`;
  receipt += `Payment Status: ${order.paymentStatus}\n`;
  receipt += doubleLine + "\n";
  
  // Footer
  receipt += center("Thank you for your business!") + "\n";
  receipt += center(`Served by: ${cashierName}`) + "\n";
  receipt += "\n\n\n"; // Paper feed
  
  return receipt;
}

export async function printReceiptDirect(order: Order, servedBy: string = "", printerConfig?: { ip: string; port: number }) {
  try {
    // Format the date
    const date = new Date(order.orderDate);
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Calculate subtotal
    const subtotal = order.items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
    
    // Calculate tax (you can adjust the tax rate as needed)
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;

    // Format the receipt content with ESC/POS commands
    const receipt = [
      '\x1B\x61\x01', // Center alignment
      `${STORE_INFO.name}\n`,
      `${STORE_INFO.address}\n`,
      `${STORE_INFO.phone}\n`,
      `${formattedDate}\n`,
      '\x1B\x61\x00', // Left alignment
      '----------------------------------------\n',
      `Receipt: ${order.id}\n`,
      `Customer: ${order.clientName}\n`,
      `Phone no.: ${order.clientContact}\n`,
      '----------------------------------------\n',
      // Items
      ...order.items.map(item => 
        `${item.product} x${item.quantity}${' '.repeat(32 - item.product.length - item.quantity.toString().length - (item.rate * item.quantity).toFixed(2).length)}$${(item.rate * item.quantity).toFixed(2)}\n`
      ),
      '----------------------------------------\n',
      `Subtotal:${' '.repeat(32 - 'Subtotal:'.length - subtotal.toFixed(2).length)}$${subtotal.toFixed(2)}\n`,
      `Tax:${' '.repeat(32 - 'Tax:'.length - tax.toFixed(2).length)}$${tax.toFixed(2)}\n`,
      '\x1B\x45\x01', // Bold ON
      `TOTAL:${' '.repeat(32 - 'TOTAL:'.length - order.grandTotal.toFixed(2).length)}$${order.grandTotal.toFixed(2)}\n`,
      '\x1B\x45\x00', // Bold OFF
      `Balance:${' '.repeat(32 - 'Balance:'.length - (0).toFixed(2).length)}$${(0).toFixed(2)}\n`,
      '----------------------------------------\n',
      `Payment Method: ${order.paymentMethod}\n`,
      `Served by: ${servedBy}\n`,
      '\n',
      '\x1B\x61\x01', // Center alignment
      'Thank you for your purchase!\n',
      'Please keep this receipt for your records\n',
      `${STORE_INFO.website}\n`,
      '\n\n\n\n', // Paper feed
      '\x1B\x69', // Cut paper
    ].join('');

    // Print using Bluetooth or TCP based on platform
    if (Platform.OS === 'android') {
      // For Android, use Bluetooth printing
      const devices = await ThermalPrinter.getBluetoothDeviceList();
      if (devices.length === 0) {
        throw new Error('No Bluetooth printer found');
      }
      
      await ThermalPrinter.printBluetooth({
        payload: receipt,
        ...ThermalPrinter.defaultConfig,
      });
    } else {
      // For iOS/Web, use network printing
      await ThermalPrinter.printTcp({
        payload: receipt,
        ...ThermalPrinter.defaultConfig,
      });
    }

    return true;
  } catch (error) {
    console.error('Printing error:', error);
    throw error;
  }
} 