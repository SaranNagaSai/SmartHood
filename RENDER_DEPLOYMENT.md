# 🚀 Smart Hood - Render Deployment Guide

Complete guide to deploy your Smart Hood MERN application to Render.com

---

## 📋 Prerequisites

- ✅ Render account (free tier available): https://render.com/
- ✅ GitHub repository with your code
- ✅ MongoDB Atlas account (for database)
- ✅ Firebase project (for authentication & notifications)
- ✅ Cloudinary account (optional, for images)

---

## 🗂️ Deployment Architecture

```
Smart Hood Platform
├── Backend (Node.js/Express) → Render Web Service
├── Frontend (React/Vite) → Render Static Site
└── Database (MongoDB) → MongoDB Atlas (Cloud)
```

---

## 🔧 Part 1: Backend API Deployment

### Step 1: Prepare Backend for Production

**Create `server/package.json` start script:**

Your `package.json` should have:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 2: Create Render Web Service

1. **Login to Render**: https://dashboard.render.com/
2. **Click "New +" → "Web Service"**
3. **Connect Repository**:
   - Click "Connect account" → Authorize GitHub
   - Select your repository: `SmartHood`
   - Click "Connect"

### Step 3: Configure Backend Service

**Basic Settings:**
- **Name**: `smarthood-backend` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Free tier: `Free` (512 MB RAM, sleeps after inactivity)
- Paid: `Starter` ($7/month, always on)

### Step 4: Environment Variables

Click "Advanced" → Add Environment Variables:

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smarthood

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Firebase
FIREBASE_PROJECT_ID=smart-hood-9da8f
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@smart-hood-9da8f.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

⚠️ **IMPORTANT**: For `FIREBASE_PRIVATE_KEY`, keep the `\n` characters as literal `\n` (not actual line breaks)

### Step 5: Deploy Backend

1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. Your backend URL will be: `https://smarthood-backend.onrender.com`
4. Test: Visit `https://smarthood-backend.onrender.com` - should see "Smart Hood Backend is running..."

---

## 🎨 Part 2: Frontend Deployment

### Step 1: Update Frontend API URL

**Update `frontend/.env`:**
```env
VITE_API_URL=https://smarthood-backend.onrender.com/api
```

**IMPORTANT**: Replace with your actual backend URL from Step 1!

### Step 2: Update Build Configuration

**Verify `frontend/package.json` has:**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Step 3: Create Render Static Site

1. **Render Dashboard** → **"New +" → "Static Site"**
2. **Select Repository**: `SmartHood`
3. **Configure**:
   - **Name**: `smarthood-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### Step 4: Add Environment Variables

Add all Firebase variables:
```env
VITE_API_URL=https://smarthood-backend.onrender.com/api
VITE_FIREBASE_API_KEY=AIzaSyDei3YFE5Dj-EbPhr94uGc2kSpkJ-YOet0
VITE_FIREBASE_AUTH_DOMAIN=smart-hood-9da8f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smart-hood-9da8f
VITE_FIREBASE_STORAGE_BUCKET=smart-hood-9da8f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=257024789633
VITE_FIREBASE_APP_ID=1:257024789633:web:b2802755dc73e24d2dd180
VITE_FIREBASE_MEASUREMENT_ID=G-JDC9X9WB9T
VITE_FIREBASE_VAPID_KEY=BKrc4J6FkOxYNZgsZ59c239v4bPi5dnEc2uJRASI2ZvACnSi85Rz-gBin4DNUE3UG9LK9at3xvHpBOxzxeKEWlc
```

### Step 5: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait 3-5 minutes
3. Your app URL: `https://smarthood-frontend.onrender.com`

---

## 🗄️ Part 3: MongoDB Atlas Setup

### Option 1: Already Have MongoDB Atlas

1. **Whitelist Render IPs**:
   - MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add `0.0.0.0/0` (allow from anywhere)
   - OR add specific Render IPs

2. **Get Connection String**:
   - Database → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your actual password
   - Use this in backend environment variables

### Option 2: New MongoDB Atlas Setup

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster** (Free M0 tier)
3. **Create Database User**:
   - Database Access → Add New User
   - Username: `smarthood_user`
   - Password: Generate secure password
4. **Whitelist All IPs**: `0.0.0.0/0`
5. **Get Connection String**:
   ```
   mongodb+srv://smarthood_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smarthood
   ```
6. **Add to Backend Environment Variables**

---

## 🔥 Part 4: Firebase Configuration

### Update Firebase for Production

1. **Firebase Console** → Project Settings → Authorized Domains
2. **Add Your Render Domains**:
   - `smarthood-frontend.onrender.com`
   - `smarthood-backend.onrender.com`

