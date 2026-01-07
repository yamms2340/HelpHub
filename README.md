# HelpHub — Community-Powered Help Platform

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=mui&logoColor=white)


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
- **Secure Payments** — Razorpay integration for safe and reliable campaign donations
- **Responsive Design** - Mobile-first UI built with Material-UI
- **Redis Caching** - Optimized performance with Redis cache for frequently accessed data

## 🔒 Security

- **Password Hashing:** User passwords are securely hashed using `bcrypt` before storage.
- **OTP-based Email Verification:** New users must verify their email via a time-bound 6-digit OTP before account activation.
- **JWT Authentication:** Secure, stateless authentication using JSON Web Tokens with protected routes enforced via middleware.
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

## Prerequisites
- Node.js (v16+)
- MongoDB
- Redis

## Clone the repository
git clone https://github.com/yamms2340/HelpHub
cd helphub

## Backend Setup
cd backend
npm install
npm run dev

Backend runs at: http://localhost:5000

## Frontend Setup
cd frontend
npm install
npm start

Frontend runs at: http://localhost:3000

## Redis Setup
## Install Redis
sudo apt-get install redis-server

## Start Redis
redis-server

## Verify Redis is running
redis-cli ping

Expected output: PONG

## 🔐 Environment Variables

## Backend .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/helphub
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_ENABLED=true

## Frontend .env
REACT_APP_API_URL=http://localhost:5000/api

## 📡 API Endpoints

**Base URL:** `http://localhost:5000/api` (dev) / `https://helphubplatform.onrender.com/api` (prod)

<details>
<summary>🛠️ System</summary>

- `GET /health` — API status
- `GET /debug/routes` — List all routes
- `GET /debug/cache/stats` — Redis cache stats

</details>

<details>
<summary>🔐 Authentication (OTP Flow)</summary>

**Flow:** `register` → sends OTP → `verify-otp` → `login`

- `POST /auth/register` — `{name, email, password}` → sends OTP
- `POST /auth/verify-otp` — `{email, otp}` → JWT token
- `POST /auth/login` — `{email, password}` → JWT token
- `GET /auth/me` — Current user (cached)
- `PUT /auth/update` — Update profile
- `POST /auth/logout` — Clear cache
- `POST /auth/resend-otp` — `{email}` → new OTP

</details>

<details>
<summary>📋 Requests</summary>

- `GET /requests` — All requests (cached)
- `GET /requests/my` — User requests (cached)
- `GET /requests/:id` — Single request
- `POST /requests` — Create request
- `PUT /requests/:id` — Update request
- `DELETE /requests/:id` — Delete request
- `PUT /requests/:id/offer-help` — Offer help
- `PUT /requests/:id/confirm` — Confirm completion
- `PUT /requests/:id/cancel` — Cancel request
- `GET /requests/search?q=term` — Search requests
- `GET /requests/category/:category` — Filter by category
- `GET /requests/user/:userId` — User requests
- `GET /requests/stats` — Stats
- `GET /requests/stats/user/:userId` — User stats

</details>

<details>
<summary>🎁 Rewards</summary>

- `GET /rewards` — All rewards
- `GET /rewards/coins` — User coins
- `POST /rewards/redeem` — `{rewardId, deliveryDetails}`
- `GET /rewards/redemptions` — User history
- `GET /rewards/categories` — Categories
- `POST /rewards/award-coins` — Admin award

</details>

<details>
<summary>🏆 Leaderboard</summary>

- `GET /leaderboard` — Global (cached)
- `GET /leaderboard?timeframe=all&limit=10` — Filtered
- `GET /leaderboard/user/:id` — User stats
- `GET /leaderboard/user/:id/rank?timeframe=all` — User rank
- `GET /leaderboard/stats/overview` — Overview
- `POST /leaderboard/award-points` — Award points
- `GET /leaderboard/user/:id/points-history?limit=20` — History

</details>

<details>
<summary>💰 Campaigns & Donations</summary>

**Campaigns:**
- `GET /campaigns` — All campaigns
- `GET /campaigns/:id` — Single campaign
- `POST /campaigns` — Create
- `PUT /campaigns/:id` — Update
- `DELETE /campaigns/:id` — Delete
- `POST /campaigns/:id/donate` — Donate
- `GET /campaigns/stats` — Stats

**Donations:**
- `POST /donations/create-order` — Razorpay order
- `POST /donations/verify-payment` — Verify payment
- `GET /donations` — All donations
- `GET /donations/user` — User donations

</details>

<details>
<summary>📝 Content (Posts & Stories)</summary>

**Impact Posts:**
- `GET /impact-posts` — All posts
- `POST /impact-posts` — Create post
- `GET /impact-posts/:id` — Single post
- `PUT /impact-posts/:id` — Update
- `DELETE /impact-posts/:id` — Delete
- `POST /impact-posts/:id/like` — Like
- `DELETE /impact-posts/:id/like` — Unlike

**Stories (Image Upload):**
- `GET /stories` — All stories
- `POST /stories/submit` — `multipart/form-data`
- `GET /stories/:id` — Single story
- `GET /stories/inspiring-stories?limit=10` — Featured
- `GET /stories/search?q=term` — Search
- `GET /stories/stats` — Stats

</details>

<details>
<summary>👥 Help / Community</summary>

- `GET /help/hall-of-fame` — Top helpers
- `GET /help/history/:userId?limit=20` — User history
- `GET /help/stats` — Platform stats
- `GET /help/inspiring-stories?limit=10` — Stories

</details>


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



