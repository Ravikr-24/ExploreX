# 🌍 ExploreX

ExploreX is a MERN stack tourism platform that helps users discover tourist destinations, explore attractions and activities, save favorite places, write reviews, and create personalized travel plans.

The project also includes a secure admin dashboard for managing destinations, users, and reviews.

---

## ✨ Features

### 👤 User Features

- User registration and login
- Secure JWT-based authentication
- Password hashing using bcrypt
- Browse tourist destinations
- Search destinations
- Filter destinations by category, budget, and rating
- View detailed destination information
- Destination image gallery
- Explore attractions and activities
- View attraction and activity images
- Add destinations to favorites
- Remove destinations from favorites
- Add reviews and ratings
- Edit own reviews
- Delete own reviews
- Automatic destination rating calculation
- Create personalized travel plans
- Edit travel plans
- Delete travel plans
- Manage user profile
- Protected user routes
- Automatic logout when authentication token becomes invalid

### 🛠️ Admin Features

- Secure admin authentication
- Role-based authorization
- Admin dashboard
- View total users
- View total destinations
- View total reviews
- View total travel plans
- Add new destinations
- Edit destinations
- Delete destinations
- Manage registered users
- Delete users
- Manage reviews
- Delete reviews
- Protected admin routes

---

## 🔐 Security Features

ExploreX includes several security measures to protect users and APIs:

- JWT authentication
- bcrypt password hashing
- Protected routes
- Role-based authorization
- User ownership checks
- Request validation
- MongoDB ObjectId validation
- Duplicate data prevention
- Mongoose schema validation
- CORS configuration
- Helmet security headers
- API rate limiting
- Authentication rate limiting
- Environment variable protection
- Centralized error handling
- Secure handling of invalid or expired JWT tokens
- Password excluded from user API responses

---

## 🧑‍💻 Tech Stack

### Frontend

- React
- Vite
- React Router
- Redux Toolkit
- React Redux
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Express Validator
- Helmet
- Express Rate Limit
- CORS

### Development Tools

- Visual Studio Code
- MongoDB Compass
- Postman
- Git
- GitHub

---

## 📁 Project Structure

