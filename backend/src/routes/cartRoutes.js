import { Router } from 'express';
import { cartController } from '../controllers/index.js';

const router = Router();

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.delete('/items/:productId', cartController.removeItem);
router.post('/clear', cartController.clearCart);

export default router;
