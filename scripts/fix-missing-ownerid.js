/**
 * Fix missing ownerId fields in existing items
 * This script updates items that are missing the ownerId field
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

async function fixMissingOwnerIds() {
  try {
    console.log('Fetching all items...');
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    
    const itemsToUpdate = [];
    
    itemsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.ownerId) {
        itemsToUpdate.push({
          id: docSnap.id,
          data: data
        });
      }
    });
    
    console.log(`Found ${itemsToUpdate.length} items missing ownerId`);
    
    if (itemsToUpdate.length === 0) {
      console.log('No items need updating!');
      return;
    }
    
    // Use the current user's ID as the owner for these items
    const currentUserId = 'WYgkQd2XCvShHB9GNZFHHkhcSw53'; // The user ID from the logs
    
    for (const item of itemsToUpdate) {
      console.log(`Updating item: ${item.id} (${item.data.title})`);
      
      const itemRef = doc(db, 'items', item.id);
      await updateDoc(itemRef, {
        ownerId: currentUserId
      });
      
      console.log(`✅ Updated ${item.id}`);
    }
    
    console.log(`Successfully updated ${itemsToUpdate.length} items!`);
    
  } catch (error) {
    console.error('Error fixing missing ownerIds:', error);
  }
}

fixMissingOwnerIds();