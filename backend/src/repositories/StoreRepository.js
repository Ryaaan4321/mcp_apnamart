import { BaseRepository } from './BaseRepository.js';

const INITIAL_STORES = [
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

export class StoreRepository extends BaseRepository {
  constructor() {
    super('Store', INITIAL_STORES, 'id');
  }

  async findByPincode(pincode) {
    const cleanPin = String(pincode).trim();
    return this.findAll(store => store.pincodes.includes(cleanPin) && store.status === 'ACTIVE');
  }

  async findByCity(city) {
    const cleanCity = String(city).trim().toLowerCase();
    return this.findAll(store => store.city.toLowerCase() === cleanCity);
  }
}
