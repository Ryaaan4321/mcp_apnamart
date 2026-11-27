import { App } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Order Tracker', version: '1.0.0' }, {});
const root = document.getElementById('app');

const ICON_PACKAGE =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>';

const ICON_CLOCK =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

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
      <div class="header-left">
        ${ICON_PACKAGE}
        <div>
          <div class="title">Track Order</div>
          <div class="subtitle">${esc(t.storeName)}</div>
        </div>
      </div>
      <span class="status-pill">${esc(t.status)}</span>
    </div>
    <div class="timeline">
      ${STEPS.map((s, idx) => {
        const cls = idx === currentIdx ? 'step active' : idx < currentIdx ? 'step done' : 'step';
        return `<div class="${cls}">${esc(s.label)}</div>`;
      }).join('')}
    </div>
    ${Array.isArray(t.items) && t.items.length > 0 ? `
      <div class="divide-list">
        ${t.items.map((item) => {
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
                <div class="row-sub">Qty ${esc(item.quantity)} &middot; &#8377;${esc(item.price)}</div>
              </div>
              <div class="row-price">&#8377;${esc(item.total || item.totalPrice || item.price * item.quantity)}</div>
            </div>
          `;
        }).join('')}
      </div>
    ` : ''}
    <div class="summary-box">
      <div class="summary-line"><span>Order ID</span><span class="val mono">${esc(t.orderId)}</span></div>
      <div class="summary-line"><span>Customer</span><span class="val">${esc(t.customerName)}</span></div>
      ${t.deliveryAddress ? `<div class="summary-line"><span>Address</span><span class="val">${esc(t.deliveryAddress)}</span></div>` : ''}
      <div class="summary-total"><span>Total</span><span>&#8377;${esc(t.totalAmount)}</span></div>
      <div class="eta-line">${ICON_CLOCK}<span>Estimated arrival in ~${esc(t.estimatedDeliveryMinutes)} mins</span></div>
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

(async () => {
  await app.connect();
})();
