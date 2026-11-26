import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCTS = [
  {
    id: 'prod_atta_001',
    name: 'Aashirvaad Shudh Chakki Atta (5kg)',
    category: 'Staples & Grains',
    brand: 'Aashirvaad',
    mrp: 275,
    apnaMartPrice: 239,
    discountPercentage: 13,
    unit: '5 kg',
    stock: 85,
    isAvailable: true,
    description: '100% whole wheat flour, soft rotis with traditional chakki process.',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_rice_002',
    name: 'India Gate Basmati Rice Rozzana (1kg)',
    category: 'Staples & Grains',
    brand: 'India Gate',
    mrp: 110,
    apnaMartPrice: 89,
    discountPercentage: 19,
    unit: '1 kg',
    stock: 120,
    isAvailable: true,
    description: 'Aromatic long grain basmati rice ideal for everyday cooking and pulao.',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_dal_003',
    name: 'Apna Mart Choice Toor Dal / Arhar Dal (1kg)',
    category: 'Staples & Grains',
    brand: 'Apna Mart Choice',
    mrp: 185,
    apnaMartPrice: 154,
    discountPercentage: 17,
    unit: '1 kg',
    stock: 90,
    isAvailable: true,
    description: 'Unpolished premium toor dal, rich in protein without artificial colors.',
    imageUrl: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_oil_004',
    name: 'Fortune Kachi Ghani Pure Mustard Oil (1L Pouch)',
    category: 'Oils & Spices',
    brand: 'Fortune',
    mrp: 165,
    apnaMartPrice: 138,
    discountPercentage: 16,
    unit: '1 L',
    stock: 64,
    isAvailable: true,
    description: 'Cold pressed authentic pungent kachi ghani mustard oil for authentic taste.',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_masala_005',
    name: 'Catch Super Garam Masala (100g)',
    category: 'Oils & Spices',
    brand: 'Catch',
    mrp: 92,
    apnaMartPrice: 78,
    discountPercentage: 15,
    unit: '100 g',
    stock: 150,
    isAvailable: true,
    description: 'Low-temperature ground spice blend preserving natural essential oils.',
    imageUrl: null,
    thumbnailUrl: null
  },
  {
    id: 'prod_dairy_006',
    name: 'Amul Taaza Fresh Homogenised Toned Milk (1L)',
    category: 'Dairy & Bakery',
    brand: 'Amul',
    mrp: 75,
    apnaMartPrice: 72,
    discountPercentage: 4,
    unit: '1 L',
    stock: 45,
    isAvailable: true,
    description: 'UHT treated long life toned milk, nutritious and ready to drink.',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_dairy_007',
    name: 'Amul Malai Paneer (200g)',
    category: 'Dairy & Bakery',
    brand: 'Amul',
    mrp: 95,
    apnaMartPrice: 88,
    discountPercentage: 7,
    unit: '200 g',
    stock: 35,
    isAvailable: true,
    description: 'Rich, soft and fresh Indian cottage cheese.',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_snack_008',
    name: 'Maggi 2-Minute Masala Noodles (Pack of 4 - 280g)',
    category: 'Packaged Foods & Snacks',
    brand: 'Nestle Maggi',
    mrp: 60,
    apnaMartPrice: 52,
    discountPercentage: 13,
    unit: '280 g',
    stock: 200,
    isAvailable: true,
    description: 'Classic favorite instant noodles with authentic Indian masala tastemaker.',
    imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_snack_009',
    name: 'Haldiram Nagpur Aloo Bhujia (400g)',
    category: 'Packaged Foods & Snacks',
    brand: 'Haldiram',
    mrp: 125,
    apnaMartPrice: 105,
    discountPercentage: 16,
    unit: '400 g',
    stock: 80,
    isAvailable: true,
    description: 'Crispy spicy potato gram flour noodles snack.',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_clean_010',
    name: 'Surf Excel Quick Wash Detergent Powder (1kg)',
    category: 'Household & Cleaning',
    brand: 'Surf Excel',
    mrp: 155,
    apnaMartPrice: 132,
    discountPercentage: 15,
    unit: '1 kg',
    stock: 70,
    isAvailable: true,
    description: 'X-tra clean technology that removes tough stains quickly in machines or bucket.',
    imageUrl: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_clean_011',
    name: 'Vim Dishwash Gel Lemon (500ml Bottle)',
    category: 'Household & Cleaning',
    brand: 'Vim',
    mrp: 120,
    apnaMartPrice: 99,
    discountPercentage: 18,
    unit: '500 ml',
    stock: 110,
    isAvailable: true,
    description: 'Powerful degreasing dishwash gel infused with 100 lemons power.',
    imageUrl: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=200&q=70'
  },
  {
    id: 'prod_care_012',
    name: 'Dettol Original Germ Protection Bathing Soap (Pack of 4x125g)',
    category: 'Personal Care & Hygiene',
    brand: 'Dettol',
    mrp: 198,
    apnaMartPrice: 165,
    discountPercentage: 17,
    unit: '500 g',
    stock: 55,
    isAvailable: true,
    description: 'Antibacterial soap protecting against 100 illness-causing germs.',
    imageUrl: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=200&q=70'
  }
];

