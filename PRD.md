# Product Requirements Document (PRD)

## Project Title

AI‑Powered Personal Knowledge & Career Intelligence Platform

## Author

Prabesh Khanal

## Version

v1.0 (Student / Portfolio Build)

---

## 1. Purpose of the Product

The purpose of this product is to build a full‑stack, AI‑ready web application that allows users to store personal knowledge (notes, documents, projects, resumes), query that data intelligently, and receive AI‑driven career insights.

This project is designed to:

* Master MongoDB and NoSQL data modeling
* Use Mongoose effectively (schemas, validation, relationships)
* Demonstrate AI system design aligned with AWS AI Practitioner concepts
* Serve as a strong, explainable portfolio project

This is **not** intended to be a commercial SaaS. It is an interview‑grade engineering project.

---

## 2. Target Users

### Primary User

* Student / early‑career developer
* Preparing for internships or entry‑level roles
* Wants to organize learning and career material

### Secondary User (Future Scope)

* Any knowledge worker managing learning content

---

## 3. Goals and Success Criteria

### Goals

* Allow flexible storage of structured and unstructured data
* Provide AI‑assisted insights without paid services
* Demonstrate clean backend architecture
* Showcase NoSQL best practices

### Success Criteria

* User can store and retrieve all content reliably
* AI pipeline works with mock or local inference
* MongoDB schemas are defensible in interviews
* Application is stable and demo‑ready

---

## 4. Functional Requirements (Step‑by‑Step)

### Phase 1: User Management

#### FR‑1. User Registration

* User can sign up with email and password
* Passwords must be hashed

#### FR‑2. Authentication

* JWT‑based authentication
* Protected routes on backend

#### FR‑3. User Profile

* Basic profile information
* Skill interests (tags)

---

### Phase 2: Knowledge Storage (Core NoSQL Learning)

#### FR‑4. Notes Module

* Create, read, update, delete notes
* Notes can be:

  * Plain text
  * Markdown‑like content
  * Tagged

#### FR‑5. Documents Module

* Upload documents (PDF / text initially)
* Store metadata separately from content

#### FR‑6. Projects Module

* Store projects with:

  * Description
  * Skills used
  * Links
  * Status

#### FR‑7. Skills Module

* Central skills collection
* Reused across projects, resumes, and analysis

---

### Phase 3: Resume & Career Data

#### FR‑8. Resume Storage

* Store multiple resume versions
* Structured sections:

  * Education
  * Experience
  * Skills

#### FR‑9. Resume Versioning

* Maintain history
* Allow comparison (basic)

---

### Phase 4: AI Architecture (Free‑First Design)

#### FR‑10. AI Abstraction Layer

* Central AI service interface
* Supports:

  * Mock AI
  * Local inference
  * Cloud AI (future)

#### FR‑11. Text Processing Pipeline

* Chunk large text
* Store processed output

#### FR‑12. Embedding Placeholder System

* Store vectors or simulated embeddings
* Enable semantic‑style retrieval logic

---

### Phase 5: AI Features

#### FR‑13. Knowledge Q&A

* User can ask questions about stored content
* System retrieves relevant data
* AI generates grounded response

#### FR‑14. Skill Gap Analysis

* Compare resume skills vs target role
* Identify missing skills

#### FR‑15. Learning Recommendations

* Suggest topics based on gaps

---

### Phase 6: Analytics & History

#### FR‑16. AI Interaction History

* Store prompts and responses
* Timestamped

#### FR‑17. Progress Tracking

* Skill growth over time (basic)

---

## 5. Non‑Functional Requirements

### Performance

* API response < 500ms for CRUD

### Security

* JWT authentication
* Input validation via Mongoose

### Scalability

* Designed for future AI service upgrades

### Cost

* Must run at $0/month during development

---

## 6. Data Model Overview (MongoDB)

### Core Collections

* users
* notes
* documents
* projects
* skills
* resumes
* aiInteractions

### Design Principles

* Embed when data is owned by user
* Reference shared entities (skills)
* Avoid deep nesting

---

## 7. API Design (High Level)

### Auth

* POST /auth/register
* POST /auth/login

### Notes

* GET /notes
* POST /notes
* PUT /notes/:id
* DELETE /notes/:id

### AI

* POST /ai/query
* POST /ai/analyze‑resume

---

## 8. Frontend Requirements (React + Tailwind)

### Pages

* Login / Register
* Dashboard
* Notes
* Projects
* Resume
* AI Insights

### UI Principles

* Clean
* Minimal
* Data‑first

---

## 9. File Structure (Monorepo Style)

### Root

```
/ai‑knowledge‑platform
│
├── backend
│   ├── src
│   │   ├── config
│   │   │   └── db.js
│   │   ├── models
│   │   │   ├── User.js
│   │   │   ├── Note.js
│   │   │   ├── Project.js
│   │   │   ├── Skill.js
│   │   │   ├── Resume.js
│   │   │   └── AIInteraction.js
│   │   ├── routes
│   │   │   ├── auth.routes.js
│   │   │   ├── notes.routes.js
│   │   │   ├── ai.routes.js
│   │   ├── services
│   │   │   ├── aiService.js
│   │   │   ├── embeddingService.js
│   │   ├── middleware
│   │   │   └── authMiddleware.js
│   │   ├── controllers
│   │   └── app.js
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── services
│   │   │   └── api.js
│   │   ├── context
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

## 10. Out of Scope (v1)

* Payments
* Multi‑tenant organizations
* Real‑time collaboration
* Heavy AI fine‑tuning

---

## 11. Future Enhancements

* Cloud AI integration (Bedrock / OpenAI)
* Advanced analytics
* Interview simulator

---

## 12. Final Notes

This PRD intentionally prioritizes:

* Architectural clarity
* NoSQL correctness
* AI‑readiness without cost

If built as specified, this project is sufficient for **serious technical interviews**.
