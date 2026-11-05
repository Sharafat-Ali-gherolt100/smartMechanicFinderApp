import { validators } from '../../../src/utils/validators';

describe('Validators', () => {
  describe('email validator', () => {
    test('validates correct email', () => {
      expect(validators.email('test@example.com')).toBeNull();
      expect(validators.email('user.name@domain.co')).toBeNull();
    });

    test('rejects invalid email', () => {
      expect(validators.email('invalid')).toBe('Please enter a valid email address');
      expect(validators.email('')).toBe('Email is required');
    });
  });

  describe('password validator', () => {
    test('validates correct password', () => {
      expect(validators.password('password123')).toBeNull();
    });

    test('rejects short password', () => {
      expect(validators.password('123')).toBe('Password must be at least 6 characters');
    });

    test('rejects empty password', () => {
      expect(validators.password('')).toBe('Password is required');
    });
  });
});