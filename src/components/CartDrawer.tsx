import React, { useState, useEffect } from "react";
import { X, Trash2, Plus, Minus, Tag, ShieldCheck, CreditCard, MessageSquare, Sparkles } from "lucide-react";
import { Jewel, CartItem, Coupon, getPrimaryImage } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  jewels: Jewel[];
  onUpdateQty: (jewelId: string, delta: number) => void;
  onRemoveItem: (jewelId: string) => void;
  onCheckoutSuccess: (order: any) => void;
  onStartCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  jewels,
  onUpdateQty,
  onRemoveItem,
  onCheckoutSuccess,
  onStartCheckout
}: CartDrawerProps) {
  // Coupon verification states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Customer Data collection
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customSizeOrEngraving, setCustomSizeOrEngraving] = useState("");
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [checkoutNotes, setCheckoutNotes] = useState("");
  
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart Abandonment tracking: if user enters email but closes/leaves, notify API
  useEffect(() => {
    return () => {
      // On unmount/close, if there are items and email entered but no order placed
      if (cart.length > 0 && customerEmail.trim().includes("@") && step === "checkout") {
        fetch("/api/customers/abandon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: customerEmail, name: customerName, phone: customerPhone })
        }).catch(e => console.warn("Cart abandonment log failed", e));
      }
    };
  }, [isOpen, cart, customerEmail, step, customerName, customerPhone]);

  if (!isOpen) return null;

  // Gather cart details with actual prices (checking for flash sales!)
  const cartDetails = cart.map(item => {
    const target = jewels.find(j => j.id === item.jewelId);
    if (!target) return null;
    const activePrice = target.isFlashSale && target.flashSalePrice ? target.flashSalePrice : target.price;
    return {
      jewel: target,
      quantity: item.quantity,
      price: activePrice,
      totalItemCost: activePrice * item.quantity
    };
  }).filter(Boolean) as { jewel: Jewel; quantity: number; price: number; totalItemCost: number }[];

  const subtotal = cartDetails.reduce((acc, c) => acc + c.totalItemCost, 0);

  // Apply Coupon mechanics
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = Math.round(subtotal * (appliedCoupon.value / 100));
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Verify Coupon with backend server
  const handleVerifyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode.trim()) return;

    try {
      const response = await fetch("/api/coupons/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount: subtotal })
      });
      const data = await response.json();
      if (response.ok && data) {
        setAppliedCoupon(data);
        setCouponSuccess(`Promocode Applied! saved ₹${data.discountType === "percentage" ? `${data.value}%` : `₹${data.value}`}`);
      } else {
        setCouponError(data.error || "Promo verification failed.");
      }
    } catch (err) {
      setCouponError("Could not verify promo code.");
    }
  };

  // Trigger Purchase order checkout
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName || !customerPhone) {
      alert("Kindly fill out all precious patron fields to register checkout.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          items: cartDetails.map(c => ({
            jewelId: c.jewel.id,
            name: c.jewel.name,
            price: c.price,
            quantity: c.quantity
          })),
          total: finalTotal,
          discountApplied: discountAmount,
          whatsappNotifications,
          notes: checkoutNotes,
          customSizeOrEngraving
        })
      });
      const data = await response.json();
      if (response.ok && data && data.success) {
        onCheckoutSuccess(data.order);
        setStep("cart");
        setAppliedCoupon(null);
        setCouponCode("");
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCustomSizeOrEngraving("");
        setCheckoutNotes("");
        onClose();
      } else {
        alert(data.error || "Acquisition processing failed.");
      }
    } catch (err) {
      console.error("Order failed", err);
      alert("Maison Vault server failed to process checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Background close overlay */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Main Drawer Shell */}
      <div className="bg-[#FCFBF8] border-l border-gold-mid/30 w-full max-w-md h-full flex flex-col shadow-2xl justify-between">
        
        {/* Header Block */}
        <div className="p-4.5 border-b border-gold-mid/15 bg-gold-light/45 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-maroon-mid text-[#F3EFE0] tracking-widest uppercase font-mono text-[9px] border border-gold-mid/30 rounded">
              Aurelia
            </span>
            <h3 className="font-serif text-base sm:text-lg font-bold text-maroon-dark tracking-wide">
              {step === "cart" ? "Your Jewels Bag" : "Patron Checkout Archives"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-maroon-mid bg-white rounded-full border border-gold-mid/10 hover:border-gold-mid/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Scroll */}
        <div className="flex-1 overflow-y-auto p-4.5 space-y-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-4">
              <span className="text-3xl text-gold-mid animate-pulse">⚜</span>
              <p className="font-serif text-base font-bold text-neutral-700">Maison Luxury Bag is Empty</p>
              <p className="text-xs text-neutral-400 font-light max-w-[240px]">
                Tour our vermeil gold catalog pieces and secure precious Burmese rubies and ivory beads.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-maroon-mid hover:bg-maroon-dark text-white rounded font-bold text-[10px] uppercase tracking-widest border border-maroon-mid transition-all duration-300"
              >
                Tour Collection
              </button>
            </div>
          ) : step === "cart" ? (
            /* ================= CART ITEMS VIEW ================= */
            <div className="space-y-4">
              {cartDetails.map(({ jewel, quantity, price, totalItemCost }) => (
                <div
                  key={jewel.id}
                  className="flex items-center gap-3.5 bg-white border border-gold-mid/10 hover:border-gold-mid/30 p-3 rounded shadow-sm relative transition-colors duration-200"
                >
                  <div className="h-16 w-16 bg-gold-light/40 rounded overflow-hidden flex-shrink-0 border border-gold-mid/10">
                    <img referrerPolicy="no-referrer" src={getPrimaryImage(jewel.image)} alt={jewel.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between h-14">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-neutral-800 leading-none truncate max-w-[200px]" title={jewel.name}>
                        {jewel.name}
                      </h4>
                      <span className="text-[10px] text-gold-dark font-mono mt-0.5 block">{jewel.sku}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-maroon-mid text-xs">
                        ₹{price.toLocaleString()}
                      </span>
                      {/* Quantity sliders */}
                      <div className="flex items-center gap-1 border border-neutral-200 rounded p-0.5 bg-[#FCFBF8]">
                        <button
                          onClick={() => onUpdateQty(jewel.id, -1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-500 hover:text-maroon-mid"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => onUpdateQty(jewel.id, 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-500 hover:text-maroon-mid"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(jewel.id)}
                    className="p-2 text-neutral-400 hover:text-[#800020] transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Coupon Area */}
              <div className="border-t border-gold-mid/15 pt-5 space-y-2.5">
                <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest block">Apply Promocode</span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gold-mid/60" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ROYAL20, GOLDEN10"
                      className="w-full bg-white border border-gold-mid/20 hover:border-gold-mid/40 rounded py-2 pl-9 pr-3 text-xs outline-none focus:border-maroon-mid transition-all font-mono uppercase"
                    />
                  </div>
                  <button
                    onClick={handleVerifyCoupon}
                    className="px-4 bg-[#1C1817] text-gold-mid hover:text-[#FCFBF8] rounded text-xs tracking-wider uppercase font-bold border border-gold-mid/20 hover:border-gold-mid/50 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-rose-500 font-mono tracking-wide">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-600 font-mono tracking-wide font-medium">{couponSuccess}</p>}
                
                {/* Suggestions code */}
                <div className="text-[9px] text-neutral-400 font-light flex items-center gap-1.5 font-sans pt-1">
                  <Sparkles className="w-3 h-3 text-gold-mid" />
                  <span>Try codes: <strong className="font-mono text-gold-dark font-semibold">ROYAL20</strong> (20% off high-end rings), <strong className="font-mono text-gold-dark font-semibold">GOLDEN10</strong> or <strong className="font-mono text-gold-dark font-semibold">MAISON500</strong></span>
                </div>
              </div>

              {/* Engagement details customization resizing */}
              <div className="border-t border-gold-mid/10 pt-4">
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">
                  Anniversary Custom Engraving / Ring Sizing
                </label>
                <textarea
                  value={customSizeOrEngraving}
                  onChange={(e) => setCustomSizeOrEngraving(e.target.value)}
                  placeholder="e.g., Resize Ring to Size 7. Engrave inside band: 'Forever Yours A.D. 2026'"
                  rows={2}
                  className="w-full bg-white border border-gold-mid/20 rounded p-2 text-xs outline-none focus:border-maroon-mid transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            /* ================= CHECKOUT CONTACT VIEW ================= */
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 animate-slideIn">
              <div className="bg-gold-light/20 border border-gold-mid/20 p-3.5 rounded text-xs text-neutral-600 space-y-1.5 font-light leading-relaxed">
                <p className="font-bold text-maroon-dark font-serif text-sm">Secure Vault Order Ingress</p>
                <p>Maison requires client identity cards and tracking options to coordinate dispatch under high security protection.</p>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Patron Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Countess Georgina Sterling"
                  className="w-full border border-gold-mid/20 rounded p-2.5 text-xs bg-white outline-none focus:border-maroon-mid"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Vault Contact Email *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="georgina@sterlingmanor.co"
                  className="w-full border border-gold-mid/20 rounded p-2.5 text-xs bg-white outline-none focus:border-maroon-mid"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Dispatch Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 202 555 0143"
                  className="w-full border border-gold-mid/20 rounded p-2.5 text-xs bg-white outline-none focus:border-maroon-mid font-mono"
                />
              </div>

              <div className="flex items-center gap-2.5 bg-gold-light/40 border border-gold-mid/10 p-3 rounded">
                <input
                  type="checkbox"
                  id="notifs-wa"
                  checked={whatsappNotifications}
                  onChange={(e) => setWhatsappNotifications(e.target.checked)}
                  className="w-4.5 h-4.5 accent-maroon-mid text-gold-mid cursor-pointer"
                />
                <label htmlFor="notifs-wa" className="text-[11px] text-neutral-700 font-semibold cursor-pointer select-none">
                  Activate WhatsApp Dispatch Notifications
                  <span className="block text-[9px] text-neutral-500 font-normal">Real-time status tracking ping directly to your phone.</span>
                </label>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Secret Delivery Instruction Notes</label>
                <textarea
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Gate passcode, secret handoff instructions, or direct courier delivery alerts..."
                  rows={2}
                  className="w-full border border-gold-mid/20 rounded p-2.5 text-xs bg-white outline-none focus:border-maroon-mid resize-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Dynamic Billing Footer Section */}
        {cart.length > 0 && (
          <div className="p-4.5 pb-24 md:pb-28 lg:pb-4.5 border-t border-gold-mid/15 bg-white space-y-4 shadow-top">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal:</span>
                <span className="font-mono">₹{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Maison Promo Deduct:</span>
                  <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              {customSizeOrEngraving && (
                <div className="flex justify-between text-gold-dark font-medium text-[10px] font-mono">
                  <span>CUSTOM SPEC ENGRAVING:</span>
                  <span>ACTIVE FEE: COMPLIMENTARY</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-800 font-extrabold text-sm border-t border-gold-mid/10 pt-2.5 pb-1">
                <span>Total Acquisition:</span>
                <span className="font-serif text-maroon-dark text-base">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Stepper Buttons layout */}
            <div className="flex gap-2.5">
              <button
                id="cart-drawer-checkout-btn"
                onClick={() => {
                  onStartCheckout();
                  onClose();
                }}
                className="w-full py-4 bg-[#800020] hover:bg-[#600018] text-white font-bold text-xs uppercase tracking-widest rounded-[4px] flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-97 shadow-[0_4px_12px_rgba(128,0,32,0.15)] hover:shadow-[0_6px_20px_rgba(128,0,32,0.30)] select-none cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-[#F3EFE0] flex-shrink-0" />
                <span>Check out</span>
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 text-center font-sans flex items-center justify-center gap-1 select-none">
              <span>🔒</span>
              <span className="font-medium tracking-wide">100% Safe & Secure Checkout</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
