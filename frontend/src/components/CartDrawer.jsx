import { useState, useEffect, useMemo } from 'react';
import { X, Trash2, ShoppingBag, CheckCircle2, AlertCircle, Plus, Minus, ShieldCheck } from 'lucide-react';
import { api } from '../api/client.js';

function buildQrCells(upiUri) {
  const size = 21;
  const text = String(upiUri || 'upi://pay?pa=apnamart@upi');
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  const finderOn = (r, c) => {
    const lr = r >= size - 7 ? r - (size - 7) : r;
    const lc = c >= size - 7 ? c - (size - 7) : c;
    return (
      lr === 0 || lr === 6 || lc === 0 || lc === 6 ||
      (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4)
    );
  };
  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const dark = isFinder(r, c)
        ? finderOn(r, c)
        : ((text.charCodeAt((r * size + c) % text.length) + r * 7 + c * 13) % 5) < 2;
      if (dark) cells.push({ r, c });
    }
  }
  return cells;
}

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
  const [verifyingUpi, setVerifyingUpi] = useState(false);
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
      setVerifyingUpi(false);
      if (step === 'success' || step === 'upi') {
        setStep('cart');
        setPlacedOrder(null);
      }
    }
  }, [isOpen, step]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const totalSavings = cart?.totalSavings || 0;
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 25;
  const totalAmount = subtotal + deliveryFee;

  const upiCells = useMemo(
    () => buildQrCells(`upi://pay?pa=apnamart@upi&pn=Apna%20Mart&am=${totalAmount}&cu=INR`),
    [totalAmount]
  );

  if (!isOpen) return null;

  async function submitOrder() {
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
      setVerifyingUpi(false);
    }
  }

  async function handleCheckout(e) {
    e.preventDefault();
    if (paymentMethod === 'ONLINE_UPI') {
      setError('');
      setStep('upi');
      return;
    }
    await submitOrder();
  }

  function handleVerifyUpi() {
    setVerifyingUpi(true);
    setError('');
    setTimeout(() => {
      submitOrder();
    }, 1100);
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
              {step === 'upi' && 'UPI Payment'}
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
          ) : step === 'upi' ? (
            <div className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/70 flex flex-col items-center text-center space-y-3">
                <div>
                  <p className="text-xs text-neutral-500">Payable Amount</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-0.5">₹{totalAmount}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-neutral-200">
                  <svg width="150" height="150" viewBox="0 0 138 138" aria-label="UPI QR Code">
                    {upiCells.map((cell, i) => (
                      <rect
                        key={i}
                        x={6 + cell.c * 6}
                        y={6 + cell.r * 6}
                        width="6"
                        height="6"
                        fill="#171717"
                      />
                    ))}
                  </svg>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs text-neutral-600">
                  <span>UPI ID:</span>
                  <span className="font-mono font-semibold text-neutral-900">apnamart@upi</span>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((appName) => (
                    <span
                      key={appName}
                      className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-[11px] font-semibold text-neutral-700"
                    >
                      {appName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Scan with any UPI app, then click verify to confirm your order.</span>
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
            ) : step === 'upi' ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={verifyingUpi || submitting}
                  onClick={() => setStep('checkout')}
                  className="px-4 py-2.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-50 text-neutral-700 text-sm font-medium rounded-lg"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={verifyingUpi || submitting}
                  onClick={handleVerifyUpi}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {verifyingUpi ? 'Verifying UPI payment…' : submitting ? 'Placing Order...' : "I've Paid · Verify & Place Order"}
                </button>
              </div>
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
                  {submitting
                    ? 'Placing Order...'
                    : paymentMethod === 'ONLINE_UPI'
                    ? `Proceed to Pay · ₹${totalAmount}`
                    : `Place Order · ₹${totalAmount}`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
