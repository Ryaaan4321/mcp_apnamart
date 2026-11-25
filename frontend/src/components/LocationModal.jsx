import { useState, useEffect } from 'react';
import { MapPin, X, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { api } from '../api/client.js';

export function LocationModal({ isOpen, onClose, currentLocation, onSelectLocation }) {
  const [pincode, setPincode] = useState(currentLocation?.pincode || '');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(currentLocation || null);

  useEffect(() => {
    if (!isOpen) return;
    api.listStores()
      .then((res) => setStores(res.data || []))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleCheck(pinToCheck) {
    const cleanPin = String(pinToCheck || pincode).trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setError('Please enter a valid 6-digit Indian pincode.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.checkServiceability(cleanPin);
      setResult(res.data);
      setPincode(cleanPin);
      if (res.data.isServiceable) {
        onSelectLocation(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-neutral-900">
              Delivery Location
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheck(pincode);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit pincode (e.g. 834001)"
              className="flex-1 px-3.5 py-2 text-sm border border-neutral-200 rounded-lg focus:border-emerald-600 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </form>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && !error && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                result.isServiceable
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {result.isServiceable ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Serviceable: {result.store.name}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Outside Delivery Zone ({result.pincode})</span>
                  </>
                )}
              </div>
              {result.isServiceable ? (
                <>
                  <p className="text-emerald-800">{result.store.address}</p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-medium text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {result.estimatedDeliveryMinutes} mins delivery
                    </span>
                    <span>{result.store.openingHours}</span>
                  </div>
                </>
              ) : (
                <p className="text-amber-800">{result.message}</p>
              )}
            </div>
          )}

          {stores.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500">
                Active Apna Mart Hubs (click to select)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {stores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => handleCheck(store.pincodes[0])}
                    className={`text-left p-2.5 rounded-lg border transition-colors ${
                      result?.store?.id === store.id
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-neutral-900">
                      {store.city}
                    </span>
                    <span className="block text-[11px] text-neutral-500">
                      PIN {store.pincodes[0]} · {store.estimatedDeliveryMinutes}m
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
