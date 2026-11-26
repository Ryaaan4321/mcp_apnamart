import { App, applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Order Tracker', version: '1.0.0' }, {});
const root = document.getElementById('app');

const STEPS = [
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PACKING', label: 'Packed' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' }
];

function esc(val) {
  return String(val ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderTracking(t) {
  if (!t || !t.orderId) {
    root.innerHTML = '<div class="empty">Order tracking information unavailable.</div>';
    return;
  }

  const currentIdx = STEPS.findIndex((s) => s.key === t.status);

  root.innerHTML = `
    <div class="header">
      <div>
        <div class="title">Order ${esc(t.orderId)}</div>
        <div class="subtitle">${esc(t.storeName)} &middot; ETA ~${esc(t.estimatedDeliveryMinutes)} mins</div>
      </div>
    </div>
    <div class="timeline">
      ${STEPS.map((s, idx) => {
        const cls = idx === currentIdx ? 'step active' : idx < currentIdx ? 'step done' : 'step';
        return `<div class="${cls}">${esc(s.label)}</div>`;
      }).join('')}
    </div>
    ${Array.isArray(t.items) && t.items.length > 0 ? `
      <div class="list">
        ${t.items.map((item) => {
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
              <div style="font-weight:700;">&#8377;${esc(item.total || item.totalPrice || item.price * item.quantity)}</div>
            </div>
          `;
        }).join('')}
      </div>
    ` : ''}
    <div class="summary-box">
      <div class="summary-line"><span>Customer</span><span>${esc(t.customerName)}</span></div>
      ${t.deliveryAddress ? `<div class="summary-line"><span>Address</span><span>${esc(t.deliveryAddress)}</span></div>` : ''}
      <div class="summary-total"><span>Order Total</span><span>&#8377;${esc(t.totalAmount)}</span></div>
    </div>
  `;
}

app.ontoolinput = () => {
  root.innerHTML = '<div class="empty">Fetching live order status...</div>';
};

app.ontoolresult = (result) => {
  const payload = result?.structuredContent || (() => {
    try {
      return JSON.parse(result?.content?.[0]?.text || '{}');
    } catch {
      return null;
    }
  })();
  renderTracking(payload);
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
