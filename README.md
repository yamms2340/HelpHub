# HelpHub — Community-Powered Help Platform

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=mui&logoColor=white)

A full-stack MERN application connecting people who need help with those who want to help.

</div>

## 🎯 About

HelpHub is a community-driven platform where users can create help requests, offer assistance to others, earn points for helping, and track their contributions through a leaderboard system.

## 🌐 Live Demo
Frontend: https://helphubplatformfrontend.onrender.com
Backend API: https://helphubplatform.onrender.com

## 🚀 Deployment
- **Frontend:** Deployed on Render (React build)  
  👉https://helphubplatformfrontend.onrender.com

- **Backend:** Deployed on Render (Node.js + Express)  
  👉//helphubplatform.onrender.com

- **Database:** MongoDB Atlas  
  👉 https://www.mongodb.com/atlas

- **Caching:** Redis (enabled for read-heavy APIs)  
  👉 https://redis.io

- **CI/CD:** Auto-deploy on push to `main` branch via Render GitHub integration  
  👉 https://render.com/docs/deploys

## ✨ Features

- **Help Requests System** - Create, browse, and manage help requests with categories and status tracking
- **My Requests Dashboard** - View and manage your personal help requests
- **Points & Leaderboard** - Earn points for helping others and compete on the global leaderboard
- **User Authentication** - Secure JWT-based authentication with OTP verification
- **Responsive Design** - Mobile-first UI built with Material-UI
- **Redis Caching** - Optimized performance with Redis cache for frequently accessed data

## 🛠️ Tech Stack

**Frontend:** React.js, Material-UI, Axios, React Router  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, Redis  
**Authentication:** JWT, OTP Email Verification  
**Caching:** Redis for optimized API performance

## ⚡ Performance

- **Redis Caching** implemented for:
  - Public requests feed
  - User-specific requests
  - Leaderboard data
- Significantly improved response times through intelligent cache invalidation
- Cache hit/miss logging for monitoring

## 🚀 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Redis

### Clone the repository
git clone https://github.com/yamms2340/HelpHub
cd helphub

### Backend Setup
cd backend
npm install
npm run dev

Backend runs at: http://localhost:5000

### Frontend Setup
cd frontend
npm install
npm start

Frontend runs at: http://localhost:3000

### Redis Setup
# Install Redis
sudo apt-get install redis-server

# Start Redis
redis-server

# Verify Redis is running
redis-cli ping

Expected output: PONG

## 🔐 Environment Variables

### Backend .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/helphub
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_ENABLED=true

### Frontend .env
REACT_APP_API_URL=http://localhost:5000/api

## 📡 API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/send-otp - Send OTP for verification
- POST /api/auth/verify-otp - Verify OTP code
- GET /api/auth/me - Get current user

### Requests
- GET /api/requests - Get all help requests (cached)
- GET /api/requests/my - Get user's own requests (cached)
- POST /api/requests - Create new request
- PUT /api/requests/:id/offer-help - Offer help on request
- PUT /api/requests/:id/confirm - Confirm completion

### Leaderboard
- GET /api/leaderboard - Get global leaderboard (cached)
- GET /api/leaderboard/user/:id - Get user stats

## 📁 Project Structure

<img width="354" height="657" alt="image" src="https://github.com/user-attachments/assets/c906ce93-e14d-4abc-82c2-7b7f23d2fa8d" />
<img width="341" height="742" alt="image" src="https://github.com/user-attachments/assets/efa11f82-4377-4ff4-bcec-d143309184b0" />

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: git checkout -b feature/AmazingFeature
3. Commit changes: git commit -m 'Add AmazingFeature'
4. Push to branch: git push origin feature/AmazingFeature
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 📧 Contact

GitHub: @yamms2340
Project: https://github.com/yamms2340/HelpHub



