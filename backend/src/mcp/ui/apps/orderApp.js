import { App, applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Order', version: '1.0.0' }, {});
const root = document.getElementById('app');

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
        <div>
          <div class="title">Review Your Order</div>
          <div class="subtitle">${esc(r.store.name)} &middot; ~${esc(r.store.estimatedDeliveryMinutes)} mins</div>
        </div>
      </div>
      ${r.totalSavings > 0 ? `<div class="savings">Total savings: &#8377;${esc(r.totalSavings)}</div>` : ''}
      <div class="list">
        ${(r.items || []).map((item) => {
          const imgSrc = item.thumbnailUrl || item.imageUrl;
          const initials = esc((item.name || 'AM').slice(0, 2).toUpperCase());
          return `
            <div class="row-item">
              <div class="row-thumb">
                ${imgSrc
                  ? `<img src="${esc(imgSrc)}" alt="${esc(item.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" /><span class="thumb-fallback" style="display:none;">${initials}</span>`
                  : `<span class="thumb-fallback">${initials}</span>`}
              </div>
              <div class="row-info">
                <div class="name" style="min-height:auto;-webkit-line-clamp:1;">${esc(item.name)}</div>
                <div class="meta">Qty ${esc(item.quantity)} &times; &#8377;${esc(item.price)}</div>
              </div>
              <div style="font-weight:700;">&#8377;${esc(item.totalPrice || item.price * item.quantity)}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="summary-box">
        <div class="summary-line"><span>Customer</span><span>${esc(r.customerName)} (${esc(r.customerPhone)})</span></div>
        <div class="summary-line"><span>Address</span><span>${esc(r.deliveryAddress)} (${esc(r.pincode)})</span></div>
        <div class="summary-line"><span>Payment</span><span>${esc(r.paymentMethod)}</span></div>
        <div class="summary-line"><span>Subtotal</span><span>&#8377;${esc(r.subtotal)}</span></div>
        <div class="summary-line"><span>Delivery Fee</span><span>${r.deliveryFee === 0 ? 'FREE' : `&#8377;${esc(r.deliveryFee)}`}</span></div>
        <div class="summary-total"><span>Total Payable</span><span>&#8377;${esc(r.totalAmount)}</span></div>
      </div>
      <div style="margin-top:12px;display:flex;justify-content:flex-end;">
        <button id="confirm-order-btn" class="btn-primary">Confirm &amp; Place Order</button>
      </div>
    `;

    const btn = document.getElementById('confirm-order-btn');
    btn?.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Placing order...';
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
      } catch (err) {
        btn.textContent = 'Failed - retry';
        btn.disabled = false;
      }
    });
    return;
  }

  const order = data.order || data;
  root.innerHTML = `
    <div class="header">
      <div>
        <div class="title">Order Confirmed: ${esc(order.id)}</div>
        <div class="subtitle">${esc(order.storeName)} &middot; ~${esc(order.estimatedDeliveryMinutes)} mins</div>
      </div>
    </div>
    <div class="summary-box">
      <div class="summary-line"><span>Status</span><span>${esc(order.status)}</span></div>
      <div class="summary-line"><span>Delivery Address</span><span>${esc(order.deliveryAddress)} (${esc(order.pincode)})</span></div>
      <div class="summary-line"><span>Payment</span><span>${esc(order.paymentMethod)} (${esc(order.paymentStatus)})</span></div>
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

app.onhostcontextchanged = (ctx) => {
  if (ctx?.theme) applyDocumentTheme(ctx.theme);
  if (ctx?.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
};

(async () => {
  await app.connect();
  const ctx = app.getHostContext();
  if (ctx?.theme) applyDocumentTheme(ctx.theme);
  if (ctx?.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
})();
