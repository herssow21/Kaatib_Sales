import { StyleSheet } from 'react-native';

export const customerManagementStyles = StyleSheet.create({
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
    flex: 3,
  },
  ordersCell: {
    flex: 1,
    alignItems: 'center',
  },
  actionsCell: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  cell: {
    fontSize: 14,
    color: '#212529',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    margin: 16,
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 8,
  },
  modalButton: {
    minWidth: 100,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
  },
  recentOrdersSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  orderItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
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
  tableHeaderMobile: {
    display: 'none',
  },
  rowMobile: {
    padding: 12,
  },
  cellMobile: {
    fontSize: 12,
  },
}); 