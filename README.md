

https://github.com/user-attachments/assets/b5a2db66-3fca-40db-85aa-b65298a3d86f



# WebDevProject
# Faculty Library Management System (FLMS)

A full-stack library management web application built with Node.js/Express, PostgreSQL, React, and Tailwind CSS.

---

## Project Structure

```
flms/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL pool
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, profile
│   │   │   ├── bookController.js    # CRUD + search/filter
│   │   │   ├── loanController.js    # Borrow, return, renew
│   │   │   └── userController.js    # Admin user management
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT + role authorization
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── books.js
│   │   │   ├── loans.js
│   │   │   └── users.js
│   │   └── app.js
│   ├── schema.sql                   # Database schema
│   ├── seed.js                      # Seed demo data
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js             # Axios instance with auth interceptor
    │   ├── components/
    │   │   ├── BookCard.jsx
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── Pagination.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx      # Global auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Catalog.jsx
    │   │   ├── BookDetails.jsx
    │   │   ├── MyLoans.jsx
    │   │   ├── Profile.jsx
    │   │   └── admin/
    │   │       ├── ManageBooks.jsx
    │   │       ├── ManageLoans.jsx
    │   │       └── ManageUsers.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

 ### Setup Instructions

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

---

### 1. Database Setup

```bash
# Connect to PostgreSQL and run the schema
psql -U postgres -f flms/backend/schema.sql
```

Or manually:
```sql
CREATE DATABASE flms_db;
```

Then run the schema file contents against `flms_db`.

---

### 2. Backend Setup

```bash
cd flms/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/flms_db
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
# Seed demo data
npm run seed

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd flms/frontend

# Install dependencies
npm install

# Create environment file (optional — Vite proxy handles this)
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Demo Accounts (after seeding)

| Role      | Email                   | Password   |
|-----------|-------------------------|------------|
| Admin     | admin@flms.com          | Admin@123  |
| Librarian | librarian@flms.com      | Lib@123    |
| Faculty   | faculty@flms.com        | User@123   |
| Student   | student@flms.com        | User@123   |

---

## Features

### Authentication
- JWT-based register/login/logout
- bcrypt password hashing
- Protected routes by role

### Roles & Permissions
| Feature            | Student | Faculty | Librarian | Admin |
|--------------------|---------|---------|-----------|-------|
| Browse catalog     | ✓       | ✓       | ✓         | ✓     |
| Borrow books       | ✓       | ✓       | ✓         | ✓     |
| Manage books       |         |         | ✓         | ✓     |
| View all loans     |         |         | ✓         | ✓     |
| Manage users       |         |         |           | ✓     |

### Book Catalog
- Search by title, author, ISBN
- Filter by category and availability
- Pagination (12 per page)

### Borrow System
- Student: max 5 books, 14-day period
- Faculty: max 10 books, 30-day period
- Max 2 renewals per loan
- Automatic overdue detection
- No duplicate active borrows

---

## API Endpoints

### Auth
| Method | Endpoint           | Description         |
|--------|--------------------|---------------------|
| POST   | /api/auth/register | Register            |
| POST   | /api/auth/login    | Login               |
| GET    | /api/auth/profile  | Get profile         |
| PUT    | /api/auth/profile  | Update profile      |

### Books
| Method | Endpoint              | Auth Required |
|--------|-----------------------|---------------|
| GET    | /api/books            | No            |
| GET    | /api/books/:id        | No            |
| GET    | /api/books/categories | No            |
| POST   | /api/books            | Librarian+    |
| PUT    | /api/books/:id        | Librarian+    |
| DELETE | /api/books/:id        | Librarian+    |

### Loans
| Method | Endpoint              | Auth Required |
|--------|-----------------------|---------------|
| GET    | /api/loans/my         | Any user      |
| GET    | /api/loans            | Librarian+    |
| POST   | /api/loans/borrow     | Any user      |
| PUT    | /api/loans/:id/return | Any user      |
| PUT    | /api/loans/:id/renew  | Any user      |

### Users
| Method | Endpoint                      | Auth Required |
|--------|-------------------------------|---------------|
| GET    | /api/users                    | Admin         |
| GET    | /api/users/:id                | Admin         |
| PUT    | /api/users/:id/role           | Admin         |
| PUT    | /api/users/:id/toggle-status  | Admin         |
