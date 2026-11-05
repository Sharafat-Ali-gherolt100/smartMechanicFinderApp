import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // Navigation handled automatically by AppNavigator via auth state change
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error?.error || error?.message || 'Invalid email or password. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Title */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Icon name="build" size={48} color="#fff" />
          </View>
          <Text style={styles.appTitle}>GetFix</Text>
          <Text style={styles.appSubtitle}>Skardu, Gilgit-Baltistan</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {/* Email */}
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <Icon name="email" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#bdc3c7"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: null }); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* Password */}
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <Icon name="lock" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#bdc3c7"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: null }); }}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#7f8c8d"
              />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Test credentials hint */}
          <View style={styles.hintsBox}>
            <Text style={styles.hintsTitle}>Test Credentials</Text>
            <Text style={styles.hintsText}>User: user@example.com / password123</Text>
            <Text style={styles.hintsText}>Mechanic: mechanic@example.com / password123</Text>
            <Text style={styles.hintsText}>Admin: admin@example.com / password123</Text>
          </View>
        </View>

        {/* Switch to register */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onSwitchToRegister} disabled={isLoading}>
            <Text style={styles.switchLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, elevation: 6,
    shadowColor: '#3498db', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  appTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
  appSubtitle: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#dde2e7', borderRadius: 10,
    backgroundColor: '#fafafa', marginBottom: 6, paddingHorizontal: 12,
  },
  inputError: { borderColor: '#e74c3c' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 15, color: '#2c3e50' },
  eyeButton: { padding: 4 },
  errorText: { color: '#e74c3c', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  loginButton: {
    backgroundColor: '#3498db', borderRadius: 10, height: 52,
    justifyContent: 'center', alignItems: 'center', marginTop: 12,
    elevation: 3, shadowColor: '#3498db', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
  loginButtonDisabled: { opacity: 0.65 },
  loginButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  hintsBox: {
    marginTop: 20, backgroundColor: '#eaf4fb', borderRadius: 8,
    padding: 12, borderLeftWidth: 3, borderLeftColor: '#3498db',
  },
  hintsTitle: { fontSize: 13, fontWeight: 'bold', color: '#2980b9', marginBottom: 4 },
  hintsText: { fontSize: 12, color: '#2c3e50', lineHeight: 18 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchText: { color: '#7f8c8d', fontSize: 14 },
  switchLink: { color: '#3498db', fontSize: 14, fontWeight: 'bold' },
});

export default LoginForm;
