import supabase from './supabase.js';
import getFirestore, { initFirebase } from './firebase.js';

const USE_FIREBASE = !!process.env.FIREBASE_SERVICE_ACCOUNT;

async function insertApplicationSupabase(payload) {
  const { data, error } = await supabase.from('applications').insert(payload).select().single();
  return { data, error };
}

async function findExistingSupabase(aternos_username) {
  const { data } = await supabase
    .from('applications')
    .select('id, status')
    .eq('aternos_username', aternos_username)
    .in('status', ['pending', 'accepted'])
    .maybeSingle();
  return data;
}

async function getApplicationsSupabase(status) {
  let q = supabase.from('applications').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  return { data, error };
}

async function getApplicationByIdSupabase(id) {
  const { data, error } = await supabase.from('applications').select('*').eq('id', id).maybeSingle();
  return { data, error };
}

async function updateApplicationSupabase(id, updates) {
  const { data, error } = await supabase.from('applications').update(updates).eq('id', id).select().single();
  return { data, error };
}

async function deleteApplicationSupabase(id) {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  return { error };
}

async function getConfigSupabase() {
  const { data, error } = await supabase.from('site_config').select('key, value');
  return { data, error };
}

async function upsertConfigSupabase(key, value) {
  const { data, error } = await supabase.from('site_config').upsert({ key, value }, { onConflict: 'key' });
  return { data, error };
}

// --- Firestore implementations ---
function colApps(db) { return db.collection('applications'); }
function colConfig(db) { return db.collection('site_config'); }

async function findExistingFirestore(aternos_username) {
  const db = getFirestore();
  const q = await colApps(db)
    .where('aternos_username', '==', aternos_username)
    .where('status', 'in', ['pending', 'accepted'])
    .limit(1)
    .get();
  if (q.empty) return null;
  const doc = q.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function insertApplicationFirestore(payload) {
  const db = getFirestore();
  payload.created_at = new Date().toISOString();
  const ref = await colApps(db).add(payload);
  const doc = await ref.get();
  return { data: { id: doc.id, ...doc.data() }, error: null };
}

async function getApplicationsFirestore(status) {
  const db = getFirestore();
  let q = colApps(db).orderBy('created_at', 'desc');
  if (status) q = q.where('status', '==', status);
  const snap = await q.get();
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return { data, error: null };
}

async function getApplicationByIdFirestore(id) {
  const db = getFirestore();
  const doc = await colApps(db).doc(id).get();
  if (!doc.exists) return { data: null, error: { message: 'Not found' } };
  return { data: { id: doc.id, ...doc.data() }, error: null };
}

async function updateApplicationFirestore(id, updates) {
  const db = getFirestore();
  updates.reviewed_at = updates.reviewed_at || new Date().toISOString();
  await colApps(db).doc(id).set(updates, { merge: true });
  const doc = await colApps(db).doc(id).get();
  return { data: { id: doc.id, ...doc.data() }, error: null };
}

async function deleteApplicationFirestore(id) {
  const db = getFirestore();
  await colApps(db).doc(id).delete();
  return { error: null };
}

async function getConfigFirestore() {
  const db = getFirestore();
  const snap = await colConfig(db).get();
  const data = snap.docs.map(d => ({ key: d.id, value: d.data().value }));
  return { data, error: null };
}

async function upsertConfigFirestore(key, value) {
  const db = getFirestore();
  await colConfig(db).doc(key).set({ value }, { merge: true });
  return { data: [{ key, value }], error: null };
}

// --- Exports that choose backend ---
export async function findExistingApplication(aternos_username) {
  if (USE_FIREBASE) return findExistingFirestore(aternos_username);
  return findExistingSupabase(aternos_username);
}

export async function insertApplication(payload) {
  if (USE_FIREBASE) return insertApplicationFirestore(payload);
  return insertApplicationSupabase(payload);
}

export async function getApplications(status) {
  if (USE_FIREBASE) return getApplicationsFirestore(status);
  return getApplicationsSupabase(status);
}

export async function getApplicationById(id) {
  if (USE_FIREBASE) return getApplicationByIdFirestore(id);
  return getApplicationByIdSupabase(id);
}

export async function updateApplication(id, updates) {
  if (USE_FIREBASE) return updateApplicationFirestore(id, updates);
  return updateApplicationSupabase(id, updates);
}

export async function deleteApplication(id) {
  if (USE_FIREBASE) return deleteApplicationFirestore(id);
  return deleteApplicationSupabase(id);
}

export async function getConfig() {
  if (USE_FIREBASE) return getConfigFirestore();
  return getConfigSupabase();
}

export async function upsertConfig(key, value) {
  if (USE_FIREBASE) return upsertConfigFirestore(key, value);
  return upsertConfigSupabase(key, value);
}

export default {
  findExistingApplication,
  insertApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getConfig,
  upsertConfig,
};
