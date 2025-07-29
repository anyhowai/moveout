# MoveOut Map 🗺️

A Google Maps Platform Awards hackathon MVP where users can post furniture items and browse them on an interactive map.

## 🚀 Features

- **Post Items**: Share furniture with photos, categories, urgency levels, and pickup addresses
- **Interactive Map**: Browse items on Google Maps with urgency-based color coding
- **Directions**: Get directions to pickup locations
- **Real-time Updates**: Items sync across all users via Firebase

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (React) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes  
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (images)
- **Maps**: Google Maps JavaScript SDK + APIs (Geocoding, Directions)

## 🏃‍♂️ Quick Start

### Prerequisites

1. Node.js 18.17.1+ (check with `node --version`)
2. Google Cloud Platform account with Maps API enabled
3. Firebase project set up

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
   - Enable these APIs in Google Cloud Console:
     - Maps JavaScript API
     - Geocoding API
     - Directions API
   - Create an API key and add it to `.env.local`

4. **Set up Firebase**
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Firebase Storage
   - Get your config values and add to `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Posting an Item

1. Click "Post Item" in the navigation
2. Fill out the form:
   - Item title and description
   - Category and urgency level
   - Upload a photo (optional)
   - Enter pickup address
   - Add your contact information
3. Submit the form

### Browsing Items

1. View the interactive map on the home page
2. Items appear as colored markers based on urgency:
   - 🔴 Red: Urgent pickup needed
   - 🟡 Yellow: Moderate urgency
   - 🟢 Green: Flexible timing
3. Click markers to see item details
4. Click "Get Directions" to navigate to pickup location

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
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page (map view)
│   ├── post/           # Post item page
│   └── api/            # API routes
├── components/         # React components
│   ├── map/           # Map-related components
│   ├── items/         # Item-related components
│   └── ui/            # Reusable UI components
├── lib/               # Utilities and config
│   ├── firebase.ts    # Firebase configuration
│   ├── types.ts       # TypeScript types
│   └── utils.ts       # Helper functions
└── styles/            # Global styles
```

## 🎯 Demo Script (2 minutes)

1. **Opening** (15s): "MoveOut Map helps people find furniture during moves"
2. **Map Demo** (45s): Show existing items on map, click markers, get directions
3. **Post Item** (45s): Add new furniture item with photo and details
4. **Integration** (15s): Show new item appearing on map in real-time

## 🤝 Contributing

This is a hackathon MVP. Follow the coding guidelines in `CLAUDE.md` for any contributions.

## 📄 License

MIT License - see LICENSE file for details.