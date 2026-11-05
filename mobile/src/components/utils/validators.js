export const validators = {
  email: (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) return 'Email is required';
    if (!regex.test(email)) return 'Please enter a valid email address';
    return null;
  },
  
  password: (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 50) return 'Password must be less than 50 characters';
    return null;
  },
  
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },
  
  name: (name) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 50) return 'Name must be less than 50 characters';
    return null;
  },
  
  phone: (phone) => {
    if (!phone) return null; // Optional field
    const regex = /^[0-9+\-\s()]{7,20}$/;
    if (!regex.test(phone)) return 'Please enter a valid phone number';
    return null;
  },
  
  shopName: (shopName) => {
    if (!shopName) return 'Shop name is required';
    if (shopName.length < 2) return 'Shop name must be at least 2 characters';
    return null;
  },
  
  address: (address) => {
    if (!address) return 'Address is required';
    if (address.length < 5) return 'Please enter a complete address';
    return null;
  },
  
  cnic: (cnic) => {
    if (!cnic) return 'CNIC number is required for mechanic verification';
    const clean = cnic.replace(/[-\s]/g, '');
    if (!/^\d{13}$/.test(clean)) return 'CNIC must be 13 digits (e.g. 71101-1234567-1)';
    return null;
  },
};

export const validateForm = (fields, validators) => {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, value] of Object.entries(fields)) {
    const validator = validators[fieldName];
    if (validator) {
      const error = validator(value);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    }
  }
  
  return { errors, isValid };
};