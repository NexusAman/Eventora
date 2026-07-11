# Eventora

**Eventora** is a full-stack event discovery and booking platform. It gives attendees a simple way to discover events, reserve a seat through email OTP verification, and manage their bookings—while providing administrators with a central workspace to create events and review booking requests.

## Highlights

- Browse upcoming events with rich details, pricing, availability, dates, and locations.
- Search events by title, description, location, or category with a debounced search experience.
- Register and verify accounts through a six-digit, email-delivered OTP.
- Authenticate users securely with JWT-based sessions and hashed passwords.
- Request an event booking using a second OTP verification flow.
- Track booking states: `pending`, `confirmed`, and `cancelled`.
- Protect capacity with live available-seat tracking; seats are restored when confirmed bookings are cancelled.
- Give administrators role-protected tools to create, edit, and delete events; view every booking; and confirm or cancel requests.
- Record payment status for confirmed bookings and surface revenue, paid-client, and pending-request statistics in the admin dashboard.
- Send email notifications for OTPs and confirmed bookings.
- Use a modern, responsive UI built for desktop and mobile.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Axios, React Icons |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Email | Nodemailer with Gmail SMTP |
| Development | ESLint, Nodemon |

## Project Structure

```text
Eventora/
├── client/                  # React + Vite application
│   └── src/
│       ├── components/      # Shared UI components
│       ├── context/         # Authentication state
│       ├── pages/           # Home, event, user, and admin pages
│       └── utils/           # Axios API client
├── server/                  # Express API
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Auth, event, and booking logic
│   ├── middleware/          # JWT and role authorization
│   ├── models/              # User, Event, Booking, and OTP schemas
│   ├── routes/              # API route definitions
│   └── utils/               # Email helpers
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB (local installation or MongoDB Atlas)
- A Gmail account with an app password for email delivery

### 1. Clone and install dependencies

```bash
git clone <your-repository-url>
cd Eventora

cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Create `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/eventora
JWT_SECRET=replace-with-a-long-random-secret
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=5000
```

> For Gmail, use a Google App Password rather than your normal account password. Never commit the `.env` file.

### 3. Start the application

Open two terminals from the project root.

```bash
# Terminal 1 — API server
cd server
npm run dev
```

```bash
# Terminal 2 — React client
cd client
npm run dev
```

Open the URL displayed by Vite (typically `http://localhost:5173`). The API runs at `http://localhost:5000`.

## API Overview

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create an account and send verification OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify account email and receive a JWT |
| `POST` | `/api/auth/login` | Public | Sign in with email and password |
| `GET` | `/api/events` | Public | List events; supports search and filters |
| `GET` | `/api/events/:id` | Public | Get one event |
| `POST` | `/api/events` | Admin | Create an event |
| `PUT` | `/api/events/:id` | Admin | Update an event |
| `DELETE` | `/api/events/:id` | Admin | Delete an event |
| `POST` | `/api/bookings/send-otp` | Signed in | Send booking-verification OTP |
| `POST` | `/api/bookings` | Signed in | Create a booking request |
| `GET` | `/api/bookings/my` | Signed in | Get a user’s bookings; admins receive all bookings |
| `PUT` | `/api/bookings/:id/confirm` | Admin | Confirm a booking and record payment status |
| `DELETE` | `/api/bookings/:id` | Signed in / Admin | Cancel an owned booking or any booking as admin |

Protected endpoints expect a bearer token:

```http
Authorization: Bearer <jwt-token>
```

## Roles and Booking Flow

```text
Attendee → Register → Verify email OTP → Sign in
         → Request booking OTP → Submit booking → Pending review
         → View or cancel booking

Administrator → Create/manage events → Review booking requests
              → Confirm payment status → Confirm or cancel booking
```

To create an administrator, update the relevant user's `role` to `admin` in MongoDB. Administrative routes are protected on the server; changing the client alone does not grant access.

## Available Scripts

| Directory | Command | Description |
| --- | --- | --- |
| `client` | `npm run dev` | Start the Vite development server |
| `client` | `npm run build` | Create a production build |
| `client` | `npm run lint` | Run ESLint |
| `server` | `npm run dev` | Start API server with Nodemon |
| `server` | `npm start` | Start API server with Node.js |

## Notes

- OTP records automatically expire after five minutes.
- Booking confirmation and payment status are handled by an administrator; no third-party payment gateway is integrated yet.
- The frontend API base URL is currently configured as `http://localhost:5000/api` in `client/src/utils/axios.js`. Update it before deploying the client and server separately.

## License

This project is licensed under the ISC License. See the server package metadata for details.
