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

// Sample users with reputation scores and profiles
const sampleUsers = [
  {
    id: 'user_alexandra_chen',
    name: 'Alexandra Chen',
    email: 'alex.chen.sf@email.com',
    reputation: 4.8,
    totalRatings: 23,
    itemsGiven: 15,
    itemsReceived: 8,
    joinedDate: new Date('2023-08-15'),
    neighborhoods: ['Pacific Heights', 'Marina District']
  },
  {
    id: 'user_marcus_johnson',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    reputation: 4.6,
    totalRatings: 18,
    itemsGiven: 12,
    itemsReceived: 6,
    joinedDate: new Date('2023-09-20'),
    neighborhoods: ['Pacific Heights', 'Fillmore']
  },
  {
    id: 'user_emma_rodriguez',
    name: 'Emma Rodriguez',
    email: 'emma.r.sf@email.com',
    reputation: 4.9,
    totalRatings: 31,
    itemsGiven: 20,
    itemsReceived: 11,
    joinedDate: new Date('2023-06-10'),
    neighborhoods: ['Marina District', 'Cow Hollow']
  },
  {
    id: 'user_david_park',
    name: 'David Park',
    email: 'dpark.hv@email.com',
    reputation: 4.4,
    totalRatings: 12,
    itemsGiven: 8,
    itemsReceived: 4,
    joinedDate: new Date('2023-10-05'),
    neighborhoods: ['Hayes Valley', 'Castro']
  },
  {
    id: 'user_sarah_kim',
    name: 'Sarah Kim',
    email: 'sarah.k.tech@email.com',
    reputation: 4.7,
    totalRatings: 15,
    itemsGiven: 10,
    itemsReceived: 5,
    joinedDate: new Date('2023-07-22'),
    neighborhoods: ['SOMA', 'Mission Bay']
  }
];

// Sample ratings and reviews
const sampleRatings = [
  {
    itemId: 'item_couch_set',
    fromUserId: 'user_marcus_johnson',
    toUserId: 'user_alexandra_chen',
    rating: 5,
    review: 'Amazing furniture set! Alexandra was super helpful and flexible with pickup time. Everything was exactly as described.',
    createdAt: new Date('2024-01-15')
  },
  {
    itemId: 'item_dining_table',
    fromUserId: 'user_david_park',
    toUserId: 'user_emma_rodriguez',
    rating: 5,
    review: 'Perfect dining table for our new place! Emma was very communicative and even helped us load it into our truck.',
    createdAt: new Date('2024-01-10')
  },
  {
    itemId: 'item_tv_mount',
    fromUserId: 'user_sarah_kim',
    toUserId: 'user_james_wilson',
    rating: 4,
    review: 'Great TV and James helped with the wall mount removal. Very smooth transaction.',
    createdAt: new Date('2024-01-08')
  }
];

// Sample favorites/bookmarks
const sampleFavorites = [
  {
    userId: 'user_alexandra_chen',
    itemId: 'item_herman_miller_chair',
    addedAt: new Date('2024-01-20')
  },
  {
    userId: 'user_marcus_johnson',
    itemId: 'item_kitchenaid_mixer',
    addedAt: new Date('2024-01-18')
  },
  {
    userId: 'user_emma_rodriguez',
    itemId: 'item_exercise_equipment',
    addedAt: new Date('2024-01-16')
  }
];

