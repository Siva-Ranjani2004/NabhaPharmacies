import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import type { User, Pharmacy, Stock, ActivityLog, RegistrationRequest } from '../types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PHARMACIES: 'pharmacies',
  MEDICINES: 'medicines',
  STOCK: 'stock',
  REGISTRATION_REQUESTS: 'registration-requests',
  ACTIVITY_LOGS: 'activity-logs'
} as const;

// Convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Convert Date to Firestore Timestamp
export const dateToTimestamp = (date: Date) => {
  return Timestamp.fromDate(date);
};

// Authentication helpers
export const firebaseAuth = {
  signIn: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },
  
  signUp: async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },
  
  signOut: async () => {
    await signOut(auth);
  },
  
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Generic Firestore helpers
export const firestoreHelpers = {
  // Get document by ID
  getDoc: async <T>(collectionName: string, docId: string): Promise<T | null> => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
  },
  
  // Get all documents from collection
  getDocs: async <T>(collectionName: string): Promise<T[]> => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  },
  
  // Add document
  addDoc: async <T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return docRef.id;
  },
  
  // Update document
  updateDoc: async (collectionName: string, docId: string, data: Partial<any>): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });
  },
  
  // Delete document
  deleteDoc: async (collectionName: string, docId: string): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  },
  
  // Real-time listener
  onSnapshot: <T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    queryConstraints?: any[]
  ) => {
    let q = collection(db, collectionName);
    if (queryConstraints) {
      q = query(q, ...queryConstraints);
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as T));
      callback(data);
    });
  }
};

// Batch operations for multiple writes
export const batchWrite = async (operations: Array<{
  type: 'add' | 'update' | 'delete';
  collection: string;
  docId?: string;
  data?: any;
}>) => {
  const batch = writeBatch(db);
  
  operations.forEach(op => {
    const docRef = op.docId ? doc(db, op.collection, op.docId) : doc(collection(db, op.collection));
    
    switch (op.type) {
      case 'add':
        batch.set(docRef, { ...op.data, created_at: serverTimestamp() });
        break;
      case 'update':
        batch.update(docRef, { ...op.data, updated_at: serverTimestamp() });
        break;
      case 'delete':
        batch.delete(docRef);
        break;
    }
  });
  
  await batch.commit();
};

