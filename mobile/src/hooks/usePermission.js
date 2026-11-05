import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const usePermission = (permission) => {
  const [status, setStatus] = useState('unavailable');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    setLoading(true);
    try {
      let result;
      if (Platform.OS === 'ios') {
        result = await check(permission);
      } else {
        result = await PermissionsAndroid.check(permission);
      }
      setStatus(result === 'granted' || result === RESULTS.GRANTED ? 'granted' : 'denied');
    } catch (error) {
      setStatus('unavailable');
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    setLoading(true);
    try {
      let result;
      if (Platform.OS === 'ios') {
        result = await request(permission);
      } else {
        result = await PermissionsAndroid.request(permission);
      }
      const granted = result === 'granted' || result === RESULTS.GRANTED;
      setStatus(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      setStatus('unavailable');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, requestPermission, checkPermission };
};