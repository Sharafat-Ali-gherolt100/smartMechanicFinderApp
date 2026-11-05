import { Alert } from 'react-native';

export const NotificationService = {
  showNotification: (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  },
  requestPermissions: async () => {
    return true;
  },
};

export default NotificationService;
