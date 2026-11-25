import { MapPin, Search, X, ChevronDown, Clock } from 'lucide-react';

export function Header({
  location,
  onOpenLocation,
  searchQuery,
  onSearchChange
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-3 pb-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenLocation}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <MapPin className="w-4 h-4 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {location?.isServiceable ? location.store.city : 'Select Address'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
            </div>
            <p className="text-xs text-gray-500 truncate">
              {location?.isServiceable
                ? `${location.pincode} · ${location.store.name}`
                : 'Tap to set delivery location'}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenLocation}
          className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full shrink-0"
        >
          <Clock className="w-3 h-3 text-green-600" />
          <span className="text-xs font-medium text-green-700">
            {location?.isServiceable ? `${location.estimatedDeliveryMinutes} min` : 'Check PIN'}
          </span>
        </button>
      </div>

      <div className="relative mt-2.5">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for groceries, essentials..."
          className="w-full h-10 pl-9 pr-8 text-sm bg-gray-50 border border-gray-200 focus:border-gray-300 focus:bg-white rounded-lg outline-none transition-colors placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
}
