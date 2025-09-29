import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { firebaseServerConfig } from './config';

export function getAdminApp() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: firebaseServerConfig.projectId,
        clientEmail: firebaseServerConfig.clientEmail,
        privateKey: firebaseServerConfig.privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
  return getApps()[0]!;
}

export function getAdminServices() {
  const app = getAdminApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  return { db, auth, storage };
}
