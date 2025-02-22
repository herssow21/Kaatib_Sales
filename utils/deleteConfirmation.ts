import { Platform, Alert } from 'react-native';

export const showDeleteConfirmation = (
  itemType: string,
  onConfirm: () => void
) => {
  const message = `Are you sure you want to delete this ${itemType}?`;

  if (Platform.OS === 'web') {
    if (window.confirm(message)) {
      onConfirm();
    }
  } else {
    Alert.alert(
      `Delete ${itemType}`,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: onConfirm,
          style: 'destructive'
        }
      ]
    );
  }
}; 