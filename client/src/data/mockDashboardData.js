export const DEFAULT_SAVED_VEHICLES = [
  {
    _id: 'saved-1',
    status: 'live',
    startPrice: 1500000,
    currentBid: 1850000,
    bidCount: 31,
    badge: 'RESERVE MET',
    timeLeft: '03h 14m',
    endTime: new Date(Date.now() + 3.2 * 3600 * 1000).toISOString(),
    car: {
      title: '2023 Mahindra XUV700 AX7',
      specs: 'MIDNIGHT BLACK · 6-SPEED AUTOMATIC · AWD',
      details: '12,500 KM · Single Owner · Mumbai',
      images: ['https://upload.wikimedia.org/wikipedia/commons/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png'],
    },
    seller: {
      name: 'Riya Kapoor',
      city: 'Mumbai',
    },
  },
  {
    _id: 'saved-2',
    status: 'live',
    startPrice: 3500000,
    currentBid: 4250000,
    bidCount: 52,
    badge: 'ENDING SOON',
    timeLeft: '01h 10m',
    endTime: new Date(Date.now() + 1.2 * 3600 * 1000).toISOString(),
    car: {
      title: '2022 Toyota Fortuner Legender',
      specs: 'PEARL WHITE · 6-SPEED AUTOMATIC · 4X4',
      details: '18,200 KM · 1st Owner · Bangalore',
      images: ['https://upload.wikimedia.org/wikipedia/commons/2/23/2021_Toyota_Fortuner_SRZ_2.7_4x2_%28Indonesia%29_front_view_02.jpg'],
    },
    seller: {
      name: 'Aditya Birla Group Cars',
      city: 'Bangalore',
    },
  },
  {
    _id: 'saved-3',
    status: 'live',
    startPrice: 2800000,
    currentBid: 3150000,
    bidCount: 19,
    badge: 'NO RESERVE',
    timeLeft: '1d 08h',
    endTime: new Date(Date.now() + 32 * 3600 * 1000).toISOString(),
    car: {
      title: '2021 BMW 330i M Sport',
      specs: 'PORTIMAO BLUE · 8-SPEED STEPTRONIC · RWD',
      details: '24,000 KM · Verified Service · Delhi NCR',
      images: ['https://upload.wikimedia.org/wikipedia/commons/8/8d/BMW_G20_IMG_0083.jpg'],
    },
    seller: {
      name: 'Karan Mehra',
      city: 'Delhi NCR',
    },
  },
];

export const DEFAULT_WON_AUCTIONS = [
  {
    _id: 'won-1',
    auctionId: 'sample-won-1',
    finalAmount: 5450000,
    userMaxBid: 5450000,
    wonDate: '2026-10-10T14:30:00.000Z',
    status: 'won',
    paymentStatus: 'Escrow Secured',
    car: {
      title: '2021 BMW M340i xDrive',
      specs: 'TANZANITE BLUE · 8-SPEED SPORT AUTO · XDRIVE',
      details: '14,200 KM · Single Owner · Chennai',
      images: ['https://upload.wikimedia.org/wikipedia/commons/8/8d/BMW_G20_IMG_0083.jpg'],
    },
    seller: {
      name: 'Vikram Sethi',
      email: 'vikram.sethi@example.com',
      phone: '+91 98201 54321',
    },
  },
];

export const DEFAULT_LOST_AUCTIONS = [
  {
    _id: 'lost-1',
    auctionId: 'sample-lost-1',
    winningBid: 7350000,
    userMaxBid: 7100000,
    endedDate: '2026-10-14T18:00:00.000Z',
    status: 'outbid',
    car: {
      title: '2020 Porsche 718 Cayman',
      specs: 'GUARDS RED · 7-SPEED PDK · RWD',
      details: '9,800 KM · Porsche Approved · Mumbai',
      images: ['https://upload.wikimedia.org/wikipedia/commons/e/e0/2018_Porsche_718_Cayman_PDK_2.0_Front.jpg'],
    },
  },
  {
    _id: 'lost-2',
    auctionId: 'sample-lost-2',
    winningBid: 2950000,
    userMaxBid: 2750000,
    endedDate: '2026-10-06T16:00:00.000Z',
    status: 'outbid',
    car: {
      title: '2022 Skoda Octavia vRS 245',
      specs: 'RALLYE GREEN · 7-SPEED DSG · FWD',
      details: '19,500 KM · Stage 1 Tuned · Pune',
      images: ['https://upload.wikimedia.org/wikipedia/commons/2/23/2021_Toyota_Fortuner_SRZ_2.7_4x2_%28Indonesia%29_front_view_02.jpg'],
    },
  },
];

export const DEFAULT_PAYMENT_METHODS = [
  {
    id: 'pm_default_1',
    brand: 'Visa',
    last4: '4092',
    expMonth: 8,
    expYear: 2028,
    cardholderName: 'Registered Collector',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];
