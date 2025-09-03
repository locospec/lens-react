import { PERSISTER_CONFIG } from "@lens2/constants/cache";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import { openDB } from "idb";

/**
 * Creates an IndexedDB persister for React Query
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
export function createIDBPersister(): Persister {
  const getDB = () =>
    openDB(PERSISTER_CONFIG.DB_NAME, PERSISTER_CONFIG.DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PERSISTER_CONFIG.STORE_NAME)) {
          db.createObjectStore(PERSISTER_CONFIG.STORE_NAME);
        }
      },
    });

  return {
    persistClient: async (client: PersistedClient) => {
      const db = await getDB();
      await db.put(PERSISTER_CONFIG.STORE_NAME, client, "persisted-client");
    },
    restoreClient: async () => {
      const db = await getDB();
      return await db.get(PERSISTER_CONFIG.STORE_NAME, "persisted-client");
    },
    removeClient: async () => {
      const db = await getDB();
      await db.delete(PERSISTER_CONFIG.STORE_NAME, "persisted-client");
    },
  } satisfies Persister;
}

/**
 * Creates a persister with automatic fallback:
 * - Tries IndexedDB first (better performance, larger storage)
 * - Falls back to localStorage if IndexedDB is not available
 */
export function createLensViewPersister(): Persister {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    // Return a no-op persister for SSR
    return {
      persistClient: async () => {},
      restoreClient: async () => undefined,
      removeClient: async () => {},
    };
  }

  // Check IndexedDB availability
  if ("indexedDB" in window) {
    try {
      // Test if IndexedDB is actually usable (some browsers may have it disabled)
      const testDB = window.indexedDB.open("test");
      testDB.onsuccess = () => {
        // Clean up test database
        window.indexedDB.deleteDatabase("test");
      };

      return createIDBPersister();
    } catch (error) {
      console.warn(
        "IndexedDB not available, falling back to localStorage",
        error
      );
    }
  }

  // Fallback to localStorage with async wrapper
  return createAsyncStoragePersister({
    storage: {
      getItem: async (key: string) => {
        return window.localStorage.getItem(key);
      },
      setItem: async (key: string, value: string) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        window.localStorage.removeItem(key);
      },
    },
    key: "lens-view-query-cache",
  });
}
