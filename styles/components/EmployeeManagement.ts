import { StyleSheet, Platform } from 'react-native';
import { modalStyles } from './ModalStyles';

export const employeeManagementStyles = StyleSheet.create({
  ...modalStyles,
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subheaderText: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  addButtonContainer: {
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2196f3',
    borderRadius: 8,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerCell: {
    fontWeight: '600',
    color: '#495057',
  },
  nameCell: {
    flex: 2,
  },
  contactCell: {
    flex: 2,
  },
  addressCell: {
    flex: 2,
  },
  ordersCell: {
    flex: 1,
  },
  actionsCell: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  // Mobile styles
  containerMobile: {
    padding: 12,
  },
  headerMobile: {
    marginBottom: 16,
  },
  headerTextMobile: {
    fontSize: 20,
  },
  subheaderTextMobile: {
    fontSize: 12,
  },
  cardMobile: {
    padding: 12,
  },
  avatarMobile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nameMobile: {
    fontSize: 14,
  },
  roleMobile: {
    fontSize: 12,
  },
  metaMobile: {
    fontSize: 11,
  },
  tableHeaderMobile: {
    display: 'none',
  },
  // Form styles
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  required: {
    color: '#D32F2F',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
}); 