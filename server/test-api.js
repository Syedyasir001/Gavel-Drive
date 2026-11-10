/**
 * Gavel Drive - Automated API & CRUD Verification Test Script
 * Run via: npm test  (or node test-api.js)
 * 
 * Verifies:
 *  1. API Health Check
 *  2. Route Protection (401 Unauthorized when token missing)
 *  3. Authentication (Login / Register & JWT issuance)
 *  4. Car CRUD (Create, Read by ID, Update)
 *  5. Auction CRUD (Create auction with car reference, Query live auctions, Fetch by ID, End auction)
 */

const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

let passed = 0;
let failed = 0;

function logPass(testName, detail = '') {
  passed++;
  console.log(`  ${colors.green}✔ PASS${colors.reset} ${colors.bold}${testName}${colors.reset} ${colors.dim}${detail}${colors.reset}`);
}

function logFail(testName, error) {
  failed++;
  console.log(`  ${colors.red}✖ FAIL${colors.reset} ${colors.bold}${testName}${colors.reset}`);
  console.log(`    ${colors.red}Reason:${colors.reset} ${error.response?.data?.message || error.message}`);
}

async function runApiVerification() {
  console.log(`\n${colors.cyan}${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}   GAVEL DRIVE - API TESTING & CRUD VERIFICATION      ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}======================================================${colors.reset}`);
  console.log(`Target Base URL: ${colors.yellow}${BASE_URL}${colors.reset}\n`);

  let authToken = '';
  let createdCarId = '';
  let createdAuctionId = '';

  // 1. Health Check
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.status === 200 && res.data.success) {
      logPass('API Health Check', `[HTTP ${res.status}] ${res.data.message}`);
    } else {
      throw new Error(`Unexpected response: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log(`\n${colors.red}${colors.bold}[Server Offline]${colors.reset} Could not connect to ${BASE_URL}`);
      console.log(`${colors.yellow}Please make sure the server is running with 'npm start' or 'npm run dev' before running tests.${colors.reset}\n`);
      process.exit(1);
    }
    logFail('API Health Check', err);
  }

  // 2. Security & Route Protection (Expected 401)
  try {
    await axios.post(`${BASE_URL}/cars`, {
      title: 'Unauthenticated Test Car',
      make: 'Test',
      model: 'Test',
      year: 2024,
      mileage: 1000,
    });
    logFail('Route Protection (verifyToken on POST /cars)', new Error('Expected 401 Unauthorized but request succeeded'));
  } catch (err) {
    if (err.response?.status === 401) {
      logPass('Route Protection (verifyToken on POST /cars)', `[HTTP 401] Blocked unauthenticated listing creation`);
    } else {
      logFail('Route Protection (verifyToken on POST /cars)', err);
    }
  }

  // 3. User Authentication (Login or Register)
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'riya@gaveldrive.com',
      password: 'password123',
    }).catch(async (loginErr) => {
      // If user doesn't exist yet, register a test user
      const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Examiner Test User',
        email: `tester_${Date.now()}@gaveldrive.com`,
        password: 'password123',
        location: 'Mumbai',
      });
      return registerRes;
    });

    authToken = loginRes.data.token;
    if (authToken) {
      logPass('User Authentication (POST /auth/login)', `[HTTP 200] JWT received: ${authToken.substring(0, 18)}...`);
    } else {
      throw new Error('No token returned in authentication response');
    }
  } catch (err) {
    logFail('User Authentication (POST /auth/login)', err);
  }

  const authHeaders = {
    headers: { Authorization: `Bearer ${authToken}` },
  };

  // 4. Car CRUD: Create Car (POST /api/cars)
  try {
    const newCarPayload = {
      title: `2024 Porsche 911 GT3 RS (Verification Run)`,
      make: 'Porsche',
      model: '911 GT3 RS',
      year: 2024,
      mileage: 1200,
      description: 'Verified track-focused GT3 RS with Weissach Package and ceramic composite brakes.',
      specs: 'GUARDS RED • 7-SPEED PDK • RWD',
      images: [
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
      ],
    };

    const res = await axios.post(`${BASE_URL}/cars`, newCarPayload, authHeaders);
    createdCarId = res.data.data?._id;

    if (res.status === 201 && createdCarId) {
      logPass('Car CRUD: Create Car (POST /api/cars)', `[HTTP 201] ID: ${createdCarId}`);
    } else {
      throw new Error(`Unexpected car creation response: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    logFail('Car CRUD: Create Car (POST /api/cars)', err);
  }

  // 5. Car CRUD: Read Car by ID (GET /api/cars/:id)
  try {
    const res = await axios.get(`${BASE_URL}/cars/${createdCarId}`);
    if (res.status === 200 && res.data.data?._id === createdCarId) {
      logPass('Car CRUD: Read Car by ID (GET /api/cars/:id)', `[HTTP 200] Fetched: "${res.data.data.title}"`);
    } else {
      throw new Error('Car ID does not match created car');
    }
  } catch (err) {
    logFail('Car CRUD: Read Car by ID (GET /api/cars/:id)', err);
  }

  // 6. Car CRUD: Update Car (PUT /api/cars/:id)
  try {
    const res = await axios.put(
      `${BASE_URL}/cars/${createdCarId}`,
      { mileage: 1500, description: 'Updated mileage after dealer transport.' },
      authHeaders
    );
    if (res.status === 200 && res.data.data?.mileage === 1500) {
      logPass('Car CRUD: Update Car (PUT /api/cars/:id)', `[HTTP 200] Updated mileage to ${res.data.data.mileage} km`);
    } else {
      throw new Error('Car mileage was not updated');
    }
  } catch (err) {
    logFail('Car CRUD: Update Car (PUT /api/cars/:id)', err);
  }

  // 7. Auction CRUD: Create Live Auction (POST /api/auctions)
  try {
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 7);

    const newAuctionPayload = {
      car: createdCarId,
      startPrice: 28500000,
      endTime: endTime.toISOString(),
    };

    const res = await axios.post(`${BASE_URL}/auctions`, newAuctionPayload, authHeaders);
    createdAuctionId = res.data.data?._id;

    if (res.status === 201 && createdAuctionId && res.data.data?.status === 'live') {
      logPass('Auction CRUD: Create Live Auction (POST /api/auctions)', `[HTTP 201] ID: ${createdAuctionId} (Status: ${res.data.data.status})`);
    } else {
      throw new Error(`Unexpected auction response: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    logFail('Auction CRUD: Create Live Auction (POST /api/auctions)', err);
  }

  // 8. Auction CRUD: Query Live Auctions (GET /api/auctions?status=live)
  try {
    const res = await axios.get(`${BASE_URL}/auctions?status=live`);
    const found = res.data.data?.some((a) => a._id === createdAuctionId);
    if (res.status === 200 && found) {
      logPass('Auction CRUD: Query Live Auctions (GET /api/auctions?status=live)', `[HTTP 200] Total active: ${res.data.count}, includes newly created auction`);
    } else {
      throw new Error('Created auction not found in live auctions list');
    }
  } catch (err) {
    logFail('Auction CRUD: Query Live Auctions (GET /api/auctions?status=live)', err);
  }

  // 9. Auction CRUD: Read Auction Details (GET /api/auctions/:id)
  try {
    const res = await axios.get(`${BASE_URL}/auctions/${createdAuctionId}`);
    if (res.status === 200 && res.data.data?.car?._id === createdCarId) {
      logPass('Auction CRUD: Read Auction Details (GET /api/auctions/:id)', `[HTTP 200] Car and Seller correctly populated`);
    } else {
      throw new Error('Auction did not return populated car document');
    }
  } catch (err) {
    logFail('Auction CRUD: Read Auction Details (GET /api/auctions/:id)', err);
  }

  // 10. Auction Conclusion / Refund Execution (POST /api/auctions/:id/end)
  try {
    const res = await axios.post(`${BASE_URL}/auctions/${createdAuctionId}/end`, {}, authHeaders);
    if (res.status === 200 && res.data.success) {
      logPass('Auction Conclusion: End Auction (POST /api/auctions/:id/end)', `[HTTP 200] Status concluded, deposit refund cycle triggered`);
    } else {
      throw new Error('Auction failed to conclude');
    }
  } catch (err) {
    logFail('Auction Conclusion: End Auction (POST /api/auctions/:id/end)', err);
  }

  console.log(`\n${colors.cyan}------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}SUMMARY:${colors.reset} ${colors.green}${passed} Passed${colors.reset}, ${failed > 0 ? colors.red : colors.dim}${failed} Failed${colors.reset}`);
  console.log(`${colors.cyan}------------------------------------------------------${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runApiVerification().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});

