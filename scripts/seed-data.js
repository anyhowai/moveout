const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Firebase config - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  // This script should be run with proper environment variables
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data definitions
const SAMPLE_USERS = [
  {
    email: 'sarah.chen@email.com',
    displayName: 'Sarah Chen',
    phone: '(555) 123-4567',
    photoURL: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'College student moving out of dorm. Clean, responsive, and reliable!',
    neighborhood: 'Downtown'
  },
  {
    email: 'mike.johnson@email.com',
    displayName: 'Mike Johnson',
    phone: '(555) 234-5678',
    photoURL: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Tech professional downsizing apartment. All items well-maintained.',
    neighborhood: 'Mission District'
  },
  {
    email: 'emma.williams@email.com',
    displayName: 'Emma Williams',
    phone: '(555) 345-6789',
    photoURL: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'Recent graduate with quality furniture. Quick pickup preferred.',
    neighborhood: 'Castro'
  },
  {
    email: 'david.martinez@email.com',
    displayName: 'David Martinez',
    phone: '(555) 456-7890',
    photoURL: 'https://randomuser.me/api/portraits/men/4.jpg',
    bio: 'Family relocating. Great items looking for new homes!',
    neighborhood: 'Sunset'
  },
  {
    email: 'lisa.anderson@email.com',
    displayName: 'Lisa Anderson',
    phone: '(555) 567-8901',
    photoURL: 'https://randomuser.me/api/portraits/women/5.jpg',
    bio: 'Interior designer with curated pieces. Excellent condition guaranteed.',
    neighborhood: 'Nob Hill'
  },
  {
    email: 'alex.thompson@email.com',
    displayName: 'Alex Thompson',
    phone: '(555) 678-9012',
    photoURL: 'https://randomuser.me/api/portraits/men/6.jpg',
    bio: 'Startup employee moving cross-country. Everything must go!',
    neighborhood: 'SOMA'
  },
  {
    email: 'jenny.lee@email.com',
    displayName: 'Jenny Lee',
    phone: '(555) 789-0123',
    photoURL: 'https://randomuser.me/api/portraits/women/7.jpg',
    bio: 'Art student with unique finds. Creative items at great prices.',
    neighborhood: 'Haight-Ashbury'
  },
  {
    email: 'carlos.rodriguez@email.com',
    displayName: 'Carlos Rodriguez',
    phone: '(555) 890-1234',
    photoURL: 'https://randomuser.me/api/portraits/men/8.jpg',
    bio: 'Professional chef with quality kitchen items. Clean and functional.',
    neighborhood: 'Richmond'
  },
  {
    email: 'maria.garcia@email.com',
    displayName: 'Maria Garcia',
    phone: '(555) 901-2345',
    photoURL: 'https://randomuser.me/api/portraits/women/9.jpg',
    bio: 'Fitness enthusiast downsizing. Health-conscious household items.',
    neighborhood: 'Mission Bay'
  },
  {
    email: 'ryan.taylor@email.com',
    displayName: 'Ryan Taylor',
    phone: '(555) 012-3456',
    photoURL: 'https://randomuser.me/api/portraits/men/10.jpg',
    bio: 'Gaming enthusiast with tech gear. Well-cared-for electronics.',
    neighborhood: 'Potrero Hill'
  }
];

