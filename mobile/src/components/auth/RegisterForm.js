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
import { validators, validateForm } from '../../utils/validators';
import { AuthService } from '../../services/api';

async function getLocationName(lat, lng) {
  if (lat === '' || lng === '' || lat === null || lng === null) return '';
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  if (isNaN(parsedLat) || isNaN(parsedLng)) return '';

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${parsedLat},${parsedLng}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results[0]?.formatted_address) {
        return data.results[0].formatted_address;
      }
    } catch (e) {
      console.warn('Google Maps geocoding error:', e);
    }
  }

  // Fallback to OpenStreetMap Nominatim reverse geocoder
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${parsedLat}&lon=${parsedLng}&format=json`,
      { headers: { 'User-Agent': 'GetFix/1.0' } }
    );
    const data = await response.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Skardu';
      const state = data.address.state || data.address.region || 'Gilgit-Baltistan';
      return `${city}, ${state}`;
    } else if (data && data.display_name) {
      const parts = data.display_name.split(',');
      if (parts.length >= 2) {
        return `${parts[0].trim()}, ${parts[1].trim()}`;
      }
      return data.display_name;
    }
  } catch (e) {
    console.warn('Nominatim geocoding error:', e);
  }

  if (Math.abs(parsedLat - 35.2973) < 1.0 && Math.abs(parsedLng - 75.6333) < 1.0) {
    return 'Skardu, Gilgit-Baltistan';
  }
  return 'Unknown location';
}

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user', // 'user', 'mechanic'
    shopName: '',
    address: '',
    latitude: '',
    longitude: '',
    locationName: '',
    services: '',
    cnicNumber: '',
    certificateTitle: '',
    cnicDocumentUrl: '',
    certificateDocumentUrl: '',
    profilePhotoUrl: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'latitude' || field === 'longitude') {
        const lat = field === 'latitude' ? value : prev.latitude;
        const lng = field === 'longitude' ? value : prev.longitude;
        if (lat && lng) {
          triggerGeocode(lat, lng);
        }
      }
      return updated;
    });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const triggerGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const areaName = await getLocationName(lat, lng);
      setFormData((prev) => ({ ...prev, locationName: areaName }));
    } catch (e) {
      console.error('Geocoding failed:', e);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleDetectLocation = async () => {
    const defaultLat = '35.2973';
    const defaultLng = '75.6333';
    setFormData((prev) => ({ ...prev, latitude: defaultLat, longitude: defaultLng }));
    await triggerGeocode(defaultLat, defaultLng);
  };

  const validateStep1 = () => {
    const fields = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone,
    };
    
    const validatorMap = {
      name: validators.name,
      email: validators.email,
      password: validators.password,
      confirmPassword: (value) => validators.confirmPassword(formData.password, value),
      phone: validators.phone,
    };
    
    const { errors: validationErrors, isValid } = validateForm(fields, validatorMap);
    setErrors(validationErrors);
    return isValid;
  };

  const validateStep2 = () => {
    if (formData.role !== 'mechanic') return true;
    
    const fields = {
      shopName: formData.shopName,
      address: formData.address,
      cnic: formData.cnicNumber,
    };
    
    const validatorMap = {
      shopName: validators.shopName,
      address: validators.address,
      cnic: validators.cnic,
    };
    
    const { errors: validationErrors, isValid } = validateForm(fields, validatorMap);
    setErrors(validationErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateStep1()) return;
    if (!validateStep2()) return;
    
    setIsLoading(true);
    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };
      
      if (formData.role === 'mechanic') {
        registerData.shop_name = formData.shopName;
        registerData.address = formData.address;
        registerData.latitude = parseFloat(formData.latitude) || 35.2973;
        registerData.longitude = parseFloat(formData.longitude) || 75.6333;
        registerData.location_name = formData.locationName || 'Skardu, Gilgit-Baltistan';
        registerData.services = formData.services.split(',').map(s => s.trim()).filter(s => s);
        registerData.cnic_number = formData.cnicNumber.trim();
        registerData.certificate_title = formData.certificateTitle.trim() || 'Automotive Technician Certificate';
        registerData.cnic_document_url = formData.cnicDocumentUrl || '/api/uploads/verification/cnic/default_cnic.jpg';
        registerData.certificate_document_url = formData.certificateDocumentUrl || '/api/uploads/verification/certificate/default_cert.pdf';
        registerData.profile_photo_url = formData.profilePhotoUrl || '/api/uploads/verification/profile_photo/default_photo.jpg';
      }
      
      const response = await AuthService.register(registerData);
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please login to continue.',
        [
          {
            text: 'Login',
            onPress: () => {
              setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                role: 'user',
                shopName: '',
                address: '',
                latitude: '',
                longitude: '',
                locationName: '',
                services: '',
              });
              setStep(1);
              onSwitchToLogin();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.error || error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <View style={styles.inputContainer}>
        <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(text) => updateField('name', text)}
          editable={!isLoading}
        />
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <View style={styles.inputContainer}>
        <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry={!showPassword}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#666" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          secureTextEntry={!showConfirmPassword}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={20} color="#666" />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <View style={styles.inputContainer}>
        <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone (Optional)"
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          keyboardType="phone-pad"
          editable={!isLoading}
        />
      </View>
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <Text style={styles.label}>I am a:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            formData.role === 'user' && styles.roleButtonActive,
          ]}
          onPress={() => updateField('role', 'user')}
          disabled={isLoading}
        >
          <Icon name="person" size={24} color={formData.role === 'user' ? '#fff' : '#666'} />
          <Text style={[styles.roleText, formData.role === 'user' && styles.roleTextActive]}>
            User
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            formData.role === 'mechanic' && styles.roleButtonActive,
          ]}
          onPress={() => updateField('role', 'mechanic')}
          disabled={isLoading}
        >
          <Icon name="build" size={24} color={formData.role === 'mechanic' ? '#fff' : '#666'} />
          <Text style={[styles.roleText, formData.role === 'mechanic' && styles.roleTextActive]}>
            Mechanic
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          if (validateStep1()) {
            if (formData.role === 'mechanic') {
              setStep(2);
            } else {
              handleRegister();
            }
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.nextButtonText}>
            {formData.role === 'mechanic' ? 'Next' : 'Register'}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.backContainer}>
        <TouchableOpacity onPress={() => setStep(1)} disabled={isLoading}>
          <Icon name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Mechanic Details</Text>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="store" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Shop Name"
          value={formData.shopName}
          onChangeText={(text) => updateField('shopName', text)}
          editable={!isLoading}
        />
      </View>
      {errors.shopName && <Text style={styles.errorText}>{errors.shopName}</Text>}

      <View style={styles.inputContainer}>
        <Icon name="location-on" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={formData.address}
          onChangeText={(text) => updateField('address', text)}
          editable={!isLoading}
        />
      </View>
      {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

      <View style={styles.inputContainer}>
        <Icon name="gps-fixed" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Latitude (e.g. 35.2973)"
          value={formData.latitude}
          onChangeText={(text) => updateField('latitude', text)}
          keyboardType="decimal-pad"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="gps-fixed" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Longitude (e.g. 75.6333)"
          value={formData.longitude}
          onChangeText={(text) => updateField('longitude', text)}
          keyboardType="decimal-pad"
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          marginBottom: 10,
          backgroundColor: '#e8f4fd',
          borderRadius: 8,
        }}
        onPress={handleDetectLocation}
        disabled={isLoading || isGeocoding}
      >
        <Icon name="my-location" size={18} color="#3498db" style={{ marginRight: 6 }} />
        <Text style={{ color: '#3498db', fontWeight: '600', fontSize: 13 }}>
          Detect Location & Reverse Geocode
        </Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Icon name="place" size={20} color="#3498db" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Area / Location Name (Auto-detected)"
          value={formData.locationName}
          onChangeText={(text) => updateField('locationName', text)}
          editable={!isLoading}
        />
        {isGeocoding && <ActivityIndicator size="small" color="#3498db" style={{ marginLeft: 6 }} />}
      </View>

      <View style={styles.inputContainer}>
        <Icon name="build" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Services (comma separated: Engine Repair, Oil Change)"
          value={formData.services}
          onChangeText={(text) => updateField('services', text)}
          editable={!isLoading}
        />
      </View>

      {/* Mechanic Verification Section */}
      <View style={{ marginTop: 12, marginBottom: 8, paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 }}>
          Verification Details (Required)
        </Text>
        <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 10 }}>
          Admin will review your CNIC and certificates before approving your shop.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="badge" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="CNIC Number (e.g. 71101-1234567-1)"
          value={formData.cnicNumber}
          onChangeText={(text) => updateField('cnicNumber', text)}
          keyboardType="numeric"
          editable={!isLoading}
        />
      </View>
      {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}

      <View style={styles.inputContainer}>
        <Icon name="card-membership" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Certificate / Qualification Title"
          value={formData.certificateTitle}
          onChangeText={(text) => updateField('certificateTitle', text)}
          editable={!isLoading}
        />
      </View>

      {/* Verification Document Upload Badges */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 6 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: formData.cnicDocumentUrl ? '#e8f8f5' : '#f0f3f4',
            borderWidth: 1,
            borderColor: formData.cnicDocumentUrl ? '#2ecc71' : '#bdc3c7',
            borderRadius: 8,
            padding: 8,
            alignItems: 'center',
          }}
          onPress={() => updateField('cnicDocumentUrl', '/api/uploads/verification/cnic/attached_cnic.jpg')}
        >
          <Icon name={formData.cnicDocumentUrl ? 'check-circle' : 'file-upload'} size={18} color={formData.cnicDocumentUrl ? '#2ecc71' : '#7f8c8d'} />
          <Text style={{ fontSize: 10, fontWeight: '600', color: '#2c3e50', marginTop: 2, textAlign: 'center' }}>
            {formData.cnicDocumentUrl ? 'CNIC Attached' : 'Attach CNIC'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: formData.certificateDocumentUrl ? '#e8f8f5' : '#f0f3f4',
            borderWidth: 1,
            borderColor: formData.certificateDocumentUrl ? '#2ecc71' : '#bdc3c7',
            borderRadius: 8,
            padding: 8,
            alignItems: 'center',
          }}
          onPress={() => updateField('certificateDocumentUrl', '/api/uploads/verification/certificate/attached_cert.pdf')}
        >
          <Icon name={formData.certificateDocumentUrl ? 'check-circle' : 'file-upload'} size={18} color={formData.certificateDocumentUrl ? '#2ecc71' : '#7f8c8d'} />
          <Text style={{ fontSize: 10, fontWeight: '600', color: '#2c3e50', marginTop: 2, textAlign: 'center' }}>
            {formData.certificateDocumentUrl ? 'Cert Attached' : 'Attach Cert'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: formData.profilePhotoUrl ? '#e8f8f5' : '#f0f3f4',
            borderWidth: 1,
            borderColor: formData.profilePhotoUrl ? '#2ecc71' : '#bdc3c7',
            borderRadius: 8,
            padding: 8,
            alignItems: 'center',
          }}
          onPress={() => updateField('profilePhotoUrl', '/api/uploads/verification/profile_photo/attached_photo.jpg')}
        >
          <Icon name={formData.profilePhotoUrl ? 'check-circle' : 'add-a-photo'} size={18} color={formData.profilePhotoUrl ? '#2ecc71' : '#7f8c8d'} />
          <Text style={{ fontSize: 10, fontWeight: '600', color: '#2c3e50', marginTop: 2, textAlign: 'center' }}>
            {formData.profilePhotoUrl ? 'Photo Added' : 'Profile Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Register</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join GetFix</Text>
        </View>

        {step === 1 ? renderStep1() : renderStep2()}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={onSwitchToLogin} disabled={isLoading}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  roleButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  roleText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#fff',
  },
  nextButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  registerButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterForm;