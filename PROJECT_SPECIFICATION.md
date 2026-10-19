# GAVELDRIVE — MASTER PROJECT SPECIFICATION & ARCHITECTURE BLUEPRINT
> **Document Purpose:** Single Source of Truth (SSOT) and comprehensive architectural specification for **GavelDrive**. This document provides full domain context, full-stack specifications, UI/UX design tokens, database schemas, and ready-to-use prompt blueprints for AI coding agents (Claude, GPT-4, Gemini, Qwen, OpenCode, Antigravity, etc.).

---

## 1. Executive Summary & Business Domain

### 1.1 Project Identity
- **Project Name:** GavelDrive (also referred to as *Gavel Drive*)
- **Platform Type:** Curated, Real-Time Automotive Digital Auction Platform
- **Inspirations:** *Bring a Trailer*, *Collecting Cars*, *Cars & Bids* — adapted with modern web standards, sleek dark/warm-neutral aesthetic, and localized currency/specifications (e.g., INR ₹ formatting and global specs).

### 1.2 Business Model & Marketplace Mechanics
GavelDrive is a two-sided marketplace (C2C and B2C) connecting vehicle sellers with verified automotive enthusiasts and collectors:
1. **Curated Listings:** Vehicles undergo verification before going live. Every listing features rich engineering specifications, high-resolution photography, provenance, and condition history.
2. **Auction Formats:**
   - **Reserve Auctions:** A hidden minimum threshold set by the seller. The UI indicates status (`RESERVE MET` or `NO RESERVE`).
   - **No Reserve Auctions:** The vehicle will sell to the highest bidder regardless of final price (`NO RESERVE` badge).
3. **High-Stakes Real-Time Bidding:**
   - Timed auctions running over fixed durations (e.g., 7 days).
   - Real-time countdown timer with countdown urgency triggers.
   - **Anti-Sniping (Soft-Close Rule):** Bids submitted in the final 2 minutes reset the timer to prevent bot sniping.
   - Validated minimum increment bids (preventing duplicate or stale bid collisions).
4. **Unified User Accounts (Simultaneous Bidding & Selling):**
   - **No Role Separation:** All registered members have unified capabilities without separate "Bidder" or "Seller" tiers.
   - **Bidding Capabilities:** Place bids, participate in live auction rooms, track active bids, and maintain watchlists.
   - **Selling Capabilities:** Create car listings via `/sell`, configure start/reserve prices, upload photo galleries, and manage auctions.
   - **Platform Administration:** Listing verification, dispute mediation, and transfer coordination.


---

## 2. Full-Stack System Architecture

```
                                  ┌──────────────────────────────┐
                                  │      Client (Browser)        │
                                  │  React 18/19 + Vite + Tailwind│
                                  └──────┬───────────────▲───────┘
                                         │               │
                            HTTP / REST  │               │ WebSocket
                           (Axios + JWT) │               │ (Socket.IO Client)
                                         ▼               │
                                  ┌──────────────────────┴───────┐
                                  │   Node.js / Express Server   │
                                  │   Port: 5000 / API Routes    │
                                  └──────┬───────────────┬───────┘
                                         │               │
                                 Mongoose│               │ Socket.IO Server
                                         ▼               ▼
                                 ┌───────────────┐ ┌───────────────┐
                                 │ MongoDB Atlas │ │ Real-Time Room│
                                 │  Collections  │ │ (Live Bidding)│
                                 └───────────────┘ └───────────────┘
```

### 2.1 Workspace Directory Structure
```
c:\GavelDrive
├── client/                     # Active Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auction/        # AuctionCard.jsx, etc.
│   │   │   └── layout/         # Navbar.jsx, etc.
│   │   ├── context/            # AuthContext.jsx
│   │   ├── data/               # sampleAuctions.js (mock fallback data)
│   │   ├── pages/              # Home, Browse, VehicleDetail, Sell, Dashboard, Login, Register, NotFound
│   │   ├── services/           # api.js (Axios client with JWT interceptor)
│   │   ├── App.jsx             # React Router v7 routes
│   │   ├── index.css           # Tailwind base styles
│   │   └── main.jsx            # React root mount
│   ├── DESIGN_SYSTEM.md        # UI tokens, color palettes, spacing rules
│   ├── tailwind.config.js      # Tailwind design system extension
│   └── vite.config.js          # Vite build config
│
├── server/                     # Active Backend Application
│   ├── config/                 # db.js (Mongoose MongoDB connection)
│   ├── controllers/            # auth, car, auction, bid controllers
│   ├── middleware/             # auth.middleware.js, error.middleware.js
│   ├── models/                 # User.js, Car.js, Auction.js, Bid.js
│   ├── routes/                 # auth.routes, car.routes, auction.routes, bid.routes
│   ├── .env                    # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   └── server.js               # Express app entry & HTTP server listener
│
├── STATE.md                    # Active AI Agent state & handoff file
└── gaveldrive/                 # (Legacy CRA scaffold - keep as reference/deprecated)
```

