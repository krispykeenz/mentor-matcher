import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { firebaseConfig } from './config';

let storageEmuConnected = false;

export function initializeClientFirebase() {
  if (typeof window === 'undefined') return;
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  // When running locally, route Firebase Storage calls to the emulator to avoid CORS
  // and accidental writes to production buckets.
  const host = window.location?.hostname;
  const shouldUseEmulator = host === 'localhost' || host === '127.0.0.1';
  if (shouldUseEmulator && !storageEmuConnected) {
    try {
      const storage = getStorage();
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      storageEmuConnected = true;
    } catch {
      // If the emulator is already connected or not available, ignore.
    }
  }
}

export function getClientServices() {
  initializeClientFirebase();
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  return { auth, db, storage };
}
