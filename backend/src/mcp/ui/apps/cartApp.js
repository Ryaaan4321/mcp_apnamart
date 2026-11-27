import { App } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Cart', version: '1.0.0' }, {});
const root = document.getElementById('app');

const ICON_BAG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

const ICON_PACKAGE =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>';

function esc(val) {
  return String(val ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderCart(data) {
  const cart = data?.cart || data;
  if (!cart || !Array.isArray(cart.items)) {
    root.innerHTML = '<div class="empty">Unable to load cart.</div>';
    return;
  }

  if (cart.items.length === 0) {
    root.innerHTML = `
      <div class="header">
        <div class="header-left">
          ${ICON_BAG}
          <div class="title">Your Cart (0)</div>
        </div>
      </div>
      <div class="empty">
        <div style="font-weight:600;color:#171717;">Your cart is empty</div>
        <div style="font-size:12px;color:#737373;margin-top:4px;">Add groceries and daily essentials to get started.</div>
      </div>
    `;
    return;
  }

  const subtotal = Number(cart.subtotal || 0);
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 25;
  const totalAmount = subtotal + deliveryFee;

  root.innerHTML = `
    <div class="header">
      <div class="header-left">
        ${ICON_BAG}
        <div>
          <div class="title">Your Cart (${esc(cart.totalItems)})</div>
          <div class="subtitle mono" style="font-size:11px;">${esc(cart.cartId)}</div>
        </div>
      </div>
      <span class="eta-pill">Apna Mart</span>
    </div>
    ${cart.totalSavings > 0 ? `<div class="savings">You save &#8377;${esc(cart.totalSavings)} with Apna Mart wholesale prices</div>` : ''}
    <div class="divide-list">
      ${cart.items.map((item) => {
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
              <div class="row-sub">${esc(item.unit)} &middot; &#8377;${esc(item.price)} &times; ${esc(item.quantity)}</div>
            </div>
            <div class="row-price">&#8377;${esc(item.totalPrice)}</div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="summary-box">
      <div class="summary-line"><span>Subtotal</span><span class="val">&#8377;${esc(subtotal)}</span></div>
      <div class="summary-line"><span>Delivery Fee (Free above &#8377;499)</span><span class="val">${deliveryFee === 0 ? 'FREE' : `&#8377;${esc(deliveryFee)}`}</span></div>
      ${cart.totalSavings > 0 ? `<div class="summary-line"><span>Wholesale Savings</span><span class="val" style="color:#059669;">-&#8377;${esc(cart.totalSavings)}</span></div>` : ''}
      <div class="summary-total"><span>Total</span><span>&#8377;${esc(totalAmount)}</span></div>
    </div>
  `;
}

app.ontoolinput = () => {
  root.innerHTML = '<div class="empty">Updating your cart...</div>';
};

app.ontoolresult = (result) => {
  const payload = result?.structuredContent || (() => {
    try {
      return JSON.parse(result?.content?.[0]?.text || '{}');
    } catch {
      return null;
    }
  })();
  renderCart(payload);
};

(async () => {
  await app.connect();
})();