---

## 3. Backend Specifications

### 3.1 Technology Stack
- **Runtime:** Node.js (v18+ / v20+)
- **Framework:** Express.js 4.x
- **Database:** MongoDB Atlas via Mongoose 8.x
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Real-Time Communication:** `socket.io`
- **Logging & Utilities:** `morgan`, `cors`, `dotenv`

### 3.2 Database Schemas (Mongoose)

#### `User` Model (`server/models/User.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | required, trim | User full name |
| `email` | String | required, unique, lowercase, regex match | Valid email address |
| `password` | String | required, minlength: 6, `select: false` | Hashed with bcrypt |
| `role` | String | default: `'user'` | Unified membership status (all users bid and auction simultaneously) |
| `profilePic` | String | default: `''` | Avatar image URL |
| `timestamps` | Boolean | true | `createdAt`, `updatedAt` |

#### `Car` Model (`server/models/Car.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `title` | String | required, trim | E.g. "2023 Mahindra XUV700 AX7" |
| `make` | String | required, trim | E.g. "Mahindra", "Tata", "Toyota" |
| `model` | String | required, trim | E.g. "XUV700", "Nexon", "Fortuner" |
| `year` | Number | required | Production year (e.g. 2023) |
| `mileage` | Number | required | Total kilometers/miles driven |
| `description` | String | trim, default: `''` | Full seller narrative and condition report |
| `images` | [String] | array of URLs | Vehicle photography gallery |
| `seller` | ObjectId | ref: `'User'`, required | Creator/owner of the listing |
| `aiValuation` | Number | optional | Estimated market valuation |
| `timestamps` | Boolean | true | `createdAt`, `updatedAt` |

#### `Auction` Model (`server/models/Auction.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `car` | ObjectId | ref: `'Car'`, required | Associated vehicle reference |
| `seller` | ObjectId | ref: `'User'` | Seller reference |
| `startPrice` | Number | required, min: 0 | Initial opening bid / reserve baseline |
| `currentBid` | Number | min: 0, defaults to startPrice | Current highest bid amount |
| `startTime` | Date | required, default: `Date.now` | Auction go-live timestamp |
| `endTime` | Date | required | Auction termination timestamp |
| `status` | String | enum: `['upcoming', 'live', 'ended']` | Lifecycle status |
| `winner` | ObjectId | ref: `'User'` | Highest bidder at auction conclusion |
| `timestamps` | Boolean | true | `createdAt`, `updatedAt` |

#### `Bid` Model (`server/models/Bid.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `auction` | ObjectId | ref: `'Auction'`, required | Associated auction |
| `bidder` | ObjectId | ref: `'User'`, required | User placing the bid |
| `amount` | Number | required, min: 0 | Bid amount |
| `timestamps` | Boolean | true | `createdAt` marks the bid timestamp |

### 3.3 REST API Endpoints
All endpoints are prefixed with `/api`. Protected routes require header `Authorization: Bearer <token>`.

#### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register user, returns JWT + sanitized user.
- `POST /api/auth/login` — Authenticate user with email + password, returns JWT.
- `GET /api/auth/me` — Get currently authenticated user profile *(Protected)*.

#### Vehicles (`/api/cars`)
- `GET /api/cars` — List all cars with optional filters.
- `GET /api/cars/:id` — Get single car details.
- `POST /api/cars` — Create new car listing *(Protected, any authenticated user)*.
- `PUT /api/cars/:id` — Update car listing *(Protected, Owner only)*.
- `DELETE /api/cars/:id` — Remove car listing *(Protected, Owner/Admin)*.

