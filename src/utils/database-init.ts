import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { COLLECTIONS, SUBCOLLECTIONS } from '../config/firestore-schema';
import type { FirestoreUser, FirestorePharmacy, FirestoreMedicine } from '../config/firestore-schema';

// Initialize the database with sample data
export async function initializeDatabase() {
  try {
    console.log('Initializing Firestore database...');

    // 1. Create admin user in Firebase Auth and Firestore
    let adminUserCredential;
    try {
      adminUserCredential = await createUserWithEmailAndPassword(
        auth, 
        'admin@nabha.gov.in', 
        'admin123'
      );
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // User already exists, sign in to get the UID
        adminUserCredential = await signInWithEmailAndPassword(
          auth, 
          'admin@nabha.gov.in', 
          'admin123'
        );
      } else {
        throw error;
      }
    }

    const adminUser: Omit<FirestoreUser, 'created_at' | 'updated_at'> = {
      uid: adminUserCredential.user.uid,
      email: 'admin@nabha.gov.in',
      name: 'Dr. Rajesh Singh',
      role: 'admin',
      preferred_language: 'en'
    };

    await setDoc(doc(db, COLLECTIONS.USERS, adminUser.uid), {
      ...adminUser,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    // 2. Create pharmacy user in Firebase Auth and Firestore
    let pharmacyUserCredential;
    try {
      pharmacyUserCredential = await createUserWithEmailAndPassword(
        auth, 
        'pharmacy@nabhamedical.com', 
        'pharmacy123'
      );
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // User already exists, sign in to get the UID
        pharmacyUserCredential = await signInWithEmailAndPassword(
          auth, 
          'pharmacy@nabhamedical.com', 
          'pharmacy123'
        );
      } else {
        throw error;
      }
    }

    const pharmacyUser: Omit<FirestoreUser, 'created_at' | 'updated_at'> = {
      uid: pharmacyUserCredential.user.uid,
      email: 'pharmacy@nabhamedical.com',
      name: 'Nabha Medical Store',
      role: 'pharmacy',
      pharmacy_id: 'pharmacy-1',
      preferred_language: 'en'
    };

    await setDoc(doc(db, COLLECTIONS.USERS, pharmacyUser.uid), {
      ...pharmacyUser,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    // 3. Create pharmacy
    const pharmacy: Omit<FirestorePharmacy, 'created_at' | 'updated_at'> = {
      id: pharmacyUser.uid, // Use the actual UID from Firebase Auth
      name: 'Nabha Medical Store',
      owner_name: 'Harpreet Singh',
      email: 'pharmacy@nabhamedical.com',
      address: 'Main Bazaar, Nabha, Punjab',
      status: 'approved',
      license_id: 'PB-NAB-001',
      phone: '+91-9876543210'
    };

    await setDoc(doc(db, COLLECTIONS.PHARMACIES, pharmacy.id), {
      ...pharmacy,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    // 4. Create sample medicines in pharmacy subcollection
    const medicines: Omit<FirestoreMedicine, 'created_at' | 'updated_at'>[] = [
      {
        id: 'med-1',
        name: 'Paracetamol 500mg',
        generic_name: 'Acetaminophen',
        unit: 'tablets',
        pack_size: '10 tablets',
        category: 'Pain Relief'
      },
      {
        id: 'med-2',
        name: 'Amoxicillin 250mg',
        generic_name: 'Amoxicillin',
        unit: 'capsules',
        pack_size: '10 capsules',
        category: 'Antibiotic'
      },
      {
        id: 'med-3',
        name: 'ORS Sachets',
        generic_name: 'Oral Rehydration Salts',
        unit: 'sachets',
        pack_size: '1 sachet',
        category: 'Electrolyte'
      },
      {
        id: 'med-4',
        name: 'Crocin Advance',
        generic_name: 'Paracetamol + Caffeine',
        unit: 'tablets',
        pack_size: '10 tablets',
        category: 'Pain Relief'
      },
      {
        id: 'med-5',
        name: 'Cetirizine 10mg',
        generic_name: 'Cetirizine Hydrochloride',
        unit: 'tablets',
        pack_size: '10 tablets',
        category: 'Antihistamine'
      }
    ];

    // Create medicines in pharmacy subcollection
    for (const medicine of medicines) {
      await setDoc(doc(db, SUBCOLLECTIONS.PHARMACY_MEDICINES(pharmacyUser.uid), medicine.id), {
        ...medicine,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    }

    // 5. Create sample stock in pharmacy subcollection
    const stockItems = [
      {
        pharmacy_id: pharmacyUser.uid,
        medicine_id: 'med-1',
        medicine_name: 'Paracetamol 500mg',
        quantity: 20,
        unit: 'tablets',
        out_of_stock: false,
        last_updated_by: pharmacyUser.name,
        version: 1,
        min_quantity: 5,
        max_quantity: 100
      },
      {
        pharmacy_id: pharmacyUser.uid,
        medicine_id: 'med-2',
        medicine_name: 'Amoxicillin 250mg',
        quantity: 0,
        unit: 'capsules',
        out_of_stock: true,
        last_updated_by: pharmacyUser.name,
        version: 1,
        min_quantity: 5,
        max_quantity: 50
      },
      {
        pharmacy_id: pharmacyUser.uid,
        medicine_id: 'med-3',
        medicine_name: 'ORS Sachets',
        quantity: 10,
        unit: 'sachets',
        out_of_stock: false,
        last_updated_by: pharmacyUser.name,
        version: 1,
        min_quantity: 10,
        max_quantity: 200
      },
      {
        pharmacy_id: pharmacyUser.uid,
        medicine_id: 'med-4',
        medicine_name: 'Crocin Advance',
        quantity: 15,
        unit: 'tablets',
        out_of_stock: false,
        last_updated_by: pharmacyUser.name,
        version: 1,
        min_quantity: 5,
        max_quantity: 100
      },
      {
        pharmacy_id: pharmacyUser.uid,
        medicine_id: 'med-5',
        medicine_name: 'Cetirizine 10mg',
        quantity: 0,
        unit: 'tablets',
        out_of_stock: true,
        last_updated_by: pharmacyUser.name,
        version: 1,
        min_quantity: 5,
        max_quantity: 50
      }
    ];

    // Create stock in pharmacy subcollection
    for (const stock of stockItems) {
      await addDoc(collection(db, SUBCOLLECTIONS.PHARMACY_STOCK(pharmacyUser.uid)), {
        ...stock,
        last_updated_at: serverTimestamp(),
        created_at: serverTimestamp()
      });
    }

    // Sign out after initialization
    await signOut(auth);
    
    console.log('Database initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Check if database needs initialization
export async function checkDatabaseInitialized(): Promise<boolean> {
  try {
    const { getDocs } = await import('firebase/firestore');
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return !usersSnapshot.empty;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
}

// Migrate existing data from global collections to pharmacy subcollections
export async function migrateToPharmacySubcollections(): Promise<boolean> {
  try {
    console.log('Starting migration to pharmacy subcollections...');
    
    // Get all pharmacies
    const pharmaciesSnapshot = await getDocs(collection(db, COLLECTIONS.PHARMACIES));
    console.log(`Found ${pharmaciesSnapshot.docs.length} pharmacies to migrate`);
    
    if (pharmaciesSnapshot.docs.length === 0) {
      console.log('No pharmacies found. Creating sample pharmacy first...');
      return false;
    }
    
    for (const pharmacyDoc of pharmaciesSnapshot.docs) {
      const pharmacyId = pharmacyDoc.id;
      const pharmacyData = pharmacyDoc.data();
      
      console.log(`Migrating data for pharmacy: ${pharmacyData.name} (ID: ${pharmacyId})`);
      
      // Get existing stock for this pharmacy from global collection
      const stockSnapshot = await getDocs(collection(db, COLLECTIONS.STOCK));
      const pharmacyStock = stockSnapshot.docs.filter(doc => 
        doc.data().pharmacy_id === pharmacyId
      );
      
      console.log(`Found ${pharmacyStock.length} stock items for pharmacy ${pharmacyId}`);
      
      // Migrate stock to pharmacy subcollection
      for (const stockDoc of pharmacyStock) {
        const stockData = stockDoc.data();
        
        // Create stock in pharmacy subcollection
        await addDoc(collection(db, SUBCOLLECTIONS.PHARMACY_STOCK(pharmacyId)), {
          ...stockData,
          last_updated_at: stockData.last_updated_at || new Date(),
          created_at: stockData.created_at || new Date()
        });
        
        // Delete from global collection
        await deleteDoc(doc(db, COLLECTIONS.STOCK, stockDoc.id));
        console.log(`Migrated stock item: ${stockData.medicine_name}`);
      }
      
      // Get existing medicines and create them in pharmacy subcollection
      const medicinesSnapshot = await getDocs(collection(db, COLLECTIONS.MEDICINES));
      console.log(`Found ${medicinesSnapshot.docs.length} medicines to migrate`);
      
      for (const medicineDoc of medicinesSnapshot.docs) {
        const medicineData = medicineDoc.data();
        
        // Create medicine in pharmacy subcollection
        await setDoc(doc(db, SUBCOLLECTIONS.PHARMACY_MEDICINES(pharmacyId), medicineDoc.id), {
          ...medicineData,
          created_at: medicineData.created_at || new Date(),
          updated_at: medicineData.updated_at || new Date()
        });
        console.log(`Migrated medicine: ${medicineData.name}`);
      }
    }
    
    // After successful migration, delete global collections
    console.log('Deleting global collections...');
    
    // Delete all documents from global medicines collection
    const medicinesSnapshot = await getDocs(collection(db, COLLECTIONS.MEDICINES));
    for (const medicineDoc of medicinesSnapshot.docs) {
      await deleteDoc(doc(db, COLLECTIONS.MEDICINES, medicineDoc.id));
    }
    
    // Delete all documents from global stock collection
    const stockSnapshot = await getDocs(collection(db, COLLECTIONS.STOCK));
    for (const stockDoc of stockSnapshot.docs) {
      await deleteDoc(doc(db, COLLECTIONS.STOCK, stockDoc.id));
    }
    
    console.log('Migration completed successfully!');
    console.log('Global collections have been removed.');
    return true;
  } catch (error) {
    console.error('Error during migration:', error);
    console.error('Migration failed:', error.message);
    return false;
  }
}
