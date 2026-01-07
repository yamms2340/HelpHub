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
Frontend: https://helphubplatformfrontend.onrender.com<br>
Backend API: https://helphubplatform.onrender.com


## 🚀 Deployment
- **Frontend:** Deployed on Render (React build)  
  👉https://helphubplatformfrontend.onrender.com

- **Backend:** Deployed on Render (Node.js + Express)  
  👉 https://helphubplatform.onrender.com

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

## 🔒 Security

- **Password Hashing:** User passwords are securely hashed using `bcrypt` before storage.
- **OTP-based Email Verification:** New users must verify their email via a time-bound 6-digit OTP before account activation.
- **OTP Expiry & Validation:** OTPs expire after 10 minutes and are invalidated immediately after successful verification.
- **JWT Authentication:** Secure, stateless authentication using JSON Web Tokens with protected routes enforced via middleware.
- **Access Control:** Unverified users are blocked from login until OTP verification is completed.
- **Sensitive Data Protection:** Passwords, OTPs, and expiry fields are excluded from API responses.
- **Cache Security:** User data cached in Redis is scoped by user ID and invalidated on profile updates and logout.
- **Environment-based Secrets:** JWT secrets, database credentials, and service keys are managed via environment variables.


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

### System
- GET /api/health – API health check

### Authentication
- POST /api/auth/register – Register new user
- POST /api/auth/login – Login user
- POST /api/auth/send-otp – Send OTP
- POST /api/auth/verify-otp – Verify OTP
- GET /api/auth/me – Get current user
- POST /api/auth/refresh – Refresh token
- POST /api/auth/forgot-password – Request password reset
- POST /api/auth/reset-password – Reset password

### Requests
- GET /api/requests – Get all help requests (cached)
- GET /api/requests/my – Get logged-in user requests (cached)
- GET /api/requests/:id – Get request by ID
- POST /api/requests – Create request
- PUT /api/requests/:id – Update request
- DELETE /api/requests/:id – Delete request
- PUT /api/requests/:id/offer-help – Offer help
- PUT /api/requests/:id/confirm – Confirm completion
- PUT /api/requests/:id/cancel – Cancel request
- GET /api/requests/search – Search requests
- GET /api/requests/category/:category – Filter by category
- GET /api/requests/user/:userId – Requests by user
- GET /api/requests/stats – Request statistics
- GET /api/requests/stats/user/:userId – User request stats

### Rewards
- GET /api/rewards – Get all rewards
- GET /api/rewards/coins – Get user coins
- POST /api/rewards/redeem – Redeem reward
- GET /api/rewards/redemptions – Redemption history
- GET /api/rewards/categories – Reward categories
- POST /api/rewards/award-coins – Award coins

### Leaderboard
- GET /api/leaderboard – Global leaderboard (cached)
- GET /api/leaderboard/user/:id – User stats
- GET /api/leaderboard/user/:id/rank – User rank
- GET /api/leaderboard/stats/overview – Overview stats
- POST /api/leaderboard/award-points – Award points
- GET /api/leaderboard/user/:id/points-history – Points history

### Campaigns
- GET /api/campaigns – Get all campaigns
- GET /api/campaigns/:id – Get campaign by ID
- POST /api/campaigns – Create campaign
- PUT /api/campaigns/:id – Update campaign
- DELETE /api/campaigns/:id – Delete campaign
- POST /api/campaigns/:id/donate – Donate to campaign
- GET /api/campaigns/stats – Campaign statistics
- GET /api/campaigns/:id/donations – Campaign donations

### Donations
- POST /api/donations/create-order – Create Razorpay order
- POST /api/donations/verify-payment – Verify payment
- GET /api/donations – All donations
- GET /api/donations/user – User donations
- GET /api/donations/test-razorpay – Razorpay test

### Impact Posts
- GET /api/impact-posts – Get all posts
- GET /api/impact-posts/:id – Get post by ID
- POST /api/impact-posts – Create post
- PUT /api/impact-posts/:id – Update post
- DELETE /api/impact-posts/:id – Delete post
- POST /api/impact-posts/:id/like – Like post
- DELETE /api/impact-posts/:id/like – Unlike post

### Stories
- GET /api/stories – Get all stories
- GET /api/stories/:id – Get story by ID
- POST /api/stories/submit – Submit story (multipart/form-data)
- GET /api/stories/search – Search stories
- GET /api/stories/stats – Story stats
- GET /api/stories/inspiring-stories – Inspiring stories

### Help / Community
- GET /api/help/hall-of-fame – Hall of Fame
- GET /api/help/history/:userId – User help history
- GET /api/help/stats – Help statistics
- GET /api/help/inspiring-stories – Inspiring stories

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



