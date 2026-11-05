import { Alert } from 'react-native';

export class ErrorHandler {
  static handle = (error, context = '') => {
    console.error(`Error in ${context}:`, error);

    // Network errors
    if (error.message?.includes('Network')) {
      return {
        title: 'Network Error',
        message: 'Please check your internet connection and try again.',
        type: 'error',
      };
    }

    // Authentication errors
    if (error.status === 401 || error.message?.includes('unauthorized')) {
      return {
        title: 'Session Expired',
        message: 'Please login again to continue.',
        type: 'error',
      };
    }

    // Server errors
    if (error.status === 500) {
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        type: 'error',
      };
    }

    // Validation errors
    if (error.status === 400) {
      return {
        title: 'Validation Error',
        message: error.message || 'Please check your input and try again.',
        type: 'warning',
      };
    }

    // Default error
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      type: 'error',
    };
  };

  static showAlert = (error, context = '') => {
    const handled = ErrorHandler.handle(error, context);
    Alert.alert(handled.title, handled.message, [{ text: 'OK' }]);
    return handled;
  };

  static logError = (error, context = '') => {
    // Send to analytics or logging service
    console.error(`[${context}]`, error);
    // Here you could send to Sentry or similar service
  };
}

export const withErrorHandler = (fn, context) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.showAlert(error, context);
      ErrorHandler.logError(error, context);
      throw error;
    }
  };
};