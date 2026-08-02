# Expense Splitter - Full Stack MERN Application

A production-ready web application built with MongoDB Atlas, Express.js, React (Vite), and Node.js to manage shared expenses, calculate individual debt balances, and simplify group settlements.


## Features

 **User Authentication**: Register, login, password hashing using `bcryptjs`, and JWT token protection.
 **User Profile Management**: Update personal info and credentials.
 **Group Expense Management**: Create groups (trips, apartment rentals, couples, etc.) and manage group members.
 **Flexible Expense Splitting**:
   Equal split among group members
   Custom split by exact dollar amount
   Custom split by percentage
**Automated Debt Resolution Algorithm**: Calculates net balances and minimal "who owes whom" transactions.
 **Settlement Recording**: Track and record repayments between group members.
 **Modern Responsive UI**: Built with Tailwind CSS, Lucide icons, glassmorphism cards, and responsive sidebar navigation.

---

## Directory Structure

```
expense-splitter/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB Mongoose connection
│   │   ├── controllers/     # API Business logic (auth, user, group, expense, settlement)
│   │   ├── middleware/      # JWT auth guard & central error handling
│   │   ├── models/          # User, Group, Expense, Settlement schemas
│   │   ├── routes/          # Express API route endpoints
│   │   └── utils/           # Debt resolution & balance calculation algorithm
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, StatCards, Modals
│   │   ├── context/         # AuthContext & GroupContext
│   │   ├── pages/           # Login, Register, Dashboard, Groups, GroupDetails, Profile
│   │   ├── services/        # Axios API client setup with JWT interceptor
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .gitignore
├── .env.example
└── README.md
```

---

## Quick Start Guide

### 1. Configure MongoDB Atlas & Environment Variables

Update `backend/.env` with your MongoDB Atlas connection URI:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense_splitter?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_expense_splitter_2026
CLIENT_URL=http://localhost:5173
```

---

### 2. Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd frontend
npm install
```

---

### 3. Run Application Locally

#### Terminal 1 - Start Backend API:
```bash
cd backend
npm run dev
```
## 4 Deployment

Frontend:
Hosted on Vercel

Backend:
Hosted on Render

Database:
MongoDB Atlas
#### Terminal 2 - Start Frontend Dev Server:
```bash
cd frontend
npm run dev
```
## 5 API Endpoints

### Authentication

POST `/api/auth/register`
 Create new account

POST `/api/auth/login`
 Login user


### Expenses

GET `/api/expenses`
Get user expenses

POST `/api/expenses`
 Create expense


### Groups

POST `/api/groups`
 Create a group

GET `/api/groups`
Fetch groups
---

##  6 Future Improvements

 Add Google authentication
 
 Add email notifications for expense reminders
 
 Add payment integration for settlements
