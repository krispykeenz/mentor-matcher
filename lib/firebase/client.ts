import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

export function initializeClientFirebase() {
  if (typeof window === 'undefined') return;
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
}

export function getClientServices() {
  initializeClientFirebase();
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  return { auth, db, storage };
}