3. **Update CORS** (if needed):
   - Firebase Console → Authentication → Settings
   - Add authorized domains

---

## ✅ Part 5: Verification Checklist

### Backend Health Check

```bash
# Test backend API
curl https://smarthood-backend.onrender.com

# Test specific endpoint
curl https://smarthood-backend.onrender.com/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","username":"test"}'
```

### Frontend Check

1. Visit `https://smarthood-frontend.onrender.com`
2. Try registering a new user
3. Try logging in
4. Check browser console for errors

### Database Check

1. MongoDB Atlas → Browse Collections
2. Verify `users` collection appears after registration

---

## 🚨 Common Issues & Solutions

### Issue 1: Backend Deployment Failed

**Error**: `Module not found`
**Solution**:
- Check `Root Directory` is set to `server`
- Verify `package.json` is in `server/` folder

### Issue 2: Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS Error`
**Solution**:
- Verify `VITE_API_URL` in frontend environment variables
- Check backend `app.js` has CORS enabled:
  ```javascript
  app.use(cors());
  ```

### Issue 3: MongoDB Connection Failed

**Error**: `MongoNetworkError`
**Solution**:
- Whitelist `0.0.0.0/0` in MongoDB Atlas
- Verify connection string is correct
- Check password has no special characters (URL encode if needed)

### Issue 4: Firebase Not Working

**Error**: `Firebase: Error (auth/unauthorized-domain)`
**Solution**:
- Add Render domain to Firebase authorized domains
- Wait 5-10 minutes for Firebase to propagate changes

### Issue 5: Free Tier Sleep

**Issue**: Backend sleeps after 15 minutes
**Solution**:
- Upgrade to paid plan ($7/month)
- OR use a cron job to ping your backend every 14 minutes
- OR use UptimeRobot (free) to keep it awake

---

## 💰 Pricing Summary

**Free Tier (Both Services Free)**:
- Backend: 512 MB RAM, sleeps after inactivity
- Frontend: Unlimited static sites
- MongoDB: 512 MB storage
- **Total**: $0/month

**Recommended Production**:
- Backend Starter: $7/month (always on)
- Frontend: Free
- MongoDB: Free tier
- **Total**: $7/month

---

## 🔄 Continuous Deployment

**Auto-Deploy on Git Push:**
1. Every push to `main` branch triggers auto-deploy
2. Render builds and deploys automatically
3. Check deployment logs in Render dashboard

**Manual Deploy:**
1. Render Dashboard → Your Service
2. Click "Manual Deploy" → "Deploy latest commit"

---

## 📊 Monitoring

### Render Dashboard

- **Logs**: View real-time logs
- **Metrics**: CPU, Memory usage
- **Events**: Deployment history

### Set Up Alerts

1. Render Dashboard → Service → Settings
2. Add notification email
3. Get alerts on deployment failures

---

## 🎯 Production Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Render's environment variable UI
- ✅ Rotate secrets regularly

### 2. Database
- ✅ Enable MongoDB backup
- ✅ Create indexes for performance
- ✅ Monitor database size

### 3. Security
- ✅ Use HTTPS (Render provides free SSL)
- ✅ Enable rate limiting
- ✅ Keep dependencies updated

### 4. Performance
- ✅ Enable caching
- ✅ Optimize images (use Cloudinary)
- ✅ Monitor response times

---

## 📝 Custom Domain (Optional)

### Add Your Own Domain

1. **Render Dashboard** → Frontend Service → Settings
2. **Custom Domain** → Add `www.smarthood.com`
3. **Update DNS** at your domain provider:
   ```
   Type: CNAME
   Name: www
   Value: your-site.onrender.com
   ```
4. Wait for SSL certificate (auto-generated)

---

## 🆘 Support

- **Render Docs**: https://render.com/docs
- **MongoDB Docs**: https://docs.mongodb.com/
- **Firebase Docs**: https://firebase.google.com/docs

---

## ✅ Quick Deploy Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Firebase project configured
- [ ] GitHub repository connected to Render
- [ ] Backend Web Service created
- [ ] Backend environment variables added
- [ ] Backend deployed successfully
- [ ] Frontend Static Site created
- [ ] Frontend environment variables added
- [ ] Frontend deployed successfully
- [ ] Test registration
- [ ] Test login
- [ ] Test all features
- [ ] Monitor logs for errors

---

**🎉 Your Smart Hood platform is now LIVE on Render!**

Backend: `https://smarthood-backend.onrender.com`  
Frontend: `https://smarthood-frontend.onrender.com`
