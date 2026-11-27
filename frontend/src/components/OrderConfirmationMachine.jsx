import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

function formatMoney(amount) {
  const num = Number(amount);
  const safe = Number.isFinite(num) ? num : 0;
  return `₹ ${safe.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDate(createdAt) {
  if (!createdAt) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return String(createdAt);
  return parsed.toISOString().slice(0, 10);
}

export function OrderConfirmationMachine({ order, onClose }) {
  const [stage, setStage] = useState('cash'); // cash | printing | done
  const [billState, setBillState] = useState('hidden'); // hidden | out | taken
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);

  // Trigger voucher dispense automatically when an order is placed
  useEffect(() => {
    if (!order) return undefined;

    setStage('cash');
    setBillState('hidden');
    setReceiptPrinted(false);
    setVisibleSections(0);

    const frame = requestAnimationFrame(() => {
      setBillState('out');
    });

    return () => cancelAnimationFrame(frame);
  }, [order]);

  // Sequence receipt slide and section reveal when printing starts
  useEffect(() => {
    if (stage !== 'printing') return undefined;

    const timers = [];
    timers.push(setTimeout(() => setReceiptPrinted(true), 400));

    const startRevealAt = 2200;
    [1, 2, 3, 4].forEach((count, idx) => {
      timers.push(setTimeout(() => setVisibleSections(count), startRevealAt + idx * 150));
    });

    timers.push(setTimeout(() => setStage('done'), startRevealAt + 4 * 150 + 150));

    return () => timers.forEach((id) => clearTimeout(id));
  }, [stage]);

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = order.subtotal ?? items.reduce(
    (sum, item) => sum + Number(item.totalPrice ?? (item.price || 0) * (item.quantity || 1)),
    0
  );
  const deliveryFee = order.deliveryFee ?? Math.max(0, (order.totalAmount ?? subtotal) - subtotal);
  const totalAmount = order.totalAmount ?? subtotal + deliveryFee;
  const fullAddress = [order.deliveryAddress, order.pincode].filter(Boolean).join(', ');
  const expected = order.estimatedDeliveryMinutes
    ? `~${order.estimatedDeliveryMinutes} mins`
    : 'Within 3-5 days';

  const screenText =
    stage === 'cash'
      ? 'Please collect your order voucher'
      : stage === 'printing'
      ? 'Printing confirmation…'
      : 'Order confirmed. Please take your receipt.';

  function handleAction() {
    if (stage === 'cash') {
      setBillState('taken');
      setStage('printing');
    } else if (stage === 'done') {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/55 backdrop-blur-[2px] p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Order Confirmation Machine"
    >
      <div className="w-full max-w-[360px] flex flex-col items-center gap-3 my-auto">
        <div className="ocm-machine w-full flex flex-col items-center relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation machine"
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-neutral-700 hover:text-neutral-900 shadow-lg border border-neutral-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="ocm-screen w-full flex items-center mb-3.5" role="status" aria-live="polite">
            {screenText}
          </div>

          <div className="ocm-slot-bar" aria-hidden="true" />
          <div className="ocm-cash-outlet mb-3.5">
            <div className={`ocm-bill ${billState === 'out' ? 'out' : billState === 'taken' ? 'taken' : ''}`}>
              <span className="text-[10px] font-bold tracking-wider uppercase">Voucher</span>
              <span className="text-[15px] font-extrabold">{formatMoney(totalAmount)}</span>
            </div>
          </div>

          <div className="ocm-slot-bar" aria-hidden="true" />
          <div className="ocm-receipt-tray no-scrollbar">
            <article className={`ocm-receipt ${receiptPrinted ? 'printed' : ''}`} aria-label="Order confirmation receipt">
              <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] text-[34px] font-extrabold tracking-[0.14em] text-emerald-600/10 whitespace-nowrap"
              >
                CONFIRMED
              </div>

              <header className="relative text-center mb-2.5">
                <div className="text-[14px] font-extrabold tracking-wide uppercase break-words">
                  {order.storeName || 'Apna Mart'}
                </div>
                <div className="text-[10px] tracking-[0.22em] text-neutral-600 mt-0.5">
                  ORDER CONFIRMATION
                </div>
              </header>

              <hr className="border-0 border-t border-dashed border-neutral-400 my-2.5" />

              <div className={`ocm-section ${visibleSections >= 1 ? 'visible' : ''}`}>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-600 shrink-0">Order ID</span>
                  <span className="text-right font-semibold break-all">{order.id}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-600 shrink-0">Date</span>
                  <span className="text-right">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-600 shrink-0">Customer</span>
                  <span className="text-right break-words">{order.customerName || 'Customer'}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-600 shrink-0">Deliver to</span>
                  <span className="text-right break-words">{fullAddress || '-'}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-600 shrink-0">Expected</span>
                  <span className="text-right">{expected}</span>
                </div>
              </div>

              <hr className="border-0 border-t border-dashed border-neutral-400 my-2.5" />

              <div className={`ocm-section ${visibleSections >= 2 ? 'visible' : ''}`}>
                {items.length === 0 ? (
                  <div className="flex justify-between gap-2.5 mb-1">
                    <span className="text-neutral-600">Order items</span>
                    <span className="text-right">{formatMoney(subtotal)}</span>
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const qty = item.quantity ?? 1;
                    const lineTotal = item.totalPrice ?? (item.price || 0) * qty;
                    return (
                      <div key={item.productId || idx} className="flex justify-between gap-2.5 mb-1">
                        <span className="text-neutral-700 break-words">
                          {qty} x {item.name}
                        </span>
                        <span className="text-right shrink-0">{formatMoney(lineTotal)}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <hr className="border-0 border-t border-dashed border-neutral-400 my-2.5" />

              <div className={`ocm-section ${visibleSections >= 3 ? 'visible' : ''}`}>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-right">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-600">Delivery</span>
                  <span className="text-right">{deliveryFee === 0 ? 'FREE' : formatMoney(deliveryFee)}</span>
                </div>
                <div className="flex justify-between gap-2.5 text-[14px] font-extrabold text-neutral-900 mt-1">
                  <span>TOTAL</span>
                  <span>{formatMoney(totalAmount)}</span>
                </div>
              </div>

              <hr className="border-0 border-t border-dashed border-neutral-400 my-2.5" />

              <div className={`ocm-section ${visibleSections >= 4 ? 'visible' : ''}`}>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-600">Payment</span>
                  <span className="text-right">{order.paymentMethod || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-2.5 mb-1">
                  <span className="text-neutral-600">Status</span>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10.5px] tracking-wider">
                    CONFIRMED
                  </span>
                </div>
                <hr className="border-0 border-t border-dashed border-neutral-400 my-2.5" />
                <div className="text-center text-[10.5px] text-neutral-600 mt-1">
                  Thank you for your order. Keep this for your records.
                </div>
              </div>
            </article>
          </div>

          <button
            type="button"
            disabled={stage === 'printing'}
            onClick={handleAction}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-55 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
          >
            {stage === 'cash'
              ? 'Take voucher'
              : stage === 'printing'
              ? 'Printing confirmation…'
              : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
}
