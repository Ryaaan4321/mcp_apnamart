export class StoreController {
  constructor(storeService) {
    this.storeService = storeService;
  }
  checkServiceability = async (req, res, next) => {
    try {
      const { pincode } = req.params;
      const result = await this.storeService.checkServiceability(pincode);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  };
  listStores = async (req, res, next) => {
    try {
      const { city } = req.query;
      const stores = await this.storeService.listStores(city);
      res.json({
        success: true,
        count: stores.length,
        data: stores
      });
    } catch (err) {
      next(err);
    }
  };
  getStoreById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const store = await this.storeService.getStoreById(id);
      res.json({
        success: true,
        data: store
      });
    } catch (err) {
      next(err);
    }
  };
}
