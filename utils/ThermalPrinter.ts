import { Platform } from 'react-native';
import NetPrinter from 'react-native-thermal-printer';

interface PrintConfig {
  payload: string;
  host?: string;
  port?: number;
  timeout?: number;
  width?: number;
}

class ThermalPrinter {
  static async printBluetooth({ payload }: PrintConfig): Promise<void> {
    if (Platform.OS === 'web') {
      throw new Error('Bluetooth printing is not supported on web platform');
    }

    try {
      // Get list of paired Bluetooth printers
      const devices = await NetPrinter.getBluetoothDeviceList();
      
      if (!devices || devices.length === 0) {
        throw new Error('No Bluetooth printers found. Please pair a printer first.');
      }

      // Use the first available printer
      const printer = devices[0];

      // Print using Bluetooth connection
      await NetPrinter.printBluetooth({
        payload,
        printerNbrCharactersPerLine: 32, // Default for 58mm printer
        printerDpi: 203,
        printerWidthMM: 58,
        ...printer
      });
    } catch (error) {
      console.error('Bluetooth print error:', error);
      throw new Error(error.message || 'Failed to print via Bluetooth');
    }
  }

  static async printTcp({ payload, host, port = 9100, timeout = 5000, width = 32 }: PrintConfig): Promise<void> {
    if (Platform.OS === 'web') {
      throw new Error('TCP printing is not supported on web platform');
    }

    if (!host) {
      throw new Error('Printer IP address is required for TCP printing');
    }

    try {
      // Print using TCP connection
      await NetPrinter.printTcp({
        payload,
        ip: host,
        port,
        timeout,
        printerWidthMM: width === 32 ? 58 : 80, // 58mm or 80mm printer
        printerDpi: 203, // Standard DPI
        printerNbrCharactersPerLine: width,
      });
    } catch (error) {
      console.error('TCP print error:', error);
      throw new Error(error.message || 'Failed to print via TCP/IP');
    }
  }

  static async print(config: PrintConfig): Promise<void> {
    // If host is provided, use TCP printing, otherwise try Bluetooth
    if (config.host) {
      return this.printTcp(config);
    } else {
      return this.printBluetooth(config);
    }
  }
}

export default ThermalPrinter; 