#### Auctions (`/api/auctions`)
- `GET /api/auctions` — List auctions with query filtering (e.g. `?status=live`).
- `GET /api/auctions/:id` — Retrieve full auction details with populated car, seller, and winner.
- `POST /api/auctions` — Create an auction listing *(Protected)*.
- `PUT /api/auctions/:id` — Update auction details *(Protected)*.
- `DELETE /api/auctions/:id` — Cancel an auction *(Protected)*.

#### Bids (`/api/bids`)
- `GET /api/bids/auction/:auctionId` — Retrieve bid history for a specific auction.
- `POST /api/bids` — Submit a bid on an active auction *(Protected)*.
- `GET /api/bids/me` — List bids submitted by authenticated user *(Protected)*.

### 3.4 Socket.IO Real-Time Protocol Specifications
To support low-latency bid updates without client polling:
- **Namespace / Connection:** Connects to backend server via WebSockets.
- **Client Emits:**
  - `join_auction`: `{ auctionId }` — User joins room `auction_${auctionId}`.
  - `leave_auction`: `{ auctionId }` — User leaves room.
  - `place_bid`: `{ auctionId, amount, userId }` — Submits real-time bid.
- **Server Broadcasts (to `auction_${auctionId}`):**
  - `bid_update`: `{ auctionId, currentBid, bidCount, latestBid: { bidder, amount, timestamp } }`
  - `timer_extended`: `{ auctionId, newEndTime, reason: 'anti_sniping' }`
  - `auction_ended`: `{ auctionId, winner, finalBid }`

---

## 4. Frontend Specifications

### 4.1 Technology Stack
- **Framework:** React 18/19 with Vite 8.x
- **Routing:** React Router v7 (`BrowserRouter`, `Routes`, `Route`)
- **Styling:** Tailwind CSS v3/v4 token system
- **HTTP Client:** Axios with JWT request interceptors
- **Real-Time Client:** `socket.io-client`
- **Linter:** `oxlint`

### 4.2 Route Hierarchy & Page Breakdown
1. **`/` — Home Page (`client/src/pages/Home.jsx`)**
   - High-impact hero section with featured hero auction.
   - Quick category pills (All, SUVs, Sedans, Performance, Classics).
   - Live auction grid using `AuctionCard`.
   - Platform value propositions: Transparent bidding, verified inspection, secure Escrow transfer.
2. **`/browse` — Browse & Catalog (`client/src/pages/Browse.jsx`)**
   - Filter sidebar / header: Make, Body Style, Transmission, Fuel, Price Range, Status (`live`, `upcoming`, `ended`).
   - Search query matching title, make, model.
   - Sort dropdowns (Ending Soonest, Newly Listed, Bid: Low to High, Bid: High to Low).
   - Responsive multi-column auction card grid.
3. **`/auctions/:id` — Live Auction Room (`client/src/pages/VehicleDetail.jsx`)**
   - **Hero Gallery:** Multi-image gallery with thumbnail switcher and lightbox view.
   - **Live Auction HUD:** Real-time countdown timer, reserve status badge, current bid, bid count.
   - **Action Module:** Quick bid increment buttons (`+₹10,000`, `+₹25,000`, `+₹50,000`) and custom bid input.
   - **Bid History Stream:** Chronological feed of latest bids with bidder anonymity/names and timestamps.
   - **Engineering Specifications Table:** 12-point matrix (Year, Make, Model, Body Style, Mileage, Transmission, Drive Type, Fuel, Engine, Power, Seats, Colour).
   - **Narrative & Condition Report:** Detailed description, service records, known flaws.
   - **Seller Module:** Seller name, location, rating, response time, and inquiry trigger.
4. **`/sell` — Vehicle Listing Wizard (`client/src/pages/Sell.jsx`)**
   - Guided multi-step form: Step 1 (Vehicle Basics), Step 2 (Specifications & Pricing), Step 3 (Photo Upload).
   - Auto-creates `Car` document and schedules associated `Auction`.
5. **`/dashboard` — User Dashboard (`client/src/pages/Dashboard.jsx`)**
   - Personal command center: Active Bids, Won Auctions, My Listings, Watchlist.
   - Profile overview and quick links to create listings.
6. **`/login` & `/register` — Authentication (`Login.jsx`, `Register.jsx`)**
   - Clean, minimalist authentication forms. Registration requires only Name, Email, and Password with immediate access to both bid on auctions and list vehicles.

---

## 5. UI/UX Design System & Token Constraints

> **Hard Constraint for Agents:** All styling must strictly obey `DESIGN_SYSTEM.md`. Never use arbitrary Tailwind classes (e.g. `bg-[#123456]`, `rounded-2xl`).

