import { Router } from 'express';
import { productController } from '../controllers/index.js';

const router = Router();

router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

export default router;
