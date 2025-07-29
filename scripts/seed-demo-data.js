/**
 * Demo Data Seeder for MoveOut Map
 * Run this script to populate your Firestore database with sample items for the hackathon demo
 * 
 * Usage: node scripts/seed-demo-data.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration (using same env vars as the app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Sample demo data - simplified structure to avoid validation errors
const demoItems = [
  {
    title: "IKEA EKTORP 3-Seat Sofa",
    description: "Comfortable beige sofa in excellent condition. Pet-free, smoke-free home. Perfect for a new apartment!",
    category: "furniture",
    urgency: "urgent",
    address: "123 Mission St, San Francisco, CA 94103",
    coordinates: { lat: 37.7849, lng: -122.4094 },
    contactInfo: {
      name: "Sarah Chen",
      phone: "(415) 555-0123",
      email: "sarah.chen@email.com"
    },
    isAvailable: true
  },
  {
    title: "Samsung 55\" 4K Smart TV",
    description: "Barely used Samsung smart TV. Moving overseas, need gone by this weekend. Includes original remote and all cables.",
    category: "electronics",
    urgency: "urgent",
    address: "456 Valencia St, San Francisco, CA 94110",
    coordinates: { lat: 37.7615, lng: -122.4220 },
    contactInfo: {
      name: "Mike Rodriguez",
      phone: "(415) 555-0456",
      email: "mike.r@email.com"
    },
    isAvailable: true
  },
  {
    title: "Wooden Dining Table & 4 Chairs",
    description: "Solid oak dining set from West Elm. Some minor scratches but very sturdy. Seats 4-6 people comfortably.",
    category: "furniture",
    urgency: "moderate",
    address: "789 Market St, San Francisco, CA 94102",
    coordinates: { lat: 37.7875, lng: -122.4058 },
    contactInfo: {
      name: "Jessica Park",
      phone: "(415) 555-0789",
      email: "jessica.park@email.com"
    },
    isAvailable: true
  },
  {
    title: "Collection of Programming Books",
    description: "25+ technical books including React, Node.js, Python, and machine learning. Great for bootcamp students!",
    category: "books",
    urgency: "low",
    address: "321 Castro St, San Francisco, CA 94114",
    coordinates: { lat: 37.7609, lng: -122.4350 },
    contactInfo: {
      name: "Alex Thompson",
      phone: "(415) 555-0321",
      email: "alex.dev@email.com"
    },
    isAvailable: true
  },
  {
    title: "KitchenAid Stand Mixer - Red",
    description: "Classic red KitchenAid mixer, works perfectly. Includes dough hook and whisk attachments. Moving to smaller place.",
    category: "kitchen",
    urgency: "moderate",
    address: "654 Fillmore St, San Francisco, CA 94117",
    coordinates: { lat: 37.7749, lng: -122.4312 },
    contactInfo: {
      name: "Emma Wilson",
      phone: "(415) 555-0654",
      email: "emma.wilson@email.com"
    },
    isAvailable: true
  },
  {
    title: "Winter Clothing Collection",
    description: "Men's winter jackets (L-XL), sweaters, and boots. All clean and in good condition. Great for someone new to SF weather!",
    category: "clothing", 
    urgency: "low",
    address: "987 Irving St, San Francisco, CA 94122",
    coordinates: { lat: 37.7635, lng: -122.4686 },
    contactInfo: {
      name: "David Kim",
      phone: "(415) 555-0987",
      email: "david.kim.sf@email.com"
    },
    isAvailable: true
  },
  {
    title: "Vintage Wall Art & Mirrors",
    description: "Beautiful collection of framed prints and decorative mirrors. Perfect for making a new place feel like home.",
    category: "decoration",
    urgency: "low",
    address: "111 Hayes St, San Francisco, CA 94102",
    coordinates: { lat: 37.7766, lng: -122.4200 },
    contactInfo: {
      name: "Maria Santos",
      phone: "(415) 555-0111",
      email: "maria.santos@email.com"
    },
    isAvailable: true
  },
  {
    title: "Gaming Setup - Monitor, Keyboard, Mouse",
    description: "Complete gaming setup: 27\" curved monitor, mechanical keyboard, gaming mouse. Upgrading to newer gear.",
    category: "electronics",
    urgency: "moderate",
    address: "555 Geary St, San Francisco, CA 94102",
    coordinates: { lat: 37.7876, lng: -122.4113 },
    contactInfo: {
      name: "Ryan Chen",
      phone: "(415) 555-0555",
      email: "ryan.gamer@email.com"
    },
    isAvailable: true
  }
];

async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seeding...');
    
    // Check if environment variables are loaded
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('Firebase environment variables not found. Make sure to load .env.local');
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📡 Connected to Firebase project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

    // Add each demo item to Firestore
    for (let i = 0; i < demoItems.length; i++) {
      const item = demoItems[i];
      console.log(`📦 Adding item ${i + 1}/${demoItems.length}: ${item.title}`);
      
      await addDoc(collection(db, 'items'), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    console.log('✅ Demo data seeding completed successfully!');
    console.log(`🎯 Added ${demoItems.length} sample items to your database`);
    console.log('🚀 Your app is now ready for the hackathon demo!');
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

// Load environment variables and run the seeder
require('dotenv').config({ path: '.env.local' });
seedDemoData();