```text
ExploreX/
│
├── client/
│   ├── public/
│   └── src/
│       ├── admin/
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminDestinations.jsx
│       │   ├── AddDestination.jsx
│       │   ├── EditDestination.jsx
│       │   ├── AdminUsers.jsx
│       │   └── AdminReviews.jsx
│       │
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── AdminRoute.jsx
│       │   └── DestinationCard.jsx
│       │
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Explore.jsx
│       │   ├── DestinationDetails.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Profile.jsx
│       │   ├── Favorites.jsx
│       │   ├── TravelPlans.jsx
│       │   └── NotFound.jsx
│       │
│       ├── redux/
│       │   ├── authSlice.js
│       │   └── store.js
│       │
│       ├── services/
│       │   └── api.js
│       │
│       ├── styles/
│       │   └── CSS files
│       │
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── destinationController.js
│   │   ├── reviewController.js
│   │   ├── favoriteController.js
│   │   ├── userController.js
│   │   ├── travelPlanController.js
│   │   └── adminController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimitMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Destination.js
│   │   ├── Review.js
│   │   ├── Favorite.js
│   │   └── TravelPlan.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── destinationRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── favoriteRoutes.js
│   │   ├── userRoutes.js
│   │   ├── travelPlanRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── utils/
│   │   ├── validateObjectId.js
│   │   └── escapeRegex.js
│   │
│   ├── validators/
│   │   └── authValidator.js
│   │
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
🗄️ Database Models




ExploreX uses MongoDB with the following main collections:

User

Stores user account information.

name
email
password
role
profileImage
createdAt
updatedAt
Destination

Stores tourist destination information.

name
description
location
category
images
attractions
activities
bestTimeToVisit
budget
rating
Review

Stores user reviews and ratings.

user
destination
rating
comment
createdAt
updatedAt
Favorite

Stores the destinations saved by users.

user
destination
createdAt
updatedAt
TravelPlan

Stores personalized travel plans.

user
title
destinations
startDate
endDate
budget
notes
createdAt
updatedAt
🚀 Installation and Setup
1. Clone the Repository
git clone YOUR_GITHUB_REPOSITORY_URL

Move into the project folder:

cd ExploreX

Replace YOUR_GITHUB_REPOSITORY_URL with the actual GitHub repository URL after the project is uploaded to GitHub.

2. Install Frontend Dependencies

Open a terminal:

cd client
npm install
3. Install Backend Dependencies

Open another terminal:

cd server
npm install
4. Configure Environment Variables

Inside the server folder, create a file named:

.env

Add:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
CLIENT_URL=http://localhost:5173

Never upload the .env file to GitHub.

The project already contains .env.example as a reference.

5. Start the Backend

Inside the server folder:

npm run dev

The backend will run on:

http://localhost:5000
6. Start the Frontend

Open another terminal:

cd client
npm run dev

The frontend will run on:

http://localhost:5173
🔑 Authentication Flow

ExploreX uses JWT-based authentication.

The authentication process works as follows:

User registers an account.
Password is securely hashed using bcrypt.
User logs in using email and password.
Backend verifies the credentials.
Backend generates a JWT token.
Frontend stores the authentication information.
Axios automatically attaches the JWT token to protected API requests.
Backend verifies the token using authentication middleware.
Protected resources are available only to authenticated users.
Admin resources additionally require the admin role.
🔌 API Endpoints
Authentication
POST /api/auth/register
POST /api/auth/login
Destinations
GET    /api/destinations
GET    /api/destinations/:id
POST   /api/destinations
PUT    /api/destinations/:id
DELETE /api/destinations/:id
Favorites
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:destinationId
Reviews
GET    /api/reviews/:destinationId
POST   /api/reviews
PUT    /api/reviews/:reviewId
DELETE /api/reviews/:reviewId
Travel Plans
GET    /api/travel-plans
POST   /api/travel-plans
PUT    /api/travel-plans/:id
DELETE /api/travel-plans/:id
Users
GET    /api/users
DELETE /api/users/:userId
Admin
GET    /api/admin/stats
GET    /api/reviews/admin
DELETE /api/reviews/admin/:reviewId
🧪 Testing

The application has been tested for:

User registration
User login
Invalid login credentials
Duplicate email registration
JWT authentication
Protected routes
Invalid JWT handling
Expired/invalid authentication token handling
Admin authorization
Normal user access restriction
Destination CRUD operations
Invalid destination IDs
Favorites
Duplicate favorites
Reviews
Review validation
Review ownership
Duplicate reviews
Automatic rating calculation
Travel plan CRUD operations
User management
Admin review management
CORS
Helmet
API rate limiting
Authentication rate limiting
Centralized error handling
Frontend production build
📸 Screenshots

Screenshots can be added here after finalizing the project UI.

Home Page
Add Home Page screenshot here
Explore Page
Add Explore Page screenshot here
Destination Details
Add Destination Details screenshot here
Travel Plans
Add Travel Plans screenshot here
Admin Dashboard
Add Admin Dashboard screenshot here
📦 Production Build

To create a production build of the frontend:

cd client
npm run build

The production files will be generated inside:

client/dist/

The project has been successfully tested with a production build.

🔮 Future Improvements

Some possible future improvements include:

Cloud image storage
Google Maps integration
Weather information for destinations
Destination recommendations
Pagination
Advanced search
Social login
Email verification
Forgot password functionality
Improved admin analytics
Production deployment
Cloud database configuration
👨‍💻 Developer
Ravi Kumar

B.Tech – Computer Science & Engineering

Aspiring Full Stack Developer specializing in the MERN stack.