const SAMPLE_ITEMS = [
  // Furniture
  {
    title: 'Comfortable Grey Sectional Sofa',
    description: 'IKEA Ektorp sectional in excellent condition. Very comfortable for movie nights! Pet-free and smoke-free home. Covers are machine washable.',
    category: 'furniture',
    urgency: 'moderate',
    address: '123 Market St, San Francisco, CA 94102',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
    ownerIndex: 0,
    status: 'available'
  },
  {
    title: 'Modern Standing Desk with Adjustable Height',
    description: 'Jarvis bamboo standing desk, barely used. Perfect for remote work setup. Includes cable management and memory settings.',
    category: 'furniture',
    urgency: 'low',
    address: '456 Mission St, San Francisco, CA 94105',
    coordinates: { lat: 37.7849, lng: -122.3977 },
    imageUrl: 'https://images.unsplash.com/photo-1498300152072-cd6cfbbdba3a?w=800&h=600&fit=crop',
    ownerIndex: 1,
    status: 'available'
  },
  {
    title: 'Vintage Wooden Dining Chairs (Set of 4)',
    description: 'Beautiful mid-century dining chairs. Some wear consistent with age but structurally sound. Great for someone who appreciates vintage pieces.',
    category: 'furniture',
    urgency: 'urgent',
    address: '789 Castro St, San Francisco, CA 94114',
    coordinates: { lat: 37.7609, lng: -122.4350 },
    imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop',
    ownerIndex: 2,
    status: 'pending',
    pickupDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  },
  {
    title: 'White IKEA Hemnes Dresser',
    description: 'Six-drawer dresser in good condition. One small scratch on top (see photo). Great storage solution for bedroom or closet.',
    category: 'furniture',
    urgency: 'moderate',
    address: '321 Sunset Blvd, San Francisco, CA 94122',
    coordinates: { lat: 37.7649, lng: -122.4649 },
    imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=600&fit=crop',
    ownerIndex: 3,
    status: 'available'
  },
  
  // Electronics
  {
    title: 'MacBook Pro 13" 2020 - Excellent Condition',
    description: 'MacBook Pro M1, 8GB RAM, 256GB SSD. Used for light work only. Includes original charger and box. Screen protector applied since day one.',
    category: 'electronics',
    urgency: 'low',
    address: '555 California St, San Francisco, CA 94108',
    coordinates: { lat: 37.7914, lng: -122.4051 },
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
    ownerIndex: 4,
    status: 'available'
  },
  {
    title: '55" Samsung Smart TV - Like New',
    description: 'Samsung 55" 4K UHD Smart TV, barely used. Purchased last year but moving to smaller place. Includes remote and wall mount.',
    category: 'electronics',
    urgency: 'urgent',
    address: '777 Brannan St, San Francisco, CA 94103',
    coordinates: { lat: 37.7749, lng: -122.4094 },
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop',
    ownerIndex: 5,
    status: 'available',
    pickupDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
  },
  {
    title: 'iPhone 12 Pro - Unlocked, Great Condition',
    description: 'iPhone 12 Pro 128GB in Pacific Blue. Always in case with screen protector. Minor wear on edges. Unlocked for all carriers.',
    category: 'electronics',
    urgency: 'moderate',
    address: '999 Haight St, San Francisco, CA 94117',
    coordinates: { lat: 37.7694, lng: -122.4481 },
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
    ownerIndex: 6,
    status: 'picked_up'
  },
  {
    title: 'PlayStation 5 with Extra Controller',
    description: 'PS5 console with original controller plus extra DualSense controller. Includes original packaging and cables. Adult owned.',
    category: 'electronics',
    urgency: 'low',
    address: '432 Geary St, San Francisco, CA 94102',
    coordinates: { lat: 37.7877, lng: -122.4105 },
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&h=600&fit=crop',
    ownerIndex: 7,
    status: 'available'
  },

  // Kitchen Items
  {
    title: 'KitchenAid Stand Mixer - Red',
    description: 'Classic KitchenAid Artisan mixer in Empire Red. Lightly used, works perfectly. Includes dough hook, wire whip, and flat beater.',
    category: 'kitchen',
    urgency: 'moderate',
    address: '888 Irving St, San Francisco, CA 94122',
    coordinates: { lat: 37.7635, lng: -122.4684 },
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    ownerIndex: 8,
    status: 'available'
  },
  {
    title: 'Complete Dinnerware Set for 8',
    description: 'White ceramic dinnerware set including plates, bowls, mugs. Service for 8 people. A few minor chips but overall great condition.',
    category: 'kitchen',
    urgency: 'low',
    address: '246 Third St, San Francisco, CA 94107',
    coordinates: { lat: 37.7830, lng: -122.3924 },
    imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop',
    ownerIndex: 9,
    status: 'available'
  },
  {
    title: 'Breville Espresso Machine',
    description: 'Breville Barista Express, excellent working condition. Perfect espresso every time. Includes cleaning kit and extra filters.',
    category: 'kitchen',
    urgency: 'urgent',
    address: '135 Townsend St, San Francisco, CA 94107',
    coordinates: { lat: 37.7749, lng: -122.3908 },
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
    ownerIndex: 1,
    status: 'expired',
    pickupDeadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },

  // Books & Media
  {
    title: 'Computer Science Textbooks (Bundle)',
    description: 'Collection of CS textbooks: Data Structures, Algorithms, Database Systems. Great for students. Some highlighting but all readable.',
    category: 'books',
    urgency: 'moderate',
    address: '678 Cole St, San Francisco, CA 94117',
    coordinates: { lat: 37.7676, lng: -122.4507 },
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    ownerIndex: 2,
    status: 'available'
  },
  {
    title: 'Fiction Novel Collection (20+ Books)',
    description: 'Mix of popular fiction including thrillers, romance, and literary fiction. Authors include Gillian Flynn, Stephen King, and more.',
    category: 'books',
    urgency: 'low',
    address: '909 Valencia St, San Francisco, CA 94110',
    coordinates: { lat: 37.7599, lng: -122.4204 },
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
    ownerIndex: 3,
    status: 'available'
  },
  {
    title: 'Vinyl Record Collection - Classic Rock',
    description: 'Vintage vinyl records from the 70s and 80s. Includes Led Zeppelin, Pink Floyd, The Beatles. Well-preserved condition.',
    category: 'books',
    urgency: 'urgent',
    address: '333 Fillmore St, San Francisco, CA 94117',
    coordinates: { lat: 37.7749, lng: -122.4330 },
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    ownerIndex: 4,
    status: 'available',
    pickupDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },

  // Clothing
  {
    title: 'Winter Coat - North Face, Size M',
    description: 'North Face winter coat, mens medium. Excellent condition, rarely worn. Perfect for someone who needs warm outerwear.',
    category: 'clothing',
    urgency: 'moderate',
    address: '444 Pine St, San Francisco, CA 94108',
    coordinates: { lat: 37.7915, lng: -122.4072 },
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
    ownerIndex: 5,
    status: 'available'
  },
  {
    title: 'Designer Handbag - Coach',
    description: 'Authentic Coach handbag in brown leather. Some wear but still in good condition. Comes with authenticity card.',
    category: 'clothing',
    urgency: 'low',
    address: '567 Polk St, San Francisco, CA 94102',
    coordinates: { lat: 37.7850, lng: -122.4183 },
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop',
    ownerIndex: 6,
    status: 'pending'
  },
  {
    title: 'Running Shoes - Nike, Size 10',
    description: 'Nike Air Max running shoes, size 10. Used but still have good tread. Great for casual wear or light jogging.',
    category: 'clothing',
    urgency: 'urgent',
    address: '890 Market St, San Francisco, CA 94102',
    coordinates: { lat: 37.7844, lng: -122.4078 },
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
    ownerIndex: 7,
    status: 'available'
  },

  // Decorative Items
  {
    title: 'Large Monstera Plant in Ceramic Pot',
    description: 'Beautiful, healthy Monstera deliciosa. About 4 feet tall. Comes with decorative ceramic pot. Perfect for plant lovers!',
    category: 'decoration',
    urgency: 'urgent',
    address: '111 Lombard St, San Francisco, CA 94111',
    coordinates: { lat: 37.8024, lng: -122.4058 },
    imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&h=600&fit=crop',
    ownerIndex: 8,
    status: 'available',
    pickupDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
  },
  {
    title: 'Modern Table Lamp - IKEA',
    description: 'Minimalist white table lamp from IKEA. Works perfectly, just doesnt fit my new decor. Includes LED bulb.',
    category: 'decoration',
    urgency: 'moderate',
    address: '222 Bush St, San Francisco, CA 94104',
    coordinates: { lat: 37.7909, lng: -122.4017 },
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=600&fit=crop',
    ownerIndex: 9,
    status: 'available'
  },
  {
    title: 'Framed Abstract Art Print',
    description: 'Large abstract art print in black frame. Modern geometric design. Great statement piece for living room or office.',
    category: 'decoration',
    urgency: 'low',
    address: '333 Kearny St, San Francisco, CA 94108',
    coordinates: { lat: 37.7946, lng: -122.4042 },
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    ownerIndex: 0,
    status: 'picked_up'
  }
];

