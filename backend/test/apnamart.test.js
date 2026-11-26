import test from 'node:test';
import assert from 'node:assert/strict';

import { prisma } from '../src/db/prisma.js';
import { NotFoundError, BadRequestError } from '../src/errors/index.js';
import { Logger } from '../src/logger/Logger.js';
import { ProductRepository, StoreRepository, CartRepository, OrderRepository } from '../src/repositories/index.js';
import { ProductService, StoreService, CartService, OrderService } from '../src/services/index.js';
import { createMcpServer } from '../src/mcp/index.js';
import { UI_RESOURCES, getUiHtml } from '../src/mcp/ui/buildUiResources.js';

test.after(async () => {
  await prisma.$disconnect();
});

test('1. Error Hierarchy test', () => {
  const notFound = new NotFoundError('Product', 'prod_xyz');
  assert.equal(notFound.statusCode, 404);
  assert.equal(notFound.isOperational, true);
  assert.match(notFound.message, /prod_xyz/);

  const badReq = new BadRequestError('Invalid input');
  assert.equal(badReq.statusCode, 400);
});

test('2. Logger tests', () => {
  const logger = new Logger('TestContext', 'debug');
  assert.equal(logger.context, 'TestContext');
  const subLogger = logger.forContext('SubService');
  assert.equal(subLogger.context, 'SubService');
});

test('3. Repositories test', async () => {
  const productRepo = new ProductRepository();
  const products = await productRepo.findAll();
  assert.ok(products.length >= 10);

  const atta = await productRepo.findById('prod_atta_001');
  assert.ok(atta);
  assert.equal(atta.brand, 'Aashirvaad');
  assert.ok('imageUrl' in atta && 'thumbnailUrl' in atta);
  assert.ok(atta.imageUrl?.startsWith('https://'));
  assert.ok(atta.thumbnailUrl?.startsWith('https://'));

  const masala = await productRepo.findById('prod_masala_005');
  assert.ok(masala);
  assert.equal(masala.imageUrl, null);
  assert.equal(masala.thumbnailUrl, null);

  const storeRepo = new StoreRepository();
  const stores = await storeRepo.findByPincode('834001');
  assert.ok(stores.length > 0);
});

test('4. Product and Store Services business logic', async () => {
  const productRepo = new ProductRepository();
  const storeRepo = new StoreRepository();
  const productService = new ProductService(productRepo);
  const storeService = new StoreService(storeRepo);

  const searchResults = await productService.searchProducts({ query: 'Mustard' });
  assert.equal(searchResults.items.length, 1);
  assert.equal(searchResults.items[0].id, 'prod_oil_004');
  assert.ok('imageUrl' in searchResults.items[0] && 'thumbnailUrl' in searchResults.items[0]);
  assert.equal(searchResults.pagination.total, 1);
  assert.equal(searchResults.facets.brands[0].name, 'Fortune');

  const paginated = await productService.searchProducts({ sortBy: 'price_asc', page: 1, limit: 3 });
  assert.equal(paginated.items.length, 3);
  assert.equal(paginated.pagination.limit, 3);
  assert.ok(paginated.pagination.hasNextPage);
  assert.ok(paginated.items[0].apnaMartPrice <= paginated.items[1].apnaMartPrice);
  assert.ok(paginated.facets.categories.length > 0);
  assert.ok(paginated.facets.priceRange.max >= paginated.facets.priceRange.min);

  const brandFiltered = await productService.searchProducts({ brand: 'Amul' });
  assert.ok(brandFiltered.items.length >= 2);
  assert.ok(brandFiltered.items.every(p => p.brand === 'Amul'));

  const categories = await productService.listCategories();
  assert.ok(categories.includes('Staples & Grains'));

  const serviceable = await storeService.checkServiceability('834001');
  assert.equal(serviceable.isServiceable, true);
  assert.ok(serviceable.store);

  const nonServiceable = await storeService.checkServiceability('110001');
  assert.equal(nonServiceable.isServiceable, false);
});

