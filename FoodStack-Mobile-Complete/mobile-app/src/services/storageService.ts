// Simple in-memory storage fallback for development
class SimpleStorage {
  private storage: { [key: string]: string } = {};

  async getItem(key: string): Promise<string | null> {
    return this.storage[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    delete this.storage[key];
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    keyValuePairs.forEach(([key, value]) => {
      this.storage[key] = value;
    });
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach(key => {
      delete this.storage[key];
    });
  }
}

// Try to use AsyncStorage, fallback to simple storage
let storage: any;

try {
  // Dynamic import to avoid bundling issues
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
} catch (error) {
  console.warn('AsyncStorage not available, using fallback storage');
  storage = new SimpleStorage();
}

export default storage;