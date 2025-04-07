import { StyleSheet } from 'react-native';
import { globalStyles } from '../global';
import { spacing, colors, borderRadius } from '../../theme/theme';
import { Platform } from 'react-native';

export const orderFormStyles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    padding: spacing.sm,
  },
  title: {
    ...globalStyles.title,
    marginBottom: spacing.sm,
  },
  topSection: {
    marginBottom: spacing.sm,
  },
  inputGroup: {
    ...globalStyles.formGroup,
    flex: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  label: {
    ...globalStyles.label,
    marginBottom: spacing.xs,
  },
  input: {
    ...globalStyles.input,
    height: 40,
    marginBottom: 0,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  discountInput: {
    ...globalStyles.input,
    width: Platform.OS === 'android' ? '50%' : '40%',
    height: 40,
    marginBottom: 0,
  },
  productLabel: {
    ...globalStyles.subtitle,
    marginTop: spacing.sm,
  },
  productName: {
    ...globalStyles.caption,
  },
  itemContainer: {
    ...globalStyles.row,
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xs,
  },
  formGroup: {
    flex: 1,
    marginRight: spacing.sm,
  },
  picker: {
    minHeight: 40,
    backgroundColor: colors.input,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  button: {
    ...globalStyles.button,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  actionButton: {
    marginBottom: spacing.xs,
  },
  addButton: {
    marginTop: spacing.xs,
  },
  buttonContainer: {
    ...globalStyles.buttonContainer,
    marginTop: spacing.sm,
  },
  discountRow: {
    ...globalStyles.row,
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xs,
  },
  alignRow: {
    ...globalStyles.row,
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  grandTotalLabel: {
    ...globalStyles.subtitle,
    flex: 1,
    textAlign: 'left',
  },
  grandTotalValue: {
    ...globalStyles.subtitle,
  },
  dateInputContainer: {
    ...globalStyles.row,
  },
  dateInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  amountPaidInput: {
    ...globalStyles.input,
    width: Platform.OS === 'android' ? '50%' : '40%',
    height: 40,
    marginBottom: 0,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  bottomSection: {
    ...globalStyles.card,
    flexDirection: Platform.OS === 'android' ? 'column' : 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  leftColumn: {
    width: Platform.OS === 'android' ? '98%' : '48%',
  },
  rightColumn: {
    width: Platform.OS === 'android' ? '98%' : '48%',
  },
  searchSection: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.background,
  },
  productSelectionContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
}); 