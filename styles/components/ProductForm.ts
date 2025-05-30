import { StyleSheet, Platform } from 'react-native';
import { modalStyles } from "./ModalStyles";

export const productFormStyles = StyleSheet.create({
  ...modalStyles,
  container: {
    maxWidth: 500,
    marginHorizontal: "auto",
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: Platform.OS === "web" ? 24 : 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
  },
  closeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    color: '#D32F2F',
  },
  input: {
    backgroundColor: 'white',
    height: Platform.OS === 'web' ? undefined : 45,
  },
  picker: {
    backgroundColor: 'white',
    height: Platform.OS === 'web' ? undefined : 45,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    height: Platform.OS === 'web' ? undefined : 45,
    justifyContent: 'center',
  },
  cancelButton: {
    borderColor: '#666',
  },
  cancelText: {
    color: '#666',
  },
  createButton: {
    backgroundColor: '#2196f3',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
  },
}); 