// IndexedDB utilities for offline storage
const DB_NAME = 'NabhaPharmaciesDB';
const DB_VERSION = 1;

interface DBSchema {
  medicines: Medicine[];
  stock: Stock[];
  pendingUpdates: Stock[];
  activityLog: ActivityLog[];
  settings: { key: string; value: any }[];
}

class StorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('medicines')) {
          const medicineStore = db.createObjectStore('medicines', { keyPath: 'id' });
          medicineStore.createIndex('name', 'name', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('stock')) {
          const stockStore = db.createObjectStore('stock', { keyPath: 'id' });
          stockStore.createIndex('pharmacy_id', 'pharmacy_id', { unique: false });
          stockStore.createIndex('medicine_id', 'medicine_id', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('pendingUpdates')) {
          db.createObjectStore('pendingUpdates', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('activityLog')) {
          const activityStore = db.createObjectStore('activityLog', { keyPath: 'id' });
          activityStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async getStore<T>(storeName: keyof DBSchema, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  async get<T>(storeName: keyof DBSchema, key: string): Promise<T | undefined> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: keyof DBSchema): Promise<T[]> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: keyof DBSchema, data: T): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: keyof DBSchema, key: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Specific methods for stock management
  async addPendingUpdate(stock: Stock): Promise<void> {
    await this.put('pendingUpdates', { ...stock, id: `${stock.pharmacy_id}-${stock.medicine_id}-${Date.now()}` });
  }

  async getPendingUpdates(): Promise<Stock[]> {
    return await this.getAll('pendingUpdates');
  }

  async clearPendingUpdates(): Promise<void> {
    const store = await this.getStore('pendingUpdates', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const storage = new StorageManager();