/**
 * Enhanced Demo Data Seeder for MoveOut Map
 * This creates a more comprehensive and realistic dataset for demo purposes
 * 
 * Usage: node scripts/enhanced-demo-data.js
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

// Enhanced sample data with better geographic distribution and variety
const enhancedDemoItems = [
  // Furniture - Various SF neighborhoods
  {
    title: "Mid-Century Modern Couch & Coffee Table Set",
    description: "Beautiful walnut mid-century set from West Elm. Couch seats 3 comfortably, coffee table has storage. Moving to NYC, need gone by next weekend! Pet-free, smoke-free home.",
    category: "furniture",
    urgency: "urgent",
    address: "1847 Union St, San Francisco, CA 94123", // Pacific Heights
    coordinates: { lat: 37.7956, lng: -122.4297 },
    contactInfo: {
      name: "Alexandra Chen",
      phone: "(415) 555-0147",
      email: "alex.chen.sf@email.com"
    },
    isAvailable: true,
    status: "available",
    pickupDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
  },
  {
    title: "IKEA POÄNG Chair with Ottoman - Brown Leather",
    description: "Comfortable reading chair with matching ottoman. Great condition, just upgrading to a different style. Perfect for apartments or small spaces.",
    category: "furniture",
    urgency: "moderate",
    address: "2845 California St, San Francisco, CA 94115", // Pacific Heights
    coordinates: { lat: 37.7886, lng: -122.4434 },
    contactInfo: {
      name: "Marcus Johnson",
      phone: "(415) 555-0284",
      email: "marcus.j@email.com"
    },
    isAvailable: true,
    status: "available"
  },
  {
    title: "Dining Table for 6 - Solid Oak",
    description: "Custom-made solid oak dining table, seats 6 people. Some wear on surface but very sturdy. Including 4 matching chairs (can fit 6 total). Moving to smaller apartment.",
    category: "furniture",
    urgency: "low",
    address: "3201 Scott St, San Francisco, CA 94123", // Marina District
    coordinates: { lat: 37.8021, lng: -122.4404 },
    contactInfo: {
      name: "Emma Rodriguez",
      phone: "(415) 555-0320",
      email: "emma.r.sf@email.com"
    },
    isAvailable: true,
    status: "available"
  },
  {
    title: "Queen Size Bed Frame with Headboard",
    description: "Modern platform bed frame, dark gray upholstered headboard. Mattress not included. Easy to disassemble for transport. Great condition, only 2 years old.",
    category: "furniture",
    urgency: "moderate",
    address: "1401 Grove St, San Francisco, CA 94117", // Hayes Valley
    coordinates: { lat: 37.7759, lng: -122.4361 },
    contactInfo: {
      name: "David Park",
      phone: "(415) 555-1401",
      email: "dpark.hv@email.com"
    },
    isAvailable: true,
    status: "available"
  },

  // Electronics - Tech-focused items for SF
  {
    title: "MacBook Air Stand & Wireless Keyboard Combo",
    description: "Aluminum laptop stand and Apple Magic Keyboard. Perfect for remote work setup. Stand adjusts to multiple heights. Both barely used, original packaging included.",
    category: "electronics",
    urgency: "low",
    address: "201 Folsom St, San Francisco, CA 94105", // SOMA
    coordinates: { lat: 37.7879, lng: -122.3957 },
    contactInfo: {
      name: "Sarah Kim",
      phone: "(415) 555-0201",
      email: "sarah.k.tech@email.com"
    },
    isAvailable: true,
    status: "available"
  },
  {
    title: "55\" LG OLED TV + Wall Mount",
    description: "2022 LG OLED55C2PUA in excellent condition. Includes professional wall mount (can help with removal). Moving to furnished place, must go this week. Original remote, cables, and box.",
    category: "electronics",
    urgency: "urgent",
    address: "1200 Van Ness Ave, San Francisco, CA 94109", // Nob Hill
    coordinates: { lat: 37.7926, lng: -122.4194 },
    contactInfo: {
      name: "James Wilson",
      phone: "(415) 555-1200",
      email: "jwilson.nob@email.com"
    },
    isAvailable: true,
    status: "available",
    pickupDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
  },
  {
    title: "Herman Miller Monitor Arm + Webcam Setup",
    description: "Professional dual monitor arm setup with Logitech C920 webcam and ring light. Perfect for WFH video calls. Adjustable for monitors up to 27 inches each.",
    category: "electronics",
    urgency: "moderate",
    address: "610 Long Bridge St, San Francisco, CA 94107", // Mission Bay
    coordinates: { lat: 37.7715, lng: -122.3965 },
    contactInfo: {
      name: "Rachel Zhang",
      phone: "(415) 555-0610",
      email: "rachel.mb@email.com"
    },
    isAvailable: true,
    status: "available"
  },

  // Kitchen items
  {
    title: "KitchenAid Stand Mixer + Attachments - Red",
    description: "Classic red KitchenAid Artisan mixer with dough hook, whisk, and paddle. Also including pasta maker and ice cream bowl attachments. Works perfectly, just moving abroad.",
    category: "kitchen",
    urgency: "urgent",
    address: "850 Bush St, San Francisco, CA 94108", // Nob Hill
    coordinates: { lat: 37.7909, lng: -122.4102 },
    contactInfo: {
      name: "Isabella Martinez",
      phone: "(415) 555-0850",
      email: "isabella.m@email.com"
    },
    isAvailable: true,
    status: "available",
    pickupDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
  },
  {
    title: "Complete Cooking Set - Pots, Pans, Utensils",
    description: "Everything needed for a new kitchen! Non-stick pans, stainless steel pots, wooden utensils, cutting boards, and basic appliances. Great for students or new apartments.",
    category: "kitchen",
    urgency: "moderate",
    address: "2020 Chestnut St, San Francisco, CA 94123", // Marina
    coordinates: { lat: 37.8014, lng: -122.4381 },
    contactInfo: {
      name: "Thomas Liu",
      phone: "(415) 555-2020",
      email: "thomas.liu.marina@email.com"
    },
    isAvailable: true,
    status: "available"
  },

  // Books & Educational
  {
    title: "Tech Library - 50+ Programming & Design Books",
    description: "Comprehensive collection: JavaScript, Python, React, UX/UI Design, Machine Learning, and more. Perfect for bootcamp students or career changers. Most books from 2020-2023.",
    category: "books",
    urgency: "low",
    address: "450 Sansome St, San Francisco, CA 94111", // Financial District
    coordinates: { lat: 37.7959, lng: -122.4014 },
    contactInfo: {
      name: "Kevin Chang",
      phone: "(415) 555-0450",
      email: "kevin.chang.dev@email.com"
    },
    isAvailable: true,
    status: "available"
  },
  {
    title: "Medical School Textbooks + Study Materials",
    description: "UCSF medical textbooks, anatomy models, and study guides. Excellent condition, all current editions. Perfect for pre-med students. Retail value over $2000.",
    category: "books",
    urgency: "moderate",
    address: "1600 Holloway Ave, San Francisco, CA 94112", // Near SFSU
    coordinates: { lat: 37.7211, lng: -122.4764 },
    contactInfo: {
      name: "Dr. Amanda Foster",
      phone: "(415) 555-1600",
      email: "afoster.md@email.com"
    },
    isAvailable: true,
    status: "available"
  },

  // Clothing
  {
    title: "Professional Wardrobe - Women's Size M/L",
    description: "Complete professional wardrobe: blazers, dress pants, blouses, and dresses. Mix of brands including Ann Taylor, Banana Republic. Great for new grads starting careers.",
    category: "clothing",
    urgency: "low",
    address: "1901 Divisadero St, San Francisco, CA 94115", // Fillmore
    coordinates: { lat: 37.7849, lng: -122.4404 },
    contactInfo: {
      name: "Jennifer Adams",
      phone: "(415) 555-1901",
      email: "jennifer.adams.sf@email.com"
    },
    isAvailable: true,
    status: "available"
  },
  {
    title: "Outdoor Gear Collection - Hiking & Camping",
    description: "REI backpack, North Face jackets (M/L), hiking boots size 10, sleeping bag, and camping gear. Perfect for Bay Area outdoor adventures. Excellent condition.",
    category: "clothing",
    urgency: "moderate",
    address: "4201 18th St, San Francisco, CA 94114", // Castro
    coordinates: { lat: 37.7609, lng: -122.4350 },
    contactInfo: {
      name: "Michael Torres",
      phone: "(415) 555-4201",
      email: "mike.torres.outdoors@email.com"
    },
    isAvailable: true,
    status: "available"
  },

  // Decoration & Home
  {
    title: "Plant Collection - 12+ Indoor Plants",
    description: "Healthy indoor plant collection: snake plants, pothos, fiddle leaf fig, and more. Includes decorative pots and plant care supplies. Great for brightening up any space!",
    category: "decoration",
    urgency: "urgent",
    address: "520 Frederick St, San Francisco, CA 94117", // Cole Valley
    coordinates: { lat: 37.7656, lng: -122.4512 },
    contactInfo: {
      name: "Luna Rodriguez",
      phone: "(415) 555-0520",
      email: "luna.plants@email.com"
    },
    isAvailable: true,
    status: "available",
    pickupDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
  },
  {
    title: "Modern Art Collection - Framed Prints & Canvases",
    description: "Curated collection of modern art prints and canvases. Mix of abstract and minimalist pieces. Various sizes, all professionally framed. Perfect for decorating a new place.",
    category: "decoration",
    urgency: "low",
    address: "1255 Post St, San Francisco, CA 94109", // Japantown
    coordinates: { lat: 37.7852, lng: -122.4311 },
    contactInfo: {
      name: "Yuki Tanaka",
      phone: "(415) 555-1255",
      email: "yuki.art.sf@email.com"
    },
    isAvailable: true,
    status: "available"
  },

  // Other category
  {
    title: "Exercise Equipment - Yoga & Home Gym",
    description: "Complete home workout setup: yoga mats, resistance bands, dumbbells (10-25 lbs), kettlebells, and foam roller. Perfect for staying fit at home or starting a workout routine.",
    category: "other",
    urgency: "moderate",
    address: "2800 California St, San Francisco, CA 94115", // Pacific Heights
    coordinates: { lat: 37.7882, lng: -122.4420 },
    contactInfo: {
      name: "Fitness Coach Maria",
      phone: "(415) 555-2800",
      email: "maria.fitness.sf@email.com"
    },
    isAvailable: true,
    status: "available"
  },
  {
    title: "Board Game Collection - 25+ Games",
    description: "Extensive board game collection including Settlers of Catan, Ticket to Ride, Pandemic, and many more. Perfect for game nights and social gatherings. All complete with instructions.",
    category: "other",
    urgency: "low",
    address: "401 Parnassus Ave, San Francisco, CA 94117", // Inner Sunset
    coordinates: { lat: 37.7632, lng: -122.4596 },
    contactInfo: {
      name: "Board Game Bob",
      phone: "(415) 555-0401",
      email: "boardgamebob@email.com"
    },
    isAvailable: true,
    status: "available"
  },

  // Some items with different statuses for variety
  {
    title: "Designer Desk Chair - Herman Miller Aeron",
    description: "Authentic Herman Miller Aeron chair in excellent condition. Size B (medium), fully adjustable, ergonomic design. Perfect for home office or studio.",
    category: "furniture",
    urgency: "moderate",
    address: "555 Mission St, San Francisco, CA 94105", // SOMA
    coordinates: { lat: 37.7889, lng: -122.3987 },
    contactInfo: {
      name: "Tech Startup Steve",
      phone: "(415) 555-0555",
      email: "steve.startup.sf@email.com"
    },
    isAvailable: true,
    status: "pending" // Someone is already interested
  }
];

// Function to generate items with various statuses
function generateItemsWithStatuses(baseItems) {
  const items = [...baseItems];
  const now = new Date();
  
  // Add a few expired items
  items.push({
    title: "Vintage Leather Sofa - EXPIRED",
    description: "Beautiful vintage leather sofa, but pickup deadline has passed. Will be donated to charity if not claimed soon.",
    category: "furniture",
    urgency: "urgent",
    address: "1234 Irving St, San Francisco, CA 94122",
    coordinates: { lat: 37.7635, lng: -122.4686 },
    contactInfo: {
      name: "Sarah Vintage",
      phone: "(415) 555-1234",
      email: "sarah.vintage@email.com"
    },
    isAvailable: false,
    status: "expired",
    pickupDeadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  });

  // Add a picked up item
  items.push({
    title: "Coffee Table Set - PICKED UP",
    description: "Modern glass coffee table with matching side tables. Successfully picked up by a happy new owner!",
    category: "furniture",
    urgency: "low",
    address: "789 Market St, San Francisco, CA 94102",
    coordinates: { lat: 37.7875, lng: -122.4058 },
    contactInfo: {
      name: "Happy Helper",
      phone: "(415) 555-0789",
      email: "happy.helper@email.com"
    },
    isAvailable: false,
    status: "picked_up"
  });

  return items;
}

async function seedEnhancedDemoData() {
  try {
    console.log('🌱 Starting enhanced demo data seeding...');
    
    // Check if environment variables are loaded
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('Firebase environment variables not found. Make sure to load .env.local');
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📡 Connected to Firebase project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

    // Generate items with various statuses
    const allItems = generateItemsWithStatuses(enhancedDemoItems);

    // Add each demo item to Firestore
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      console.log(`📦 Adding item ${i + 1}/${allItems.length}: ${item.title}`);
      
      await addDoc(collection(db, 'items'), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Add some random creation times for more realistic data
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) // Random time in last 2 weeks
      });
    }

    console.log('✅ Enhanced demo data seeding completed successfully!');
    console.log(`🎯 Added ${allItems.length} diverse sample items to your database`);
    console.log('🗺️  Items are distributed across all SF neighborhoods');
    console.log('📊 Includes various item statuses and urgency levels');
    console.log('🚀 Your app is now ready with comprehensive demo data!');
    
  } catch (error) {
    console.error('❌ Error seeding enhanced demo data:', error);
    process.exit(1);
  }
}

// Load environment variables and run the seeder
require('dotenv').config({ path: '.env.local' });
seedEnhancedDemoData();