import { initializeApp } from 'firebase-admin/app';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config();
// import serviceAccount from '../private/production-config.json';
import serviceAccount from '../private/staging-config.json';

initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

const db: admin.firestore.Firestore = admin.firestore();
export { db };