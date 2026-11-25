import { Home, Grid3x3, ShoppingCart, ClipboardList } from 'lucide-react';

export function BottomNav({ activeTab, onSelectTab, cartCount, onOpenCart, onOpenOrders }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-lg bg-white/95 backdrop-blur border-t border-neutral-200 flex items-center justify-around h-16 pointer-events-auto">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
            activeTab === 'home' ? 'text-emerald-600' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('categories')}
          className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
            activeTab === 'categories' ? 'text-emerald-600' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Grid3x3 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Categories</span>
        </button>

        <button
          type="button"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[1rem] h-4 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        <button
          type="button"
          onClick={onOpenOrders}
          className="flex flex-col items-center justify-center gap-0.5 w-16 h-full text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] font-medium">Orders</span>
        </button>
      </div>
    </nav>
  );
}
