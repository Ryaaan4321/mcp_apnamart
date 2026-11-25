import { useState } from 'react';
import { Package, X, AlertCircle, Clock } from 'lucide-react';
import { api } from '../api/client.js';

export function TrackOrderModal({ isOpen, onClose }) {
  const [orderId, setOrderId] = useState('ord_apm_1001');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleTrack(e) {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setTracking(null);
    try {
      const res = await api.trackOrder(orderId.trim());
      setTracking(res.data);
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
            <Package className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Track Order</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleTrack} className="flex gap-2">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. ord_apm_1001)"
              className="flex-1 px-3.5 py-2 text-sm border border-neutral-200 rounded-lg focus:border-emerald-600 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Checking...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {tracking && (
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-neutral-900">
                  {tracking.orderId}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                  {tracking.status}
                </span>
              </div>
              <div className="text-neutral-600 space-y-1">
                <p>Customer: <span className="font-medium text-neutral-900">{tracking.customerName}</span></p>
                <p>Store: <span className="font-medium text-neutral-900">{tracking.storeName}</span></p>
                <p>Items: <span className="font-medium text-neutral-900">{tracking.itemsCount}</span> · Total: <span className="font-medium text-neutral-900">₹{tracking.totalAmount}</span></p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated arrival in ~{tracking.estimatedDeliveryMinutes} mins</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