// Helper function to create user accounts (this would typically be done through Firebase Auth)
async function createSampleUsers() {
  console.log('Creating sample users...');
  const userIds = [];
  
  for (let i = 0; i < SAMPLE_USERS.length; i++) {
    try {
      // In a real scenario, you'd create these through Firebase Auth
      // For now, we'll just store the user data and generate mock UIDs
      const mockUid = `sample_user_${i + 1}_${Date.now()}`;
      userIds.push(mockUid);
      
      // Store additional user data
      await addDoc(collection(db, 'users'), {
        uid: mockUid,
        ...SAMPLE_USERS[i],
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        completedPickups: Math.floor(Math.random() * 20),
      });
      
      console.log(`Created user: ${SAMPLE_USERS[i].displayName}`);
    } catch (error) {
      console.error(`Error creating user ${SAMPLE_USERS[i].displayName}:`, error);
    }
  }
  
  return userIds;
}

// Create sample items
async function createSampleItems(userIds) {
  console.log('Creating sample items...');
  
  for (const item of SAMPLE_ITEMS) {
    try {
      const ownerId = userIds[item.ownerIndex];
      const ownerData = SAMPLE_USERS[item.ownerIndex];
      
      await addDoc(collection(db, 'items'), {
        title: item.title,
        description: item.description,
        category: item.category,
        urgency: item.urgency,
        imageUrl: item.imageUrl,
        address: item.address,
        coordinates: item.coordinates,
        contactInfo: {
          name: ownerData.displayName,
          phone: ownerData.phone,
          email: ownerData.email,
        },
        ownerId: ownerId,
        status: item.status,
        isAvailable: item.status === 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(item.pickupDeadline && { pickupDeadline: item.pickupDeadline }),
      });
      
      console.log(`Created item: ${item.title}`);
    } catch (error) {
      console.error(`Error creating item ${item.title}:`, error);
    }
  }
}

// Main seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    const userIds = await createSampleUsers();
    await createSampleItems(userIds);
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`Created ${SAMPLE_USERS.length} users and ${SAMPLE_ITEMS.length} items.`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Export for use in other scripts
module.exports = {
  seedDatabase,
  SAMPLE_USERS,
  SAMPLE_ITEMS,
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}