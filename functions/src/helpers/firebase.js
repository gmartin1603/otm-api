import { initializeApp } from 'firebase-admin/app';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config();
// import serviceAccount from '../private/production-config.json' assert { type: 'json' };
import serviceAccount from '../private/staging-config.json' assert { type: 'json' };

initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
export { db };