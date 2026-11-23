import { Logger } from '../logger/Logger.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

export class StoreService {
  constructor(storeRepository, logger = null) {
    this.storeRepository = storeRepository;
    this.logger = logger ? logger.forContext('StoreService') : new Logger('StoreService');
  }
  async checkServiceability(pincode) {
    if (!pincode) {
      throw new BadRequestError('Pincode is required to check serviceability');
    }
    const cleanPin = String(pincode).trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      throw new BadRequestError('Invalid pincode format. Must be a 6-digit Indian Postal Code');
    }
    this.logger.info(`Checking store serviceability for pincode: ${cleanPin}`);
    const matchingStores = await this.storeRepository.findByPincode(cleanPin);
    if (matchingStores.length === 0) {
      this.logger.info(`Pincode ${cleanPin} is currently outside Apna Mart quick delivery network`);
      return {
        isServiceable: false,
        pincode: cleanPin,
        message: `Currently Apna Mart does not deliver to pincode ${cleanPin}. We are expanding rapidly across Tier-2/3 cities!`,
        nearestStores: await this.storeRepository.findAll(s => s.status === 'ACTIVE')
      };
    }
    const primaryStore = matchingStores[0];
    this.logger.info(`Pincode ${cleanPin} is serviceable by store: ${primaryStore.name}`);
    return {
      isServiceable: true,
      pincode: cleanPin,
      store: primaryStore,
      estimatedDeliveryMinutes: primaryStore.estimatedDeliveryMinutes,
      message: `Great news! Quick delivery is available at your location from ${primaryStore.name} in ~${primaryStore.estimatedDeliveryMinutes} minutes.`
    };
  }
  async getStoreById(storeId) {
    if (!storeId) {
      throw new BadRequestError('Store ID is required');
    }
    this.logger.info(`Fetching store by id: ${storeId}`);
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      this.logger.warn(`Store not found: ${storeId}`);
      throw new NotFoundError('Store', storeId);
    }
    return store;
  }
  async listStores(city = null) {
    this.logger.info(`Listing stores${city ? ` for city: ${city}` : ''}`);
    if (city) {
      return this.storeRepository.findByCity(city);
    }
    return this.storeRepository.findAll();
  }
}