const STORES = [
  {
    id: 'store_rnc_01',
    name: 'Apna Mart - Ranchi Main Road Supermart',
    city: 'Ranchi',
    state: 'Jharkhand',
    address: 'Opposite GEL Church Complex, Main Road, Ranchi',
    pincodes: ['834001', '834002', '834008'],
    phone: '+91 651 2233441',
    openingHours: '07:00 AM - 10:30 PM',
    quickDeliveryAvailable: true,
    estimatedDeliveryMinutes: 15,
    status: 'ACTIVE'
  },
  {
    id: 'store_jsr_02',
    name: 'Apna Mart - Jamshedpur Bistupur Supermart',
    city: 'Jamshedpur',
    state: 'Jharkhand',
    address: 'Near Ram Mandir, Main Market, Bistupur, Jamshedpur',
    pincodes: ['831001', '831005'],
    phone: '+91 657 2424552',
    openingHours: '07:00 AM - 10:00 PM',
    quickDeliveryAvailable: true,
    estimatedDeliveryMinutes: 20,
    status: 'ACTIVE'
  },
  {
    id: 'store_dhn_03',
    name: 'Apna Mart - Dhanbad Bank More Supermart',
    city: 'Dhanbad',
    state: 'Jharkhand',
    address: 'Shanti Bhavan Building, Bank More, Dhanbad',
    pincodes: ['826001', '826004'],
    phone: '+91 326 2309876',
    openingHours: '07:30 AM - 10:00 PM',
    quickDeliveryAvailable: true,
    estimatedDeliveryMinutes: 25,
    status: 'ACTIVE'
  },
  {
    id: 'store_rpr_04',
    name: 'Apna Mart - Raipur Pandri Supermart',
    city: 'Raipur',
    state: 'Chhattisgarh',
    address: 'Cloth Market Road, Pandri, Raipur',
    pincodes: ['492001', '492004'],
    phone: '+91 771 4056789',
    openingHours: '07:00 AM - 10:30 PM',
    quickDeliveryAvailable: true,
    estimatedDeliveryMinutes: 15,
    status: 'ACTIVE'
  },
  {
    id: 'store_bsp_05',
    name: 'Apna Mart - Bilaspur Link Road Supermart',
    city: 'Bilaspur',
    state: 'Chhattisgarh',
    address: 'Agrasen Chowk, Link Road, Bilaspur',
    pincodes: ['495001', '495004'],
    phone: '+91 775 2412345',
    openingHours: '07:30 AM - 10:00 PM',
    quickDeliveryAvailable: true,
    estimatedDeliveryMinutes: 20,
    status: 'ACTIVE'
  },
  {
    id: 'store_hwh_06',
    name: 'Apna Mart - Howrah GT Road Supermart',
    city: 'Howrah',
    state: 'West Bengal',
    address: '42 GT Road South, Shibpur, Howrah',
    pincodes: ['711101', '711102'],
    phone: '+91 33 26601234',
    openingHours: '07:00 AM - 10:00 PM',
    quickDeliveryAvailable: true,
    estimatedDeliveryMinutes: 20,
    status: 'ACTIVE'
  }
];

const SAMPLE_ORDERS = [
  {
    id: 'ord_apm_1001',
    customerName: 'Rahul Kumar',
    customerPhone: '9876543210',
    deliveryAddress: 'Flat 302, Green Park Residency, Kanke Road, Ranchi, Jharkhand - 834008',
    pincode: '834008',
    storeId: 'store_rnc_01',
    storeName: 'Apna Mart - Ranchi Main Road Supermart',
    items: [
      {
        productId: 'prod_atta_001',
        name: 'Aashirvaad Shudh Chakki Atta (5kg)',
        price: 239,
        quantity: 1,
        total: 239,
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=70'
      },
      {
        productId: 'prod_oil_004',
        name: 'Fortune Kachi Ghani Pure Mustard Oil (1L Pouch)',
        price: 138,
        quantity: 2,
        total: 276,
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=70'
      }
    ],
    subtotal: 515,
    deliveryFee: 0,
    totalAmount: 515,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'OUT_FOR_DELIVERY',
    estimatedDeliveryMinutes: 12,
    placedAt: new Date(Date.now() - 15 * 60 * 1000)
  }
];

async function seed() {
  console.log('Seeding products...');
  for (const prod of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: prod,
      create: prod
    });
  }

  console.log('Seeding stores...');
  for (const store of STORES) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: store,
      create: store
    });
  }

  console.log('Seeding sample orders...');
  for (const ord of SAMPLE_ORDERS) {
    await prisma.order.upsert({
      where: { id: ord.id },
      update: ord,
      create: ord
    });
  }

  console.log('Seeding completed successfully.');
}

seed()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
