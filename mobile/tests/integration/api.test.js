import MockAdapter from 'axios-mock-adapter';
import { AuthService, api } from '../../src/services/api';

const mock = new MockAdapter(api);

describe('API Integration Tests', () => {
  beforeEach(() => {
    mock.reset();
  });

  test('login successful', async () => {
    const mockResponse = {
      access_token: 'test-token',
      user: { id: 1, name: 'Test User' }
    };

    mock.onPost('/auth/login').reply(200, mockResponse);

    const result = await AuthService.login('test@example.com', 'password123');
    expect(result).toEqual(mockResponse);
  });

  test('login failed', async () => {
    mock.onPost('/auth/login').reply(401, { error: 'Invalid credentials' });

    await expect(
      AuthService.login('test@example.com', 'wrongpassword')
    ).rejects.toBeDefined();
  });

  test('register new user', async () => {
    const mockResponse = {
      message: 'User registered successfully',
      user: { id: 1, name: 'New User' }
    };

    mock.onPost('/auth/register').reply(201, mockResponse);

    const result = await AuthService.register({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123'
    });
    expect(result).toEqual(mockResponse);
  });
});