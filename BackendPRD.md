# Backend Product Requirements Document (PRD)

## 1. Purpose

This PRD defines the backend system for the AI Knowledge Platform. The frontend is complete and will consume REST APIs exposed by this backend. The backend must be scalable, secure, modular, and suitable for future AI integrations.

The primary objectives are:

* Provide a robust API layer for user-authenticated knowledge management
* Implement clean NoSQL data modeling using MongoDB and Mongoose
* Establish a production-grade backend architecture suitable for interviews and real deployment
* Prepare a clear extension path for AI-powered features

---

## 2. Tech Stack (Backend Only)

* Runtime: Node.js (LTS)
* Framework: Express.js
* Database: MongoDB Atlas (Free Tier)
* ODM: Mongoose
* Authentication: JWT (Access Token)
* Password Hashing: bcrypt
* Environment Management: dotenv
* API Style: REST
* AI (future): Abstracted service layer (no direct coupling)

---

## 3. High-Level Architecture

```
Client (React)
   |
   | REST API (JSON)
   v
Express API Layer
   |
Controllers (Business Logic)
   |
Services (Reusable Logic / AI Abstraction)
   |
Mongoose Models
   |
MongoDB Atlas
```

Key architectural rules:

* Controllers do not access MongoDB directly
* Models contain schema and validation only
* Services handle reusable logic and future AI calls
* Routes are thin and declarative

---

## 4. Backend Folder Structure

```
backend/
├── src/
│   ├── server.js            # App entry point
│   ├── app.js               # Express app configuration
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   └── Note.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── notes.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── notes.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── services/
│   │   └── ai.service.js     # Placeholder (future)
│   └── utils/
│       └── token.js
├── .env
├── package.json
└── README.md
```

---

## 5. Core Features (Phase 1)

### 5.1 User Authentication

**Purpose:** Secure access and user-specific data isolation

**Functional Requirements:**

* User registration (email, password)
* User login
* JWT-based authentication
* Password hashing using bcrypt
* Protected routes using middleware

**Non-Functional Requirements:**

* Tokens must expire
* Passwords must never be stored in plain text
* Authentication middleware must be reusable

---

### 5.2 Notes Management (Primary Domain Model)

**Purpose:** Core data entity used across the platform and AI features

**Functional Requirements:**

* Create a note
* Retrieve all notes for authenticated user
* Retrieve single note by ID (user-owned only)
* Update note
* Delete note

**Data Characteristics:**

* Notes belong to a single user
* Notes are text-heavy and AI-consumable
* Notes must support future metadata (tags, embeddings)

---

## 6. Data Models

### 6.1 User Model

Fields:

* email (unique, indexed)
* password (hashed)
* createdAt
* updatedAt

Constraints:

* Email must be unique
* Password minimum length enforced at controller level

---

### 6.2 Note Model

Fields:

* title
* content
* user (ObjectId reference to User)
* createdAt
* updatedAt

Constraints:

* Notes must always be linked to a user
* User cannot access other users' notes

---

## 7. API Contracts

### Auth Routes

```
POST   /api/auth/register
POST   /api/auth/login
```

### Notes Routes (Protected)

```
POST   /api/notes
GET    /api/notes
GET    /api/notes/:id
PUT    /api/notes/:id
DELETE /api/notes/:id
```

All protected routes require:

```
Authorization: Bearer <JWT>
```

---

## 8. Middleware

### Authentication Middleware

Responsibilities:

* Validate JWT
* Extract user ID
* Attach user info to request object

### Error Handling Middleware

Responsibilities:

* Centralized error responses
* Consistent error format
* No stack traces in production

---

## 9. AI Readiness (Phase 2 – Not Implemented Yet)

AI integration must:

* Live inside `services/ai.service.js`
* Never be called directly from controllers
* Accept plain text input (notes)
* Return structured output

Planned AI Use Cases:

* Note summarization
* Knowledge gap detection
* Skill extraction
* Learning recommendations

---

## 10. Non-Functional Requirements

* Clear separation of concerns
* Clean and readable code (interview-ready)
* No hard-coded secrets
* Consistent API response structure
* Scalable schema design

---

## 11. Development Phases

### Phase 1 (Foundation)

* Express setup
* MongoDB connection
* Folder structure

### Phase 2 (Core Functionality)

* Authentication
* Notes CRUD

### Phase 3 (Hardening)

* Error handling
* Input validation
* Code cleanup

### Phase 4 (AI Expansion – Later)

* AI service implementation
* Additional models

---

## 12. Definition of Done (Backend)

* Server starts without errors
* MongoDB connects successfully
* Auth flow works end-to-end
* Notes CRUD works end-to-end
* Frontend can consume all APIs
* Codebase is structured and documented

---

## 13. Guiding Principles

* Simplicity over cleverness
* Vertical slices over horizontal sprawl
* Architecture before features
* AI as an enhancement, not a dependency

---

End of Backend PRD
