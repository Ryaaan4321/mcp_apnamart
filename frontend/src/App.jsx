import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowUpDown, AlertCircle, ChevronRight } from 'lucide-react';
import { api } from './api/client.js';
import { Header } from './components/Header.jsx';
import { CategoryBar } from './components/CategoryBar.jsx';
import { ProductCard } from './components/ProductCard.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { LocationModal } from './components/LocationModal.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { TrackOrderModal } from './components/TrackOrderModal.jsx';

export default function App() {
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState({ categories: [], brands: [], priceRange: { min: 0, max: 0 } });
  const [allCategories, setAllCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  const [cart, setCart] = useState(null);
  const [cartBusy, setCartBusy] = useState(false);
  const [location, setLocation] = useState(null);

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const res = await api.getCart();
      setCart(res.data);
    } catch {
      // Ignore initial cart load failure if backend is offline
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.searchProducts({
        q: searchQuery || undefined,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        sortBy,
        page: 1,
        limit: 50
      });
      setProducts(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
      setFacets(res.facets || { categories: [], brands: [], priceRange: { min: 0, max: 0 } });

      if (!searchQuery && !selectedCategory && !selectedBrand && res.facets?.categories) {
        setAllCategories(res.facets.categories);
      }
    } catch (err) {
      setError(err.message || 'Unable to load Apna Mart catalog. Make sure backend is running on port 4000.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrand, sortBy]);

  useEffect(() => {
    loadCart();
    api.checkServiceability('834001')
      .then((res) => {
        if (res.data?.isServiceable) {
          setLocation(res.data);
        }
      })
      .catch(() => {});
  }, [loadCart]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  async function handleAddToCart(productId) {
    setCartBusy(true);
    try {
      const res = await api.addToCart(productId, 1);
      setCart(res.data);
    } finally {
      setCartBusy(false);
    }
  }

  async function handleDecrementCart(productId, currentQty) {
    setCartBusy(true);
    try {
      await api.removeFromCart(productId);
      if (currentQty > 1) {
        const res = await api.addToCart(productId, currentQty - 1);
        setCart(res.data);
      } else {
        await loadCart();
      }
    } finally {
      setCartBusy(false);
    }
  }

  async function handleClearCart() {
    setCartBusy(true);
    try {
      const res = await api.clearCart();
      setCart(res.data);
    } finally {
      setCartBusy(false);
    }
  }

  const cartQtyMap = useMemo(() => {
    const map = {};
    (cart?.items || []).forEach((item) => {
      map[item.productId] = item.quantity;
    });
    return map;
  }, [cart]);

  const shouldGroupByCategory = !selectedCategory && !searchQuery && !selectedBrand && sortBy === 'name_asc';

  const groupedProducts = useMemo(() => {
    if (!shouldGroupByCategory) return null;
    const groups = {};
    products.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return Object.entries(groups);
  }, [products, shouldGroupByCategory]);

  const totalCatalogCount = useMemo(() => {
    return allCategories.reduce((sum, c) => sum + c.count, 0) || pagination.total;
  }, [allCategories, pagination.total]);

  return (
    <div className="mx-auto max-w-lg min-h-screen bg-white border-x border-neutral-200/70 pb-20 flex flex-col">
      <Header
        location={location}
        onOpenLocation={() => setLocationModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (activeTab !== 'home') setActiveTab('home');
        }}
      />

      {activeTab === 'categories' ? (
        <main className="flex-1 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-neutral-900">All Categories</h1>
            <span className="text-xs text-neutral-500">{allCategories.length} categories</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {allCategories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedBrand('');
                  setActiveTab('home');
                }}
                className="text-left p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 bg-neutral-50/50 hover:bg-emerald-50/30 transition-all flex items-center justify-between gap-2"
              >
                <div>
                  <span className="block text-sm font-semibold text-neutral-900 leading-snug">
                    {cat.name}
                  </span>
                  <span className="block text-xs text-neutral-500 mt-1">
                    {cat.count} {cat.count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
              </button>
            ))}
          </div>
        </main>
      ) : (
        <>
          <CategoryBar
            categories={allCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedBrand('');
            }}
            totalCount={totalCatalogCount}
          />

          <main className="flex-1 px-4 py-4 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {selectedBrand ? (
                  <button
                    type="button"
                    onClick={() => setSelectedBrand('')}
                    className="shrink-0 px-2.5 py-1 rounded-md bg-neutral-900 text-white text-xs font-medium"
                  >
                    {selectedBrand} ×
                  </button>
                ) : (
                  facets.brands.slice(0, 4).map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => setSelectedBrand(b.name)}
                      className="shrink-0 px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200/70 text-xs text-neutral-700 transition-colors"
                    >
                      {b.name}
                    </button>
                  ))
                )}
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 rounded-lg px-2 py-1 shrink-0">
                <ArrowUpDown className="w-3 h-3 text-neutral-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-medium text-neutral-700 bg-transparent outline-none cursor-pointer"
                >
                  <option value="name_asc">A-Z</option>
                  <option value="price_asc">Low-High</option>
                  <option value="price_desc">High-Low</option>
                  <option value="discount_desc">Discount</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Backend Connection Error</p>
                  <p className="mt-0.5 text-red-700">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-48 rounded-xl bg-neutral-100 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 p-10 text-center space-y-2">
                <p className="text-sm font-semibold text-neutral-900">No products found</p>
                <p className="text-xs text-neutral-500">
                  Try clearing your search or filters.
                </p>
                {(searchQuery || selectedCategory || selectedBrand) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setSelectedBrand('');
                    }}
                    className="mt-2 px-4 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
            ) : groupedProducts ? (
              <div className="space-y-6">
                {groupedProducts.map(([categoryName, items]) => (
                  <section key={categoryName} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                        {categoryName}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(categoryName)}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        See all
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {items.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          cartQuantity={cartQtyMap[product.id] || 0}
                          onAdd={handleAddToCart}
                          onDecrement={handleDecrementCart}
                          busy={cartBusy}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQuantity={cartQtyMap[product.id] || 0}
                    onAdd={handleAddToCart}
                    onDecrement={handleDecrementCart}
                    busy={cartBusy}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={cart?.totalItems || 0}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenOrders={() => setTrackModalOpen(true)}
      />

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={(loc) => setLocation(loc)}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        location={location}
        onAdd={handleAddToCart}
        onDecrement={handleDecrementCart}
        onClearCart={handleClearCart}
        onOrderSuccess={() => {
          loadCart();
          loadProducts();
        }}
      />

      <TrackOrderModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />
    </div>
  );
}
