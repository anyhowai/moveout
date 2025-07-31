# MoveOut Map 🗺️

A Google Maps Platform Awards hackathon MVP where users can post furniture items and browse them on an interactive map.

## 🚀 Features

### Core Features
- **Post Items**: Share furniture with photos, categories, urgency levels, and pickup addresses
- **Interactive Map**: Browse items on Google Maps with urgency-based color coding and item images
- **Directions**: Get directions to pickup locations directly from map markers
- **Real-time Updates**: Items sync across all users via Firebase

### Advanced Features
- **User Authentication**: Sign in with Google or email/password
- **Messaging System**: Contact item owners directly through the platform
- **Favorites**: Save items you're interested in for later
- **Distance Filtering**: Find items within specific distance ranges using geolocation
- **Search & Filters**: Filter by category, urgency, search terms, and distance
- **User Profiles**: Manage your account and view your activity
- **Dashboard**: View your posted items, messages, and favorites
- **Item Expiration**: Automatic cleanup of expired items
- **Status Management**: Track item availability (available, pending, picked up)
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (React) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google OAuth + Email/Password)
- **Storage**: Firebase Storage (images)
- **Maps**: Google Maps JavaScript SDK + APIs (Geocoding, Directions, Places)
- **Geolocation**: Browser Geolocation API with enhanced location services

## 🏃‍♂️ Quick Start

### Prerequisites

1. Node.js 18.17.1+ (check with `node --version`)
2. Google Cloud Platform account with Maps API enabled
3. Firebase project set up

### Required APIs
Enable these Google Cloud Platform APIs:
- **Maps JavaScript API**: For interactive map display
- **Geocoding API**: For address validation and coordinates
- **Directions API**: For navigation routing
- **Places API**: For location search and autocomplete

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd moveout
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your API keys in `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Set up Google Maps API**
   - Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable these APIs in Google Cloud Console:
     - Maps JavaScript API
     - Geocoding API
     - Directions API
     - Places API
   - Create API credentials and restrict by HTTP referrers for security
   - Create an API key and add it to `.env.local`

4. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database (start in test mode for development)
   - Enable Firebase Authentication (Google + Email/Password)
   - Enable Firebase Storage for image uploads
   - Get your config values from Project Settings and add to `.env.local`

5. **Seed demo data (optional)**
   ```bash
   npm run seed-enhanced
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Getting Started

1. **Sign Up/Sign In**: Create an account using Google OAuth or email/password
2. **Allow Location Access**: Enable location services for distance-based filtering (optional)

### Posting an Item

1. Click "Post Item" in the navigation
2. Fill out the form:
   - Item title and description
   - Category (furniture, electronics, clothing, etc.)
   - Urgency level (urgent, moderate, low priority)
   - Upload a photo (optional but recommended)
   - Enter pickup address (with autocomplete)
   - Add pickup deadline if needed
3. Submit the form - your item will appear on the map instantly

### Browsing Items

1. **Map View**: Browse items on the interactive map
   - Items appear as colored markers based on urgency:
     - 🔴 Red: Urgent pickup needed
     - 🟡 Yellow: Moderate urgency
     - 🟢 Green: Flexible timing
   - Click markers to see item details with photos
   - Use "Contact" button to message the owner
   - Click "Get Directions" to navigate to pickup location

2. **List View**: Switch to list view for detailed browsing
   - See all item details, photos, and descriptions
   - Click items to view full details modal

3. **Search & Filter**: Use the search and filter options
   - Search by keywords in title, description, or address
   - Filter by category and urgency level
   - Set distance filters (1-100 miles from your location)
   - View active filters and clear them easily

### Messaging & Communication

1. **Contact Owners**: Click "Contact" on any item to send a message
2. **View Messages**: Access your conversations from the dashboard
3. **Manage Inquiries**: Item owners can respond to interested parties

### Managing Your Account

1. **Dashboard**: View and manage your posted items, messages, and favorites
2. **Profile**: Update your personal information and contact details
3. **Favorites**: Save items you're interested in for easy access later

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Database (Firebase)

Firebase is already configured for production use.

## 🏗️ Project Structure

```
src/
├── app/                     # Next.js app directory
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Home page (map/list view)
│   ├── post/page.tsx       # Post item page
│   ├── dashboard/page.tsx  # User dashboard
│   ├── messages/page.tsx   # Messages page
│   ├── profile/page.tsx    # User profile page
│   └── api/                # API routes
│       ├── items/          # Item management APIs
│       ├── messages/       # Messaging APIs
│       ├── favorites/      # Favorites APIs
│       ├── ratings/        # User ratings APIs
│       └── reports/        # Content reporting APIs
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard tabs and features
│   ├── items/             # Item cards, forms, details
│   ├── map/              # Interactive map components
│   ├── messages/         # Messaging and chat components
│   ├── ratings/          # User reputation system
│   ├── reports/          # Content reporting
│   └── ui/               # Reusable UI components
├── contexts/             # React Context providers
│   ├── auth-context.tsx  # Authentication state
│   └── favorites-context.tsx # Favorites management
├── hooks/                # Custom React hooks
│   ├── use-geolocation.ts     # Location services
│   ├── use-item-expiration.ts # Item expiration handling
│   └── use-enhanced-geolocation.ts # Advanced location features
├── lib/                  # Utilities and configuration
│   ├── firebase.ts       # Firebase configuration
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Helper functions
│   ├── geolocation-utils.ts # Location and distance utilities
│   └── validation.ts     # Form validation helpers
├── scripts/              # Database seeding and utilities
│   └── enhanced-demo-data.js # Demo data seeder
└── styles/               # Global styles
    └── globals.css       # Tailwind CSS and global styles
```

## 📄 License

MIT License - see LICENSE file for details.