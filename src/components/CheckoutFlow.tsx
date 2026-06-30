import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, MapPin, Check, Truck, ShieldCheck, Lock, Gift, Star } from "lucide-react";
import { Jewel, CartItem, Order, Coupon, getPrimaryImage } from "../types";

interface CheckoutFlowProps {
  checkoutItems: { jewel: Jewel; quantity: number }[];
  onBackToShop: () => void;
  onCheckoutSuccess: (order: Order) => void;
  couponApplied: Coupon | null;
  onApplyCoupon: (code: string) => Promise<boolean>;
  onClearCart: () => void;
}

export default function CheckoutFlow({
  checkoutItems,
  onBackToShop,
  onCheckoutSuccess,
  couponApplied,
  onApplyCoupon,
  onClearCart
}: CheckoutFlowProps) {
  // Stepper state
  // "address" -> order form active
  // "booked" -> success show
  const [step, setStep] = useState<"address" | "booked">("address");

  // Form Inputs
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [houseAddress, setHouseAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");

  // Error messages & lookup state
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  // Local Coupons inside Checkout Panel too
  const [localCoupon, setLocalCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(couponApplied);

  useEffect(() => {
    if (couponApplied) {
      setActiveCoupon(couponApplied);
    }
  }, [couponApplied]);

  // Simulated professional Indian dynamic pincode lookup
  useEffect(() => {
    if (pincode.length === 6) {
      setIsPincodeLoading(true);
      setFormError("");
      
      // Lookups simulation for top Indian pin-codes
      setTimeout(() => {
        let detectedCity = "";
        let detectedState = "";

        if (pincode.startsWith("11")) {
          detectedCity = "New Delhi";
          detectedState = "Delhi";
        } else if (pincode.startsWith("226")) {
          detectedCity = "Lucknow";
          detectedState = "Uttar Pradesh";
        } else if (pincode.startsWith("400")) {
          detectedCity = "Mumbai";
          detectedState = "Maharashtra";
        } else if (pincode.startsWith("560")) {
          detectedCity = "Bengaluru";
          detectedState = "Karnataka";
        } else if (pincode.startsWith("700")) {
          detectedCity = "Kolkata";
          detectedState = "West Bengal";
        } else if (pincode.startsWith("600")) {
          detectedCity = "Chennai";
          detectedState = "Tamil Nadu";
        } else if (pincode.startsWith("500")) {
          detectedCity = "Hyderabad";
          detectedState = "Telangana";
        } else if (pincode.startsWith("302")) {
          detectedCity = "Jaipur";
          detectedState = "Rajasthan";
        } else if (pincode.startsWith("380")) {
          detectedCity = "Ahmedabad";
          detectedState = "Gujarat";
        } else {
          // General generic match based on first digit for realistic simulation
          const firstDigit = pincode[0];
          switch (firstDigit) {
            case "1":
              detectedCity = "Gurugram";
              detectedState = "Haryana";
              break;
            case "2":
              detectedCity = "Varanasi";
              detectedState = "Uttar Pradesh";
              break;
            case "3":
              detectedCity = "Udaipur";
              detectedState = "Rajasthan";
              break;
            case "4":
              detectedCity = "Pune";
              detectedState = "Maharashtra";
              break;
            case "5":
              detectedCity = "Vijayawada";
              detectedState = "Andhra Pradesh";
              break;
            case "6":
              detectedCity = "Kochi";
              detectedState = "Kerala";
              break;
            case "7":
              detectedCity = "Guwahati";
              detectedState = "Assam";
              break;
            case "8":
              detectedCity = "Patna";
              detectedState = "Bihar";
              break;
            default:
              detectedCity = "Indore";
              detectedState = "Madhya Pradesh";
          }
        }

        setCity(detectedCity);
        setStateName(detectedState);
        setIsPincodeLoading(false);
      }, 600);
    }
  }, [pincode]);

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-5 animate-fadeIn">
        <div className="text-3xl text-gold-mid">⚜</div>
        <h3 className="font-serif text-lg font-bold text-neutral-800">Your Checkout Basket is Empty</h3>
        <p className="text-xs text-neutral-500 font-light leading-relaxed">
          Dearest patron, you have not configured any item for the checkout flow. Kindly select from our bespoke collection of gold vermeil and royal rings.
        </p>
        <button
          onClick={onBackToShop}
          className="px-6 py-2.5 bg-maroon-mid hover:bg-neutral-900 text-white rounded font-bold text-[10px] uppercase tracking-widest border border-[#D4AF37]/20 transition-all font-mono"
        >
          Return to Atelier Catalogue
        </button>
      </div>
    );
  }

  // Calculate pricing
  const subtotal = checkoutItems.reduce((acc, c) => {
    const activePrice = c.jewel.isFlashSale && c.jewel.flashSalePrice ? c.jewel.flashSalePrice : c.jewel.price;
    return acc + (activePrice * c.quantity);
  }, 0);

  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === "percentage") {
      discountAmount = Math.round(subtotal * (activeCoupon.value / 100));
    } else {
      discountAmount = activeCoupon.value;
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Verification of manual coupon inside Checkout View
  const handleVerifyCheckoutCoupon = async () => {
    setCouponError("");
    setCouponSuccessMsg("");
    if (!localCoupon.trim()) return;

    try {
      const response = await fetch("/api/coupons/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: localCoupon.toUpperCase(), amount: subtotal })
      });
      const data = await response.json();
      if (response.ok && data) {
        setActiveCoupon(data);
        setCouponSuccessMsg(`Saved Extra ₹${data.discountType === "percentage" ? `${data.value}%` : `₹${data.value}`}!`);
      } else {
        setCouponError(data.error || "Promo verification failed.");
      }
    } catch (e) {
      setCouponError("Could not verify promo code.");
    }
  };

  // Submit Order Booking Action
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Name validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      setFormError("कृपया अपना पूरा नाम दर्ज करें (कम से कम 3 अक्षर)।");
      return;
    }

    // 10 digit Indian Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      setFormError("कृपया मान्य 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें (शुरुआत 6-9 से होनी चाहिए)।");
      return;
    }

    // Pincode check
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      setFormError("कृपया मान्य 6-अंकों का एरिया पिनकोड दर्ज करें।");
      return;
    }

    if (!city || !stateName) {
      setFormError("कृपया शहर और राज्य का नाम भरें।");
      return;
    }

    if (!houseAddress.trim() || houseAddress.trim().length < 8) {
      setFormError("कृपया अपना पूरा मकान नंबर, गली/सोसायटी का नाम दर्ज करें (कम से कम 8 अक्षर)।");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Log order to database backend so that it registers in portal tracking and Admin ledger
      const orderPayload = {
        customerName: fullName.trim(),
        customerEmail: `${mobileNumber}@maisondaurelia.in`, // Simulate pseudo email based on phone for simple checkout
        customerPhone: mobileNumber,
        items: checkoutItems.map(c => {
          const activePrice = c.jewel.isFlashSale && c.jewel.flashSalePrice ? c.jewel.flashSalePrice : c.jewel.price;
          return {
            jewelId: c.jewel.id,
            name: c.jewel.name,
            price: activePrice,
            quantity: c.quantity
          };
        }),
        total: finalTotal,
        discountApplied: discountAmount,
        whatsappNotifications: true,
        pincode: pincode.trim(),
        city: city.trim(),
        state: stateName.trim(),
        houseAddress: houseAddress.trim(),
        landmark: landmark.trim(),
        notes: `House Address: ${houseAddress.trim()}, Landmark: ${landmark.trim()}, Pincode: ${pincode}, City: ${city}, State: ${stateName}. ${checkoutNotes}`.trim()
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      
      if (response.ok && data && data.success) {
        // Clear global cart after successful purchase mapping
        onClearCart();

        // 2. Build structured WhatsApp booking message link
        const whatsappNumber = "918445912476"; // Maison corporate dispatch helpline
        
        let itemsStringHeader = "";
        checkoutItems.forEach((c, idx) => {
          const activePrice = c.jewel.isFlashSale && c.jewel.flashSalePrice ? c.jewel.flashSalePrice : c.jewel.price;
          itemsStringHeader += `${idx + 1}. *${c.jewel.name}* [${c.jewel.sku}]\n   मात्रा (Quantity): ${c.quantity} | मूल्य: ₹${(activePrice * c.quantity).toLocaleString()}\n`;
        });

        const invoiceIdStr = data.order?.id || `M-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

        const message = `नमस्ते Maison d'Aurelia, मैंने वेबसाइट से एक नया ऑर्डर बुक किया है:

*ऑर्डर संदर्भ संख्या (Order ID):* ${invoiceIdStr}
-----------------------------------------
*आभूषण उत्पाद (Items Requested):*
${itemsStringHeader}
-----------------------------------------
*मूल्य सारांश (Bill Summary):*
- उप-कुल मूल्य (Subtotal): ₹${subtotal.toLocaleString()}
${discountAmount > 0 ? `- कूपन छूट (Discount): -₹${discountAmount.toLocaleString()}\n` : ""}- शिपिंग शुल्क (Shipping): मुफ्त (FREE)
- *कुल फाइनल प्राइस (Total Amount): ₹${finalTotal.toLocaleString()}*

*वितरित करने का पता (Delivery Address):*
- *नाम (Name):* ${fullName.trim()}
- *मोबाइल नंबर (Phone):* ${mobileNumber}
- *घर और सड़क का पता:* ${houseAddress.trim()}
- *लैंडमार्क (Landmark):* ${landmark.trim() ? landmark.trim() : "एन/ए"}
- *पिनकोड (Pincode):* ${pincode}
- *शहर (City):* ${city}
- *राज्य (State):* ${stateName}

*अतिरिक्त निर्देश:* ${checkoutNotes.trim() ? checkoutNotes.trim() : "कोई अतिरिक्त निर्देश नहीं"}
-----------------------------------------
कृपया यह आभूषण ऑर्डर स्वीकृत करें और अनुकूलन (Customization) व भुगतान से जुड़ी जानकारी प्रदान करें। धन्यवाद!`;

        const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        // Trigger step shift first
        setStep("booked");

        // Execute background checkout callback
        onCheckoutSuccess(data.order);

        // Open WhatsApp web connection
        window.open(waUrl, "_blank");
      } else {
        setFormError(data.error || "Acquisition registration failed in database.");
      }
    } catch (err) {
      console.error("Checkout database registration failed", err);
      setFormError("The Maison database experienced connection issues. Directing to WhatsApp instead is available.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#800020] selection:text-white">
      
      {/* Visual Stepper Tracker Bar */}
      <div className="bg-white border border-[#D4AF37]/20 rounded-xl p-4 sm:p-6 mb-8 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between relative">
          
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-200 -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-maroon-mid transition-all duration-500 -z-10" 
            style={{ width: step === "address" ? "50%" : "100%" }}
          />

          {/* Stepper 1 - Cart Bag */}
          <div className="flex flex-col items-center">
            <div className="h-9 w-9 rounded-full bg-maroon-mid text-white flex items-center justify-center font-bold text-xs ring-4 ring-[#FCFBF8]">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider font-semibold text-neutral-500 mt-2">
              Bag Cart
            </span>
          </div>

          {/* Stepper 2 - Delivery Address */}
          <div className="flex flex-col items-center">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-[#FCFBF8] transition-all duration-300 ${
              step === "address" 
                ? "bg-maroon-mid text-white ring-maroon-light/25 animate-pulse" 
                : "bg-maroon-mid text-white"
            }`}>
              {step === "booked" ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <span className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider mt-2 transition-all duration-300 ${
              step === "address" ? "font-bold text-maroon-mid" : "font-semibold text-neutral-500"
            }`}>
              Address & Details
            </span>
          </div>

          {/* Stepper 3 - Order Booked */}
          <div className="flex flex-col items-center">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-[#FCFBF8] transition-all duration-300 ${
              step === "booked" 
                ? "bg-[#25D366] text-white ring-[#25D366]/20" 
                : "bg-neutral-200 text-neutral-400"
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider mt-2 transition-all duration-300 ${
              step === "booked" ? "font-bold text-[#20ba5a]" : "font-semibold text-neutral-400"
            }`}>
              Order Booked
            </span>
          </div>

        </div>
      </div>

      {step === "address" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Address form */}
          <div className="lg:col-span-7 bg-white border border-gold-mid/15 p-6 rounded-xl shadow-sm space-y-6">
            
            {/* Header / Back Action */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="space-y-1">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-maroon-dark">
                  Delivery Address & Order Booking
                </h2>
                <p className="text-xs text-neutral-500 font-light font-sans">
                  Kindly specify correct coordination details for elite insured transport delivery.
                </p>
              </div>
              <button 
                onClick={onBackToShop}
                className="flex items-center gap-1.5 p-1.5 text-neutral-500 hover:text-maroon-mid hover:bg-neutral-50 transition-all rounded text-xs select-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-serif hidden sm:inline">Back</span>
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded flex items-start gap-2.5">
                <span className="text-rose-500 font-serif text-sm">✦</span>
                <p className="text-xs text-rose-700 font-medium leading-relaxed font-sans">{formError}</p>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              
              {/* Row 1: Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider font-semibold block">
                  Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Countess Georgina Sterling (or Rajesh Kumar)"
                  className="w-full border border-neutral-200 rounded-lg p-3 text-xs bg-white outline-none focus:border-maroon-mid focus:ring-1 focus:ring-maroon-mid/10 transition-all text-neutral-800"
                />
              </div>

              {/* Row 2: Mobile Number */}
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider font-semibold block">
                  10-Digit Mobile Number (मोबाइल नंबर) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    className="w-full border border-neutral-200 rounded-lg p-3 pl-12 text-xs bg-white outline-none focus:border-maroon-mid focus:ring-1 focus:ring-maroon-mid/10 transition-all font-mono tracking-wider text-neutral-800"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block font-light">
                  Order details and dispatch tracking links will be shared on this WhatsApp contact.
                </span>
              </div>

              {/* Row 3: Pincode lookup with City/State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider font-semibold block">
                    Pincode (पिनकोड) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="226010"
                      className="w-full border border-neutral-200 rounded-lg p-3 text-xs bg-white outline-none focus:border-maroon-mid focus:ring-1 focus:ring-maroon-mid/10 transition-all font-mono tracking-widest text-neutral-800"
                    />
                    {isPincodeLoading && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-maroon-mid border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider font-semibold block">
                    City (शहर) *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lucknow"
                    className="w-full border border-neutral-200 rounded-lg p-3 text-xs bg-neutral-50 outline-none focus:border-maroon-mid focus:ring-1 focus:ring-maroon-mid/10 transition-all text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider font-semibold block">
                    State (राज्य) *
                  </label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Uttar Pradesh"
                    className="w-full border border-neutral-200 rounded-lg p-3 text-xs bg-neutral-50 outline-none focus:border-maroon-mid focus:ring-1 focus:ring-maroon-mid/10 transition-all text-neutral-800"
                  />
                </div>

              </div>

              {/* Row 4: Full House Address */}
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider font-semibold block">
                  House No, Building, Road & Area Address (मकान एवं सड़क का पता) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={houseAddress}
                  onChange={(e) => setHouseAddress(e.target.value)}
                  placeholder="e.g. Suite 404, Awadh Royale Tower, Plot 12, Gomti Nagar"
                  className="w-full border border-neutral-200 rounded-lg p-3 text-xs bg-white outline-none focus:border-maroon-mid focus:ring-1 focus:ring-maroon-mid/10 transition-all text-neutral-800 resize-none"
                />
              </div>

              {/* Row 5: Landmark */}
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider block">
                  Nearby Landmark (प्रसिद्ध लैंडमार्क - optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Gomti Riverfront Park"
                  className="w-full border border-neutral-200 rounded-lg p-3 text-xs bg-white outline-none focus:border-maroon-mid focus:ring-1 focus:ring-maroon-mid/10 transition-all text-neutral-800"
                />
              </div>

              {/* Row 6: Additional Special Instructions */}
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider block">
                  Special Delivery Instructions / Ring Sizing (optional)
                </label>
                <textarea
                  rows={1}
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="e.g. Please bring extra sizing loop, or wrap as anniversary gift..."
                  className="w-full border border-neutral-200 rounded-lg p-3 text-xs bg-white outline-none focus:border-maroon-mid focus:ring-1 focus:ring-maroon-mid/10 transition-all text-neutral-800 resize-none"
                />
              </div>

              {/* Confirm Bottom Trigger - High-end Emerald Green Look or Luxury Theme */}
              <div className="pt-4 border-t border-neutral-100">
                <button
                  type="submit"
                  disabled={isSubmitting || isPincodeLoading}
                  className="w-full py-4.5 bg-[#075E54] hover:bg-[#128C7E] text-white font-extrabold text-xs sm:text-sm uppercase tracking-[0.16em] font-mono rounded-lg flex items-center justify-center gap-3 shadow-[0_4px_18px_rgba(7,94,84,0.3)] hover:shadow-[0_6px_26px_rgba(18,140,126,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 transform select-none"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {/* Brand beautiful WhatsApp SVG Icon */}
                      <svg className="w-5.5 h-5.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>CONFIRM & PLACE ORDER ON WHATSAPP</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: Order Summary Box */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-[#D4AF37]/25 p-5 rounded-xl shadow-sm space-y-4">
              
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <span className="font-serif text-sm font-bold text-neutral-800 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gold-mid" />
                  Order Summary ({checkoutItems.length} {checkoutItems.length === 1 ? "Jewel" : "Jewels"})
                </span>
                <span className="text-[10px] bg-gold-light text-gold-dark px-2.5 py-1 rounded font-mono font-semibold uppercase tracking-wider">
                  Bespoke Item
                </span>
              </div>

              {/* Items List scroll */}
              <div className="divide-y divide-neutral-100 max-h-[300px] overflow-y-auto pr-1 space-y-3.5">
                {checkoutItems.map(({ jewel, quantity }) => {
                  const activePrice = jewel.isFlashSale && jewel.flashSalePrice ? jewel.flashSalePrice : jewel.price;
                  return (
                    <div key={jewel.id} className="flex gap-3 pt-3 first:pt-0">
                      <div className="h-16 w-16 bg-neutral-50 rounded-md border border-neutral-100 overflow-hidden flex-shrink-0">
                        <img referrerPolicy="no-referrer" src={getPrimaryImage(jewel.image)} alt={jewel.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-1 truncate">
                        <div>
                          <h4 className="font-serif text-xs sm:text-sm font-bold text-neutral-800 leading-snug truncate" title={jewel.name}>
                            {jewel.name}
                          </h4>
                          <div className="flex gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                            <span>SKU: {jewel.sku}</span>
                            <span>•</span>
                            <span>Qty: {quantity}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-mono text-[10px] text-neutral-400">Unit: ₹{activePrice.toLocaleString()}</span>
                          <span className="font-serif font-bold text-maroon-mid text-xs">
                            ₹{(activePrice * quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon mechanics nested inside checkout */}
              <div className="border-t border-neutral-100 pt-4 space-y-2 mt-2">
                <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block font-semibold">
                  Maison Promocode
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localCoupon}
                    onChange={(e) => setLocalCoupon(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (e.g. ROYAL20)"
                    className="flex-grow bg-white border border-neutral-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-maroon-mid uppercase font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCheckoutCoupon}
                    className="px-4 py-2 bg-neutral-900 hover:bg-maroon-mid text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-rose-500 font-semibold font-mono">{couponError}</p>}
                {couponSuccessMsg && <p className="text-[10px] text-emerald-600 font-semibold font-mono">{couponSuccessMsg}</p>}
              </div>

              {/* Financial Subtotals summary */}
              <div className="border-t border-dotted border-neutral-200 pt-4 space-y-2 text-xs">
                
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal Value:</span>
                  <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                </div>

                {activeCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Off ({activeCoupon.code}):</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-500">
                  <span>Secure Insured Delivery:</span>
                  <span className="text-emerald-600 font-bold font-mono">FREE SHIPPING</span>
                </div>

                <div className="flex justify-between text-neutral-800 font-extrabold text-sm border-t border-neutral-100 pt-3 mt-1">
                  <span>Total Amount (कुल फाइनल प्राइस):</span>
                  <span className="font-serif text-maroon-dark text-base">₹{finalTotal.toLocaleString()}</span>
                </div>

              </div>

            </div>

            {/* Indian Trust Assurance block */}
            <div className="bg-gradient-to-r from-gold-light/25 to-gold-light/10 border border-gold-mid/10 p-4.5 rounded-xl text-left space-y-3">
              <span className="text-[10px] text-gold-dark font-mono font-semibold tracking-wider uppercase block">
                ✦ Maison India Assurances
              </span>
              <ul className="space-y-2 text-[11px] text-neutral-600 leading-normal font-light">
                <li className="flex gap-2 items-center">
                  <Truck className="w-3.5 h-3.5 text-gold-mid flex-shrink-0" />
                  <span><strong>मुफ्त शिपिंग (Free Delivery):</strong> No secret charges across India.</span>
                </li>
                <li className="flex gap-2 items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-mid flex-shrink-0" />
                  <span><strong>1892 Trust Heritage:</strong> Safe, armored transit box covered under insurance.</span>
                </li>
                <li className="flex gap-2 items-center">
                  <Lock className="w-3.5 h-3.5 text-gold-mid flex-shrink-0" />
                  <span><strong>UPI, Net-banking, Card payment:</strong> Settle payment easily after WhatsApp review.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      ) : (
        /* STEP 3 SUCCESS BOOKED STATE (Flipped on ordering) */
        <div className="max-w-2xl mx-auto bg-white border-2 border-[#25D366] p-8 sm:p-12 rounded-2xl text-center space-y-6 shadow-xl animate-fadeIn">
          
          <div className="h-16 w-16 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mx-auto ring-8 ring-[#25D366]/5 animate-bounce">
            <Check className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#20ba5a] font-mono uppercase tracking-widest font-extrabold block">
              Maison Order Transgress Complete
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-800">
              Order Registered Successfully!
            </h2>
            <h3 className="font-serif text-base text-maroon-mid">
              ऑर्डर की जानकारी WhatsApp पर भेज दी गई है
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed max-w-lg mx-auto">
            हमने आपके ऑर्डर और पते की जानकारी को सुरक्षित रूप से हमारे डेटाबेस में लिख लिया है तथा आपके लिए WhatsApp चैट खोल दी है। यदि वह खुद नहीं खुली है, तो नीचे दिए बटन पर क्लिक करके ऑर्डर कम्फर्म करें।
          </p>

          <div className="bg-slate-50 border border-neutral-100 rounded-xl p-5 text-left text-xs max-w-md mx-auto space-y-2.5">
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 font-medium font-mono uppercase">Patron Name:</span>
              <span className="font-bold text-neutral-800">{fullName}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 font-medium font-mono uppercase">Contact Mobile:</span>
              <span className="font-bold text-neutral-800 font-mono">+91 {mobileNumber}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 font-medium font-mono uppercase">House Address:</span>
              <span className="font-bold text-neutral-800 text-right truncate max-w-[240px]">{houseAddress}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-neutral-500 font-medium font-mono uppercase text-xs">Total Amount:</span>
              <span className="font-bold text-maroon-mid text-sm font-serif">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 max-w-md mx-auto justify-center">
            
            <button
              onClick={onBackToShop}
              className="flex-1 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all duration-300 transform"
            >
              Back to Catalog
            </button>

            <a
              href={`https://wa.me/918445912476?text=${encodeURIComponent(`नमस्ते Maison d'Aurelia, मैं अपने ऑर्डर का स्टेटस वेरिफाई करना चाहता हूँ। नाम: ${fullName}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-md transition-all duration-300 transform hover:scale-[1.02]"
            >
              <span>Verify on WhatsApp</span>
            </a>

          </div>

        </div>
      )}

    </div>
  );
}
