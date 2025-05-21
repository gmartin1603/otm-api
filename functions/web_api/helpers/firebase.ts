import { initializeApp } from 'firebase-admin/app';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config();
import serviceAccount from '../private/overtime-management-83008-firebase-adminsdk-q8kc2-1956d61a57.json' assert { type: 'json' };

initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
export { db, admin };