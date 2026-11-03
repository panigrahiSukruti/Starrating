# 🌟 RateSphere - Store Rating Web Application

A full-stack, production-ready web application built according to the **Full Stack Intern Coding Challenge Technical Reference Manual**. The system implements role-based access control (RBAC), atomic rating submissions with compound uniqueness constraints, debounced multi-column search and filtering, bidirectional Zod schema validation, and responsive role-specific dashboards.

---

## 🛠️ Tech Stack & Architecture

- **Frontend (Client)**:
  - React 19 (Vite build tool) with TypeScript
  - Tailwind CSS for modern, responsive UI design
  - React Router v6 for client-side routing & route guards
  - React Hook Form with `@hookform/resolvers/zod` for reactive validation
  - Lucide React icon suite
  - Custom 300ms debounce hook for optimized search queries
- **Backend (Server)**:
  - Node.js LTS with TypeScript & Express.js
  - Modular layered architecture: Controllers, Middleware, Validation Schemas, and Prisma Services
  - Prisma ORM managing relational schemas, cascades, and constraints
  - Stateless JSON Web Tokens (`jsonwebtoken`) with `bcryptjs` hashing (10 salt rounds)
  - Global CORS, rate-limiting (`express-rate-limit`), and Helmet security middleware
  - SQLite database (`dev.db`) out-of-the-box (zero configuration needed, fully compatible with PostgreSQL / MySQL via Prisma provider switch)

---

## 👥 Personas & Capabilities

### 1. System Administrator
- **Analytics Dashboard**: Real-time KPI metrics displaying:
  - Total registered users
  - Total registered stores
  - Total ratings submitted
- **User Management**:
  - Interactive table displaying Name, Email, Address, Role, and Store Average Rating (for Store Owners)
  - Search by Name, Email, and Address (300ms debounced)
  - Role filter dropdown (`ALL`, `ADMIN`, `STORE_OWNER`, `USER`)
  - Multi-column sortable table headers (ASC / DESC)
  - **Add User Modal** with strict bidirectional Zod validation
- **Store Management**:
  - Table displaying Store Name, Email, Address, Overall Rating (stars + numerical value), and Assigned Owner
  - Multi-column sorting and debounced search
  - **Add Store Modal** enforcing 1-to-1 Store Owner constraint (only shows Store Owners not yet assigned to a store)

### 2. Normal User
- **Store Discovery Catalog (`/stores`)**:
  - Browse all registered neighborhood stores
  - Real-time search across Store Name and Address with a 300ms debounce
  - Sort by Store Name, Address, or Highest Rating
  - Display overall ratings rounded to 1 decimal place with Lucide star indicators
- **Interactive 5-Star Rating System**:
  - View personal submitted rating (e.g., `You rated: 5 ★`)
  - Submit a new rating (1 to 5 stars)
  - Modify existing ratings atomically via Prisma compound unique constraint `(userId, storeId)`
- **Registration & Profile**:
  - Public registration form with live inline validation feedback
  - Universal password change view

### 3. Store Owner
- **Operational Dashboard (`/owner/dashboard`)**:
  - Overview card: Store Name, Address, Contact Email, Store Status
  - KPI Cards: Store Overall Average Rating (1 decimal place) and Total Reviews Count
  - Customer Reviews Breakdown Table: Customer Name, Customer Email, Rating (Stars + badge), and Submission Date
  - Sort reviews by Customer Name, Rating, or Submission Date

---

## 🔑 Pre-Seeded Demo Credentials

The database comes pre-seeded with sample users, stores, and ratings. You can test each persona immediately using these credentials (or use the 1-click demo buttons on the login page):

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **👑 System Administrator** | `admin@storerating.com` | `Admin@12345` | System-wide admin access |
| **🏪 Store Owner** | `a.harrison@corporate.org` | `Owner@12345` | Owner of *Central Roasters Cafe* |
| **👤 Normal User** | `user@storerating.com` | `User@12345` | Can rate stores & browse catalog |

---

## 🔒 Form Validations & Business Rules

All validation rules are enforced symmetrically on both client (React Hook Form + Zod) and server (Express Middleware + Zod):

- **Name**: Min 20 characters, Max 60 characters
- **Address**: Max 400 characters
- **Email**: Standard RFC 5322 format, canonical lowercase
- **Password**: 8 to 16 characters, $\ge$ 1 uppercase letter, $\ge$ 1 special character (`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]`)
- **Rating**: Integer value between 1 and 5
- **Store Owner to Store**: Strict 1-to-1 relationship enforced via unique `ownerId`
- **Ratings Duplication Trap**: Enforced atomic upsert via compound unique constraint `@@unique([userId, storeId], name: "user_store_rating_unique")`
- **Floating Point Aggregation**: All averages formatted to 1 decimal place via `Number(avg.toFixed(1))`
- **Information Disclosure Prevention**: Passwords hashes are never returned over the wire (explicit selection masks applied)

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+ or v22+)
- npm

### 1. Install Dependencies
```bash
# In server directory:
cd server
npm install

# In client directory:
cd ../client
npm install
```

### 2. Database Setup & Seed
```bash
cd server
npx prisma db push
npm run seed
```

### 3. Run Development Servers
```bash
# Terminal 1 - Backend Server (Port 5000):
cd server
npm run dev

# Terminal 2 - Frontend Client (Port 5173):
cd client
npm run dev
```

Open your browser at `http://localhost:5173` to explore the application!

### 4. Run Automated API Tests
```bash
cd server
npx tsx test-api.ts
```

