const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Car = require('./models/Car');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');
const Deposit = require('./models/Deposit');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/gaveldrive';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} at ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    console.log('[Seeder] Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Car.deleteMany({}),
      Auction.deleteMany({}),
      Bid.deleteMany({}),
      Deposit.deleteMany({}),
    ]);
    console.log('✓ Cleared Users, Cars, Auctions, Bids, and Deposits');

    console.log('[Seeder] Creating demo users...');
    const users = await User.create([
      {
        name: 'Riya Kapoor',
        email: 'riya@gaveldrive.com',
        password: 'password123',
        role: 'seller',
        profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        phone: '+91 98765 43210',
        location: 'Mumbai, Maharashtra',
        bio: 'Verified automotive consignor specializing in luxury SUVs and grand tourers.',
        verificationStatus: 'verified',
        verificationDetails: {
          documentType: 'Aadhaar',
          documentNumber: 'XXXX-XXXX-4812',
          legalName: 'Riya Kapoor',
          verifiedAt: new Date(),
        },
        paymentMethods: [
          {
            id: 'card_riya_01',
            brand: 'Visa',
            bankName: 'HDFC Bank',
            cardType: 'Signature Credit Card',
            last4: '4092',
            expMonth: 8,
            expYear: 2028,
            cardholderName: 'Riya Kapoor',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Arjun Singhania',
        email: 'arjun@gaveldrive.com',
        password: 'password123',
        role: 'user',
        profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phone: '+91 91234 56789',
        location: 'Bangalore, Karnataka',
        bio: 'Private collector of performance sedans and modern classics.',
        verificationStatus: 'verified',
        verificationDetails: {
          documentType: 'PAN',
          documentNumber: 'ABCPS1234F',
          legalName: 'Arjun Singhania',
          verifiedAt: new Date(),
        },
        paymentMethods: [
          {
            id: 'card_arjun_01',
            brand: 'Mastercard',
            bankName: 'ICICI Bank',
            cardType: 'Sapphiro World Credit Card',
            last4: '8821',
            expMonth: 11,
            expYear: 2029,
            cardholderName: 'Arjun Singhania',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Kabir Oberoi',
        email: 'kabir@gaveldrive.com',
        password: 'password123',
        role: 'user',
        profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        phone: '+91 98111 22334',
        location: 'New Delhi',
        bio: 'Automotive investor and sports car enthusiast.',
        verificationStatus: 'verified',
        verificationDetails: {
          documentType: 'Passport',
          documentNumber: 'Z8942103',
          legalName: 'Kabir Oberoi',
          verifiedAt: new Date(),
        },
      },
    ]);

    const seller = users[0];
    const bidder1 = users[1];
    const bidder2 = users[2];
    console.log(`✓ Created 3 users: ${seller.email}, ${bidder1.email}, ${bidder2.email}`);

    console.log('[Seeder] Creating 5 showcase vehicles...');
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const carsData = [
      {
        title: '2023 Mahindra XUV700 AX7 Luxury AWD',
        make: 'Mahindra',
        model: 'XUV700 AX7',
        year: 2023,
        mileage: 12500,
        description:
          'Offered in striking Midnight Black, this XUV700 AX7 Luxury AWD has covered just 12,500 km under single ownership. Equipped with ADAS Level 2 suite, panoramic Skyroof, Sony 3D immersive sound system, and twin 10.25-inch high-definition digital screens.',
        images: [
          'https://upload.wikimedia.org/wikipedia/commons/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png',
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: 'MIDNIGHT BLACK • 6-SPEED AUTOMATIC • AWD',
        seller: seller._id,
        aiValuation: 2150000,
      },
      {
        title: '2023 Tata Nexon Fearless DCA',
        make: 'Tata',
        model: 'Nexon Fearless',
        year: 2023,
        mileage: 8400,
        description:
          'A standout Fearless Purple Nexon with the 7-speed wet dual-clutch automatic transmission. Gently driven in Pune with full service documentation. Features sequential LED DRLs, 360-degree camera, ventilated leatherette seats, and digital cockpit.',
        images: [
          'https://upload.wikimedia.org/wikipedia/commons/e/e5/2023_Tata_Nexon_XZA%2B_front_view.jpg',
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: 'FEARLESS PURPLE • 7-SPEED DCA • FWD',
        seller: seller._id,
        aiValuation: 1320000,
      },
      {
        title: '2022 Toyota Fortuner Legender 4x4',
        make: 'Toyota',
        model: 'Fortuner Legender',
        year: 2022,
        mileage: 18200,
        description:
          'Commanding Fortuner Legender 4x4 in Pearl White with contrast black roof. First owner, showroom maintained with extended Toyota Shield warranty until late 2027. Ceramic coated, immaculate dual-tone interior, and wireless charging.',
        images: [
          'https://upload.wikimedia.org/wikipedia/commons/2/23/2021_Toyota_Fortuner_SRZ_2.7_4x2_%28Indonesia%29_front_view_02.jpg',
          'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: 'PEARL WHITE • 6-SPEED AUTOMATIC • 4X4',
        seller: seller._id,
        aiValuation: 4450000,
      },
      {
        title: '2021 BMW M340i xDrive Sedan',
        make: 'BMW',
        model: 'M340i',
        year: 2021,
        mileage: 14000,
        description:
          'Finished in Portimao Blue Metallic over Cognac Vernasca leather. Powered by the legendary 3.0L B58 inline-6 turbo engine outputting 382 BHP, paired with an M Sport differential, adaptive M suspension, laserlights, and Harman Kardon premium audio.',
        images: [
          'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: 'PORTIMAO BLUE • 8-SPEED STEPTRONIC • XDRIVE',
        seller: seller._id,
        aiValuation: 5400000,
      },
      {
        title: '2022 Porsche 911 Carrera S (992)',
        make: 'Porsche',
        model: '911 Carrera S',
        year: 2022,
        mileage: 6200,
        description:
          'Stunning Guards Red 992 Carrera S with full black leather cabin and red contrast stitching. Optioned with Sport Chrono package, sports exhaust system with silver tailpipes, 20/21-inch RS Spyder design wheels, and front axle lift system.',
        images: [
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: 'GUARDS RED • 8-SPEED PDK • RWD',
        seller: seller._id,
        aiValuation: 16500000,
      },
    ];

    const cars = await Car.create(carsData);
    console.log(`✓ Created ${cars.length} cars successfully`);

    console.log('[Seeder] Creating live auctions...');
    const auctionsData = [
      {
        car: cars[0]._id,
        seller: seller._id,
        startPrice: 1500000,
        currentBid: 1850000,
        startTime: new Date(now - 2 * day),
        endTime: new Date(now + 5 * day),
        status: 'live',
      },
      {
        car: cars[1]._id,
        seller: seller._id,
        startPrice: 900000,
        currentBid: 1180000,
        startTime: new Date(now - 1 * day),
        endTime: new Date(now + 6 * day),
        status: 'live',
      },
      {
        car: cars[2]._id,
        seller: seller._id,
        startPrice: 3500000,
        currentBid: 4250000,
        startTime: new Date(now - 3 * day),
        endTime: new Date(now + 2 * day),
        status: 'live',
      },
      {
        car: cars[3]._id,
        seller: seller._id,
        startPrice: 4200000,
        currentBid: 4850000,
        startTime: new Date(now - 1 * day),
        endTime: new Date(now + 4 * day),
        status: 'live',
      },
      {
        car: cars[4]._id,
        seller: seller._id,
        startPrice: 12500000,
        currentBid: 14200000,
        startTime: new Date(now - 2 * day),
        endTime: new Date(now + 7 * day),
        status: 'live',
      },
    ];

    const auctions = await Auction.create(auctionsData);
    console.log(`✓ Created ${auctions.length} live auctions successfully`);

    console.log('[Seeder] Creating sample bids and bidder deposits...');
    const bidsData = [
      {
        auction: auctions[0]._id,
        bidder: bidder1._id,
        amount: 1700000,
        createdAt: new Date(now - 1 * day),
      },
      {
        auction: auctions[0]._id,
        bidder: bidder2._id,
        amount: 1850000,
        createdAt: new Date(now - 2 * 60 * 60 * 1000),
      },
      {
        auction: auctions[2]._id,
        bidder: bidder1._id,
        amount: 4000000,
        createdAt: new Date(now - 12 * 60 * 60 * 1000),
      },
      {
        auction: auctions[2]._id,
        bidder: bidder2._id,
        amount: 4250000,
        createdAt: new Date(now - 1 * 60 * 60 * 1000),
      },
      {
        auction: auctions[4]._id,
        bidder: bidder1._id,
        amount: 14200000,
        createdAt: new Date(now - 3 * 60 * 60 * 1000),
      },
    ];
    await Bid.create(bidsData);
    console.log(`✓ Created ${bidsData.length} active bids`);

    const depositsData = [
      {
        user: bidder1._id,
        auction: auctions[0]._id,
        auctionTitle: cars[0].title,
        amount: 10000,
        status: 'held',
        paymentMethod: { id: 'card_arjun_01', brand: 'Mastercard', last4: '8821' },
        transactionId: `DEP_${Date.now()}_01`,
      },
      {
        user: bidder2._id,
        auction: auctions[0]._id,
        auctionTitle: cars[0].title,
        amount: 10000,
        status: 'held',
        paymentMethod: { id: 'card_kabir_01', brand: 'Visa', last4: '1094' },
        transactionId: `DEP_${Date.now()}_02`,
      },
      {
        user: bidder1._id,
        auction: auctions[2]._id,
        auctionTitle: cars[2].title,
        amount: 10000,
        status: 'held',
        paymentMethod: { id: 'card_arjun_01', brand: 'Mastercard', last4: '8821' },
        transactionId: `DEP_${Date.now()}_03`,
      },
    ];
    await Deposit.create(depositsData);
    console.log(`✓ Created ${depositsData.length} security deposits`);

    console.log('\n======================================================');
    console.log('       GAVEL DRIVE MONGODB SEED SUMMARY               ');
    console.log('======================================================');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host:     ${mongoose.connection.host}`);
    console.log('------------------------------------------------------');
    for (let i = 0; i < auctions.length; i++) {
      const a = auctions[i];
      const c = cars[i];
      console.log(`[${i + 1}] ${c.title}`);
      console.log(`    Auction ID:  ${a._id}`);
      console.log(`    Car ID:      ${c._id}`);
      console.log(`    Status:      ${a.status.toUpperCase()}`);
      console.log(`    Start Price: ₹${a.startPrice.toLocaleString('en-IN')}`);
      console.log(`    Current Bid: ₹${a.currentBid.toLocaleString('en-IN')}`);
      console.log(`    Seller:      ${seller.name} (${seller.email})`);
      console.log('------------------------------------------------------');
    }
    console.log('\n[Seeder] Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Error seeding data:', err);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    console.log('[Seeder] Destroying all database records...');
    await Promise.all([
      User.deleteMany({}),
      Car.deleteMany({}),
      Auction.deleteMany({}),
      Bid.deleteMany({}),
      Deposit.deleteMany({}),
    ]);
    console.log('✓ All database collections cleared successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Error destroying data:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
  destroyData();
} else {
  seedData();
}

