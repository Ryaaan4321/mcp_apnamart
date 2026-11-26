import { App, applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps/app-with-deps';

const app = new App({ name: 'Apna Mart Products', version: '1.0.0' }, {});
const root = document.getElementById('app');

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
    root.innerHTML = '<div class="empty">No matching products found.</div>';
    return;
  }

  const totalText = pagination ? `${products.length} of ${pagination.total} items` : `${products.length} items`;

  root.innerHTML = `
    <div class="header">
      <div>
        <div class="title">Apna Mart Catalog</div>
        <div class="subtitle">${esc(totalText)}</div>
      </div>
    </div>
    <div class="grid">
      ${products.map((p) => {
        const imgSrc = p.thumbnailUrl || p.imageUrl;
        const initials = esc((p.brand || p.category || 'AM').slice(0, 12));
        return `
          <div class="card">
            <div>
              <div class="thumb-wrap">
                ${imgSrc
                  ? `<img src="${esc(imgSrc)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" /><span class="thumb-fallback" style="display:none;">${initials}</span>`
                  : `<span class="thumb-fallback">${initials}</span>`}
                ${p.discountPercentage > 0 ? `<span class="badge">${esc(p.discountPercentage)}% OFF</span>` : ''}
              </div>
              <div class="meta" style="margin-top:8px;">${esc(p.brand)} &middot; ${esc(p.unit)}</div>
              <div class="name">${esc(p.name)}</div>
            </div>
            <div class="card-footer">
              <div>
                <span class="price">&#8377;${esc(p.apnaMartPrice)}</span>
                ${p.mrp > p.apnaMartPrice ? `<span class="mrp">&#8377;${esc(p.mrp)}</span>` : ''}
              </div>
              <button class="btn add-btn" data-id="${esc(p.id)}" ${!p.isAvailable || p.stock <= 0 ? 'disabled' : ''}>
                ${!p.isAvailable || p.stock <= 0 ? 'Out' : 'Add to cart'}
              </button>
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
      btn.textContent = 'Adding...';
      try {
        const caps = app.getHostCapabilities();
        if (caps?.serverTools) {
          await app.callServerTool({
            name: 'manage_cart',
            arguments: { action: 'add', productId, quantity: 1 }
          });
          btn.textContent = 'Added';
        } else if (caps?.message) {
          await app.sendMessage({
            role: 'user',
            content: [{ type: 'text', text: `Add product ${productId} (quantity 1) to my cart.` }]
          });
          btn.textContent = 'Requested';
        }
      } catch (err) {
        btn.textContent = 'Error';
        btn.disabled = false;
      }
    });
  });
}

app.ontoolinput = () => {
  root.innerHTML = '<div class="empty">Searching Apna Mart catalog...</div>';
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
