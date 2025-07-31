/**
 * Create demo users and fix item ownership for proper messaging
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, updateDoc } = require('firebase/firestore');

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

const demoUsers = [
  {
    id: 'demo_user_alice',
    email: 'alice@demo.com',
    displayName: 'Alice Johnson',
    photoURL: null,
    createdAt: new Date(),
    lastSeen: new Date(),
    completedPickups: 15,
    rating: 4.8
  },
  {
    id: 'demo_user_bob', 
    email: 'bob@demo.com',
    displayName: 'Bob Smith',
    photoURL: null,
    createdAt: new Date(),
    lastSeen: new Date(),
    completedPickups: 8,
    rating: 4.5
  }
];

async function createDemoUsersAndFixItems() {
  try {
    console.log('Creating demo users...');
    
    // Create demo users
    for (const user of demoUsers) {
      console.log(`Creating user: ${user.displayName}`);
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, user);
      console.log(`✅ Created ${user.displayName}`);
    }
    
    console.log('\nFixing item ownership...');
    
    // Get all items and assign different owners
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    const items = [];
    
    itemsSnapshot.forEach((docSnap) => {
      items.push({
        id: docSnap.id,
        data: docSnap.data()
      });
    });
    
    console.log(`Found ${items.length} items to update`);
    
    // Assign different owners to items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const newOwnerId = demoUsers[i % demoUsers.length].id; // Rotate between demo users
      
      console.log(`Updating item: ${item.data.title} -> Owner: ${demoUsers[i % demoUsers.length].displayName}`);
      
      const itemRef = doc(db, 'items', item.id);
      await updateDoc(itemRef, {
        ownerId: newOwnerId
      });
      
      console.log(`✅ Updated ${item.id}`);
    }
    
    console.log('\n✅ Successfully created demo users and fixed item ownership!');
    console.log('\nDemo users created:');
    demoUsers.forEach(user => {
      console.log(`- ${user.displayName} (${user.id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createDemoUsersAndFixItems();