const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  query,
  where,
  serverTimestamp 
} = require('firebase/firestore');

// This script creates sample interactions: messages, ratings, favorites, and reports
// Run this AFTER running seed-data.js

const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample message conversations
const SAMPLE_CONVERSATIONS = [
  {
    itemTitle: 'Comfortable Grey Sectional Sofa',
    messages: [
      { sender: 'buyer', content: 'Hi! Is this sofa still available? I\'m very interested.', timestamp: -60 },
      { sender: 'seller', content: 'Yes it is! Are you able to pick it up this weekend?', timestamp: -45 },
      { sender: 'buyer', content: 'Perfect! Saturday afternoon would work great. What time?', timestamp: -30 },
      { sender: 'seller', content: 'How about 2 PM? I can help you load it into your truck.', timestamp: -15 },
      { sender: 'buyer', content: 'Sounds perfect! See you Saturday at 2 PM. Thank you!', timestamp: -5 }
    ]
  },
  {
    itemTitle: 'MacBook Pro 13" 2020 - Excellent Condition',
    messages: [
      { sender: 'buyer', content: 'Is the battery life still good on this MacBook?', timestamp: -120 },
      { sender: 'seller', content: 'Yes! Battery health is at 92%. It easily lasts 8+ hours.', timestamp: -110 },
      { sender: 'buyer', content: 'Great! Any cosmetic damage I should know about?', timestamp: -100 },
      { sender: 'seller', content: 'Just minor scuffs on the bottom. Screen and keyboard are perfect.', timestamp: -90 },
      { sender: 'buyer', content: 'I\'ll take it! When can I pick it up?', timestamp: -80 }
    ]
  },
  {
    itemTitle: '55" Samsung Smart TV - Like New',
    messages: [
      { sender: 'buyer', content: 'Does this TV come with the original remote?', timestamp: -90 },
      { sender: 'seller', content: 'Yes, both the original remote and wall mount are included!', timestamp: -85 },
      { sender: 'buyer', content: 'Excellent! I can pick up tonight if that works?', timestamp: -80 },
      { sender: 'seller', content: 'Tonight works perfectly. Can you come around 7 PM?', timestamp: -75 }
    ]
  },
  {
    itemTitle: 'KitchenAid Stand Mixer - Red',
    messages: [
      { sender: 'buyer', content: 'Hi! What year is this mixer from?', timestamp: -150 },
      { sender: 'seller', content: 'I bought it in 2019, so it\'s about 4 years old but lightly used.', timestamp: -140 },
      { sender: 'buyer', content: 'Does it come with all the original attachments?', timestamp: -135 },
      { sender: 'seller', content: 'Yes! Dough hook, wire whip, and flat beater all included.', timestamp: -130 }
    ]
  },
  {
    itemTitle: 'Vintage Wooden Dining Chairs (Set of 4)',
    messages: [
      { sender: 'buyer', content: 'These chairs look beautiful! How\'s the structural integrity?', timestamp: -200 },
      { sender: 'seller', content: 'They\'re very solid! I\'ve been using them daily for 3 years.', timestamp: -190 },
      { sender: 'buyer', content: 'Perfect! I love vintage furniture. Can I see them tomorrow?', timestamp: -180 },
      { sender: 'seller', content: 'Absolutely! How about 3 PM? I\'m in the Castro area.', timestamp: -175 },
      { sender: 'buyer', content: 'See you at 3 PM tomorrow. Can\'t wait!', timestamp: -170 }
    ]
  }
];

