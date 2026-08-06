# 🎯 ComplaintHub - Online Complaint Registration & Management System

> A modern, full-stack enterprise complaint management web application built with **React (Vite), Node.js, Express, MongoDB Atlas**, and deployed 100% serverless on **Vercel**.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://online-complaint-register-six.vercel.app)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://cloud.mongodb.com)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)

---

## 🌟 Demo Credentials & Links

### 🔗 Live Production URLs
- **Live Web Application**: [https://online-complaint-register-six.vercel.app](https://online-complaint-register-six.vercel.app)
- **GitHub Repository**: [https://github.com/sooryaprakashrnp-wq/online-complaint-register](https://github.com/sooryaprakashrnp-wq/online-complaint-register)

### 🧪 Pre-seeded Demo Credentials
| Role | Email | Password | Dashboard Features |
| --- | --- | --- | --- |
| 🛡️ **Admin** | `admin@demo.com` | `admin123` | Analytics, User Management, Ticket Overrides |
| 🎧 **Agent** | `agent@demo.com` | `agent123` | Ticket Queue, Status Updates, Internal Response |
| 👤 **User** | `user@demo.com` | `user123` | Create Complaint, Live Track, Feedback & Ratings |

---

## 1. 🏗️ Project Architecture & Design System

### 🏛️ System Architecture Diagram
```mermaid
graph TD
    Client["📱 Client Browser (React + Vite SPA)"]
    Vercel["⚡ Vercel Edge Serverless Function (Express API)"]
    Atlas[("🍃 MongoDB Atlas Cloud Database")]

    Client -->|HTTP / JSON Requests| Vercel
    Vercel -->|Mongoose ODM Connection| Atlas
    Atlas -->|Encrypted BSON Documents| Vercel
    Vercel -->|JSON API Response + JWT| Client
```

### 📊 Entity-Relationship (ER) Diagram
```mermaid
erDiagram
    USER ||--o{ COMPLAINT : "creates"
    USER ||--o{ COMPLAINT : "assigned to (Agent)"
    USER ||--o{ FEEDBACK : "submits"
    COMPLAINT ||--o{ MESSAGES : "contains"
    COMPLAINT ||--o| FEEDBACK : "has"

    USER {
        ObjectId _id PK
        string name
        string email
        string password
        enum role "USER | AGENT | ADMIN"
        string phone
        boolean isActive
        datetime createdAt
    }

    COMPLAINT {
        ObjectId _id PK
        string title
        string description
        enum category "Hardware | Software | Network | Billing | Service | Other"
        enum priority "LOW | MEDIUM | HIGH"
        enum status "Pending | Assigned | In Progress | Resolved | Closed"
        ObjectId createdBy FK
        ObjectId assignedAgent FK
        datetime resolvedAt
        array messages
        datetime createdAt
    }

    FEEDBACK {
        ObjectId _id PK
        ObjectId complaintId FK
        ObjectId userId FK
        number rating "1 to 5 Stars"
        string comment
        datetime createdAt
    }
```

### ✨ Key System Features
1. **Logo Splash Screen**: 2-second animated brand intro before navigating to Login.
2. **Role-Based Access Control (RBAC)**: Distinct permissions for User, Agent, and Admin roles.
3. **Real-time Ticket Tracking**: Visual progress badges (`Pending` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`).
4. **Interactive Messaging System**: In-ticket conversation thread between Complaint Creator and Assigned Agent.
5. **Customer Feedback & Ratings**: Star-rating and review portal upon complaint resolution.
6. **Admin Analytics Dashboard**: Statistical chart breakdowns by category, priority, and resolution rate.

### 👥 Roles & Responsibilities

#### 1. 👤 End User
- Register account and log in.
- Submit structured complaints with Category, Priority, and Description.
- Track real-time resolution status of complaints.
- Send messages directly to assigned support agent.
- Submit post-resolution rating (1-5 stars) and feedback.

#### 2. 🎧 Support Agent
- Access designated Agent Dashboard queue.
- Pick up unassigned tickets or work on assigned complaints.
- Change ticket status (`In Progress`, `Resolved`, `Closed`).
- Send progress updates to user via ticket message thread.

#### 3. 🛡️ System Admin
- Monitor complete system metrics and total ticket counts.
- Manage user roles, activate or deactivate accounts.
- View resolution performance analytics and category breakdowns.
- Re-assign tickets to support agents.

### 🔄 User Flow Diagram
```mermaid
sequenceDiagram
    autonumber
    actor U as User / Client
    participant F as React Frontend (Vite)
    participant B as Express API (Vercel)
    participant DB as MongoDB Atlas

    U->>F: Opens Web Application
    F->>F: Displays 2-Second Logo Splash Screen
    F->>U: Redirects to /login
    U->>F: Submits Credentials (user@demo.com / user123)
    F->>B: POST /api/auth/login
    B->>DB: Query User Document
    DB-->>B: User Record & Hashed Password
    B->>B: Verify Password (bcrypt) & Sign JWT
    B-->>F: HTTP 200 (Token & User Profile)
    F->>F: Save JWT in localStorage
    F->>U: Redirect to Role Dashboard (/dashboard)
```

### 🧩 Model-View-Controller (MVC) Pattern Explanation
ComplaintHub strictly follows the industry-standard **MVC Architecture**:

- **Model (`server/models/`)**: Defines the data schema using Mongoose. Encapsulates business logic, indexes, validation rules, and password hashing (`User.js`, `Complaint.js`, `Feedback.js`).
- **View (`client/src/pages/` & `components/`)**: Renders interactive user interfaces using React JSX components, Bootstrap 5, and responsive Tailwind-style CSS tokens.
- **Controller (`server/controllers/`)**: Acts as the intermediary glue. Receives HTTP requests from Express router, processes business logic, interacts with Mongoose Models, and returns structured JSON responses (`authController.js`, `complaintController.js`, `adminController.js`, `feedbackController.js`).

---

## 2. 📁 Project Folder Structure

```
SkillWallet/
├── api/
│   └── index.js                 # Vercel Serverless Function entry point (Express app wrapper)
├── client/                      # React SPA Frontend (Vite)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── _redirects           # Netlify & SPA client-side routing rules
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js         # Axios interceptor with JWT auto-attachment
│   │   │   ├── authService.js   # Auth API calls
│   │   │   └── complaintService.js # Complaint API calls
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Global responsive Navigation Bar
│   │   │   ├── ProtectedRoute.jsx # RBAC Route Guard
│   │   │   └── SplashScreen.jsx # 2-second Animated Logo Splash Screen
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global React State for User & JWT Session
│   │   ├── pages/
│   │   │   ├── Admin/           # Admin Dashboard, Users, Analytics
│   │   │   ├── Agent/           # Agent Ticket Queue Dashboard
│   │   │   ├── Auth/            # LoginPage (with Logo Header), RegisterPage
│   │   │   ├── User/            # User Dashboard, New Complaint, Detail View
│   │   │   └── FeedbackPage.jsx # Star Rating & Review Page
│   │   ├── App.jsx              # Main Route Switcher
│   │   ├── index.css            # Dark/Light Design Token Stylesheet
│   │   └── main.jsx             # React DOM Entrypoint
│   ├── index.html
│   ├── vite.config.js           # Vite build & proxy settings
│   └── package.json
├── server/                      # Node.js Express Backend Engine
│   ├── config/
│   │   └── db.js                # MongoDB Mongoose connection handler
│   ├── controllers/             # Business Logic Controllers
│   │   ├── adminController.js
│   │   ├── agentController.js
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   └── feedbackController.js
│   ├── middleware/              # Express Middlewares
│   │   ├── auth.js              # JWT Verification & Role Authorization
│   │   └── errorHandler.js      # Global Error Middleware
│   ├── models/                  # Mongoose Schemas (User, Complaint, Feedback)
│   ├── routes/                  # Express API Endpoints
│   ├── seed.js                  # Database seeder script for demo users
│   ├── server.js                # Express app initialization
│   ├── startWithMemoryDB.js     # In-memory MongoDB runner for local testing
│   └── package.json
├── package.json                 # Root Vercel Serverless dependency manifest
├── vercel.json                  # Single Vercel Full-Stack deployment rewrites
└── README.md                    # System Documentation
```

---

## 3. ⚙️ Backend Server & Database Setup

### 🔧 Tech Stack
- **Runtime**: Node.js v24+
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose 9.x
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Validation**: express-validator

### 🚀 Running Backend Locally

1. Navigate to the `server/` directory:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://sooryaprakashrnp_db_user:FioUFZeRNcOJmxqv@crcluster0.qsjbkzj.mongodb.net/complaint_db?appName=CRCluster0&retryWrites=true&w=majority
   JWT_SECRET=complaint_system_jwt_secret_key_2024
   JWT_EXPIRE=7d
   ```

3. Start server with In-Memory MongoDB (Local Testing):
   ```bash
   npm run dev
   ```

4. Seed MongoDB Database:
   ```bash
   node seed.js
   ```

---

## 4. 🗄️ Database Development & Schema Design

### 1. `User` Schema
- **`email`**: Unique, lowercase string with regex validation.
- **`password`**: Select `false` by default, hashed via `bcryptjs` in Mongoose `pre('save')` hook.
- **`role`**: Enum `['USER', 'AGENT', 'ADMIN']`.

### 2. `Complaint` Schema
- **`title` & `description`**: Structured complaint text.
- **`category`**: `['Hardware', 'Software', 'Network', 'Billing', 'Service', 'Other']`.
- **`priority`**: `['LOW', 'MEDIUM', 'HIGH']`.
- **`status`**: `['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed']`.
- **`createdBy`**: Ref to `User`.
- **`assignedAgent`**: Ref to `User` (Agent).
- **`messages`**: Array of message objects for ticket chat.

### 3. `Feedback` Schema
- **`complaintId`**: Ref to `Complaint`.
- **`rating`**: Number `(1 to 5)`.
- **`comment`**: Feedback text.

---

## 5. 🎨 Frontend Development

### 🛠️ Tech Stack
- **Framework**: React 19 (Vite 8)
- **Routing**: React Router DOM v7
- **Styling**: Custom CSS Token Palette + Bootstrap 5
- **Icons & Visuals**: UTF-8 Emojis + Chart.js
- **Notifications**: React Toastify

### 🚀 Running Frontend Locally

1. Navigate to `client/`:
   ```bash
   cd client
   npm install
   ```

2. Configure `client/.env`:
   ```env
   VITE_API_URL=/api
   ```

3. Start Vite Dev Server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 6. 🚀 Project Extensions & Future Roadmap

Here are planned future capabilities to further scale the ComplaintHub platform:

- [ ] **AI-Powered Auto Categorization**: Use Gemini Flash API to automatically analyze complaint text and assign category/priority.
- [ ] **Real-time Push Notifications**: WebSockets (Socket.io) for instant alert sounds when an agent replies.
- [ ] **File & Image Attachments**: AWS S3 or Cloudinary integration for uploading screenshots of issue tickets.
- [ ] **SLA Breach Alerts**: Automatic email notifications via Nodemailer when a `HIGH` priority ticket remains unassigned for > 2 hours.
- [ ] **Multi-Language Support (i18n)**: Support for English, Tamil, and Spanish UI localization.

---

## 7. 🌐 Live Production Deployment Summary

ComplaintHub is deployed **100% as a unified full-stack application on Vercel**:

- **Production App Link**: [https://online-complaint-register-six.vercel.app](https://online-complaint-register-six.vercel.app)
- **Vercel Serverless API Handler**: `api/index.js`
- **SPA Rewrite Rule**: `vercel.json` rewrites all non-API paths to `dist/index.html`.

---
*Created & Maintained by Soorya Prakash for ComplaintHub System.*
