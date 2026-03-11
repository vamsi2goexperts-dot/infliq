# INFLIQ MVP

A modern social media application inspired by Instagram with unique map-based user discovery, built with React Native (Expo) and Node.js microservices.

## 🚀 Features

- **Map-Based Discovery**: Find users on an interactive world map with category filters
- **OTP Authentication**: Secure login via Twilio SMS OTP
- **Real-Time Messaging**: Chat, Communities, and Debates with Socket.io
- **Posts & Reels**: Share photos and videos with AWS S3 storage
- **Follow System**: Connect with users worldwide
- **Category Filtering**: Verified Voice, Sports, Global, and more

## 📁 Project Structure

```
MVP/
├── backend/
│   ├── services/
│   │   ├── auth-service/      # JWT + Twilio OTP
│   │   ├── user-service/      # Profiles, follow system
│   │   ├── post-service/      # Posts, reels, likes, comments
│   │   ├── chat-service/      # Real-time messaging (Socket.io)
│   │   ├── media-service/     # AWS S3 uploads
│   │   └── feed-service/      # Feed aggregation with Redis cache
│   ├── package.json
│   └── .env
└── mobile/
    ├── src/
    │   ├── screens/           # All app screens
    │   ├── components/        # Reusable components
    │   ├── services/          # API clients
    │   ├── context/           # State management
    │   └── utils/             # Constants, helpers
    ├── App.js
    └── app.json
```

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB (Atlas)
- Redis (Cloud)
- Socket.io
- Twilio (SMS/OTP)
- AWS S3
- JWT Authentication

### Frontend
- React Native (Expo)
- React Navigation
- Google Maps
- Socket.io Client
- Axios

## 📦 Installation

### Backend Setup

```bash
cd backend
npm install

# Start all services
npm run dev

# Or start individual services
npm run dev:auth    # Port 3001
npm run dev:user    # Port 3002
npm run dev:post    # Port 3003
npm run dev:feed    # Port 3004
npm run dev:chat    # Port 3005
npm run dev:media   # Port 3008
```

### Mobile Setup

```bash
cd mobile
npm install

# Start Expo
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run on Web
npx expo start --web
```

## 🔑 Environment Variables

All credentials are configured in `backend/.env`:

- **MongoDB**: Atlas connection string
- **Redis**: Cloud Redis credentials
- **Twilio**: Account SID, Auth Token, Phone Number
- **AWS S3**: Access Key, Secret Key, Bucket Name
- **JWT**: Secret key for token generation

## 🎨 Design

The app follows the INFLIQ design system:

- **Primary Color**: Deep Blue (#00008B)
- **Accent**: Royal Blue (#0000CD)
- **Navigation**: Dark Slate (#5A6C7D)
- **Background**: White, Light Gray

## 📱 Screens

1. **Login/Register** - Email/password + OTP authentication
2. **Map Discovery** - Interactive map with user markers and category filters
3. **Feed** - Posts from followed users with stories
4. **Reels** - Full-screen vertical videos
5. **Messages** - Chats, Communities, Debates tabs
6. **Profile** - User profile with photo grid

## 🔌 API Endpoints

### Auth Service (3001)
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP & login
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - Register user

### User Service (3002)
- `GET /api/users/profile/:id` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/follow/:id` - Follow user
- `GET /api/users/nearby` - Get nearby users
- `GET /api/users/by-category/:category` - Filter by category

### Post Service (3003)
- `POST /api/posts` - Create post/reel
- `GET /api/posts/:id` - Get post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comment` - Comment

### Chat Service (3005)
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id/messages` - Get messages
- Socket.io events: `send-message`, `typing`, `mark-read`

### Media Service (3008)
- `POST /api/media/upload` - Upload to S3
- `DELETE /api/media/:key` - Delete from S3

### Feed Service (3004)
- `GET /api/feed` - Get personalized feed
- `GET /api/feed/stories` - Get stories

## 🧪 Testing

### Test Backend Services

```bash
# Test auth service
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# Health checks
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### Test Mobile App

1. Start Expo: `npx expo start`
2. Scan QR code with Expo Go app
3. Test login with OTP
4. Navigate through bottom tabs
5. Test map discovery with filters

## 🚧 Current Status

### ✅ Completed
- Backend microservices architecture
- Authentication with Twilio OTP
- User service with geolocation
- Post service with likes/comments
- Chat service with Socket.io
- Media service with S3 uploads
- Feed service with Redis caching
- React Native app structure
- Bottom tab navigation
- Login screen
- Map discovery screen
- Messages screen

### 🔄 In Progress
- Profile screen UI
- Feed screen with posts
- Reels video player
- Real-time chat UI
- Profile card overlay on map

### 📋 To Do
- Complete all screen implementations
- Add image/video upload UI
- Implement stories feature
- Add push notifications
- Testing and bug fixes

## 📝 Notes

- **Google Maps API**: Requires API key for production
- **Expo Account**: Needed for building APK/IPA
- **Backend**: All services must be running for full functionality
- **MongoDB**: Ensure connection string is correct
- **Redis**: Cloud Redis is configured and ready

## 🤝 Contributing

This is an MVP project. For production deployment:

1. Add proper error handling
2. Implement comprehensive testing
3. Add rate limiting
4. Set up CI/CD pipeline
5. Configure production environment variables
6. Add monitoring and logging

## 📄 License

MIT

---

**Built with ❤️ using React Native & Node.js**
