import { Router } from 'express';
import { orderController } from '../controllers/index.js';

const router = Router();

router.post('/', orderController.createOrder);
router.get('/track/:id', orderController.trackOrder);
router.get('/by-phone', orderController.getOrdersByPhone);
router.get('/:id', orderController.getOrderById);

export default router;
