import { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, CheckCircle2, AlertCircle, Plus, Minus } from 'lucide-react';
import { api } from '../api/client.js';

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  location,
  onAdd,
  onDecrement,
  onClearCart,
  onOrderSuccess
}) {
  const [step, setStep] = useState('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState(location?.pincode || '834001');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if (location?.pincode) {
      setPincode(location.pincode);
    }
  }, [location]);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      if (step === 'success') {
        setStep('cart');
        setPlacedOrder(null);
      }
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const totalSavings = cart?.totalSavings || 0;
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 25;
  const totalAmount = subtotal + deliveryFee;

  async function handleCheckout(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await api.createOrder({
        customerName,
        customerPhone,
        deliveryAddress,
        pincode,
        paymentMethod
      });
      setPlacedOrder(res.data);
      setStep('cart');
      onOrderSuccess(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/40 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-neutral-900">
              {step === 'cart' && `Your Cart (${cart?.totalItems || 0})`}
              {step === 'checkout' && 'Delivery Details'}
              {step === 'success' && 'Order Confirmed'}
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

        <div className="flex-1 overflow-y-auto p-5">
          {step === 'success' && placedOrder ? (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Order placed successfully</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Order ID: <span className="font-mono font-semibold">{placedOrder.id}</span>
                </p>
                <p className="text-xs text-emerald-700">
                  Fulfilling Store: {placedOrder.storeName}
                </p>
                <p className="text-xs text-emerald-700">
                  Estimated Delivery: ~{placedOrder.estimatedDeliveryMinutes} mins
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Status</span>
                  <span className="font-semibold text-neutral-900">{placedOrder.status}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Payment</span>
                  <span className="font-semibold text-neutral-900">{placedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-neutral-900 font-bold text-sm pt-2 border-t border-neutral-100">
                  <span>Total Amount</span>
                  <span>₹{placedOrder.totalAmount}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Your cart is empty</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Add groceries and daily essentials to get started.
                </p>
              </div>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-4">
              {totalSavings > 0 && (
                <div className="px-3.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs font-medium text-emerald-800">
                  You save ₹{totalSavings} with Apna Mart wholesale prices
                </div>
              )}

              <div className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <div key={item.productId} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        {item.unit} · ₹{item.price} each
                      </p>
                    </div>

                    <div className="flex items-center bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => onDecrement(item.productId, item.quantity)}
                        className="p-1.5 text-neutral-700 hover:bg-neutral-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAdd(item.productId)}
                        className="p-1.5 text-neutral-700 hover:bg-neutral-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right shrink-0 min-w-[3.5rem]">
                      <span className="text-sm font-semibold text-neutral-900">
                        ₹{item.totalPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear cart</span>
                </button>
              </div>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Aman Sharma"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Delivery Address
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House 14, Circular Road, Ranchi"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:border-emerald-600 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="834001"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:border-emerald-600 outline-none bg-white"
                >
                  <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                  <option value="ONLINE_UPI">Online UPI</option>
                </select>
              </div>
            </form>
          )}
        </div>

        {items.length > 0 && step !== 'success' && (
          <div className="p-5 border-t border-neutral-200 bg-neutral-50/70 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Fee (Free above ₹499)</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1.5 border-t border-neutral-200">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-2.5 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-medium rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {submitting ? 'Placing Order...' : `Place Order · ₹${totalAmount}`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
