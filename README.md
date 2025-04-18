# Evana
A simple fullstack event booking system built with Next.js and TypeScript. Users can browse events and reserve their spots with real-time capacity checks.

## 🔗 Live Demo

Check out the live app here: [Event Booking App](https://your-live-link.vercel.app)


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗂️ Database Schema Design

This project uses a relational database with three core tables: `Users`, `Events`, and `Bookings`.

### 👤 Users Table

Stores basic information about users.

| Column     | Type      | Description              |
|------------|-----------|--------------------------|
| id         | String    | Primary Key (CUID)       |
| name       | String    | User's full name         |
| email      | String    | Unique email address     |

- `email` is unique to prevent duplicate accounts.

---

### 📅 Events Table

Contains details about each event.

| Column        | Type      | Description                        |
|---------------|-----------|------------------------------------|
| id            | String    | Primary Key (CUID)                 |
| title         | String    | Title of the event                 |
| description   | String    | Event description                  |
| start_time    | DateTime  | When the event starts              |
| max_capacity  | Int       | Maximum allowed bookings           |

---

### 🎟️ Bookings Table

Links users to the events they’ve booked.

| Column     | Type      | Description                            |
|------------|-----------|----------------------------------------|
| id         | String    | Primary Key (CUID)                     |
| user_id    | String    | Foreign Key → Users.id                 |
| event_id   | String    | Foreign Key → Events.id                |

- A **user can book an event only once**: enforced via a composite unique constraint on `user_id + event_id`.
- **Overbooking is prevented**: backend logic checks that current bookings do not exceed `max_capacity`.

## 📌 Assumptions Made
- Users are considered already authenticated; no login/signup flow is implemented.
- Pagination for infinite scroll assumes a default page size of **10 events per request**.
- No roles or permissions are implemented (e.g., admin vs. regular user).
