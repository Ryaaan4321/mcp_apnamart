import { App } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Cart', version: '1.0.0' }, {});
const root = document.getElementById('app');

const ICON_BAG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

const ICON_PACKAGE =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>';

const ICON_MINUS =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';

const ICON_PLUS =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';

const ICON_TRASH =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';

function esc(val) {
  return String(val ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function runCartMutation(args, fallbackText) {
  const caps = app.getHostCapabilities();
  if (caps?.serverTools) {
    const res = await app.callServerTool({
      name: 'manage_cart',
      arguments: args
    });
    const nextPayload = res?.structuredContent || (() => {
      try {
        return JSON.parse(res?.content?.[0]?.text || '{}');
      } catch {
        return null;
      }
    })();
    if (nextPayload) {
      renderCart(nextPayload);
    }
  } else if (caps?.message) {
    await app.sendMessage({
      role: 'user',
      content: [{ type: 'text', text: fallbackText }]
    });
  }
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
  const cartId = cart.cartId || 'default_user_cart';

  root.innerHTML = `
    <div class="header">
      <div class="header-left">
        ${ICON_BAG}
        <div>
          <div class="title">Your Cart (${esc(cart.totalItems)})</div>
          <div class="subtitle mono" style="font-size:11px;">${esc(cartId)}</div>
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
              <div class="row-sub">${esc(item.unit)} &middot; &#8377;${esc(item.price)} each</div>
            </div>
            <div class="qty-stepper">
              <button class="qty-btn dec-btn" type="button" data-id="${esc(item.productId)}" data-qty="${esc(item.quantity)}" aria-label="Decrease quantity">${ICON_MINUS}</button>
              <span class="qty-val">${esc(item.quantity)}</span>
              <button class="qty-btn inc-btn" type="button" data-id="${esc(item.productId)}" data-qty="${esc(item.quantity)}" aria-label="Increase quantity">${ICON_PLUS}</button>
            </div>
            <div class="row-price">&#8377;${esc(item.totalPrice)}</div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="clear-row">
      <button id="clear-cart-btn" class="clear-btn" type="button">${ICON_TRASH}<span>Clear cart</span></button>
    </div>
    <div class="summary-box">
      <div class="summary-line"><span>Subtotal</span><span class="val">&#8377;${esc(subtotal)}</span></div>
      <div class="summary-line"><span>Delivery Fee (Free above &#8377;499)</span><span class="val">${deliveryFee === 0 ? 'FREE' : `&#8377;${esc(deliveryFee)}`}</span></div>
      ${cart.totalSavings > 0 ? `<div class="summary-line"><span>Wholesale Savings</span><span class="val" style="color:#059669;">-&#8377;${esc(cart.totalSavings)}</span></div>` : ''}
      <div class="summary-total"><span>Total</span><span>&#8377;${esc(totalAmount)}</span></div>
    </div>
  `;

  const setBusy = (busy) => {
    root.querySelectorAll('.qty-btn, #clear-cart-btn').forEach((el) => {
      el.disabled = busy;
    });
  };

  root.querySelectorAll('.dec-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const productId = btn.getAttribute('data-id');
      const currentQty = Number(btn.getAttribute('data-qty') || 1);
      const nextQty = Math.max(0, currentQty - 1);
      setBusy(true);
      try {
        await runCartMutation(
          { action: 'update', cartId, productId, quantity: nextQty },
          nextQty === 0
            ? `Remove product ${productId} from cart ${cartId}.`
            : `Set quantity of product ${productId} in cart ${cartId} to ${nextQty}.`
        );
      } finally {
        setBusy(false);
      }
    });
  });

  root.querySelectorAll('.inc-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const productId = btn.getAttribute('data-id');
      const currentQty = Number(btn.getAttribute('data-qty') || 1);
      const nextQty = currentQty + 1;
      setBusy(true);
      try {
        await runCartMutation(
          { action: 'update', cartId, productId, quantity: nextQty },
          `Set quantity of product ${productId} in cart ${cartId} to ${nextQty}.`
        );
      } finally {
        setBusy(false);
      }
    });
  });

  document.getElementById('clear-cart-btn')?.addEventListener('click', async () => {
    setBusy(true);
    try {
      await runCartMutation(
        { action: 'clear', cartId },
        `Clear cart ${cartId}.`
      );
    } finally {
      setBusy(false);
    }
  });
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
