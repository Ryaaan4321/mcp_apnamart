import { Plus, Minus, Wheat, Droplet, Milk, Cookie, Sparkles, ShieldCheck, Package } from 'lucide-react';

const CATEGORY_VISUALS = {
  'Staples & Grains': { icon: Wheat, bg: 'bg-amber-50/80', text: 'text-amber-700' },
  'Oils & Spices': { icon: Droplet, bg: 'bg-orange-50/80', text: 'text-orange-700' },
  'Dairy & Bakery': { icon: Milk, bg: 'bg-sky-50/80', text: 'text-sky-700' },
  'Packaged Foods & Snacks': { icon: Cookie, bg: 'bg-rose-50/80', text: 'text-rose-700' },
  'Household & Cleaning': { icon: Sparkles, bg: 'bg-indigo-50/80', text: 'text-indigo-700' },
  'Personal Care & Hygiene': { icon: ShieldCheck, bg: 'bg-teal-50/80', text: 'text-teal-700' }
};

export function ProductCard({ product, cartQuantity, onAdd, onDecrement, busy }) {
  const visual = CATEGORY_VISUALS[product.category] || {
    icon: Package,
    bg: 'bg-neutral-100',
    text: 'text-neutral-600'
  };
  const Icon = visual.icon;
  const outOfStock = !product.isAvailable || product.stock <= 0;

  return (
    <div className="bg-white rounded-xl border border-neutral-200/80 hover:border-neutral-300 transition-all p-3 flex flex-col justify-between gap-2.5">
      <div>
        <div className={`w-full h-24 rounded-lg ${visual.bg} ${visual.text} flex items-center justify-center relative mb-2.5`}>
          <Icon className="w-7 h-7" />
          {product.discountPercentage > 0 && (
            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>

        <p className="text-[11px] font-medium text-neutral-500 truncate">
          {product.brand} · {product.unit}
        </p>
        <h3 className="text-xs font-semibold text-neutral-900 leading-snug line-clamp-2 min-h-[2rem] mt-0.5">
          {product.name}
        </h3>
      </div>

      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1.5">
        <div className="leading-tight">
          <span className="block text-sm font-bold text-neutral-900">
            ₹{product.apnaMartPrice}
          </span>
          {product.mrp > product.apnaMartPrice && (
            <span className="block text-[11px] text-neutral-400 line-through">
              ₹{product.mrp}
            </span>
          )}
        </div>

        {outOfStock ? (
          <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-400 text-[11px] font-medium">
            Out
          </span>
        ) : cartQuantity > 0 ? (
          <div className="flex items-center bg-emerald-600 text-white rounded-lg overflow-hidden shadow-xs">
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecrement(product.id, cartQuantity)}
              aria-label="Decrease quantity"
              className="px-2 py-1.5 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-1.5 text-xs font-semibold min-w-[1.25rem] text-center">
              {cartQuantity}
            </span>
            <button
              type="button"
              disabled={busy || cartQuantity >= product.stock}
              onClick={() => onAdd(product.id)}
              aria-label="Increase quantity"
              className="px-2 py-1.5 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAdd(product.id)}
            className="px-3.5 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:opacity-50 text-xs font-semibold transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
