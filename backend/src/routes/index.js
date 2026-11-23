import { Router } from 'express';
import productRoutes from './productRoutes.js';
import storeRoutes from './storeRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';

const apiRouter = Router();

apiRouter.use('/products', productRoutes);
apiRouter.use('/stores', storeRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);

export default apiRouter;
