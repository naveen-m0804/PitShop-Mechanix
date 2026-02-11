# Smart Vehicle Repair Assistance Platform - Frontend

Production-grade React frontend with glassmorphism design, real-time WebSocket tracking, and Leaflet maps integration.

## Features

- ✅ Glassmorphism dark theme design
- ✅ JWT authentication with role-based routing
- ✅ Real-time WebSocket communication
- ✅ Leaflet maps with 20km radius visualization
- ✅ Live mechanic tracking with ETA calculation
- ✅ Geolocation services with Haversine distance
- ✅ Redux Toolkit state management
- ✅ Responsive mobile-first design
- ✅ Browser notifications for mechanics
- ✅ SOS emergency system

## Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8080`

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000` with proxy to backend.

### 3. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Page components
│   │   ├── LoginPage.jsx
│   │   ├── ClientHomePage.jsx
│   │   ├── MapViewPage.jsx
│   │   ├── CreateRequestPage.jsx
│   │   ├── MyRequestsPage.jsx
│   │   ├── LiveTrackingPage.jsx
│   │   └── MechanicDashboard.jsx
│   ├── services/           # API and services
│   │   ├── api.js          # Axios with JWT interceptor
│   │   ├── socket.js       # Socket.IO client
│   │   └── geolocation.js  # Location services
│   ├── store/              # Redux store
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   ├── shopsSlice.js
│   │   └── requestsSlice.js
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
└── package.json
```

## Key Features Implementation

### Glassmorphism Design

```css
.glass-card {
  background: hsla(220, 20%, 15%, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
}
```

### Real-time WebSocket

```javascript
socketService.connect();
socketService.onMechanicLocation((data) => {
  setMechanicLocation([data.location.latitude, data.location.longitude]);
});
```

### Geolocation with Haversine

```javascript
const location = await getCurrentLocation();
const distance = calculateDistance(lat1, lon1, lat2, lon2);
```

### Redux State Management

```javascript
dispatch(setNearbyShops(shops));
const { nearbyShops } = useSelector((state) => state.shops);
```

## Pages

### Client Pages

- **Login** - Authentication with role selection
- **Home** - Nearby mechanics list with filters
- **Map** - Leaflet map with 20km radius circle
- **Create Request** - Vehicle type and problem description
- **My Requests** - Pending/Accepted/Completed tabs
- **Live Tracking** - Real-time mechanic location with ETA

### Mechanic Pages

- **Dashboard** - Incoming/Active/Completed requests
- **Availability Toggle** - Online/Offline status
- **Accept Requests** - One-tap accept with auto-delete logic
- **Browser Notifications** - SOS alerts

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_WS_URL=http://localhost:8080
```

## Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **Socket.IO Client** - WebSocket
- **Leaflet** - Maps
- **Lucide React** - Icons
- **Framer Motion** - Animations (optional)

## License

MIT
