import { App } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Products', version: '1.0.0' }, {});
const root = document.getElementById('app');

const ICON_PACKAGE =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>';

const CATEGORY_CLASS = {
  'Staples & Grains': 'cat-grains',
  'Oils & Spices': 'cat-oils',
  'Dairy & Bakery': 'cat-dairy',
  'Packaged Foods & Snacks': 'cat-snacks',
  'Household & Cleaning': 'cat-household',
  'Personal Care & Hygiene': 'cat-care'
};

function esc(val) {
  return String(val ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderProducts(data) {
  if (!data || !Array.isArray(data.products)) {
    root.innerHTML = '<div class="empty">No product data received.</div>';
    return;
  }

  const { products, pagination } = data;
  if (products.length === 0) {
    root.innerHTML = '<div class="empty">No products found. Try clearing your search or filters.</div>';
    return;
  }

  const totalText = pagination ? `${products.length} of ${pagination.total} items` : `${products.length} items`;

  root.innerHTML = `
    <div class="header">
      <div>
        <div class="title">Apna Mart</div>
        <div class="subtitle">Wholesale Grocery &amp; Daily Essentials</div>
      </div>
      <span class="eta-pill">${esc(totalText)}</span>
    </div>
    <div class="grid">
      ${products.map((p) => {
        const imgSrc = p.thumbnailUrl || p.imageUrl;
        const catClass = CATEGORY_CLASS[p.category] || 'cat-default';
        const outOfStock = !p.isAvailable || p.stock <= 0;
        return `
          <div class="card">
            <div>
              <div class="thumb-wrap ${catClass}">
                ${imgSrc
                  ? `<img src="${esc(imgSrc)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span style="display:none;">${ICON_PACKAGE}</span>`
                  : ICON_PACKAGE}
                ${p.discountPercentage > 0 ? `<span class="badge">${esc(p.discountPercentage)}% OFF</span>` : ''}
              </div>
              <div class="meta">${esc(p.brand)} &middot; ${esc(p.unit)}</div>
              <div class="name">${esc(p.name)}</div>
            </div>
            <div class="card-footer">
              <div class="price-col">
                <span class="price">&#8377;${esc(p.apnaMartPrice)}</span>
                ${p.mrp > p.apnaMartPrice ? `<span class="mrp">&#8377;${esc(p.mrp)}</span>` : ''}
              </div>
              ${outOfStock
                ? '<span class="btn-out">Out</span>'
                : `<button class="btn add-btn" data-id="${esc(p.id)}">Add</button>`}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  root.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const productId = btn.getAttribute('data-id');
      btn.disabled = true;
      btn.textContent = '...';
      try {
        const caps = app.getHostCapabilities();
        if (caps?.serverTools) {
          await app.callServerTool({
            name: 'manage_cart',
            arguments: { action: 'add', productId, quantity: 1 }
          });
          btn.textContent = 'Added';
          btn.classList.add('btn-added');
          btn.disabled = false;
        } else if (caps?.message) {
          await app.sendMessage({
            role: 'user',
            content: [{ type: 'text', text: `Add product ${productId} (quantity 1) to my cart.` }]
          });
          btn.textContent = 'Added';
          btn.classList.add('btn-added');
          btn.disabled = false;
        }
      } catch {
        btn.textContent = 'Add';
        btn.disabled = false;
      }
    });
  });
}

app.ontoolinput = () => {
  root.innerHTML = '<div class="empty">Loading Apna Mart catalog...</div>';
};

app.ontoolresult = (result) => {
  const payload = result?.structuredContent || (() => {
    try {
      return JSON.parse(result?.content?.[0]?.text || '{}');
    } catch {
      return null;
    }
  })();
  renderProducts(payload);
};

(async () => {
  await app.connect();
})();
