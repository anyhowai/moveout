/**
 * Flush all message threads and messages from the database
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

async function flushMessages() {
  try {
    console.log('🗑️  Flushing all message threads and messages...');
    
    // Delete all message threads
    const threadsSnapshot = await getDocs(collection(db, 'messageThreads'));
    const threadCount = threadsSnapshot.size;
    
    if (threadCount > 0) {
      console.log(`Found ${threadCount} message threads to delete`);
      
      for (const docSnap of threadsSnapshot.docs) {
        console.log(`Deleting thread: ${docSnap.id}`);
        await deleteDoc(doc(db, 'messageThreads', docSnap.id));
      }
      
      console.log(`✅ Deleted ${threadCount} message threads`);
    }
    
    // Delete all messages
    const messagesSnapshot = await getDocs(collection(db, 'messages'));
    const messageCount = messagesSnapshot.size;
    
    if (messageCount > 0) {
      console.log(`Found ${messageCount} messages to delete`);
      
      for (const docSnap of messagesSnapshot.docs) {
        console.log(`Deleting message: ${docSnap.id}`);
        await deleteDoc(doc(db, 'messages', docSnap.id));
      }
      
      console.log(`✅ Deleted ${messageCount} messages`);
    }
    
    if (threadCount === 0 && messageCount === 0) {
      console.log('No message threads or messages found to delete.');
    } else {
      console.log(`\n🎉 Successfully cleaned up ${threadCount} threads and ${messageCount} messages!`);
    }
    
  } catch (error) {
    console.error('❌ Error flushing messages:', error);
  }
}

flushMessages();