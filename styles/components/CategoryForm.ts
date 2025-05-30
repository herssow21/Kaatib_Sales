import { StyleSheet, Platform, Dimensions } from 'react-native';

export function getCategoryFormStyles(isDark: boolean) {
  // Palette
  const textColor = isDark ? '#f5f6fa' : '#23272f';
  const bgColor = isDark ? '#181f2a' : '#f7f7fa';
  const inputBg = isDark ? '#232b3b' : '#fff';
  const listBg = isDark ? '#232b3b' : '#fff';
  const cardBorder = isDark ? '#2c3442' : '#e0e3ea';
  const borderColor = isDark ? '#444' : '#bfc4cc';
  const shadow = isDark
    ? { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }
    : { shadowColor: '#bfc4cc', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } };

  return StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      ...Platform.select({
        web: {
          borderRadius: 8,
          maxWidth: 500,
          width: 500,
          alignSelf: 'center',
          padding: 16,
        },
        default: {
          borderRadius: 0,
          maxWidth: Dimensions.get('window').width,
          width: Dimensions.get('window').width,
          padding: 12,
        },
      }),
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      position: 'relative',
      paddingRight: 0,
    },
    closeButtonContainer: {
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 20,
    },
    title: {
      fontWeight: 'bold',
      fontSize: Platform.OS === 'web' ? 28 : 22,
      color: textColor,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      backgroundColor: '#D32F2F',
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    inputSection: {
      marginBottom: 20,
    },
    listSection: {
      marginTop: 8,
    },
    listTitle: {
      marginBottom: 12,
      fontWeight: '600',
      color: textColor,
    },
    categoryItem: {
      marginBottom: 8,
      backgroundColor: listBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: cardBorder,
      ...shadow,
      minHeight: 44,
    },
    categoryContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      flexWrap: 'nowrap',
    },
    categoryText: {
      fontSize: Platform.OS === 'web' ? 18 : 15,
      flex: 1,
      marginRight: Platform.OS === 'web' ? 8 : 4,
      color: textColor,
    },
    actions: {
      flexDirection: 'row',
      gap: Platform.OS === 'web' ? 8 : 3,
    },
    actionButton: {
      marginHorizontal: Platform.OS === 'web' ? 2 : 3,
      paddingHorizontal: Platform.OS === 'web' ? 8 : 6,
      minWidth: Platform.OS === 'web' ? undefined : 40,
    },
    actionButtonLabel: {
      fontSize: Platform.OS === 'web' ? 20 : 18,
      color: textColor,
    },
    deleteButton: {
      borderColor: 'transparent',
    },
    input: {
      marginBottom: 16,
      backgroundColor: isDark ? '#232b3b' : '#fff',
      color: isDark ? '#f5f6fa' : '#23272f',
      borderRadius: 10,
      height: Platform.OS === 'web' ? 48 : 45,
      fontSize: Platform.OS === 'web' ? 17 : 15,
      borderWidth: 1.2,
      borderColor: isDark ? '#444' : '#bfc4cc',
    },
    button: {
      height: Platform.OS === 'web' ? 48 : 45,
      justifyContent: 'center',
      borderRadius: 24,
    },
    list: {
      ...Platform.select({
        web: {
          maxHeight: 160,
          overflowY: 'scroll',
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? '#444 #232b3b' : '#bfc4cc #f7f7fa',
        },
        default: {
          maxHeight: 290,
          minHeight: 44,
          // For mobile, always show vertical scroll
        },
      }),
    },
  });
} 