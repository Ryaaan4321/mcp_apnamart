import { App } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Order', version: '1.0.0' }, {});
const root = document.getElementById('app');

const ICON_BAG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

const ICON_CLOCK =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

const ICON_PACKAGE =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>';

function esc(val) {
  return String(val ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatMoney(amount) {
  const num = Number(amount);
  const safe = Number.isFinite(num) ? num : 0;
  return '₹ ' + safe.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(createdAt) {
  if (!createdAt) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return String(createdAt);
  return parsed.toISOString().slice(0, 10);
}

function formatPayment(method) {
  if (method === 'CASH_ON_DELIVERY') return 'Cash on Delivery';
  if (method === 'ONLINE_UPI') return 'Online UPI';
  return method || '-';
}

function renderDemoQrSvg(upiUri) {
  const size = 21;
  const cell = 6;
  const pad = 6;
  const total = size * cell + pad * 2;
  const text = String(upiUri || 'upi://pay?pa=apnamart@upi');
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  const finderOn = (r, c) => {
    const lr = r >= size - 7 ? r - (size - 7) : r;
    const lc = c >= size - 7 ? c - (size - 7) : c;
    return (
      lr === 0 || lr === 6 || lc === 0 || lc === 6 ||
      (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4)
    );
  };
  const rects = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let dark = false;
      if (isFinder(r, c)) {
        dark = finderOn(r, c);
      } else {
        const idx = (r * size + c) % text.length;
        dark = ((text.charCodeAt(idx) + r * 7 + c * 13) % 5) < 2;
      }
      if (dark) {
        rects.push(`<rect x="${pad + c * cell}" y="${pad + r * cell}" width="${cell}" height="${cell}" fill="#171717" />`);
      }
    }
  }
  return `<svg width="144" height="144" viewBox="0 0 ${total} ${total}" aria-label="UPI QR Code">${rects.join('')}</svg>`;
}

function renderBarcodeSvg(seedStr) {
  const text = String(seedStr || 'APNAMART');
  let x = 0;
  const bars = [];
  for (let i = 0; i < 36; i++) {
    const code = text.charCodeAt(i % text.length);
    const w = ((code + i) % 3) + 1;
    if (i % 2 === 0) {
      bars.push(`<rect x="${x}" y="0" width="${w}" height="24" fill="#171717" />`);
    }
    x += w + (((code >> 1) + i) % 2) + 1;
  }
  return `<svg width="${Math.min(x, 180)}" height="24" viewBox="0 0 ${x} 24" aria-hidden="true">${bars.join('')}</svg>`;
}

function renderConfirmedMachine(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = order.subtotal ?? items.reduce(
    (sum, item) => sum + Number(item.totalPrice ?? (item.price || 0) * (item.quantity || 1)),
    0
  );
  const deliveryFee = order.deliveryFee ?? Math.max(0, (order.totalAmount ?? subtotal) - subtotal);
  const totalAmount = order.totalAmount ?? subtotal + deliveryFee;
  const fullAddress = [order.deliveryAddress, order.pincode].filter(Boolean).join(', ');
  const expected = order.estimatedDeliveryMinutes ? `~${order.estimatedDeliveryMinutes} mins` : 'Within 3-5 days';

  root.innerHTML = `
    <div class="ocm-wrap">
      <div class="ocm-machine">
        <div class="ocm-top-bar">
          <div class="ocm-brand">
            <span id="ocm-led" class="ocm-led"></span>
            <span>Apna Mart POS</span>
          </div>
          <span id="ocm-status" class="ocm-status-chip" role="status" aria-live="polite">Voucher ready</span>
        </div>

        <div class="ocm-slot-housing">
          <div class="ocm-slot-lip" aria-hidden="true"></div>
        </div>

        <div id="ocm-voucher-area" class="ocm-voucher-area">
          <div id="ocm-bill" class="ocm-bill">
            <span class="ocm-bill-label">Order Voucher</span>
            <span class="ocm-bill-amount">${esc(formatMoney(totalAmount))}</span>
          </div>
        </div>

        <div class="ocm-receipt-tray">
          <article id="ocm-receipt" class="ocm-receipt" aria-label="Order confirmation receipt">
            <div class="ocm-watermark" aria-hidden="true">CONFIRMED</div>
            <header class="ocm-r-header">
              <div class="ocm-r-brand">APNA MART</div>
              <div class="ocm-r-store">${esc(order.storeName || 'Apna Mart Supermart')}</div>
              <div class="ocm-r-sub">ORDER CONFIRMATION SLIP</div>
            </header>
            <hr class="ocm-divider" />
            <div id="ocm-sec-1" class="ocm-section">
              <div class="ocm-r-row"><span class="ocm-r-label">Order ID</span><span class="ocm-r-val" style="font-weight:700;">${esc(order.id)}</span></div>
              <div class="ocm-r-row"><span class="ocm-r-label">Date</span><span class="ocm-r-val">${esc(formatDate(order.placedAt || order.createdAt))}</span></div>
              <div class="ocm-r-row"><span class="ocm-r-label">Customer</span><span class="ocm-r-val">${esc(order.customerName || 'Customer')}</span></div>
              <div class="ocm-r-row"><span class="ocm-r-label">Deliver to</span><span class="ocm-r-val">${esc(fullAddress || '-')}</span></div>
              <div class="ocm-r-row"><span class="ocm-r-label">ETA</span><span class="ocm-r-val">${esc(expected)}</span></div>
            </div>
            <hr class="ocm-divider" />
            <div id="ocm-sec-2" class="ocm-section">
              <div class="ocm-items-head"><span>ITEM</span><span>AMOUNT</span></div>
              ${items.length === 0
                ? `<div class="ocm-r-row"><span class="ocm-r-item-name">Order items</span><span class="ocm-r-price">${esc(formatMoney(subtotal))}</span></div>`
                : items.map((item) => {
                    const qty = item.quantity ?? 1;
                    const lineTotal = item.totalPrice ?? (item.price || 0) * qty;
                    return `<div class="ocm-r-row"><span class="ocm-r-item-name">${esc(qty + ' x ' + item.name)}</span><span class="ocm-r-price">${esc(formatMoney(lineTotal))}</span></div>`;
                  }).join('')}
            </div>
            <hr class="ocm-divider" />
            <div id="ocm-sec-3" class="ocm-section">
              <div class="ocm-r-row"><span class="ocm-r-label">Subtotal</span><span class="ocm-r-price">${esc(formatMoney(subtotal))}</span></div>
              <div class="ocm-r-row"><span class="ocm-r-label">Delivery</span><span class="ocm-r-price">${deliveryFee === 0 ? 'FREE' : esc(formatMoney(deliveryFee))}</span></div>
              <hr class="ocm-divider-solid" />
              <div class="ocm-r-row ocm-r-total"><span>TOTAL</span><span class="ocm-r-price">${esc(formatMoney(totalAmount))}</span></div>
            </div>
            <hr class="ocm-divider" />
            <div id="ocm-sec-4" class="ocm-section">
              <div class="ocm-r-row"><span class="ocm-r-label">Payment</span><span class="ocm-r-val">${esc(formatPayment(order.paymentMethod))}</span></div>
              <div class="ocm-r-row" style="align-items:center;"><span class="ocm-r-label">Status</span><span class="ocm-r-tag">CONFIRMED</span></div>
              <div class="ocm-barcode">
                ${renderBarcodeSvg(order.id)}
                <span class="ocm-barcode-id">${esc(order.id)}</span>
              </div>
              <div class="ocm-r-footer">Thank you for shopping with Apna Mart.</div>
            </div>
          </article>
        </div>
        <button id="ocm-btn" class="btn-primary" style="margin-top:12px;">Print receipt</button>
      </div>
    </div>
  `;

  const statusEl = document.getElementById('ocm-status');
  const ledEl = document.getElementById('ocm-led');
  const voucherArea = document.getElementById('ocm-voucher-area');
  const billEl = document.getElementById('ocm-bill');
  const receiptEl = document.getElementById('ocm-receipt');
  const btnEl = document.getElementById('ocm-btn');
  const sections = [
    document.getElementById('ocm-sec-1'),
    document.getElementById('ocm-sec-2'),
    document.getElementById('ocm-sec-3'),
    document.getElementById('ocm-sec-4')
  ];

  let stage = 'cash';
  requestAnimationFrame(() => {
    billEl?.classList.add('out');
  });

  btnEl?.addEventListener('click', () => {
    if (stage !== 'cash') return;
    stage = 'printing';
    billEl?.classList.remove('out');
    billEl?.classList.add('taken');
    setTimeout(() => {
      voucherArea?.classList.add('collapsed');
    }, 240);
    btnEl.disabled = true;
    btnEl.textContent = 'Printing receipt…';
    if (statusEl) statusEl.textContent = 'Printing…';
    ledEl?.classList.add('printing');

    setTimeout(() => {
      receiptEl?.classList.add('printed');
    }, 360);

    const startRevealAt = 2000;
    sections.forEach((sec, idx) => {
      setTimeout(() => {
        sec?.classList.add('visible');
      }, startRevealAt + idx * 140);
    });

    setTimeout(() => {
      stage = 'done';
      ledEl?.classList.remove('printing');
      if (statusEl) statusEl.textContent = 'Receipt printed';
      btnEl.textContent = 'Done';
    }, startRevealAt + sections.length * 140 + 150);
  });
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
        <button id="confirm-order-btn" class="btn-primary">${r.paymentMethod === 'ONLINE_UPI' ? `Proceed to Pay &middot; &#8377;${esc(r.totalAmount)}` : `Place Order &middot; &#8377;${esc(r.totalAmount)}`}</button>
      </div>
    `;

    async function submitConfirmedOrder(btn, defaultLabel) {
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
        btn.textContent = defaultLabel;
        btn.disabled = false;
      }
    }

    function renderUpiStep() {
      const upiUri = `upi://pay?pa=apnamart@upi&pn=Apna%20Mart&am=${encodeURIComponent(r.totalAmount)}&cu=INR`;
      root.innerHTML = `
        <div class="header">
          <div class="header-left">
            ${ICON_BAG}
            <div>
              <div class="title">UPI Payment</div>
              <div class="subtitle">${esc(r.store.name)}</div>
            </div>
          </div>
          <span class="eta-pill">Scan &amp; Pay</span>
        </div>
        <div class="upi-card">
          <div>
            <div style="font-size:11px;color:#737373;">Payable Amount</div>
            <div class="upi-amount">&#8377;${esc(r.totalAmount)}</div>
          </div>
          <div class="upi-qr-box">${renderDemoQrSvg(upiUri)}</div>
          <div class="upi-id-pill"><span>UPI ID:</span><strong class="mono" style="color:#171717;">apnamart@upi</strong></div>
          <div class="upi-apps">
            <span class="upi-app-chip">GPay</span>
            <span class="upi-app-chip">PhonePe</span>
            <span class="upi-app-chip">Paytm</span>
            <span class="upi-app-chip">BHIM</span>
          </div>
          <div class="upi-actions">
            <button id="upi-back-btn" class="btn-secondary" type="button">Back</button>
            <button id="upi-verify-btn" class="btn-primary" type="button" style="flex:1;">I've Paid &middot; Verify</button>
          </div>
        </div>
      `;

      document.getElementById('upi-back-btn')?.addEventListener('click', () => {
        renderOrder(data);
      });

      const verifyBtn = document.getElementById('upi-verify-btn');
      verifyBtn?.addEventListener('click', () => {
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying UPI payment…';
        setTimeout(() => {
          verifyBtn.textContent = 'Payment Verified';
          submitConfirmedOrder(verifyBtn, "I've Paid · Verify");
        }, 1100);
      });
    }

    const btn = document.getElementById('confirm-order-btn');
    btn?.addEventListener('click', () => {
      if (r.paymentMethod === 'ONLINE_UPI') {
        renderUpiStep();
      } else {
        submitConfirmedOrder(btn, `Place Order · ₹${r.totalAmount}`);
      }
    });
    return;
  }

  const order = data.order || data;
  renderConfirmedMachine(order);
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
