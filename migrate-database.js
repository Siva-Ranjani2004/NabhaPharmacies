// Migration Script for NabhaPharmacies Database
// Run this in your browser console on the app page

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // Import the migration function
    const { migrateToPharmacySubcollections } = await import('./src/utils/database-init.ts');
    
    // Run the migration
    const success = await migrateToPharmacySubcollections();
    
    if (success) {
      console.log('✅ Migration completed successfully!');
      console.log('Your database now uses pharmacy subcollections.');
      console.log('Check your Firebase console to see the new structure.');
    } else {
      console.log('❌ Migration failed');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run the migration
migrateDatabase();

