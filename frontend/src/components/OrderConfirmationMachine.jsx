import { useEffect, useMemo, useState } from 'react';
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

function formatPayment(method) {
  if (method === 'CASH_ON_DELIVERY') return 'Cash on Delivery';
  if (method === 'ONLINE_UPI') return 'Online UPI';
  return method || '-';
}

function buildBarcodeBars(seedStr) {
  const text = String(seedStr || 'APNAMART');
  let x = 0;
  const bars = [];
  for (let i = 0; i < 36; i++) {
    const code = text.charCodeAt(i % text.length);
    const w = ((code + i) % 3) + 1;
    if (i % 2 === 0) {
      bars.push({ x, w });
    }
    x += w + (((code >> 1) + i) % 2) + 1;
  }
  return { bars, width: x };
}

export function OrderConfirmationMachine({ order, onClose }) {
  const [stage, setStage] = useState('cash'); // cash | printing | done
  const [billState, setBillState] = useState('hidden'); // hidden | out | taken
  const [voucherCollapsed, setVoucherCollapsed] = useState(false);
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);

  useEffect(() => {
    if (!order) return undefined;

    setStage('cash');
    setBillState('hidden');
    setVoucherCollapsed(false);
    setReceiptPrinted(false);
    setVisibleSections(0);

    const frame = requestAnimationFrame(() => {
      setBillState('out');
    });

    return () => cancelAnimationFrame(frame);
  }, [order]);

  useEffect(() => {
    if (stage !== 'printing') return undefined;

    const timers = [];
    timers.push(setTimeout(() => setVoucherCollapsed(true), 240));
    timers.push(setTimeout(() => setReceiptPrinted(true), 360));

    const startRevealAt = 2000;
    [1, 2, 3, 4].forEach((count, idx) => {
      timers.push(setTimeout(() => setVisibleSections(count), startRevealAt + idx * 140));
    });

    timers.push(setTimeout(() => setStage('done'), startRevealAt + 4 * 140 + 150));

    return () => timers.forEach((id) => clearTimeout(id));
  }, [stage]);

  const barcode = useMemo(() => buildBarcodeBars(order?.id), [order?.id]);

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

  const statusLabel =
    stage === 'cash'
      ? 'Voucher ready'
      : stage === 'printing'
      ? 'Printing…'
      : 'Receipt printed';

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
      <div className="w-full max-w-[356px] flex flex-col items-center my-auto">
        <div className="ocm-machine w-full flex flex-col items-center relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation machine"
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-neutral-700 hover:text-neutral-900 shadow-lg border border-neutral-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-full flex items-center justify-between gap-2 px-1 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-100 tracking-tight">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  stage === 'printing'
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.75)]'
                    : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                }`}
              />
              <span>Apna Mart POS</span>
            </div>
            <span
              className="text-[11px] font-medium text-zinc-300 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full"
              role="status"
              aria-live="polite"
            >
              {statusLabel}
            </span>
          </div>

          <div className="ocm-slot-housing">
            <div className="ocm-slot-lip" aria-hidden="true" />
          </div>

          <div className={`ocm-voucher-area ${voucherCollapsed ? 'collapsed' : ''}`}>
            <div className={`ocm-bill ${billState === 'out' ? 'out' : billState === 'taken' ? 'taken' : ''}`}>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700">
                Order Voucher
              </span>
              <span className="text-[15px] font-bold font-mono">{formatMoney(totalAmount)}</span>
            </div>
          </div>

          <div className="ocm-receipt-tray no-scrollbar">
            <article className={`ocm-receipt ${receiptPrinted ? 'printed' : ''}`} aria-label="Order confirmation receipt">
              <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] text-[32px] font-extrabold tracking-[0.16em] text-emerald-600/[0.07] whitespace-nowrap"
              >
                CONFIRMED
              </div>

              <header className="relative text-center mb-2.5">
                <div className="font-sans text-[15px] font-bold tracking-tight text-neutral-900">
                  APNA MART
                </div>
                <div className="text-[10.5px] font-semibold text-neutral-700 mt-0.5 break-words">
                  {order.storeName || 'Apna Mart Supermart'}
                </div>
                <div className="text-[9.5px] tracking-[0.18em] text-neutral-500 mt-1">
                  ORDER CONFIRMATION SLIP
                </div>
              </header>

              <hr className="border-0 border-t border-dashed border-neutral-300 my-2.5" />

              <div className={`ocm-section ${visibleSections >= 1 ? 'visible' : ''}`}>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-500 shrink-0">Order ID</span>
                  <span className="text-right font-bold text-neutral-900 break-all">{order.id}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-500 shrink-0">Date</span>
                  <span className="text-right text-neutral-900">{formatDate(order.placedAt || order.createdAt)}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-500 shrink-0">Customer</span>
                  <span className="text-right text-neutral-900 break-words">{order.customerName || 'Customer'}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-500 shrink-0">Deliver to</span>
                  <span className="text-right text-neutral-900 break-words">{fullAddress || '-'}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-500 shrink-0">ETA</span>
                  <span className="text-right text-neutral-900">{expected}</span>
                </div>
              </div>

              <hr className="border-0 border-t border-dashed border-neutral-300 my-2.5" />

              <div className={`ocm-section ${visibleSections >= 2 ? 'visible' : ''}`}>
                <div className="flex justify-between text-[9.5px] font-bold tracking-wider text-neutral-500 mb-1.5">
                  <span>ITEM</span>
                  <span>AMOUNT</span>
                </div>
                {items.length === 0 ? (
                  <div className="flex justify-between gap-2.5 mb-1">
                    <span className="text-neutral-700">Order items</span>
                    <span className="text-right">{formatMoney(subtotal)}</span>
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const qty = item.quantity ?? 1;
                    const lineTotal = item.totalPrice ?? (item.price || 0) * qty;
                    return (
                      <div key={item.productId || idx} className="flex justify-between gap-2.5 mb-1">
                        <span className="text-neutral-900 break-words">
                          {qty} x {item.name}
                        </span>
                        <span className="text-right shrink-0 text-neutral-900">{formatMoney(lineTotal)}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <hr className="border-0 border-t border-dashed border-neutral-300 my-2.5" />

              <div className={`ocm-section ${visibleSections >= 3 ? 'visible' : ''}`}>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-right text-neutral-900">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-500">Delivery</span>
                  <span className="text-right text-neutral-900">
                    {deliveryFee === 0 ? 'FREE' : formatMoney(deliveryFee)}
                  </span>
                </div>
                <hr className="border-0 border-t border-neutral-800 my-1.5" />
                <div className="flex justify-between gap-2.5 text-[13.5px] font-extrabold text-neutral-900 mt-1">
                  <span>TOTAL</span>
                  <span>{formatMoney(totalAmount)}</span>
                </div>
              </div>

              <hr className="border-0 border-t border-dashed border-neutral-300 my-2.5" />

              <div className={`ocm-section ${visibleSections >= 4 ? 'visible' : ''}`}>
                <div className="flex justify-between gap-2.5 mb-1">
                  <span className="text-neutral-500">Payment</span>
                  <span className="text-right text-neutral-900">{formatPayment(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between items-center gap-2.5 mb-1">
                  <span className="text-neutral-500">Status</span>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px] tracking-wider">
                    CONFIRMED
                  </span>
                </div>

                <div className="mt-2.5 mb-1 flex flex-col items-center gap-1">
                  <svg
                    width={Math.min(barcode.width, 180)}
                    height="24"
                    viewBox={`0 0 ${barcode.width} 24`}
                    aria-hidden="true"
                  >
                    {barcode.bars.map((bar, i) => (
                      <rect key={i} x={bar.x} y="0" width={bar.w} height="24" fill="#171717" />
                    ))}
                  </svg>
                  <span className="text-[9.5px] tracking-wider text-neutral-600">{order.id}</span>
                </div>

                <div className="text-center text-[10px] text-neutral-500 mt-1">
                  Thank you for shopping with Apna Mart.
                </div>
              </div>
            </article>
          </div>

          <button
            type="button"
            disabled={stage === 'printing'}
            onClick={handleAction}
            className="mt-3.5 w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-55 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {stage === 'cash'
              ? 'Print receipt'
              : stage === 'printing'
              ? 'Printing receipt…'
              : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
}
