import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

test('7. Express HTTP REST API Endpoints', async () => {
  const app = createApp();

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.equal(healthData.status, 'UP');

    const prodRes = await fetch(`${baseUrl}/api/v1/products/search?q=atta`);
    assert.equal(prodRes.status, 200);
    const prodData = await prodRes.json();
    assert.ok(prodData.success);
    assert.ok(prodData.data.length > 0);
    assert.equal(prodData.data[0].id, 'prod_atta_001');

    const storeRes = await fetch(`${baseUrl}/api/v1/stores/serviceability/834001`);
    assert.equal(storeRes.status, 200);
    const storeData = await storeRes.json();
    assert.ok(storeData.success);
    assert.equal(storeData.data.isServiceable, true);

    const testCartId = `cart_http_test_${Date.now()}`;

    const cartRes = await fetch(`${baseUrl}/api/v1/cart`, {
      headers: { 'x-cart-id': testCartId }
    });
    assert.equal(cartRes.status, 200);
    const cartData = await cartRes.json();
    assert.ok(cartData.success);

    const addRes = await fetch(`${baseUrl}/api/v1/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cart-id': testCartId },
      body: JSON.stringify({ productId: 'prod_rice_002', quantity: 2 })
    });
    assert.equal(addRes.status, 200);
    const addData = await addRes.json();
    assert.equal(addData.data.totalItems, 2);

    const notFoundRes = await fetch(`${baseUrl}/api/v1/products/invalid_id_9999`);
    assert.equal(notFoundRes.status, 404);
    const notFoundData = await notFoundRes.json();
    assert.equal(notFoundData.success, false);
    assert.equal(notFoundData.error.statusCode, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  }
});
