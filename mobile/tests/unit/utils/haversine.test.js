import { calculateDistance } from '../../../src/services/location';

describe('Haversine Distance Calculation', () => {
  test('calculates distance between two points', () => {
    const distance = calculateDistance(35.2973, 75.6333, 35.3100, 75.6200);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(5);
  });

  test('returns 0 for same point', () => {
    const distance = calculateDistance(35.2973, 75.6333, 35.2973, 75.6333);
    expect(distance).toBe(0);
  });

  test('calculates distance in kilometers', () => {
    const distance = calculateDistance(35.2973, 75.6333, 35.3100, 75.6200);
    expect(typeof distance).toBe('number');
  });
});