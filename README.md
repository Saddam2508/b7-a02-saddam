# DevPulse API

A collaborative backend platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL

[https://b7-a02-saddam.vercel.app](https://b7-a02-saddam.vercel.app)

## GitHub Repository

[https://github.com/Saddam2508/b7-a02-saddam](https://github.com/Saddam2508/b7-a02-saddam)

---

# Features

- User registration and login with JWT authentication
- Role-based authorization system
- Contributor and Maintainer roles
- Create bug reports and feature requests
- Get all issues with filtering and sorting
- Get single issue details
- Contributor can update only their own open issues
- Maintainer can update any issue
- Maintainer can delete any issue
- Secure password hashing using bcrypt
- PostgreSQL database with raw SQL queries
- Modular Express.js architecture
- TypeScript strict typing
- Centralized response handling
- Environment variable configuration

---

# Tech Stack

| Technology    | Usage                         |
| ------------- | ----------------------------- |
| Node.js       | Runtime environment           |
| TypeScript    | Type safety                   |
| Express.js    | Backend framework             |
| PostgreSQL    | Relational database           |
| neondatabase/ |                               |
| serverless    | PostgreSQL native driver      |
| bcrypt        | Password hashing              |
| jsonwebtoken  | JWT authentication            |
| dotenv        | Environment variables         |
| cors          | Cross-origin resource sharing |
| tsx           | Development server            |

---

# Project Structure

```bash
src/
│
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   └── issue/
│   │
│   ├── middleware/
│   ├── utils/
│   └── config/
│
├── db/
├── app.ts
└── server.ts
```

---

# Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
BCRYPT_SALT_ROUNDS=10
```

---

# Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/Saddam2508/b7-a02-saddam.git
```

## 2. Move Into Project

```bash
cd b7-a02-saddam
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Run Development Server

```bash
npm run dev
```

## 5. Build Project

```bash
npm run build
```

## 6. Start Production Server

```bash
npm start
```

---

# Authentication System

DevPulse uses JWT-based authentication.

## Authentication Flow

1. User registers or logs in
2. Server validates credentials
3. JWT token is generated
4. Client stores token
5. Client sends token in Authorization header
6. Protected routes verify token before processing requests

## Authorization Header

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# User Roles

| Role        | Permissions                                           |
| ----------- | ----------------------------------------------------- |
| contributor | Create issues, view issues, update own open issues    |
| maintainer  | All contributor permissions + update/delete any issue |

---

# Database Schema Summary

## users Table

| Field      | Type                     |
| ---------- | ------------------------ |
| id         | SERIAL PRIMARY KEY       |
| name       | VARCHAR                  |
| email      | VARCHAR UNIQUE           |
| password   | TEXT                     |
| role       | contributor / maintainer |
| created_at | TIMESTAMP                |
| updated_at | TIMESTAMP                |

## issues Table

| Field       | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL PRIMARY KEY            |
| title       | VARCHAR(150)                  |
| description | TEXT                          |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | INTEGER                       |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |

---

# API Endpoints

## Auth Routes

### Register User

```http
POST /api/auth/signup
```

### Login User

```http
POST /api/auth/login
```

---

## Issue Routes

### Create Issue

```http
POST /api/issues
```

Protected Route

---

### Get All Issues

```http
GET /api/issues
```

Query Parameters:

| Param  | Values                      |
| ------ | --------------------------- |
| sort   | newest, oldest              |
| type   | bug, feature_request        |
| status | open, in_progress, resolved |

Example:

```http
GET /api/issues?sort=newest&type=bug
```

---

### Get Single Issue

```http
GET /api/issues/:id
```

---

### Update Issue

```http
PATCH /api/issues/:id
```

Protected Route

Rules:

- Contributor can update only own issue
- Contributor can update only if issue status is open
- Maintainer can update any issue

---

### Delete Issue

```http
DELETE /api/issues/:id
```

Protected Route

Rules:

- Only maintainer can delete issues

---

# Common Response Format

## Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": {}
}
```

---

# Validation Rules

## User Validation

- Name is required
- Email must be unique
- Password is required
- Role must be contributor or maintainer

## Issue Validation

- Title is required
- Title maximum length: 150 characters
- Description minimum length: 20 characters
- Type must be bug or feature_request
- Status must be open, in_progress, or resolved

---

# Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based authorization
- Protected routes
- Environment variable protection
- No password returned in responses

---

# Deployment

Backend Deployment:

- Vercel
- Render
- Railway

Database Hosting:

- NeonDB
- Supabase
- ElephantSQL

---

# Author

Name: Md Saddam Hossain

Email: [saddam.dev26@gmail.com](mailto:saddam.dev26@gmail.com)

GitHub: [https://github.com/Saddam2508](https://github.com/Saddam2508)

---

# License

This project is created for educational and assignment purposes.
