# MoveOut Map - Hackathon Demo Script

## Demo Overview (2 minutes)
This demo showcases **MoveOut Map**, a Google Maps Platform Awards hackathon MVP where users can post furniture items and browse them on an interactive map.

## Demo Flow

### 1. Opening Hook (15 seconds)
> "Imagine you're moving out and have furniture to give away, or you're a student looking for free furniture. MoveOut Map connects people through an interactive Google Maps experience."

**Show:** Landing page with map view displaying various furniture items

### 2. Core Feature Demo (60 seconds)

#### A. Browse Items on Map (20 seconds)
- **Action:** Navigate around the map showing different furniture markers
- **Highlight:** 
  - Color-coded urgency levels (red = urgent, yellow = moderate, green = low priority)
  - Item images displayed in info windows
  - Real-time locations with addresses

> "Users can instantly see available furniture in their area with urgency-based color coding and preview images."

#### B. Get Directions (15 seconds)
- **Action:** Click on a furniture marker, then click "Get Directions"
- **Show:** Google Maps directions opening in new tab

> "One-click directions powered by Google Maps API makes pickup coordination seamless."

#### C. Post New Item (25 seconds)
- **Action:** Click "Post Item" button
- **Show:** Item posting form with:
  - Photo upload
  - Category selection (furniture, electronics, etc.)
  - Urgency level selection
  - Address geocoding using Google Places API
- **Complete:** Submit the form and show item appearing on map

> "Posting is simple - upload a photo, set urgency, and our Google Places integration handles address validation."

### 3. Advanced Features Highlight (30 seconds)

#### User Authentication & Messaging
- **Show:** User profile with Google OAuth sign-in
- **Demonstrate:** Contact item owner through built-in messaging system

#### Smart Filtering
- **Action:** Use distance filter slider and category filters
- **Show:** Map updating in real-time based on filters

> "Advanced features include user authentication, direct messaging, distance-based filtering, and real-time updates across all users."

### 4. Technical Stack & Closing (15 seconds)
- **Show:** Quick overview of tech stack slide or code structure
- **Key Points:**
  - Next.js + TypeScript frontend
  - Firebase Firestore & Auth backend
  - Google Maps JavaScript SDK + APIs
  - Responsive design works on mobile/desktop

> "Built with modern web technologies and Google Cloud Platform services, MoveOut Map demonstrates the power of location-based applications for solving real-world problems."

## Demo Data Setup
Before demo, ensure:
1. **Environment variables** are configured (.env.local)
2. **Demo data seeded** using: `npm run seed-enhanced`
3. **Map displays** multiple items across different categories and urgency levels
4. **User account** is ready for authentication demo

## Backup Talking Points
If technical issues occur:
- Emphasize the problem-solving aspect: "Furniture waste and student needs"
- Highlight Google Maps Platform integration
- Discuss scalability and real-world application potential
- Mention responsive design and mobile experience

## Key Demo URLs
- **Live App:** [Your deployment URL]
- **GitHub Repo:** [Your repo URL]
- **Documentation:** README.md with full setup instructions

## Success Metrics to Mention
- Real-time synchronization across users
- Mobile-responsive design
- Google Maps API integration (Geocoding, Directions, Places)
- User authentication and messaging system
- Distance-based filtering and search