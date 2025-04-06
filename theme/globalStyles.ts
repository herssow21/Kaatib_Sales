import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from './theme';

export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },

  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    margin: spacing.sm,
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Forms
  formGroup: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body2,
    marginBottom: spacing.xs,
    color: colors.text,
  },

  // Buttons
  button: {
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },

  // Typography
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body1,
    color: colors.text,
  },
  caption: {
    ...typography.caption,
    color: colors.disabled,
  },

  // Lists
  listItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContainer: {
    backgroundColor: colors.background,
  },

  // Modals
  modal: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.backdrop,
  },

  // Alerts
  alert: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  alertContent: {
    margin: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },

  // Utility
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  spacer: {
    height: spacing.md,
  },
  flex: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  halfWidth: {
    width: '50%',
  },
}); 