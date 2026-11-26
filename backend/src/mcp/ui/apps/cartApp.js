import { App, applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Cart', version: '1.0.0' }, {});
const root = document.getElementById('app');

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
        <div class="title">Apna Mart Cart</div>
      </div>
      <div class="empty">Your cart is empty.</div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="header">
      <div>
        <div class="title">Apna Mart Cart (${esc(cart.totalItems)} items)</div>
        <div class="subtitle">Cart ID: ${esc(cart.cartId)}</div>
      </div>
    </div>
    ${cart.totalSavings > 0 ? `<div class="savings">You save &#8377;${esc(cart.totalSavings)} with Apna Mart wholesale prices</div>` : ''}
    <div class="list">
      ${cart.items.map((item) => {
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
              <div class="meta">${esc(item.unit)} &middot; &#8377;${esc(item.price)} &times; ${esc(item.quantity)}</div>
            </div>
            <div style="font-weight:700;">&#8377;${esc(item.totalPrice)}</div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="summary-box">
      <div class="summary-line"><span>Subtotal</span><span>&#8377;${esc(cart.subtotal)}</span></div>
      <div class="summary-line"><span>Savings</span><span>-&#8377;${esc(cart.totalSavings || 0)}</span></div>
      <div class="summary-total"><span>Cart Total</span><span>&#8377;${esc(cart.subtotal)}</span></div>
    </div>
  `;
}

app.ontoolinput = () => {
  root.innerHTML = '<div class="empty">Updating cart...</div>';
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