// Sample ratings and reviews
const SAMPLE_RATINGS = [
  {
    itemTitle: 'iPhone 12 Pro - Unlocked, Great Condition',
    rating: 5,
    review: 'Exactly as described! Phone was in perfect condition and pickup was smooth. Great seller!',
    pickupExperience: 'excellent'
  },
  {
    itemTitle: 'Framed Abstract Art Print',
    rating: 4,
    review: 'Beautiful art piece and fair price. Seller was very responsive and helpful.',
    pickupExperience: 'good'
  },
  {
    itemTitle: 'Comfortable Grey Sectional Sofa',
    rating: 5,
    review: 'Amazing sofa and even helped me load it! Very friendly and accommodating.',
    pickupExperience: 'excellent'
  },
  {
    itemTitle: 'Modern Standing Desk with Adjustable Height',
    rating: 4,
    review: 'Desk works great and was easy to disassemble for transport. Minor scratches but overall good.',
    pickupExperience: 'good'
  },
  {
    itemTitle: 'MacBook Pro 13" 2020 - Excellent Condition',
    rating: 5,
    review: 'Perfect laptop! Battery life is exactly as promised. Very professional seller.',
    pickupExperience: 'excellent'
  },
  {
    itemTitle: '55" Samsung Smart TV - Like New',
    rating: 5,
    review: 'TV works perfectly and all accessories included. Quick and easy pickup!',
    pickupExperience: 'excellent'
  }
];

// Sample favorites (which users have favorited which items)
const SAMPLE_FAVORITES = [
  { userIndex: 0, itemTitle: 'MacBook Pro 13" 2020 - Excellent Condition' },
  { userIndex: 0, itemTitle: 'Modern Table Lamp - IKEA' },
  { userIndex: 1, itemTitle: 'KitchenAid Stand Mixer - Red' },
  { userIndex: 1, itemTitle: 'PlayStation 5 with Extra Controller' },
  { userIndex: 2, itemTitle: '55" Samsung Smart TV - Like New' },
  { userIndex: 2, itemTitle: 'Large Monstera Plant in Ceramic Pot' },
  { userIndex: 3, itemTitle: 'Comfortable Grey Sectional Sofa' },
  { userIndex: 4, itemTitle: 'Vintage Wooden Dining Chairs (Set of 4)' },
  { userIndex: 5, itemTitle: 'Computer Science Textbooks (Bundle)' },
  { userIndex: 6, itemTitle: 'Winter Coat - North Face, Size M' },
  { userIndex: 7, itemTitle: 'Fiction Novel Collection (20+ Books)' },
  { userIndex: 8, itemTitle: 'Complete Dinnerware Set for 8' }
];

// Sample reports
const SAMPLE_REPORTS = [
  {
    itemTitle: 'Running Shoes - Nike, Size 10',
    category: 'misleading',
    reason: 'Photos don\'t match actual condition',
    description: 'The shoes shown in photos appear much newer than described'
  },
  {
    itemTitle: 'Designer Handbag - Coach',
    category: 'fraud',
    reason: 'Suspected counterfeit item',
    description: 'Authenticity card looks suspicious and hardware quality seems poor'
  }
];

async function getUsers() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const users = [];
  usersSnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  return users;
}

async function getItems() {
  const itemsSnapshot = await getDocs(collection(db, 'items'));
  const items = [];
  itemsSnapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });
  return items;
}

async function createMessageThreads(users, items) {
  console.log('Creating message threads and conversations...');
  
  for (const conversation of SAMPLE_CONVERSATIONS) {
    const item = items.find(item => item.title === conversation.itemTitle);
    if (!item) continue;
    
    const seller = users.find(user => user.uid === item.ownerId);
    const buyer = users[Math.floor(Math.random() * users.length)];
    
    if (seller.uid === buyer.uid) continue; // Skip if same user
    
    // Create thread
    const threadRef = await addDoc(collection(db, 'message_threads'), {
      itemId: item.id,
      itemTitle: item.title,
      buyerId: buyer.uid,
      sellerId: seller.uid,
      lastMessage: conversation.messages[conversation.messages.length - 1].content,
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      unreadCount: {
        [buyer.uid]: 0,
        [seller.uid]: 0
      }
    });
    
    // Create messages
    for (const msg of conversation.messages) {
      const senderId = msg.sender === 'seller' ? seller.uid : buyer.uid;
      const recipientId = msg.sender === 'seller' ? buyer.uid : seller.uid;
      
      await addDoc(collection(db, 'messages'), {
        threadId: threadRef.id,
        senderId,
        recipientId,
        content: msg.content,
        createdAt: new Date(Date.now() + msg.timestamp * 60 * 1000), // Convert minutes to milliseconds
        isRead: true
      });
    }
    
    console.log(`Created conversation for: ${conversation.itemTitle}`);
  }
}

