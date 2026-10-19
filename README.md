
#  GavelDrive — Live Collector Automotive Auctions

<div align="center">



### *The premier curated, real-time automotive digital auction platform.*

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_8.9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

[Explore Live Auctions](http://localhost:5173/browse) • [Architecture](#-system-architecture) • [Key Features](#-core-platform-features) • [Quick Start](#-quick-start--installation) • [API Docs](#-api-endpoints-reference)

</div>

---

## 📖 Table of Contents
- [About GavelDrive](#-about-gaveldrive)
- [System Architecture](#-system-architecture)
- [Core Platform Features](#-core-platform-features)
  - [1. Dynamic Bid Increment Engine](#1-dynamic-bid-increment-engine)
  - [2. Refundable Security Deposit & Escrow System](#2-refundable-security-deposit--escrow-system)
  - [3. Soft-Close Anti-Sniping Protection](#3-soft-close-anti-sniping-protection)
  - [4. Unified Collector Profiles](#4-unified-collector-profiles)
  - [5. Interactive Vehicle Showcase & Thumbnails](#5-interactive-vehicle-showcase--thumbnails)
- [Technology Stack](#-technology-stack)
- [Repository Directory Structure](#-repository-directory-structure)
- [Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Server Setup (Backend)](#2-server-setup-backend)
  - [3. Client Setup (Frontend)](#3-client-setup-frontend)
- [Environment Variables](#-environment-variables)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Design System & UI Tokens](#-design-system--ui-tokens)
- [Contributing & License](#-contributing--license)

---

## 🏎️ About GavelDrive

**GavelDrive** is a specialized, high-stakes digital auction marketplace engineered for collector, enthusiast, and luxury vehicles. Inspired by the transparent mechanics of *Bring a Trailer* and *Cars & Bids*, GavelDrive brings a bespoke warm-neutral aesthetic, localized Indian Rupee (`₹` INR) financial mechanics, escrow-backed live bidding, and real-time WebSocket synchronization.

Every vehicle listed on GavelDrive undergoes a thorough vetting process, featuring complete mechanical histories, verified specifications, transparency badges (`RESERVE MET` / `NO RESERVE`), and active bidder commentary.

---

## 🏛️ System Architecture

```
                              ┌─────────────────────────────────────────┐
                              │           Client Application            │
                              │   React 19 • Vite 8 • Tailwind CSS v4   │
                              └───────┬─────────────────────────▲───────┘
                                      │                         │
                         HTTP / REST  │                         │ WebSocket
                        (Axios + JWT) │                         │ (Socket.IO Client)
                                      ▼                         │
                              ┌─────────────────────────────────┴───────┐
                              │         Express REST & WS API           │
                              │    Node.js • Mongoose 8 • Port: 5000    │
                              └───────┬─────────────────────────┬───────┘
                                      │                         │
                             Mongoose │                         │ In-Memory Rooms
                                      ▼                         ▼
                              ┌───────────────┐         ┌───────────────┐
                              │ MongoDB Atlas │         │ Live Bidding  │
                              │  Collections  │         │  Room State   │
                              └───────────────┘         └───────────────┘
```

---

## ✨ Core Platform Features

### 1. Dynamic Bid Increment Engine
Unlike platforms with rigid bid increments, GavelDrive automatically calibrates minimum allowable bid increments according to the vehicle's current valuation bracket:

| Valuation Range (Current Bid) | Minimum Increment (`minIncrement`) | Quick Bid Multipliers |
|:------------------------------|:-----------------------------------|:----------------------|
| **< ₹5,00,000**               | **₹5,000**                         | `+₹5,000`, `+₹10,000` |
| **₹5,00,000 — ₹15,00,000**    | **₹10,000**                        | `+₹10,000`, `+₹30,000`|
| **₹15,00,000 — ₹50,00,000**   | **₹25,000**                        | `+₹25,000`, `+₹50,000`|
| **> ₹50,00,000**              | **₹50,000**                        | `+₹50,000`, `+₹1,00,000`|

Dynamic **Quick Bid** action pills calculate the next allowable offer on the fly, enabling rapid one-tap bidding without input validation errors.

### 2. Refundable Security Deposit & Escrow System
To prevent frivolous bids and maintain marketplace trust, GavelDrive implements a strict **Bidding Entry Fee**:
- **Escrow Hold:** Users authorize a refundable **₹10,000** deposit via their verified payment card to unlock bidding privileges on any live auction.
- **Immediate Gating:** Bidding controls remain securely locked until deposit authorization is verified.
- **100% Automated Refund:** The moment an auction closes (or timer expires), the escrow system automatically processes a 100% refund back to the bidder's card, generating an immutable refund transaction reference (`REF_...`).
- **Dashboard Tracking:** Bidder deposits, held status, and refund receipts are audited in real time under the unified **Bidding Deposits (Escrow)** ledger.

### 3. Soft-Close Anti-Sniping Protection
- Timed auctions operate with a **2-Minute Soft-Close Rule**.
- Any bid placed within the final 120 seconds automatically extends the auction countdown by an additional 2 minutes, ensuring all prospective buyers have a fair opportunity to counter.

### 4. Unified Collector Profiles
- **No Role Friction:** Every registered user can bid, watch, and list cars simultaneously without toggling between buyer/seller accounts.
- **KYC Verification:** Instant or document-backed identity verification badges.
- **Saved Watchlists:** Track high-interest auctions with real-time countdown alerts.
- **Command Center Ledger:** Filter past activity by `Active Bids`, `Won Auctions`, `Lost / Outbid`, `Bidding Deposits (Escrow)`, and `Sold Vehicles`.

### 5. Interactive Vehicle Showcase & Thumbnails
- High-fidelity responsive photo galleries.
- Real-time thumbnail synchronizer displaying exact vehicle angles with visual active state rings.
- Dynamic reserve tags: `RESERVE MET` (Emerald), `NO RESERVE` (Violet), and `ENDING SOON` (Amber pulses).

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) (Concurrent Mode)
- **Tooling & Bundler:** [Vite 8](https://vitejs.dev/) with Fast Refresh
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Networking:** [Axios](https://axios-http.com/) with request/response interceptors & JWT injection
- **Real-Time Client:** [Socket.IO Client v4](https://socket.io/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (v18+ / v20+ LTS)
- **Framework:** [Express.js 4.x](https://expressjs.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/) via [Mongoose 8.x](https://mongoosejs.com/)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + Salted Hashing (`bcryptjs`)
- **Real-Time Engine:** [Socket.IO v4](https://socket.io/)
- **Middleware:** `cors`, `dotenv`, `morgan` request logger

---

## 📂 Repository Directory Structure

```text
Gavel-Drive/
├── client/                          # React + Vite Frontend
│   ├── public/                      # Static assets & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── auction/             # AuctionCard, BiddingDepositModal, etc.
│   │   │   ├── dashboard/           # AuctionHistoryLedger, KycModal, OverviewTab, etc.
│   │   │   └── layout/              # Navbar, Footer, Container wrappers
│   │   ├── context/                 # AuthContext.jsx (global authentication state)
│   │   ├── data/                    # sampleAuctions.js, mockDashboardData.js
│   │   ├── pages/                   # Home, Browse, VehicleDetail, Sell, Dashboard, Auth
│   │   ├── services/                # api.js (Axios HTTP instance)
│   │   ├── App.jsx                  # Main routing configuration
│   │   ├── index.css                # Tailwind CSS v4 design tokens & theme
│   │   └── main.jsx                 # Client entry point
│   ├── .env.example                 # Client environment template
│   ├── tailwind.config.js           # Design system extension
│   └── vite.config.js               # Vite configuration
│
├── server/                          # Express & Node.js Backend
│   ├── config/                      # db.js (MongoDB connection)
│   ├── controllers/                 # auth, auction, bid, car, deposit controllers
│   ├── middleware/                  # auth.middleware, error.middleware
│   ├── models/                      # User, Car, Auction, Bid, Deposit schemas
│   ├── routes/                      # API endpoint definitions
│   ├── .env.example                 # Server environment template
│   └── server.js                    # Server startup & WebSocket initialization
│
├── .gitignore                       # Repository ignore rules
├── PROJECT_SPECIFICATION.md         # Comprehensive architectural specification
└── README.md                        # Master repository documentation
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **pnpm**
- **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) connection string)

---

### 1. Clone Repository
```bash
git clone https://github.com/Syedyasir001/Gavel-Drive.git
cd Gavel-Drive
```

---

### 2. Server Setup (Backend)
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `MONGO_URI` and `JWT_SECRET` are correctly populated).*
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will run at `http://localhost:5000`.*

---

### 3. Client Setup (Frontend)
1. In a new terminal window, navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *(Defaults to `VITE_API_URL=http://localhost:5000/api`).*
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web application will open at `http://localhost:5173`.*

---

## 🔐 Environment Variables

### Server (`server/.env`)
| Variable | Description | Example / Default |
|:---------|:------------|:------------------|
| `PORT` | Backend listening port | `5000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/gaveldrive` |
| `JWT_SECRET` | Secret key for signing session tokens | `your_super_secret_jwt_key` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |

### Client (`client/.env`)
| Variable | Description | Example / Default |
|:---------|:------------|:------------------|
| `VITE_API_URL` | Base REST API URL for Axios | `http://localhost:5000/api` |

---

## 📡 API Endpoints Reference

### Authentication & Collector Profile (`/api/auth`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/auth/me` | Fetch active authenticated profile | Private |
| `PUT` | `/api/auth/profile` | Update profile information | Private |
| `POST` | `/api/auth/kyc` | Submit identity verification details | Private |
| `GET` | `/api/auth/payment-methods` | List verified credit/debit cards | Private |
| `POST` | `/api/auth/payment-methods` | Add new payment method card | Private |
| `DELETE` | `/api/auth/payment-methods/:id` | Remove saved payment method | Private |
| `PATCH` | `/api/auth/payment-methods/:id/default`| Set card as default | Private |
| `GET` | `/api/auth/watchlist` | Get saved user watchlist | Private |
| `POST` | `/api/auth/watchlist/:auctionId` | Toggle vehicle in/out of watchlist | Private |
| `GET` | `/api/auth/history` | Comprehensive ledger (bids, won, lost, deposits) | Private |

### Auctions (`/api/auctions`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `GET` | `/api/auctions` | List auctions with filter/search queries | Public |
| `GET` | `/api/auctions/:id` | Retrieve auction details and bid history | Public |
| `POST` | `/api/auctions` | Create new vehicle auction listing | Private |
| `PUT` | `/api/auctions/:id` | Update listing specifications | Private |
| `POST` | `/api/auctions/:id/end` | Trigger manual/simulated auction close & escrow release | Private |

### Bidding & Escrow Deposits (`/api/bids`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `POST` | `/api/bids` | Submit a validated incremental bid | Private |
| `GET` | `/api/bids/auction/:auctionId` | Fetch full chronological bid history | Public |
| `POST` | `/api/bids/deposit` | Authorize ₹10,000 refundable entry deposit | Private |
| `GET` | `/api/bids/deposit/:auctionId` | Get user deposit status for an auction | Private |
| `POST` | `/api/bids/deposit/:auctionId/refund` | Trigger 100% deposit refund upon auction conclusion | Private |
| `GET` | `/api/bids/deposits/me` | Get all user escrow holds and refunds | Private |

---

## 🎨 Design System & UI Tokens

GavelDrive adheres to an editorial, warm-neutral and dark palette built to let collector vehicles take center stage:

```css
/* Core Color Tokens */
--gd-bg: #F5F3EF;          /* Warm parchment background */
--gd-surface: #EDE9E1;     /* Elevated panel surface */
--gd-sidebar: #FFFFFF;     /* Pure card white */
--gd-ink: #141311;         /* Deep obsidian primary text */
--gd-muted: #57534E;       /* Warm graphite secondary text */
--gd-ghost: #857F77;       /* Subdued meta text */
--gd-line: #E2DDD5;        /* Subtle divider borders */
--gd-primary: #1C2B36;     /* Deep slate luxury primary */
--gd-reserveMet: #1B7A43;   /* Verified emerald */
--gd-warning: #C97A1E;      /* Urgency amber */
--gd-endingSoon: #B83226;   /* Crimson expiring alert */
```

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with precision for automotive enthusiasts worldwide. © 2026 GavelDrive.</sub>
</div>
