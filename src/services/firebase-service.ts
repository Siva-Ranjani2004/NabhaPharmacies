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
  serverTimestamp,
  writeBatch,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { COLLECTIONS, SUBCOLLECTIONS } from '../config/firestore-schema';
import type { 
  FirestoreUser, 
  FirestorePharmacy, 
  FirestoreMedicine, 
  FirestoreStock, 
  FirestoreActivityLog, 
  FirestoreRegistrationRequest 
} from '../config/firestore-schema';
import type { User, Pharmacy, Stock, ActivityLog, RegistrationRequest } from '../types';
import { emailService, type CredentialsEmailData } from './email-service';

export class FirebaseService {
  // Authentication methods
  async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User not found in database');
      }
      
      const userData = userDoc.data() as FirestoreUser;
      
      // Account verification check removed - users can login immediately
      
      const user: User = {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        pharmacy_id: userData.pharmacy_id,
        preferred_language: userData.preferred_language
      };
      
      return { user, token: await firebaseUser.getIdToken() };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string, userData: Partial<FirestoreUser>): Promise<{ user: User; token: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      const newUser: FirestoreUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name || '',
        role: userData.role || 'pharmacy',
        pharmacy_id: userData.pharmacy_id,
        preferred_language: userData.preferred_language || 'en',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
        ...newUser,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      const user: User = {
        id: newUser.uid,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        pharmacy_id: newUser.pharmacy_id,
        preferred_language: newUser.preferred_language
      };
      
      return { user, token: await firebaseUser.getIdToken() };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as FirestoreUser;
            const user: User = {
              id: userData.uid,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              pharmacy_id: userData.pharmacy_id,
              preferred_language: userData.preferred_language
            };
            callback(user);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Stock management methods
  async getStock(pharmacyId: string): Promise<Stock[]> {
    try {
      // Get stock from pharmacy subcollection
      const stockQuery = query(
        collection(db, SUBCOLLECTIONS.PHARMACY_STOCK(pharmacyId))
      );
      const querySnapshot = await getDocs(stockQuery);
      
      if (querySnapshot.docs.length === 0) {
        // No stock data found, return empty array
        return [];
      }
      
      // Check if it's the new structure (one document with all medicines)
      const stockDoc = querySnapshot.docs[0];
      const data = stockDoc.data();
      
      if (data.medicines && typeof data.medicines === 'object') {
        // New structure: one document with medicines object
        const stockItems: Stock[] = [];
        for (const [medicineId, medicineData] of Object.entries(data.medicines)) {
          stockItems.push({
            id: `${stockDoc.id}-${medicineId}`,
            pharmacy_id: pharmacyId,
            medicine_id: medicineId,
            medicine_name: (medicineData as any).medicine_name || '',
            quantity: (medicineData as any).quantity || 0,
            unit: (medicineData as any).unit || '',
            out_of_stock: (medicineData as any).out_of_stock || false,
            last_updated_by: data.last_updated_by || 'System',
            last_updated_at: data.last_updated_at?.toDate() || new Date(),
            version: data.version || 1
          } as Stock);
        }
        return stockItems;
      } else {
        // Old structure: individual documents per medicine
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            pharmacy_id: pharmacyId,
            medicine_id: data.medicine_id,
            medicine_name: data.medicine_name,
            quantity: data.quantity,
            unit: data.unit,
            out_of_stock: data.out_of_stock,
            last_updated_by: data.last_updated_by,
            last_updated_at: data.last_updated_at?.toDate() || new Date(),
            version: data.version
          } as Stock;
        });
      }
    } catch (error) {
      console.error('Error getting stock:', error);
      throw error;
    }
  }

  async updateStock(stock: Partial<Stock>): Promise<Stock> {
    try {
      const pharmacyId = stock.pharmacy_id!;
      let stockRef;
      let updatedData;
      
      if (stock.id) {
        // This is an existing stock item - update it
        stockRef = doc(db, SUBCOLLECTIONS.PHARMACY_STOCK(pharmacyId), stock.id);
        updatedData = {
          ...stock,
          last_updated_at: serverTimestamp(),
          version: (stock.version || 0) + 1
        };
        await updateDoc(stockRef, updatedData);
      } else {
        // This is a new stock item - create both medicine and stock
        const medicineId = `med-${Date.now()}`;
        
        // First, create the medicine in pharmacy's medicine collection
        const medicineData: any = {
          id: medicineId,
          name: stock.medicine_name!,
          unit: stock.unit!,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        
        // Only add fields that are not undefined
        if (stock.generic_name !== undefined) medicineData.generic_name = stock.generic_name;
        if (stock.pack_size !== undefined) medicineData.pack_size = stock.pack_size;
        if (stock.category !== undefined) medicineData.category = stock.category;
        
        await setDoc(doc(db, SUBCOLLECTIONS.PHARMACY_MEDICINES(pharmacyId), medicineId), medicineData);
        
        // Then create the stock entry - filter out undefined values
        const cleanStockData: any = {
          pharmacy_id: stock.pharmacy_id,
          medicine_id: medicineId,
          medicine_name: stock.medicine_name,
          quantity: stock.quantity,
          unit: stock.unit,
          out_of_stock: stock.out_of_stock,
          last_updated_by: stock.last_updated_by,
          last_updated_at: serverTimestamp(),
          created_at: serverTimestamp(),
          version: 0
        };
        
        // Only add optional fields if they're not undefined
        if (stock.generic_name !== undefined) cleanStockData.generic_name = stock.generic_name;
        if (stock.pack_size !== undefined) cleanStockData.pack_size = stock.pack_size;
        if (stock.category !== undefined) cleanStockData.category = stock.category;
        
        const docRef = await addDoc(collection(db, SUBCOLLECTIONS.PHARMACY_STOCK(pharmacyId)), cleanStockData);
        stockRef = docRef;
        updatedData = { ...cleanStockData, id: docRef.id };
      }
      
      // Create activity log
      await this.createActivityLog({
        pharmacy_id: pharmacyId,
        medicine_id: updatedData.medicine_id || stock.medicine_id!,
        medicine_name: stock.medicine_name!,
        old_quantity: 0, // For new items, old quantity is 0
        new_quantity: stock.quantity!,
        updated_by: stock.last_updated_by!,
        action: stock.id ? 'update' as const : 'add' as const
      });
      
      return {
        ...stock,
        id: stockRef.id,
        last_updated_at: new Date(),
        version: updatedData.version
      } as Stock;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  // Activity log methods
  async createActivityLog(log: Omit<FirestoreActivityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      // Create activity log in pharmacy subcollection
      await addDoc(collection(db, SUBCOLLECTIONS.PHARMACY_ACTIVITY(log.pharmacy_id)), {
        ...log,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  }

  async getActivityLog(pharmacyId: string): Promise<ActivityLog[]> {
    try {
      const activityQuery = query(
        collection(db, SUBCOLLECTIONS.PHARMACY_ACTIVITY(pharmacyId)),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(activityQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          pharmacy_id: pharmacyId,
          medicine_id: data.medicine_id,
          medicine_name: data.medicine_name,
          old_quantity: data.old_quantity,
          new_quantity: data.new_quantity,
          updated_by: data.updated_by,
          timestamp: data.timestamp?.toDate() || new Date()
        } as ActivityLog;
      });
    } catch (error) {
      console.error('Error getting activity log:', error);
      throw error;
    }
  }

  // Registration request methods
  async submitRegistrationRequest(data: Omit<RegistrationRequest, 'id' | 'status' | 'submitted_at'>): Promise<{ request_id: string }> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.REGISTRATION_REQUESTS), {
        ...data,
        status: 'pending',
        submitted_at: serverTimestamp()
      });
      
      return { request_id: docRef.id };
    } catch (error) {
      console.error('Error submitting registration request:', error);
      throw error;
    }
  }

  async approveRegistrationRequest(requestId: string, adminNotes?: string, adminUser?: User): Promise<{ pharmacyId: string; credentials: { email: string; tempPassword: string }; emailSent: boolean }> {
    try {
      const requestRef = doc(db, COLLECTIONS.REGISTRATION_REQUESTS, requestId);
      
      // Update the request status to approved
      await updateDoc(requestRef, {
        status: 'approved',
        admin_notes: adminNotes || 'Approved by admin',
        approved_at: serverTimestamp()
      });

      // Get the request data to create pharmacy and user
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) {
        throw new Error('Registration request not found');
      }

      const requestData = requestDoc.data();
      
      // Create pharmacy document
      const pharmacyId = `pharmacy-${Date.now()}`;
      const pharmacyData = {
        id: pharmacyId,
        name: requestData.pharmacy_name,
        owner_name: requestData.owner_name,
        email: requestData.email,
        address: requestData.address,
        license_id: requestData.license_id,
        status: 'approved',
        created_at: serverTimestamp(),
        last_update: serverTimestamp()
      };

      await setDoc(doc(db, COLLECTIONS.PHARMACIES, pharmacyId), pharmacyData);

      // Check if Firebase account already exists
      let firebaseUser;
      let tempPassword = `Pharmacy${Math.floor(Math.random() * 1000)}!`;
      let accountAlreadyExists = false;
      
      try {
        // Create the account - this will automatically sign in the new user and log out the admin
        const userCredential = await createUserWithEmailAndPassword(auth, requestData.email, tempPassword);
        firebaseUser = userCredential.user;
        
        // Immediately sign out the new user to prevent them from staying logged in
        await signOut(auth);
        
        // Account created successfully
        
        console.log('New pharmacy account created with temporary password:', tempPassword);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          // Account already exists - this means the registration was already processed
          // We need to find the existing user and update their pharmacy_id
          accountAlreadyExists = true;
          
          // Try to find existing user in Firestore by email
          const usersQuery = query(
            collection(db, COLLECTIONS.USERS),
            where('email', '==', requestData.email)
          );
          const usersSnapshot = await getDocs(usersQuery);
          
          if (!usersSnapshot.empty) {
            const existingUserDoc = usersSnapshot.docs[0];
            const existingUserData = existingUserDoc.data() as FirestoreUser;
            
            // Update the existing user with new pharmacy_id
            await updateDoc(doc(db, COLLECTIONS.USERS, existingUserDoc.id), {
              pharmacy_id: pharmacyId,
              updated_at: serverTimestamp()
            });
            
            // Create a mock user object for the response
            firebaseUser = {
              uid: existingUserData.uid,
              email: existingUserData.email
            } as any;
            
            console.log('Using existing account and updated pharmacy_id');
          } else {
            throw new Error('Account exists in Firebase Auth but not in Firestore. Please contact support.');
          }
        } else {
          throw error;
        }
      }
      
      // Create or update user document in Firestore
      if (!accountAlreadyExists) {
        const userData = {
          uid: firebaseUser.uid,
          email: requestData.email,
          name: requestData.owner_name,
          role: 'pharmacy',
          pharmacy_id: pharmacyId,
          preferred_language: 'en',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };

        await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userData);
      }

      // Send credentials email notification
      let emailSent = false;
      if (adminUser) {
        try {
          const emailData: CredentialsEmailData = {
            pharmacyName: requestData.pharmacy_name,
            ownerName: requestData.owner_name,
            email: requestData.email,
            tempPassword: tempPassword,
            adminName: adminUser.name || 'Admin',
            adminEmail: adminUser.email || 'admin@nabha.gov.in'
          };

          emailSent = await emailService.sendCredentialsEmail(emailData);
        } catch (emailError) {
          console.error('Failed to send credentials email:', emailError);
          // Don't throw error, just log it
        }
      }

      console.log('Registration request approved and pharmacy created:', pharmacyId);

      // Return credentials for admin to share with pharmacy owner
      return {
        pharmacyId,
        credentials: {
          email: requestData.email,
          tempPassword: accountAlreadyExists ? 'Use existing password or reset' : tempPassword
        },
        emailSent,
        accountAlreadyExists
      };
    } catch (error) {
      console.error('Error approving registration request:', error);
      throw error;
    }
  }

  async rejectRegistrationRequest(requestId: string, reason: string): Promise<void> {
    try {
      const requestRef = doc(db, COLLECTIONS.REGISTRATION_REQUESTS, requestId);
      
      await updateDoc(requestRef, {
        status: 'rejected',
        admin_notes: reason,
        rejected_at: serverTimestamp()
      });

      console.log('Registration request rejected:', requestId);
    } catch (error) {
      console.error('Error rejecting registration request:', error);
      throw error;
    }
  }

  // Admin function to set password for approved pharmacy
  async setPharmacyPassword(email: string, password: string): Promise<void> {
    try {
      // This would require admin privileges and proper Firebase Admin SDK
      // For now, we'll use the password reset approach
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Error setting pharmacy password:', error);
      throw error;
    }
  }

  // Activate pharmacy account after email verification
  async activatePharmacyAccount(email: string): Promise<void> {
    try {
      // Find user by email
      const usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('email', '==', email)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), {
          account_status: 'active',
          updated_at: serverTimestamp()
        });
        console.log('Pharmacy account activated:', email);
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error activating pharmacy account:', error);
      throw error;
    }
  }

  async getRegistrationRequests(): Promise<RegistrationRequest[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.REGISTRATION_REQUESTS));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          pharmacy_name: data.pharmacy_name,
          owner_name: data.owner_name,
          email: data.email,
          address: data.address,
          license_id: data.license_id,
          status: data.status,
          admin_notes: data.admin_notes,
          submitted_at: data.submitted_at?.toDate() || new Date()
        } as RegistrationRequest;
      });
    } catch (error) {
      console.error('Error getting registration requests:', error);
      throw error;
    }
  }

  // Pharmacy methods
  async getPharmacies(): Promise<Pharmacy[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.PHARMACIES));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          owner_name: data.owner_name,
          email: data.email,
          address: data.address,
          status: data.status,
          license_id: data.license_id,
          last_update: data.last_update?.toDate(),
          created_at: data.created_at?.toDate() || new Date()
        } as Pharmacy;
      });
    } catch (error) {
      console.error('Error getting pharmacies:', error);
      throw error;
    }
  }

  // Real-time listeners
  onStockChange(pharmacyId: string, callback: (stock: Stock[]) => void): () => void {
    const stockQuery = query(
      collection(db, SUBCOLLECTIONS.PHARMACY_STOCK(pharmacyId))
    );
    
    return onSnapshot(stockQuery, (querySnapshot) => {
      const stock = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          pharmacy_id: pharmacyId,
          medicine_id: data.medicine_id,
          medicine_name: data.medicine_name,
          quantity: data.quantity,
          unit: data.unit,
          out_of_stock: data.out_of_stock,
          last_updated_by: data.last_updated_by,
          last_updated_at: data.last_updated_at?.toDate() || new Date(),
          version: data.version
        } as Stock;
      });
      callback(stock);
    });
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();

