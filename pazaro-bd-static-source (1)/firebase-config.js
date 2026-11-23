// Pazaro BD — Firebase Config (CDN ES Modules for Static Hosting)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js';

export const activeFirebaseConfig = {
  "projectId": "pazaro-bd",
  "appId": "1:179805205963:web:216ff7886c51b66c44f24e",
  "apiKey": "AIzaSyCpu0SiswQyNe5mnG4E_4PTd88Z2PJxIRw",
  "authDomain": "pazaro-bd.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-d4b08b08-f859-4524-b2b8-27b33afc1191",
  "storageBucket": "pazaro-bd.firebasestorage.app",
  "messagingSenderId": "179805205963",
  "measurementId": "",
  "oAuthClientId": "179805205963-l9vr9isdqkbe5f02c63eoa23krdj2j8b.apps.googleusercontent.com",
  "recaptchaSiteKey": ""
};

export const app = initializeApp(activeFirebaseConfig);
export const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }, activeFirebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const firebaseConfigured = Boolean(activeFirebaseConfig?.projectId && activeFirebaseConfig?.apiKey);
export const OperationType = Object.freeze({ CREATE: 'create', UPDATE: 'update', DELETE: 'delete', LIST: 'list', GET: 'get', WRITE: 'write' });
export function handleFirestoreError(err, op, path) { console.error(op, path, err); }
export function formatFirestoreErrorMessage(err) { return (err && err.message) ? err.message : 'Unable to reach the Firebase database.'; }
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { ok: true, projectId: activeFirebaseConfig.projectId, databaseId: activeFirebaseConfig.firestoreDatabaseId };
  } catch (err) {
    return { ok: false, code: err?.code || 'unreachable', message: formatFirestoreErrorMessage(err) };
  }
}
