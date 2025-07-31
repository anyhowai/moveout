/**
 * Flush all items from the database
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function flushItems() {
  try {
    console.log('🗑️  Flushing all items from database...');
    
    // Get all items
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    const itemCount = itemsSnapshot.size;
    
    if (itemCount === 0) {
      console.log('No items found to delete.');
      return;
    }
    
    console.log(`Found ${itemCount} items to delete`);
    
    // Delete all items
    let deletedCount = 0;
    for (const docSnap of itemsSnapshot.docs) {
      const itemData = docSnap.data();
      console.log(`Deleting item: ${itemData.title || 'Unknown'} (${docSnap.id})`);
      
      await deleteDoc(doc(db, 'items', docSnap.id));
      deletedCount++;
      
      console.log(`✅ Deleted ${deletedCount}/${itemCount}`);
    }
    
    console.log(`\n🎉 Successfully deleted all ${deletedCount} items from the database!`);
    console.log('\n⚠️  Note: This also means any related message threads should be cleaned up.');
    
  } catch (error) {
    console.error('❌ Error flushing items:', error);
  }
}

flushItems();