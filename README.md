# Smart Hood - Community Management Platform

![Smart Hood](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Completion](https://img.shields.io/badge/Completion-100%25-success)

## 🎯 Project Overview

Smart Hood is a comprehensive MERN stack community management platform for community connectivity, local services, tourism discovery, and emergency management.

### Key Features

✅ **User Registration & Authentication** - 13-field form, Unique ID (ABC12), Location hierarchy  
✅ **Service Request System** - Post requests, "I'm Interested" flow, Revenue tracking  
✅ **Geographic Navigation** - State slideshow, 4-level drill-down, Real-time filtering  
✅ **Tourism Module** - Browse places, Image gallery, Rating & reviews  
✅ **Emergency Alerts** - Priority-based posts, Location filtering  
✅ **Events Management** - Community events, RSVP functionality  

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB
- Firebase project

### Installation
```bash
# Clone repository
git clone <repository-url>
cd SmartHood

# Backend setup
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env  
# Edit .env with Firebase config
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

---

## 📁 Project Structure

```
SmartHood/
├── server/          # Node.js Backend
│   ├── models/     # MongoDB models
│   ├── controllers/# Request handlers
│   ├── routes/     # API routes
│   └── middleware/ # Auth & validation
├── frontend/        # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
└── README.md
```

---

## 🔐 Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smarthood
JWT_SECRET=your_secret_key
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccountKey.json

# Web Push (VAPID) - required for /api/notifications/subscribe and push delivery
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📊 Core Modules

### 1. Authentication
- Registration with 13 fields
- Unique ID generation (ABC12 format)
- JWT-based login (no OTP)

### 2. Service Request System
- Post requests/offers
- Interest tracking
- Revenue tracking (Generated/Spent)
- Completion verification via Unique ID

### 3. Tourism Module
- Place browsing with category filters
- Image galleries
- 5-star ratings & reviews
- Nearby recommendations

### 4. Geographic Navigation
- State → District → Town → Locality
- Real-time content filtering
- Breadcrumb navigation

---

## 🌐 Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register user |
| `/api/auth/login` | POST | Login user |
| `/api/services` | GET/POST | Services CRUD |
| `/api/tourism/places` | GET/POST | Tourism CRUD |
| `/api/tourism/places/:id/review` | POST | Add review |
| `/api/locations/states` | GET | Get states |
| `/api/emergency` | GET/POST | Emergencies |

---

## 🎯 Completion Status

| Module | Status |
|--------|--------|
| Registration & Auth | ✅ 100% |
| Service System | ✅ 100% |
| Tourism Module | ✅ 100% |
| Geographic Navigation | ✅ 100% |
| Emergency Alerts | ✅ 100% |
| Revenue Tracking | ✅ 100% |

**Overall: 100% Production Ready** 🎉

---

## 📱 Tech Stack

**Backend:** Node.js, Express, MongoDB, Socket.IO, Firebase Admin  
**Frontend:** React 18, React Router, Framer Motion, Axios, i18next  

---

## 🚢 Deployment

**Backend:** Deploy to Heroku/AWS/DigitalOcean  
**Frontend:** Deploy to Vercel/Netlify (`npm run build`)

---

## 📞 Support

Contact: support@smarthood.com

**Built with ❤️ for Smart Communities** 🏘️
