import { App } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Order', version: '1.0.0' }, {});
const root = document.getElementById('app');

const ICON_BAG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

const ICON_CHECK =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';

const ICON_CLOCK =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

const ICON_PACKAGE =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>';

function esc(val) {
  return String(val ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderOrder(data) {
  if (!data) {
    root.innerHTML = '<div class="empty">No order data available.</div>';
    return;
  }

  if (data.status === 'REVIEW_REQUIRED' && data.review) {
    const r = data.review;
    root.innerHTML = `
      <div class="header">
        <div class="header-left">
          ${ICON_BAG}
          <div>
            <div class="title">Delivery Details</div>
            <div class="subtitle">${esc(r.store.name)}</div>
          </div>
        </div>
        <span class="eta-pill">${ICON_CLOCK}<span>${esc(r.store.estimatedDeliveryMinutes)} min</span></span>
      </div>
      ${r.totalSavings > 0 ? `<div class="savings">You save &#8377;${esc(r.totalSavings)} with Apna Mart wholesale prices</div>` : ''}
      <div class="divide-list">
        ${(r.items || []).map((item) => {
          const imgSrc = item.thumbnailUrl || item.imageUrl;
          return `
            <div class="row-item">
              <div class="row-thumb">
                ${imgSrc
                  ? `<img src="${esc(imgSrc)}" alt="${esc(item.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span style="display:none;">${ICON_PACKAGE}</span>`
                  : ICON_PACKAGE}
              </div>
              <div class="row-info">
                <div class="row-title">${esc(item.name)}</div>
                <div class="row-sub">Qty ${esc(item.quantity)} &middot; &#8377;${esc(item.price)} each</div>
              </div>
              <div class="row-price">&#8377;${esc(item.totalPrice || item.price * item.quantity)}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="summary-box">
        <div class="summary-line"><span>Customer</span><span class="val">${esc(r.customerName)} (${esc(r.customerPhone)})</span></div>
        <div class="summary-line"><span>Address</span><span class="val">${esc(r.deliveryAddress)} (${esc(r.pincode)})</span></div>
        <div class="summary-line"><span>Payment</span><span class="val">${esc(r.paymentMethod)}</span></div>
        <div class="summary-line"><span>Subtotal</span><span class="val">&#8377;${esc(r.subtotal)}</span></div>
        <div class="summary-line"><span>Delivery Fee (Free above &#8377;499)</span><span class="val">${r.deliveryFee === 0 ? 'FREE' : `&#8377;${esc(r.deliveryFee)}`}</span></div>
        <div class="summary-total"><span>Total</span><span>&#8377;${esc(r.totalAmount)}</span></div>
      </div>
      <div style="margin-top:12px;">
        <button id="confirm-order-btn" class="btn-primary">Place Order &middot; &#8377;${esc(r.totalAmount)}</button>
      </div>
    `;

    const btn = document.getElementById('confirm-order-btn');
    btn?.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Placing Order...';
      try {
        const caps = app.getHostCapabilities();
        if (caps?.serverTools) {
          const res = await app.callServerTool({
            name: 'place_order',
            arguments: {
              cartId: r.cartId,
              customerName: r.customerName,
              customerPhone: r.customerPhone,
              deliveryAddress: r.deliveryAddress,
              pincode: r.pincode,
              paymentMethod: r.paymentMethod,
              confirmed: true
            }
          });
          if (res?.structuredContent) {
            renderOrder(res.structuredContent);
            return;
          }
        } else if (caps?.message) {
          await app.sendMessage({
            role: 'user',
            content: [{ type: 'text', text: 'Confirmed, please place this order now (confirmed=true).' }]
          });
          btn.textContent = 'Confirmation sent';
          return;
        }
      } catch {
        btn.textContent = `Place Order · ₹${r.totalAmount}`;
        btn.disabled = false;
      }
    });
    return;
  }

  const order = data.order || data;
  root.innerHTML = `
    <div class="header">
      <div class="header-left">
        ${ICON_BAG}
        <div class="title">Order Confirmed</div>
      </div>
      <span class="eta-pill">${ICON_CLOCK}<span>~${esc(order.estimatedDeliveryMinutes)} min</span></span>
    </div>
    <div class="success-card">
      <div class="success-title">${ICON_CHECK}<span>Order placed successfully</span></div>
      <div class="success-meta">Order ID: <span class="mono" style="font-weight:600;">${esc(order.id)}</span></div>
      <div class="success-meta">Fulfilling Store: ${esc(order.storeName)}</div>
      <div class="success-meta">Estimated Delivery: ~${esc(order.estimatedDeliveryMinutes)} mins</div>
    </div>
    <div class="summary-box">
      <div class="summary-line"><span>Status</span><span class="status-pill">${esc(order.status)}</span></div>
      <div class="summary-line"><span>Delivery Address</span><span class="val">${esc(order.deliveryAddress)} (${esc(order.pincode)})</span></div>
      <div class="summary-line"><span>Payment</span><span class="val">${esc(order.paymentMethod)} (${esc(order.paymentStatus)})</span></div>
      <div class="summary-total"><span>Total Amount</span><span>&#8377;${esc(order.totalAmount)}</span></div>
    </div>
  `;
}

app.ontoolinput = () => {
  root.innerHTML = '<div class="empty">Preparing order review...</div>';
};

app.ontoolresult = (result) => {
  const payload = result?.structuredContent || (() => {
    try {
      return JSON.parse(result?.content?.[0]?.text || '{}');
    } catch {
      return null;
    }
  })();
  renderOrder(payload);
};

(async () => {
  await app.connect();
})();
