import admin from 'firebase-admin';

let firestore = null;

export function initFirebase() {
  if (firestore) return firestore;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT not set');

  let cred;
  try {
    cred = JSON.parse(raw);
  } catch (err) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must be a JSON string');
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(cred) });
  }
  firestore = admin.firestore();
  return firestore;
}

export default function getFirestore() {
  return initFirebase();
}
