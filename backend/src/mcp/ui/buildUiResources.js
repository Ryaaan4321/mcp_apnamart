import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, 'shared.css');

const cache = new Map();

export const UI_RESOURCES = {
  products: {
    name: 'apnamart_products_ui',
    uri: 'ui://apnamart/products.html',
    title: 'Apna Mart Product Grid',
    entry: 'productsApp.js'
  },
  cart: {
    name: 'apnamart_cart_ui',
    uri: 'ui://apnamart/cart.html',
    title: 'Apna Mart Cart Summary',
    entry: 'cartApp.js'
  },
  order: {
    name: 'apnamart_order_ui',
    uri: 'ui://apnamart/order.html',
    title: 'Apna Mart Order Review & Confirmation',
    entry: 'orderApp.js'
  },
  track: {
    name: 'apnamart_track_ui',
    uri: 'ui://apnamart/track.html',
    title: 'Apna Mart Order Status Timeline',
    entry: 'trackApp.js'
  }
};

export const UI_CSP_META = {
  ui: {
    prefersBorder: false,
    csp: {
      resourceDomains: ['https://images.unsplash.com']
    }
  }
};

export function getUiHtml(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const def = UI_RESOURCES[key];
  if (!def) {
    throw new Error(`Unknown UI resource key: ${key}`);
  }

  const entryPath = path.join(__dirname, 'apps', def.entry);
  const css = fs.readFileSync(cssPath, 'utf8');

  const bundled = esbuild.buildSync({
    entryPoints: [entryPath],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    minify: true
  });

  const js = bundled.outputFiles[0].text;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${def.title}</title>
<style>${css}</style>
</head>
<body>
<div id="app"></div>
<script>${js}</script>
</body>
</html>`;

  cache.set(key, html);
  return html;
}
