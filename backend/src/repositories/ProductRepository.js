import { BaseRepository } from './BaseRepository.js';

const INITIAL_PRODUCTS = [
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
    description: '100% whole wheat flour, soft rotis with traditional chakki process.'
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
    description: 'Aromatic long grain basmati rice ideal for everyday cooking and pulao.'
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
    description: 'Unpolished premium toor dal, rich in protein without artificial colors.'
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
    description: 'Cold pressed authentic pungent kachi ghani mustard oil for authentic taste.'
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
    description: 'Low-temperature ground spice blend preserving natural essential oils.'
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
    description: 'UHT treated long life toned milk, nutritious and ready to drink.'
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
    description: 'Rich, soft and fresh Indian cottage cheese.'
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
    description: 'Classic favorite instant noodles with authentic Indian masala tastemaker.'
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
    description: 'Crispy spicy potato gram flour noodles snack.'
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
    description: 'X-tra clean technology that removes tough stains quickly in machines or bucket.'
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
    description: 'Powerful degreasing dishwash gel infused with 100 lemons power.'
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
    description: 'Antibacterial soap protecting against 100 illness-causing germs.'
  }
];

export class ProductRepository extends BaseRepository {
  constructor() {
    super('Product', INITIAL_PRODUCTS, 'id');
  }

  async search({ query, category, minPrice, maxPrice, inStockOnly = false }) {
    return this.findAll(product => {
      if (inStockOnly && (!product.isAvailable || product.stock <= 0)) {
        return false;
      }
      if (category && product.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      if (minPrice !== undefined && product.apnaMartPrice < minPrice) {
        return false;
      }
      if (maxPrice !== undefined && product.apnaMartPrice > maxPrice) {
        return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesCat = product.category.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesDesc && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }

  async getAllCategories() {
    const products = await this.findAll();
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories);
  }

  async decrementStock(productId, quantity) {
    const product = await this.findById(productId);
    if (!product) return null;
    const newStock = Math.max(0, product.stock - quantity);
    return this.update(productId, {
      stock: newStock,
      isAvailable: newStock > 0
    });
  }
}