// Sample message threads and conversations
const sampleMessages = [
  {
    id: 'msg_thread_1',
    itemId: 'item_couch_set',
    participants: ['user_alexandra_chen', 'user_marcus_johnson'],
    messages: [
      {
        id: 'msg_1_1',
        senderId: 'user_marcus_johnson',
        content: 'Hi Alexandra! I\'m interested in your couch set. Is it still available?',
        timestamp: new Date('2024-01-12T10:30:00Z'),
        read: true
      },
      {
        id: 'msg_1_2',
        senderId: 'user_alexandra_chen',
        content: 'Hi Marcus! Yes it\'s still available. Would you like to see more photos or have any questions about dimensions?',
        timestamp: new Date('2024-01-12T11:15:00Z'),
        read: true
      },
      {
        id: 'msg_1_3',
        senderId: 'user_marcus_johnson',
        content: 'That would be great! Also, would this weekend work for pickup? I have a truck available.',
        timestamp: new Date('2024-01-12T14:22:00Z'),
        read: true
      },
      {
        id: 'msg_1_4',
        senderId: 'user_alexandra_chen',
        content: 'Perfect! Saturday afternoon works well. I\'ll send you some additional photos. The couch is 84" long and 36" deep.',
        timestamp: new Date('2024-01-12T15:45:00Z'),
        read: true
      }
    ],
    status: 'completed',
    createdAt: new Date('2024-01-12T10:30:00Z'),
    updatedAt: new Date('2024-01-12T15:45:00Z')
  },
  {
    id: 'msg_thread_2',
    itemId: 'item_kitchenaid_mixer',
    participants: ['user_isabella_martinez', 'user_david_park'],
    messages: [
      {
        id: 'msg_2_1',
        senderId: 'user_david_park',
        content: 'Hi Isabella! I love to bake and this mixer would be perfect. Are all the attachments included?',
        timestamp: new Date('2024-01-18T09:15:00Z'),
        read: true
      },
      {
        id: 'msg_2_2',
        senderId: 'user_isabella_martinez',
        content: 'Hi David! Yes, everything is included - dough hook, whisk, paddle, plus the pasta maker and ice cream bowl attachments. It\'s been well-maintained!',
        timestamp: new Date('2024-01-18T12:30:00Z'),
        read: true
      },
      {
        id: 'msg_2_3',
        senderId: 'user_david_park',
        content: 'Awesome! I can pick it up this week. What days work best for you?',
        timestamp: new Date('2024-01-18T16:45:00Z'),
        read: false
      }
    ],
    status: 'active',
    createdAt: new Date('2024-01-18T09:15:00Z'),
    updatedAt: new Date('2024-01-18T16:45:00Z')
  },
  {
    id: 'msg_thread_3',
    itemId: 'item_exercise_equipment',
    participants: ['user_maria_fitness', 'user_sarah_kim'],
    messages: [
      {
        id: 'msg_3_1',
        senderId: 'user_sarah_kim',
        content: 'Hi Maria! I\'m looking to start a home workout routine. Is this equipment good for beginners?',
        timestamp: new Date('2024-01-20T14:20:00Z'),
        read: true
      },
      {
        id: 'msg_3_2',
        senderId: 'user_maria_fitness',
        content: 'Absolutely! This is perfect for beginners. The resistance bands have different levels, and I can include a beginner workout guide I created.',
        timestamp: new Date('2024-01-20T15:10:00Z'),
        read: true
      },
      {
        id: 'msg_3_3',
        senderId: 'user_sarah_kim',
        content: 'That\'s so generous, thank you! I\'d love the workout guide. When would be good for pickup?',
        timestamp: new Date('2024-01-20T18:30:00Z'),
        read: true
      }
    ],
    status: 'active',
    createdAt: new Date('2024-01-20T14:20:00Z'),
    updatedAt: new Date('2024-01-20T18:30:00Z')
  }
];

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
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    ownerId: "user_alexandra_chen",
    contactInfo: {
      name: "Alexandra Chen",
      phone: "(415) 555-0147",
      email: "alex.chen.sf@email.com"
    },
    rating: 4.8,
    totalViews: 45,
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
    imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
    ownerId: "user_marcus_johnson",
    contactInfo: {
      name: "Marcus Johnson",
      phone: "(415) 555-0284",
      email: "marcus.j@email.com"
    },
    rating: 4.6,
    totalViews: 32,
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
    ownerId: "user_emma_rodriguez",
    contactInfo: {
      name: "Emma Rodriguez",
      phone: "(415) 555-0320",
      email: "emma.r.sf@email.com"
    },
    rating: 4.9,
    totalViews: 28,
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
    ownerId: "user_david_park",
    contactInfo: {
      name: "David Park",
      phone: "(415) 555-1401",
      email: "dpark.hv@email.com"
    },
    rating: 4.4,
    totalViews: 23,
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
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    ownerId: "user_sarah_kim",
    contactInfo: {
      name: "Sarah Kim",
      phone: "(415) 555-0201",
      email: "sarah.k.tech@email.com"
    },
    rating: 4.7,
    totalViews: 38,
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
    ownerId: "user_james_wilson",
    contactInfo: {
      name: "James Wilson",
      phone: "(415) 555-1200",
      email: "jwilson.nob@email.com"
    },
    rating: 4.5,
    totalViews: 52,
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
    ownerId: "user_rachel_zhang",
    contactInfo: {
      name: "Rachel Zhang",
      phone: "(415) 555-0610",
      email: "rachel.mb@email.com"
    },
    rating: 4.6,
    totalViews: 29,
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
    ownerId: "user_isabella_martinez",
    contactInfo: {
      name: "Isabella Martinez",
      phone: "(415) 555-0850",
      email: "isabella.m@email.com"
    },
    rating: 4.8,
    totalViews: 44,
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
    ownerId: "user_thomas_liu",
    contactInfo: {
      name: "Thomas Liu",
      phone: "(415) 555-2020",
      email: "thomas.liu.marina@email.com"
    },
    rating: 4.5,
    totalViews: 31,
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
    ownerId: "user_kevin_chang",
    contactInfo: {
      name: "Kevin Chang",
      phone: "(415) 555-0450",
      email: "kevin.chang.dev@email.com"
    },
    rating: 4.7,
    totalViews: 36,
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
    ownerId: "user_amanda_foster",
    contactInfo: {
      name: "Dr. Amanda Foster",
      phone: "(415) 555-1600",
      email: "afoster.md@email.com"
    },
    rating: 4.9,
    totalViews: 18,
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
    ownerId: "user_jennifer_adams",
    contactInfo: {
      name: "Jennifer Adams",
      phone: "(415) 555-1901",
      email: "jennifer.adams.sf@email.com"
    },
    rating: 4.3,
    totalViews: 25,
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
    ownerId: "user_michael_torres",
    contactInfo: {
      name: "Michael Torres",
      phone: "(415) 555-4201",
      email: "mike.torres.outdoors@email.com"
    },
    rating: 4.6,
    totalViews: 33,
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
    ownerId: "user_luna_rodriguez",
    contactInfo: {
      name: "Luna Rodriguez",
      phone: "(415) 555-0520",
      email: "luna.plants@email.com"
    },
    rating: 4.8,
    totalViews: 56,
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
    ownerId: "user_yuki_tanaka",
    contactInfo: {
      name: "Yuki Tanaka",
      phone: "(415) 555-1255",
      email: "yuki.art.sf@email.com"
    },
    rating: 4.4,
    totalViews: 21,
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
    ownerId: "user_maria_fitness",
    contactInfo: {
      name: "Fitness Coach Maria",
      phone: "(415) 555-2800",
      email: "maria.fitness.sf@email.com"
    },
    rating: 4.7,
    totalViews: 40,
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
    ownerId: "user_board_game_bob",
    contactInfo: {
      name: "Board Game Bob",
      phone: "(415) 555-0401",
      email: "boardgamebob@email.com"
    },
    rating: 4.9,
    totalViews: 35,
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
    ownerId: "user_tech_steve",
    contactInfo: {
      name: "Tech Startup Steve",
      phone: "(415) 555-0555",
      email: "steve.startup.sf@email.com"
    },
    rating: 4.5,
    totalViews: 48,
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
    ownerId: "user_sarah_vintage",
    contactInfo: {
      name: "Sarah Vintage",
      phone: "(415) 555-1234",
      email: "sarah.vintage@email.com"
    },
    isAvailable: false,
    status: "expired",
    rating: 4.2,
    totalViews: 67,
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
    ownerId: "user_happy_helper",
    contactInfo: {
      name: "Happy Helper",
      phone: "(415) 555-0789",
      email: "happy.helper@email.com"
    },
    isAvailable: false,
    status: "picked_up",
    rating: 4.9,
    totalViews: 42
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
    
    // Seed users first
    console.log('👥 Adding sample users...');
    for (let i = 0; i < sampleUsers.length; i++) {
      const user = sampleUsers[i];
      console.log(`👤 Adding user ${i + 1}/${sampleUsers.length}: ${user.name}`);
      
      await addDoc(collection(db, 'users'), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Generate items with various statuses
    const allItems = generateItemsWithStatuses(enhancedDemoItems);

    // Add each demo item to Firestore
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      console.log(`📦 Adding item ${i + 1}/${allItems.length}: ${item.title}`);
      
      await addDoc(collection(db, 'items'), {
        ...item,
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Random time in last 2 weeks
        updatedAt: serverTimestamp()
      });
    }

    // Seed ratings and reviews
    console.log('⭐ Adding sample ratings and reviews...');
    for (let i = 0; i < sampleRatings.length; i++) {
      const rating = sampleRatings[i];
      console.log(`⭐ Adding rating ${i + 1}/${sampleRatings.length}`);
      
      await addDoc(collection(db, 'ratings'), {
        ...rating,
        createdAt: serverTimestamp()
      });
    }
    
    // Seed favorites
    console.log('❤️ Adding sample favorites...');
    for (let i = 0; i < sampleFavorites.length; i++) {
      const favorite = sampleFavorites[i];
      console.log(`❤️ Adding favorite ${i + 1}/${sampleFavorites.length}`);
      
      await addDoc(collection(db, 'favorites'), {
        ...favorite,
        createdAt: serverTimestamp()
      });
    }
    
    // Seed message threads
    console.log('💬 Adding sample message threads...');
    for (let i = 0; i < sampleMessages.length; i++) {
      const thread = sampleMessages[i];
      console.log(`💬 Adding message thread ${i + 1}/${sampleMessages.length}`);
      
      await addDoc(collection(db, 'messageThreads'), {
        ...thread,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('✅ Enhanced demo data seeding completed successfully!');
    console.log(`🎯 Added ${allItems.length} diverse sample items to your database`);
    console.log(`👥 Added ${sampleUsers.length} sample users with reputation scores`);
    console.log(`⭐ Added ${sampleRatings.length} sample ratings and reviews`);
    console.log(`❤️ Added ${sampleFavorites.length} sample favorites`);
    console.log(`💬 Added ${sampleMessages.length} sample message threads`);
    console.log('🗺️  Items are distributed across all SF neighborhoods');
    console.log('📊 Includes various item statuses and urgency levels');
    console.log('💬 Includes realistic user conversations and interactions');
    console.log('🚀 Your app is now ready with comprehensive demo data!');
    
  } catch (error) {
    console.error('❌ Error seeding enhanced demo data:', error);
    process.exit(1);
  }
}

// Load environment variables and run the seeder
require('dotenv').config({ path: '.env.local' });
seedEnhancedDemoData();