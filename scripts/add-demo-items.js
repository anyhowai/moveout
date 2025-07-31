/**
 * Add demo items owned by Alice Johnson and Bob Smith
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

// Demo items data
const demoItems = [
  {
    title: "Comfortable Office Chair",
    description: "Ergonomic office chair with lumbar support. Perfect for working from home. Only used for 6 months, excellent condition!",
    category: "furniture",
    urgency: "moderate",
    address: "1234 Pacific Heights, San Francisco, CA",
    coordinates: {
      lat: 37.7933931,
      lng: -122.4013604
    },
    contactInfo: {
      name: "Alice Johnson",
      phone: "555-0123",
      email: "alice@demo.com"
    },
    ownerId: "demo_user_alice",
    status: "available",
    isAvailable: true
  },
  {
    title: "Samsung 55-inch Smart TV", 
    description: "Great condition Samsung smart TV. Moving to a smaller apartment and can't take it with me. Includes original remote and manual.",
    category: "electronics",
    urgency: "urgent",
    address: "567 Mission Street, San Francisco, CA",
    coordinates: {
      lat: 37.7883328,
      lng: -122.3955422
    },
    contactInfo: {
      name: "Bob Smith",
      phone: "555-0456",
      email: "bob@demo.com"
    },
    ownerId: "demo_user_bob",
    status: "available",
    isAvailable: true
  },
  {
    title: "Kitchen Dining Set",
    description: "Wooden dining table with 4 chairs. Some wear but still very functional. Perfect for a new apartment or student housing.",
    category: "furniture", 
    urgency: "low",
    address: "890 Fillmore Street, San Francisco, CA",
    coordinates: {
      lat: 37.7749295,
      lng: -122.4194155
    },
    contactInfo: {
      name: "Alice Johnson",
      phone: "555-0123", 
      email: "alice@demo.com"
    },
    ownerId: "demo_user_alice",
    status: "available",
    isAvailable: true
  },
  {
    title: "Coffee Maker & Kitchen Appliances",
    description: "Keurig coffee maker, toaster, and blender. All in working condition. Moving out of state and need these gone ASAP!",
    category: "kitchen",
    urgency: "urgent", 
    address: "321 Castro Street, San Francisco, CA",
    coordinates: {
      lat: 37.7609295,
      lng: -122.4352047
    },
    contactInfo: {
      name: "Bob Smith",
      phone: "555-0456",
      email: "bob@demo.com"
    },
    ownerId: "demo_user_bob", 
    status: "available",
    isAvailable: true
  },
  {
    title: "Books Collection - Programming & Tech",
    description: "Collection of programming books including JavaScript, Python, and React. Great for students or developers. About 15 books total.",
    category: "books",
    urgency: "low",
    address: "456 Hayes Street, San Francisco, CA", 
    coordinates: {
      lat: 37.7766293,
      lng: -122.4242508
    },
    contactInfo: {
      name: "Alice Johnson",
      phone: "555-0123",
      email: "alice@demo.com"
    },
    ownerId: "demo_user_alice",
    status: "available", 
    isAvailable: true
  },
  {
    title: "Winter Clothes & Jackets",
    description: "Gently used winter clothing including coats, sweaters, and boots. Various sizes (M-L). Great for someone new to San Francisco!",
    category: "clothing",
    urgency: "moderate",
    address: "789 Valencia Street, San Francisco, CA",
    coordinates: {
      lat: 37.7599308,
      lng: -122.4212806
    },
    contactInfo: {
      name: "Bob Smith", 
      phone: "555-0456",
      email: "bob@demo.com"
    },
    ownerId: "demo_user_bob",
    status: "available",
    isAvailable: true
  }
];

async function addDemoItems() {
  try {
    console.log('🏠 Adding demo items to the database...');
    
    let addedCount = 0;
    
    for (const item of demoItems) {
      console.log(`Adding item: "${item.title}" (Owner: ${item.contactInfo.name})`);
      
      const itemData = {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'items'), itemData);
      addedCount++;
      
      console.log(`✅ Added "${item.title}" with ID: ${docRef.id}`);
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} demo items!`);
    
    console.log('\n📋 Items added:');
    console.log('Alice Johnson\'s items:');
    demoItems
      .filter(item => item.ownerId === 'demo_user_alice')
      .forEach(item => console.log(`  - ${item.title} (${item.urgency})`));
    
    console.log('\nBob Smith\'s items:');
    demoItems
      .filter(item => item.ownerId === 'demo_user_bob') 
      .forEach(item => console.log(`  - ${item.title} (${item.urgency})`));
    
  } catch (error) {
    console.error('❌ Error adding demo items:', error);
  }
}

addDemoItems();