### 5.1 Color Tokens
```js
colors: {
  gd: {
    // Surfaces & Backgrounds
    bg:         '#F0EFE9', // Warm off-white page background
    card:       '#0D0F1A', // Dark auction card background
    sidebar:    '#FFFFFF', // Light sidebar / surface
    surface:    '#F7F7F4', // Elevated panels, modal backgrounds

    // Text & Content
    ink:        '#111111', // Primary text
    muted:      '#6B6B6B', // Secondary text / metadata
    ghost:      '#9A9A9A', // Placeholders, disabled states
    inverse:    '#FFFFFF', // White text on dark cards

    // Borders & Dividers
    line:       '#E5E5E5', // Light dividers
    lineDark:   '#2A2E3F', // Dividers inside dark cards

    // Interactive CTAs
    cta:        '#0D0F1A', // Primary button
    ctaHover:   '#2A2E3F', // Hover state

    // Status Badges
    reserveMet: '#1A7A4A', // Green — reserve price met
    noReserve:  '#1A3A6A', // Navy — no reserve
    endingSoon: '#7A4A0A', // Amber-brown background
    endingText: '#F5A623', // Amber text on ending soon badge
    newListing: '#2A1A6A', // Purple — newly listed

    // Semantic States
    success:    '#1A7A4A',
    warning:    '#F5A623',
    error:      '#C0392B',
  }
}
```

### 5.2 Typography Tokens
```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
},
fontSize: {
  eyebrow: ['10px', { lineHeight: '1.4', letterSpacing: '0.15em' }],
  label:   ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
  xs:      ['12px', { lineHeight: '1.5' }],
  sm:      ['13px', { lineHeight: '1.5' }],
  base:    ['15px', { lineHeight: '1.6' }],
  lg:      ['18px', { lineHeight: '1.4' }],
  xl:      ['22px', { lineHeight: '1.3' }],
  '2xl':   ['28px', { lineHeight: '1.2' }],
  '3xl':   ['36px', { lineHeight: '1.1' }],
}
```

### 5.3 Geometric & Elevation Rules
- **Border Radius:** Maximum `8px` (`rounded-md`). Only badges and chips may use `rounded-pill` (`999px`). Never use `rounded-xl`, `rounded-2xl`, or `rounded-3xl`.
- **Shadows:** Very subtle light shadow `0 1px 3px rgba(0,0,0,0.06)` (`shadow-card`) for light cards only. **Dark auction cards receive zero shadow.** Never use `shadow-lg`, `shadow-xl`, or `shadow-2xl`.
- **Spec Format Rule:** Multi-item specification strings must use spaced middle dot separator: `MIDNIGHT BLACK · 6-SPEED AUTOMATIC · AWD`.

---

## 6. How to Run & Develop the Application

### 6.1 Server (Backend)
```bash
# Navigate to server directory
cd c:\GavelDrive\server

# Install dependencies (if needed)
npm install

# Start backend in development mode (runs nodemon on port 5000)
npm run dev
```

### 6.2 Client (Frontend)
```bash
# Navigate to client directory
cd c:\GavelDrive\client

# Install dependencies (if needed)
npm install

# Start frontend in development mode (runs Vite on port 5173)
npm run dev
```

### 6.3 Environment Setup (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gaveldrive?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

### 6.4 Client Environment (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. AI Agent Operating Guidelines & Prompt Crafting Guide

When sharing tasks with AI agents (Qwen, OpenCode, Claude, GPT-4, Gemini, Antigravity) working on GavelDrive, instruct them using the following standardized protocol:

### 7.1 Five Inviolable Ground Rules for AI Agents
1. **Adhere to `DESIGN_SYSTEM.md`:** Never introduce arbitrary colors, large border-radiuses (`rounded-xl`+), or heavy drop shadows.
2. **Synchronize REST + Socket.IO:** Any state change involving bids, auctions, or timers must update the database through Mongoose AND emit the corresponding Socket.IO event.
3. **Validate Bid Integrity:** Bids must always exceed `currentBid` by at least the minimum increment (e.g. ₹5,000 or 1%). Out-of-order or late bids must be rejected gracefully with informative HTTP 400 status codes.
4. **Preserve Fallback Resilience:** When MongoDB contains no auctions or the API server is connecting, the frontend must gracefully fall back to `sampleAuctions.js` without throwing unhandled exceptions.
5. **Always Update `STATE.md`:** When completing an objective or switching models, update `STATE.md` with current progress.

