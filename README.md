# Support Ticket Management System

An enterprise-grade, full-stack Support Ticket Management System built with **Node.js (Express)**, **MySQL / SQLite**, and **React (Vite)**. Supports role-based access control (RBAC) for Customers and Support Agents, JWT authentication, ticket lifecycle management, comment threads, automated integration tests, and Postman API verification.

---

## 🌟 Key Features

### 👤 Customer Portal
- **User Authentication:** Secure registration and login with bcrypt password hashing and 24-hour JWT tokens.
- **Ticket Creation:** Raise new support tickets with subject, detailed description, and priority level (`low`, `medium`, `high`).
- **Ticket Dashboard:** Track ticket resolution status (`open`, `in_progress`, `closed`), search tickets by keyword, and filter by status.
- **Ticket Ownership Isolation:** Strict authorization checks guarantee customers can only view and comment on their own tickets.

### ⚡ Support Agent Control Center
- **Support Queue Overview:** Realtime counters for unassigned, open, in-progress, and resolved tickets.
- **Queue Management:** Filter tickets by status and priority level.
- **Agent Assignment:** Assign unassigned tickets to specific support agents.
- **Lifecycle Management:** Update ticket status and priority.
- **Interactive Discussion:** Post responses and collaborate with customers directly on ticket threads.

---

## 🏗️ Architecture & Database Schema

### Relational Schema (`database/schema.sql`)

1. **`users` Table:** Stores customers and support agents.
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `name` (VARCHAR)
   - `email` (VARCHAR, UNIQUE)
   - `password_hash` (VARCHAR)
   - `role` (`ENUM('customer', 'agent')`)
   - `created_at` (TIMESTAMP)

2. **`tickets` Table:** Stores customer support requests.
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `user_id` (INT, FOREIGN KEY -> users.id)
   - `subject` (VARCHAR)
   - `description` (TEXT)
   - `priority` (`ENUM('low', 'medium', 'high')`)
   - `status` (`ENUM('open', 'in_progress', 'closed')`)
   - `assigned_to` (INT, NULLABLE FOREIGN KEY -> users.id)
   - `created_at`, `updated_at` (TIMESTAMP)
   - `INDEX idx_status (status)`

3. **`ticket_comments` Table:** Stores activity history on tickets.
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `ticket_id` (INT, FOREIGN KEY -> tickets.id)
   - `user_id` (INT, FOREIGN KEY -> users.id)
   - `comment` (TEXT)
   - `created_at` (TIMESTAMP)

### Sample SQL JOIN Query (Open Tickets with Customer Details)
```sql
SELECT tickets.id, tickets.subject, tickets.status, users.name AS customer_name, users.email
FROM tickets
JOIN users ON tickets.user_id = users.id
WHERE tickets.status = 'open';
```

---

## 🚀 Public Cloud Deployment (Railway & Vercel)

### 1. Database (Railway MySQL)
- Create MySQL instance on Railway.
- Run `database/schema.sql` and `database/seed.sql`.

### 2. Backend API (Railway Node.js)
- Root Directory: `backend`
- Environment Variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`.
- Generates backend API domain e.g. `https://support-ticket-backend.up.railway.app`.

### 3. Frontend App (Vercel React)
- Root Directory: `frontend`
- Environment Variable: `VITE_API_URL=https://support-ticket-backend.up.railway.app/api`
- Generates live public domain e.g. `https://support-ticket-system.vercel.app`.
