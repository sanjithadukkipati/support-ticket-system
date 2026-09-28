-- Support Ticket Management System - Seed Data

USE support_tickets;

-- Clean existing data
DELETE FROM ticket_comments;
DELETE FROM tickets;
DELETE FROM users;

-- 1. Insert Initial Users
-- Customer 1: Dukkipati Sanjitha (Email: sanjithadukkipati06@gmail.com, Password: sanjitha@123)
-- Customer 2: Bob Smith (Email: customer2@example.com, Password: password123)
-- Support Agent 1: Sarah Connor (Email: agent@example.com, Password: agentpass123)
-- Support Agent 2: Mark Davis (Email: agent2@example.com, Password: agentpass123)

INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Dukkipati Sanjitha', 'sanjithadukkipati06@gmail.com', '$2a$10$DTpdSOR1CYTIguK0RVKnCO6GhWiu4yPAtSWa4VtYZqJhwem5wfuBS', 'customer'),
(2, 'Bob Smith', 'customer2@example.com', '$2a$10$DTpdSOR1CYTIguK0RVKnCO6GhWiu4yPAtSWa4VtYZqJhwem5wfuBS', 'customer'),
(3, 'Sarah Connor (Support)', 'agent@example.com', '$2a$10$yiYQ2DsUjCVai3W6jr/vDOmejhFWk9GueVAz5Wq/ck2DAAh6bKGya', 'agent'),
(4, 'Mark Davis (Support)', 'agent2@example.com', '$2a$10$yiYQ2DsUjCVai3W6jr/vDOmejhFWk9GueVAz5Wq/ck2DAAh6bKGya', 'agent');

-- 2. Insert Sample Tickets
INSERT INTO tickets (id, user_id, subject, description, priority, status, assigned_to) VALUES
(1, 1, 'Cannot access billing dashboard after subscription renewal', 'Whenever I click on the Billing tab in my account settings, it returns a 500 server error page. Please help resolve this urgent issue.', 'high', 'open', NULL),
(2, 1, 'Feature Request: Dark Mode Toggle for Web UI', 'I would love to have a dark theme option in the customer portal for working at night.', 'low', 'in_progress', 3),
(3, 2, 'Password reset link expired before arrival', 'The password reset email took over 45 minutes to land in my inbox and the token was already expired.', 'medium', 'closed', 3);

-- 3. Insert Sample Comments
INSERT INTO ticket_comments (id, ticket_id, user_id, comment) VALUES
(1, 2, 3, 'Hello Sanjitha! We are currently working on a modern dark mode design system and hope to release it soon.'),
(2, 2, 1, 'That sounds awesome Sarah, thank you for the quick response!'),
(3, 3, 3, 'Hi Bob, we updated our mail deliverability settings and re-sent a valid reset link to your email.'),
(4, 3, 2, 'Received and password updated successfully. Closing ticket now.');