---

## 8. Ready-to-Use AI Agent Prompt Blueprints

Copy and paste these pre-crafted prompts directly into your AI chat or agent CLI:

### Prompt 1: Implement End-to-End Real-Time Bidding with Socket.IO
```markdown
[PROJECT CONTEXT: GavelDrive Car Auction Platform]
Please implement end-to-end real-time bidding using Socket.IO across the backend and frontend:

1. Backend (server/server.js and server/controllers/bid.controller.js):
   - Wrap the Express app with http.createServer and initialize Socket.IO with CORS enabled.
   - Create room handlers: `join_auction` and `leave_auction`.
   - In `placeBid` (or a socket event `submit_bid`):
     - Validate user authentication via JWT.
     - Verify auction status is 'live' and endTime > Date.now().
     - Verify bid amount > auction.currentBid.
     - Create a Bid document in MongoDB and update Auction.currentBid and bidCount.
     - Anti-sniping: If bid is placed within 2 minutes of endTime, extend endTime by 2 minutes.
     - Broadcast `bid_update` to room `auction_${auctionId}` with updated currentBid, bidCount, and new bid details.

2. Frontend (client/src/pages/VehicleDetail.jsx):
   - Connect to Socket.IO server on component mount.
   - Emit `join_auction` with auction ID.
   - Listen for `bid_update` events to immediately update currentBid, bid list, and trigger a brief visual highlight.
   - Clean up socket listeners on unmount.

Ensure strict adherence to DESIGN_SYSTEM.md tokens for all visual elements.
```

### Prompt 2: Connect Frontend Auction & Car Pages to Real Backend APIs
```markdown
[PROJECT CONTEXT: GavelDrive Car Auction Platform]
Connect the frontend pages (`Browse.jsx`, `Home.jsx`, and `VehicleDetail.jsx`) to consume the live MongoDB backend APIs instead of static sample data:

1. In `Browse.jsx`:
   - Fetch auctions from `GET /api/auctions?status=${status}` using `api` service.
   - Implement query filtering for make, status, and sorting.
   - Retain `sampleAuctions.js` as an automatic fallback if the API returns empty or fails.

2. In `VehicleDetail.jsx`:
   - Fetch auction details by ID from `GET /api/auctions/:id`.
   - Populate car specifications, images, and seller info.
   - Wire the "Place Bid" button to `POST /api/bids` with authorization token.

3. Maintain the design system constraints in DESIGN_SYSTEM.md (color tokens `#F0EFE9`, `#0D0F1A`, max 8px border radius, no arbitrary Tailwind classes).
```

### Prompt 3: Add Multi-Image Upload (Cloudinary / S3) to the Sell Page
```markdown
[PROJECT CONTEXT: GavelDrive Car Auction Platform]
Add image upload functionality to the vehicle listing form in `client/src/pages/Sell.jsx`:

1. Build a drag-and-drop multi-file upload zone in Step 3 of the Sell wizard.
2. Provide immediate image previews with the ability to delete or set the hero/primary thumbnail.
3. Backend: Implement a secure upload endpoint `POST /api/cars/upload` using multer and Cloudinary/S3, returning secure image URLs.
4. Save the array of URLs into `Car.images` upon form submission.
5. Obey all UI rules in `DESIGN_SYSTEM.md`: Use `gd-surface` background, `gd-line` borders, and `gd-cta` button tokens.
```

### Prompt 4: Implement User Dashboard with Active Bids & Watchlist
```markdown
[PROJECT CONTEXT: GavelDrive Car Auction Platform]
Expand `client/src/pages/Dashboard.jsx` and backend endpoints to support:

1. Active Bids Tab: Display all active auctions the logged-in user has bid on, showing current status (Winning vs. Outbid).
2. Won Auctions Tab: List concluded auctions where `auction.winner === user._id`.
3. My Listings Tab: List all car auctions created by this seller, showing view counts, current bid, and time remaining.
4. Watchlist Toggle: Allow users to bookmark auctions with the heart button on `AuctionCard` and review them in their dashboard.
5. Adhere strictly to GavelDrive's minimalist luxury automotive aesthetic in `DESIGN_SYSTEM.md`.
```

---
*GavelDrive Master Specification • Generated for AI Agent Pair Programming & Handoffs*
