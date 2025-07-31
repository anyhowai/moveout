/**
 * Clean up invalid message threads where buyer and seller are the same user
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, query, where } = require('firebase/firestore');

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

async function cleanupInvalidThreads() {
  try {
    console.log('Finding invalid message threads...');
    
    // Get all message threads
    const threadsSnapshot = await getDocs(collection(db, 'messageThreads'));
    const invalidThreads = [];
    
    threadsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.buyerId === data.sellerId) {
        invalidThreads.push({
          id: docSnap.id,
          data: data
        });
      }
    });
    
    console.log(`Found ${invalidThreads.length} invalid threads (buyer = seller)`);
    
    if (invalidThreads.length === 0) {
      console.log('No invalid threads to clean up!');
      return;
    }
    
    // Delete invalid threads
    for (const thread of invalidThreads) {
      console.log(`Deleting thread: ${thread.id} (Item: ${thread.data.itemId})`);
      await deleteDoc(doc(db, 'messageThreads', thread.id));
      
      // Also delete associated messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('threadId', '==', thread.id)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      for (const messageDoc of messagesSnapshot.docs) {
        console.log(`  Deleting message: ${messageDoc.id}`);
        await deleteDoc(doc(db, 'messages', messageDoc.id));
      }
      
      console.log(`✅ Cleaned up thread ${thread.id}`);
    }
    
    console.log(`\n✅ Successfully cleaned up ${invalidThreads.length} invalid threads!`);
    
  } catch (error) {
    console.error('Error cleaning up threads:', error);
  }
}

cleanupInvalidThreads();