test('5. Cart, Order Review Confirmation, and Scoping Flow', async () => {
  const productRepo = new ProductRepository();
  const storeRepo = new StoreRepository();
  const cartRepo = new CartRepository();
  const orderRepo = new OrderRepository();

  const productService = new ProductService(productRepo);
  const storeService = new StoreService(storeRepo);
  const cartService = new CartService(cartRepo, productService);
  const orderService = new OrderService(orderRepo, productService, storeService, cartService);

  const testCartId = `cart_test_${Date.now()}`;

  await cartService.addItem(testCartId, 'prod_atta_001', 2);
  const cart = await cartService.getCart(testCartId);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.totalItems, 2);
  assert.equal(cart.subtotal, 239 * 2);
  assert.ok('imageUrl' in cart.items[0] && 'thumbnailUrl' in cart.items[0]);

  const review = await orderService.previewOrder({
    cartId: testCartId,
    customerName: 'Aman Sharma',
    customerPhone: '9876543210',
    deliveryAddress: 'House 14, Circular Road, Ranchi',
    pincode: '834001',
    paymentMethod: 'CASH_ON_DELIVERY'
  });
  assert.equal(review.requiresConfirmation, true);
  assert.equal(review.totalAmount, 239 * 2 + 25);
  assert.equal(review.store.city, 'Ranchi');

  const cartStillPresent = await cartService.getCart(testCartId);
  assert.equal(cartStillPresent.items.length, 1);

  const order = await orderService.createOrder({
    cartId: testCartId,
    customerName: 'Aman Sharma',
    customerPhone: '9876543210',
    deliveryAddress: 'House 14, Circular Road, Ranchi',
    pincode: '834001',
    paymentMethod: 'CASH_ON_DELIVERY'
  });

  assert.ok(order.id.startsWith('ord_apm_'));
  assert.equal(order.status, 'CONFIRMED');
  assert.equal(order.items.length, 1);

  const clearedCart = await cartService.getCart(testCartId);
  assert.equal(clearedCart.items.length, 0);

  const tracking = await orderService.trackOrder(order.id, '9876543210');
  assert.equal(tracking.status, 'CONFIRMED');

  await assert.rejects(
    () => orderService.trackOrder(order.id, '9999999999'),
    NotFoundError
  );
});

test('6. MCP Server Initialization, Prompts, and UI Resources', () => {
  const mcpServer = createMcpServer();
  assert.ok(mcpServer);
  assert.ok(mcpServer._registeredTools.search_products);
  assert.ok(mcpServer._registeredTools.place_order);
  assert.ok(mcpServer._registeredTools.check_delivery_serviceability);
  assert.ok(mcpServer._registeredTools.manage_cart);
  assert.ok(mcpServer._registeredTools.track_order);

  assert.equal(mcpServer._registeredTools.search_products._meta?.ui?.resourceUri, UI_RESOURCES.products.uri);
  assert.equal(mcpServer._registeredTools.manage_cart._meta?.ui?.resourceUri, UI_RESOURCES.cart.uri);
  assert.equal(mcpServer._registeredTools.place_order._meta?.ui?.resourceUri, UI_RESOURCES.order.uri);
  assert.equal(mcpServer._registeredTools.track_order._meta?.ui?.resourceUri, UI_RESOURCES.track.uri);

  assert.ok(mcpServer._registeredPrompts.plan_weekly_groceries);
  assert.ok(mcpServer._registeredPrompts.check_pincode_and_order);
  assert.ok(mcpServer._registeredPrompts.reorder_essentials);

  for (const [key, def] of Object.entries(UI_RESOURCES)) {
    assert.ok(mcpServer._registeredResources[def.uri], `Missing UI resource ${def.uri}`);
    const html = getUiHtml(key);
    assert.ok(html.includes('<!doctype html>'));
    assert.ok(html.includes('<div id="app"></div>'));
    assert.ok(html.includes('ui/initialize'));
  }
});
