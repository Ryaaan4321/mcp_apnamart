import { Router } from 'express';
import { storeController } from '../controllers/index.js';

const router = Router();

router.get('/', storeController.listStores);
router.get('/serviceability/:pincode', storeController.checkServiceability);
router.get('/:id', storeController.getStoreById);

export default router;