async function createRatings(users, items) {
  console.log('Creating sample ratings...');
  
  for (const rating of SAMPLE_RATINGS) {
    const item = items.find(item => item.title === rating.itemTitle);
    if (!item) continue;
    
    const ratedUser = users.find(user => user.uid === item.ownerId);
    const rater = users.find(user => user.uid !== item.ownerId);
    
    if (!ratedUser || !rater) continue;
    
    await addDoc(collection(db, 'ratings'), {
      itemId: item.id,
      raterId: rater.uid,
      ratedUserId: ratedUser.uid,
      rating: rating.rating,
      review: rating.review,
      pickupExperience: rating.pickupExperience,
      createdAt: serverTimestamp()
    });
    
    console.log(`Created rating for: ${rating.itemTitle}`);
  }
}

async function createFavorites(users, items) {
  console.log('Creating sample favorites...');
  
  for (const favorite of SAMPLE_FAVORITES) {
    const user = users[favorite.userIndex];
    const item = items.find(item => item.title === favorite.itemTitle);
    
    if (!user || !item) continue;
    
    await addDoc(collection(db, 'favorites'), {
      userId: user.uid,
      itemId: item.id,
      createdAt: serverTimestamp()
    });
    
    console.log(`Created favorite: ${user.displayName} → ${favorite.itemTitle}`);
  }
}

async function createReports(users, items) {
  console.log('Creating sample reports...');
  
  for (const report of SAMPLE_REPORTS) {
    const item = items.find(item => item.title === report.itemTitle);
    const reporter = users[Math.floor(Math.random() * users.length)];
    
    if (!item || !reporter) continue;
    
    await addDoc(collection(db, 'reports'), {
      reporterId: reporter.uid,
      reportedItemId: item.id,
      category: report.category,
      reason: report.reason,
      description: report.description,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    console.log(`Created report for: ${report.itemTitle}`);
  }
}

async function createUserReputations(users) {
  console.log('Creating user reputation records...');
  
  // Get all ratings to calculate reputations
  const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
  const ratingsByUser = {};
  
  ratingsSnapshot.forEach((doc) => {
    const rating = doc.data();
    if (!ratingsByUser[rating.ratedUserId]) {
      ratingsByUser[rating.ratedUserId] = [];
    }
    ratingsByUser[rating.ratedUserId].push(rating.rating);
  });
  
  // Create reputation records
  for (const user of users) {
    const userRatings = ratingsByUser[user.uid] || [];
    
    if (userRatings.length > 0) {
      const averageRating = userRatings.reduce((sum, rating) => sum + rating, 0) / userRatings.length;
      const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      userRatings.forEach(rating => {
        ratingBreakdown[rating]++;
      });
      
      await addDoc(collection(db, 'user_reputation'), {
        userId: user.uid,
        averageRating: Math.round(averageRating * 100) / 100,
        totalRatings: userRatings.length,
        ratingBreakdown,
        completedPickups: userRatings.length,
        joinedDate: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      console.log(`Created reputation for: ${user.displayName} (${averageRating.toFixed(1)} stars)`);
    }
  }
}

async function seedInteractions() {
  try {
    console.log('🌱 Starting interactions seeding...');
    
    const users = await getUsers();
    const items = await getItems();
    
    if (users.length === 0 || items.length === 0) {
      console.error('❌ No users or items found. Please run seed-data.js first.');
      return;
    }
    
    await createMessageThreads(users, items);
    await createRatings(users, items);
    await createFavorites(users, items);
    await createReports(users, items);
    await createUserReputations(users);
    
    console.log('✅ Interactions seeding completed successfully!');
    console.log(`Created conversations, ratings, favorites, and reports for ${users.length} users and ${items.length} items.`);
    
  } catch (error) {
    console.error('❌ Error seeding interactions:', error);
  }
}

// Export for use in other scripts
module.exports = {
  seedInteractions
};

// Run if called directly
if (require.main === module) {
  seedInteractions();
}