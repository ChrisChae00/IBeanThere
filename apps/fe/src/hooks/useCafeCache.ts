'use client';

import { useCallback } from 'react';
import { CafeMapData } from '@/types/map';

const DB_NAME = 'IBeanThereDB';
const STORE_NAME = 'cafeCache';
const DB_VERSION = 1;
const CACHE_TTL = 86400000; // 1 day in milliseconds

interface CacheEntry {
  key: string;
  data: CafeMapData[];
  timestamp: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export function useCafeCache() {
  const getCachedData = useCallback(async (lat: number, lng: number, radius: number): Promise<CafeMapData[] | null> => {
    try {
      const db = await openDatabase();
      const key = `${lat.toFixed(4)},${lng.toFixed(4)},${radius}`;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result as CacheEntry | undefined;

          if (!result) {
            resolve(null);
            return;
          }

          const age = Date.now() - result.timestamp;
          if (age > CACHE_TTL) {
            resolve(null);
            return;
          }

          resolve(result.data);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting cached data from IndexedDB:', error);
      return null;
    }
  }, []);

  const setCachedData = useCallback(async (
    lat: number,
    lng: number,
    radius: number,
    data: CafeMapData[]
  ): Promise<boolean> => {
    try {
      const db = await openDatabase();
      const key = `${lat.toFixed(4)},${lng.toFixed(4)},${radius}`;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const cacheEntry: CacheEntry = {
          key,
          data,
          timestamp: Date.now()
        };

        const request = store.put(cacheEntry);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error setting cached data in IndexedDB:', error);
      return false;
    }
  }, []);

  const clearCache = useCallback(async (): Promise<boolean> => {
    try {
      const db = await openDatabase();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error clearing IndexedDB cache:', error);
      return false;
    }
  }, []);

  const clearStaleCache = useCallback(async (): Promise<number> => {
    try {
      const db = await openDatabase();
      const cutoffTime = Date.now() - CACHE_TTL;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const request = index.openCursor();

        let deletedCount = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

          if (cursor) {
            const entry = cursor.value as CacheEntry;
            if (entry.timestamp < cutoffTime) {
              cursor.delete();
              deletedCount++;
            }
            cursor.continue();
          } else {
            resolve(deletedCount);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error clearing stale cache:', error);
      return 0;
    }
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    clearStaleCache
  };
}

