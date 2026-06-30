import React, { useState, useEffect } from "react";
import { Copy, Gift, QrCode, Search, Sparkles, Star, User, Heart, Truck, Undo2, LogIn, Key, Mail, Gem, ClipboardCheck, Package, Bike, PackageCheck, Check } from "lucide-react";
import { Jewel, Order, ReturnRequest } from "../types";

// Helper to calculate expected delivery date (4 days after order date)
const getExpectedDeliveryDate = (orderDateStr: string) => {
  try {
    const d = new Date(orderDateStr);
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + 4);
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
  } catch (e) {}
  return "June 28, 2026";
};

interface CustomerPortalProps {
  loggedInUser: { name: string; email: string } | null;
  onLogin: (name: string, email: string) => void;
  onLogout: () => void;
  wishlist: Jewel[];
  onRemoveWishlist: (j: Jewel) => void;
  onAddToCart: (j: Jewel) => void;
  orders: Order[];
  onTriggerReturn: (orderId: string, jewelName: string, reason: string) => void;
  returnsList: ReturnRequest[];
  currentAppUrl: string;
}

export default function CustomerPortal({
  loggedInUser,
  onLogin,
  onLogout,
  wishlist,
  onRemoveWishlist,
  onAddToCart,
  orders,
  onTriggerReturn,
  returnsList,
  currentAppUrl
}: CustomerPortalProps) {
  // Login simulator states
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  // Search filter for past order items tracking code
  const [trackingSearch, setTrackingSearch] = useState("");
  // committed tracking search query
  const [committedSearch, setCommittedSearch] = useState("");

  // Return form trigger states
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [returnJewelName, setReturnJewelName] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  // Referral copy state
  const [copied, setCopied] = useState(false);

  // Generate simulated luxury gold OTP
  const sendSimulatedOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    // Aesthetic simulated OTP code prefix
    const code = `AUR-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpError("");
    console.log(`[Maison OTP Code Debugger]: Send code ${code} to ${emailInput}`);
  };

  const verifySimulatedOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.toUpperCase() === generatedOtp) {
      // Extract client name or preset to Countess/Sir based on email
      let presetName = nameInput.trim();
      if (!presetName) {
        if (emailInput.toLowerCase().includes("reginald")) presetName = "Sir Reginald Vance";
        else if (emailInput.toLowerCase().includes("charlotte")) presetName = "Charlotte de Bourgogne";
        else if (emailInput.toLowerCase().includes("georgina")) presetName = "Lady Georgina Sterling";
        else presetName = "Honorable Patron";
      }
      onLogin(presetName, emailInput);
      setOtpSent(false);
      setOtpInput("");
      setGeneratedOtp("");
    } else {
      setOtpError("Incorrect OTP cipher. Kindly review your securely generated keys.");
    }
  };

  // Sync loyalty level coordinates based on purchase stats
  const clientOrders = orders.filter(o => o.customerEmail.toLowerCase() === (loggedInUser?.email.toLowerCase() || ""));
  const totalSpentInMaison = clientOrders.reduce((acc, o) => acc + o.total, 0);
  const clientPoints = Math.round(totalSpentInMaison * 1.5) || 500; // Base signin bonus

  const prestigeBadge = 
    clientPoints > 8000 ? "VVIP Elite Club" :
    clientPoints > 3000 ? "Elite Club" : 
    clientPoints > 1000 ? "Gold Member" : "Silver Member";

  // Referral Link
  const refLink = `${currentAppUrl || "https://ais-dev.run.app"}?ref=AUR-${loggedInUser?.name.split(" ")[0].toUpperCase() || "MAISON"}`;

  const copyRefLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Submit Returns handler
  const handleReturnRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !returnJewelName || !returnReason) {
      alert("Please configure order specifications for return requests.");
      return;
    }
    onTriggerReturn(selectedOrderId, returnJewelName, returnReason);
    setReturnSuccess(`Exchange demand for '${returnJewelName}' logged. Ref: RET-PENDING`);
    setSelectedOrderId("");
    setReturnJewelName("");
    setReturnReason("");
  };

  // Tracking milestone indicator coordinates
  const getStatusPercent = (status: string) => {
    if (status === "Received") return 15;
    if (status === "Crafting") return 40;
    if (status === "Quality Check") return 65;
    if (status === "Shipped") return 85;
    if (status === "Delivered") return 100;
    return 10;
  };

  return (
    <div id="customer-portal-root" className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
      
      {/* 1. NOT LOGGED IN STATE: AUTHENTICATION CHAMBERS */}
      {!loggedInUser ? (
        <div className="max-w-md mx-auto bg-white border border-gold-mid/30 rounded-lg p-6 sm:p-8 shadow-xl relative mt-4">
          <div className="text-center space-y-2 mb-8">
            <Gem className="w-8 h-8 text-gold-mid mx-auto animate-pulse" />
            <h2 className="font-serif text-2xl font-bold text-maroon-mid">Secure Entrance Chambers</h2>
            <p className="text-xs text-neutral-500 font-light">
              Maison d'Aurelia verification checks. Authenticate with OTP codes to access purchase logs, custom-sized rings, and elite loyalty benefits.
            </p>
          </div>

          {!otpSent ? (
            /* Email Request Form code */
            <form onSubmit={sendSimulatedOtp} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Patron Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Charlotte de Bourgogne (Optional)"
                  className="w-full border border-gold-mid/25 rounded p-2.5 outline-none focus:border-maroon-mid bg-gold-light/10"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Secure Contact Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gold-mid/50" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="patron@example.com"
                    className="w-full border border-gold-mid/25 rounded py-2.5 pl-10 pr-3 outline-none focus:border-maroon-mid"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-maroon-mid hover:bg-maroon-dark text-[#FCFBF8] border border-maroon-mid font-bold uppercase tracking-widest text-[10px] rounded transition-all duration-300"
              >
                Dispatch Security OTP PIN
              </button>
            </form>
          ) : (
            /* OTP Input verification code */
            <form onSubmit={verifySimulatedOtp} className="space-y-4 text-xs">
              <div className="bg-[#F7F4EB] border border-gold-mid/30 p-4 rounded text-center space-y-1">
                <span className="text-[10px] text-gold-dark font-mono uppercase tracking-widest block">Simulated VIP OTP Transmitter</span>
                <p className="text-xs text-neutral-800 font-bold font-mono tracking-widest bg-white py-1.5 px-3 inline-block rounded select-all border border-dashed border-gold-mid select-all">
                  {generatedOtp}
                </p>
                <span className="block text-[8px] text-neutral-400 mt-1">Copy and apply the security key below.</span>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Apply Security OTP Code *</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gold-mid/50" />
                  <input
                    type="text"
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Paste cipher (e.g. AUR-XXXX)"
                    className="w-full border border-gold-mid/25 rounded py-2.5 pl-10 pr-3 outline-none focus:border-maroon-mid font-mono uppercase tracking-widest"
                  />
                </div>
              </div>

              {otpError && <p className="text-[10px] text-rose-500 font-mono tracking-wide">{otpError}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="px-4 border border-gold-mid/30 text-neutral-600 rounded text-[10px] uppercase tracking-widest"
                >
                  Edit
                </button>
                <button
                  type="submit"
                  className="flex-grow py-3 bg-gold-mid hover:bg-gold-light text-neutral-900 font-extrabold uppercase tracking-widest text-[10px] rounded transition-colors"
                >
                  Verify & Enter Heirlooms Ledger
                </button>
              </div>
            </form>
          )}

          {/* Quick login guidelines helper */}
          <div className="mt-8 border-t border-gold-mid/10 pt-4 text-center">
            <span className="text-[9px] text-[#A52A2A] font-mono tracking-widest uppercase">
              • INTEGRITY PROTECTION PROTOCOL PROVEN •
            </span>
          </div>
        </div>
      ) : (
        
        /* 2. LOGGED IN STATE: PREMIUM INTEGRATED VAULT PORTAL */
        <div className="space-y-12 animate-fadeIn">
          {/* Dashboard Header Profile badge */}
          <div className="bg-[#1C1817] border border-gold-mid/30 rounded-lg p-6 sm:p-8 text-[#FCFBF8] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 font-serif text-9xl text-gold-mid select-none pointer-events-none transform translate-x-12 translate-y-6">
              ⚜
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="h-16 w-16 rounded-full border-2 border-gold-mid/60 bg-gold-light/10 flex items-center justify-center relative flex-shrink-0">
                <User className="w-8 h-8 text-gold-mid" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">{loggedInUser.name}</h2>
                  <span className="bg-gold-mid/20 border border-gold-mid text-gold-mid text-[9px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider font-mono">
                    {prestigeBadge}
                  </span>
                </div>
                
                {/* Clean user details: Phone and Email */}
                <div className="space-y-1 text-xs text-neutral-300">
                  <p className="flex items-center gap-1.5 font-sans">
                    <span className="text-gold-mid text-xs">📞</span> 
                    <span className="font-medium text-neutral-400">Mobile:</span> 
                    <span className="font-mono tracking-wide text-neutral-200">+91 98765 43210</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-sans">
                    <span className="text-gold-mid text-xs">✉</span> 
                    <span className="font-medium text-neutral-400">Email:</span> 
                    <span className="text-neutral-200">{loggedInUser.email}</span>
                  </p>
                </div>

                {/* Better Sign Out button as clean text link / small secondary button near details */}
                <div className="pt-1">
                  <button
                    onClick={onLogout}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-neutral-300 hover:text-white rounded text-[10px] font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Loyalty points stats panel */}
            <div className="flex flex-wrap gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-gold-mid/25 pt-5 md:pt-0 md:pl-8 text-xs">
              <div className="space-y-1 min-w-[120px]">
                <span className="text-neutral-200 block font-sans text-[11px] tracking-wider uppercase font-semibold">Aurelia Loyalty Points</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-gold-mid">{clientPoints.toLocaleString()} <span className="text-xs font-mono">pts</span></span>
              </div>
              <div className="space-y-1 min-w-[120px]">
                <span className="text-neutral-200 block font-sans text-[11px] tracking-wider uppercase font-semibold">Total Orders</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-gold-mid">{clientOrders.length}</span>
              </div>
            </div>
          </div>

          {/* Grid section with: Left (Tracking + returns), Right (Wishlist + Referral) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2 COLS: ORDER TRACKING ARCHIVES & TIMELINE CHECKS */}
            <div className="lg:col-span-2 space-y-8">
              
              <div className="bg-[#FCFBF8] border border-gold-mid/20 rounded-lg p-5 sm:p-7 shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gold-mid/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-maroon-mid" />
                    <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wide">
                      Track Your Order
                    </h3>
                  </div>
                  {/* Internal filter code */}
                  <div className="flex flex-col w-full max-w-xs sm:max-w-sm">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setCommittedSearch(trackingSearch);
                      }}
                      className="flex items-center w-full"
                    >
                      <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gold-mid/50" />
                        <input
                          type="text"
                          value={trackingSearch}
                          onChange={(e) => {
                            setTrackingSearch(e.target.value);
                            if (!e.target.value) {
                              setCommittedSearch("");
                            }
                          }}
                          placeholder="Enter Tracking Code or Order ID..."
                          className="w-full bg-white border border-[#800020] border-r-0 rounded-l py-1.5 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-[#800020] transition-all font-mono h-9"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-[#800020] hover:bg-[#600018] active:bg-[#4d0012] text-white font-sans font-bold text-xs px-4 rounded-r h-9 transition-colors flex items-center justify-center shrink-0 border border-[#800020] cursor-pointer"
                      >
                        Track
                      </button>
                    </form>
                    {/* Error Handling: neat, red error message underneath the box */}
                    {(() => {
                      const query = committedSearch.trim();
                      if (query) {
                        const hasMatches = orders.some(o => 
                          o.id.toLowerCase() === query.toLowerCase() || 
                          o.trackingCode.toLowerCase() === query.toLowerCase() ||
                          o.id.toLowerCase().includes(query.toLowerCase()) ||
                          o.trackingCode.toLowerCase().includes(query.toLowerCase())
                        );
                        if (!hasMatches) {
                          return (
                            <p className="text-red-600 text-[11px] mt-1.5 font-sans font-medium text-left">
                              Invalid Tracking ID or Order ID. Please check and try again.
                            </p>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {(() => {
                  const displayedOrders = (() => {
                    if (committedSearch.trim()) {
                      const query = committedSearch.trim().toLowerCase();
                      const globalMatches = orders.filter(o => 
                        o.id.toLowerCase() === query || 
                        o.trackingCode.toLowerCase() === query ||
                        o.id.toLowerCase().includes(query) ||
                        o.trackingCode.toLowerCase().includes(query)
                      );
                      if (globalMatches.length > 0) {
                        return globalMatches;
                      }
                    }
                    return clientOrders;
                  })();

                  if (displayedOrders.length === 0) {
                    return (
                      <div className="text-center p-10 text-neutral-400 font-light text-xs italic">
                        You have not registered any jewelry orders inside Maison d'Aurelia ledger yet. Cart additions and checkouts automatically record here.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {displayedOrders.map((order) => {
                        const score = getStatusPercent(order.status);
                        
                        return (
                          <div
                            key={order.id}
                            className="bg-white border border-gold-mid/10 p-5 rounded hover:shadow-md transition-all duration-300 relative space-y-4"
                          >
                            {/* Order general descriptors */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-2 border-b border-gold-mid/10 pb-4 text-xs">
                              <div className="space-y-1">
                                <span className="text-neutral-800 font-sans text-[11px] tracking-wider uppercase block font-semibold">Order ID</span>
                                <strong className="font-bold text-maroon-dark text-sm font-mono block">{order.id}</strong>
                                <span className="text-neutral-600 font-sans block text-[11px] mt-0.5 font-medium">Date Checked: {order.date}</span>
                                <span className="text-emerald-700 font-sans block text-[11px] mt-1 font-semibold">
                                  Expected Delivery: {getExpectedDeliveryDate(order.date)}
                                </span>
                              </div>
                              <div className="text-left sm:text-right space-y-1 w-full sm:w-auto">
                                <span className="text-neutral-800 font-sans text-[11px] tracking-wider uppercase block font-semibold">Tracking Number</span>
                                <code className="text-[11px] font-mono font-semibold text-gold-dark select-all block">{order.trackingCode}</code>
                                <div className="text-[10.5px] text-neutral-600 font-sans mt-1 block">
                                  <span className="font-medium">Courier: </span>
                                  <span className="font-semibold text-neutral-800">Delhivery</span>
                                  <span className="text-neutral-300 mx-1">|</span>
                                  <a 
                                    href={`https://www.delhivery.com/track/share?reid=${order.trackingCode}`}
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-maroon-mid hover:text-[#5c0017] underline font-medium"
                                  >
                                    Click to track on partner site
                                  </a>
                                </div>
                                <span className="text-neutral-600 font-sans block text-[11px] mt-1 font-medium">Sum: <strong className="text-maroon-mid font-bold font-sans text-xs">₹{order.total?.toLocaleString()}</strong></span>
                              </div>
                            </div>

                            {/* ITEM PILLS */}
                            <div className="pt-1">
                              <span className="text-[10px] sm:text-xs text-neutral-800 font-sans font-semibold uppercase tracking-wider block mb-3">Items in this Order</span>
                              <div className="flex flex-wrap gap-2.5">
                                {order.items.map((it, idx) => (
                                  <span key={idx} className="bg-gold-light/45 border border-gold-mid/15 text-neutral-700 text-[11px] py-1 px-2.5 rounded font-serif font-medium flex items-center gap-1.5">
                                    <span>{it.name}</span>
                                    <span className="text-neutral-700 font-sans font-semibold">x{it.quantity}</span>
                                  </span>
                                ))}
                              </div>
                              {order.customSizeOrEngraving && (
                                <p className="text-[10px] text-gold-dark bg-[#F7F4EB] border-l border-gold-mid px-2.5 py-1 font-mono italic mt-2.5 select-all">
                                  {order.customSizeOrEngraving}
                                </p>
                              )}
                            </div>

                            {/* NEW PREMIUM "TRACKING PROGRESS" TIMELINE */}
                            <div className="border-t border-gold-mid/10 pt-6 mt-4 space-y-6">
                              <div className="text-center">
                                <h4 className="text-base sm:text-lg font-serif font-black tracking-widest text-[#70001A] uppercase">TRACKING PROGRESS</h4>
                                <div className="flex items-center justify-center gap-4 my-2">
                                  <div className="h-[2px] bg-[#70001A] flex-grow max-w-[60px] sm:max-w-[100px]"></div>
                                  <span className="text-[#70001A] text-xs sm:text-sm font-serif tracking-widest uppercase font-semibold">Delivery Status</span>
                                  <div className="h-[2px] bg-[#70001A] flex-grow max-w-[60px] sm:max-w-[100px]"></div>
                                </div>
                                <div className="mt-2 flex justify-center">
                                  {/* Top Delivery Truck with Speed Lines SVG */}
                                  <svg 
                                    viewBox="0 0 24 24" 
                                    className="w-10 h-10 text-[#7A1F2B]" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="1.75" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    id="delivery-truck-speed"
                                  >
                                    {/* Speed lines */}
                                    <line x1="2" y1="8" x2="6" y2="8" />
                                    <line x1="1" y1="12" x2="7" y2="12" />
                                    <line x1="3" y1="16" x2="6" y2="16" />
                                    
                                    {/* Truck body */}
                                    <path d="M8 6h7a1 1 0 0 1 1 1v8h-8V7a1 1 0 0 1 1-1z" />
                                    <path d="M16 9h3.5a1 1 0 0 1 .8.4l2 2.6a1 1 0 0 1 .2.6V15h-6.5V9z" />
                                    
                                    {/* Wheels */}
                                    <circle cx="11" cy="17" r="1.5" />
                                    <circle cx="19" cy="17" r="1.5" />
                                  </svg>
                                </div>
                              </div>

                              <div className="relative w-full py-6 mt-2 px-1 sm:px-4">
                                {(() => {
                                  const seg1Done = ["Pending", "Received", "Crafting", "Packed", "Quality Check", "Shipped", "Delivered"].includes(order.status);
                                  const seg2Done = ["Crafting", "Packed", "Quality Check", "Shipped", "Delivered"].includes(order.status);
                                  const seg3Done = ["Quality Check", "Shipped", "Delivered"].includes(order.status);
                                  const seg4Done = ["Shipped", "Delivered"].includes(order.status);

                                  return (
                                    <>
                                      {/* Segment 1 (PLACED -> PACKED/SHIPPED) */}
                                      <div className={`absolute top-[43px] xs:top-[45px] sm:top-[58px] left-[9%] sm:left-[10%] w-[20.5%] sm:w-[20%] h-[3px] rounded-full z-0 transition-colors duration-500 ease-in-out ${seg1Done ? 'bg-[#7A1F2B]' : 'bg-[#E5E5E5]'}`}></div>

                                      {/* Segment 2 (PACKED/SHIPPED -> OUT FOR DELIVERY) */}
                                      <div className={`absolute top-[43px] xs:top-[45px] sm:top-[58px] left-[29.5%] sm:left-[30%] w-[20.5%] sm:w-[20%] h-[3px] rounded-full z-0 transition-colors duration-500 ease-in-out ${seg2Done ? 'bg-[#7A1F2B]' : 'bg-[#E5E5E5]'}`}></div>

                                      {/* Segment 3 (OUT FOR DELIVERY -> DELIVERED) */}
                                      <div className={`absolute top-[43px] xs:top-[45px] sm:top-[58px] left-[50%] w-[20.5%] sm:w-[20%] h-[3px] rounded-full z-0 transition-colors duration-500 ease-in-out ${seg3Done ? 'bg-[#7A1F2B]' : 'bg-[#E5E5E5]'}`}></div>

                                      {/* Segment 4 (DELIVERED -> ORDER DELIVERED) */}
                                      <div className={`absolute top-[43px] xs:top-[45px] sm:top-[58px] left-[70.5%] sm:left-[70%] w-[20.5%] sm:w-[20%] h-[3px] rounded-full z-0 transition-colors duration-500 ease-in-out ${seg4Done ? 'bg-[#7A1F2B]' : 'bg-[#E5E5E5]'}`}></div>

                                      {/* 5 Milestone Nodes */}
                                      <div className="relative flex justify-between items-start z-10 w-full">
                                        {/* Node 1: PLACED */}
                                        {(() => {
                                          const isDone = ["Pending", "Received", "Crafting", "Packed", "Quality Check", "Shipped", "Delivered"].includes(order.status);
                                          return (
                                            <div className="flex flex-col items-center w-[18%] sm:flex-1 relative min-w-0">
                                              <div className="relative z-10">
                                                <div className={`rounded-full p-0.5 sm:p-1 border sm:border-2 border-dashed transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-white' : 'border-neutral-200 bg-white'}`}>
                                                  <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border sm:border-2 border-solid transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-[#7A1F2B]/5 text-[#7A1F2B]' : 'border-neutral-200 bg-neutral-50 text-neutral-400'}`}>
                                                    <svg 
                                                      viewBox="0 0 24 24" 
                                                      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7 transition-colors duration-300" 
                                                      fill="none" 
                                                      stroke="currentColor" 
                                                      strokeWidth="1.75" 
                                                      strokeLinecap="round" 
                                                      strokeLinejoin="round"
                                                    >
                                                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                                      <rect x="8" y="2" width="8" height="4" rx="1" />
                                                      <path d="M9 14l2 2 4-4" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                {isDone && (
                                                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#7A1F2B] text-white rounded-full p-0.5 border border-white shadow-md flex items-center justify-center w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-5 sm:h-5 z-20">
                                                    <Check className="w-2 h-2 sm:w-3 sm:h-3 stroke-[3]" />
                                                  </div>
                                                )}
                                              </div>
                                              <span className={`mt-2 text-center text-[7.5px] xs:text-[8.5px] sm:text-[10px] md:text-[11px] font-sans font-extrabold tracking-tight sm:tracking-wider uppercase leading-tight max-w-[55px] xs:max-w-[70px] sm:max-w-[100px] ${isDone ? 'text-[#7A1F2B] font-bold' : 'text-neutral-400'}`}>
                                                PLACED
                                              </span>
                                            </div>
                                          );
                                        })()}

                                        {/* Node 2: PACKED / SHIPPED */}
                                        {(() => {
                                          const isDone = ["Crafting", "Packed", "Quality Check", "Shipped", "Delivered"].includes(order.status);
                                          return (
                                            <div className="flex flex-col items-center w-[18%] sm:flex-1 relative min-w-0">
                                              <div className="relative z-10">
                                                <div className={`rounded-full p-0.5 sm:p-1 border sm:border-2 border-dashed transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-white' : 'border-neutral-200 bg-white'}`}>
                                                  <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border sm:border-2 border-solid transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-[#7A1F2B]/5 text-[#7A1F2B]' : 'border-neutral-200 bg-neutral-50 text-neutral-400'}`}>
                                                    <svg 
                                                      viewBox="0 0 24 24" 
                                                      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7 transition-colors duration-300" 
                                                      fill="none" 
                                                      stroke="currentColor" 
                                                      strokeWidth="1.75" 
                                                      strokeLinecap="round" 
                                                      strokeLinejoin="round"
                                                    >
                                                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                      <line x1="12" y1="22.08" x2="12" y2="12" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                {isDone && (
                                                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#7A1F2B] text-white rounded-full p-0.5 border border-white shadow-md flex items-center justify-center w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-5 sm:h-5 z-20">
                                                    <Check className="w-2 h-2 sm:w-3 sm:h-3 stroke-[3]" />
                                                  </div>
                                                )}
                                              </div>
                                              <span className={`mt-2 text-center text-[7.5px] xs:text-[8.5px] sm:text-[10px] md:text-[11px] font-sans font-extrabold tracking-tight sm:tracking-wider uppercase leading-tight max-w-[55px] xs:max-w-[70px] sm:max-w-[100px] ${isDone ? 'text-[#7A1F2B] font-bold' : 'text-neutral-400'}`}>
                                                PACKED /<br className="sm:hidden" /> SHIPPED
                                              </span>
                                            </div>
                                          );
                                        })()}

                                        {/* Node 3: OUT FOR DELIVERY */}
                                        {(() => {
                                          const isDone = ["Quality Check", "Shipped", "Delivered"].includes(order.status);
                                          return (
                                            <div className="flex flex-col items-center w-[18%] sm:flex-1 relative min-w-0">
                                              <div className="relative z-10">
                                                <div className={`rounded-full p-0.5 sm:p-1 border sm:border-2 border-dashed transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-white' : 'border-neutral-200 bg-white'}`}>
                                                  <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border sm:border-2 border-solid transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-[#7A1F2B]/5 text-[#7A1F2B]' : 'border-neutral-200 bg-neutral-50 text-neutral-400'}`}>
                                                    <svg 
                                                      viewBox="0 0 24 24" 
                                                      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7 transition-colors duration-300" 
                                                      fill="none" 
                                                      stroke="currentColor" 
                                                      strokeWidth="1.75" 
                                                      strokeLinecap="round" 
                                                      strokeLinejoin="round"
                                                    >
                                                      <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                                                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                                      <circle cx="5.5" cy="18.5" r="2.5" />
                                                      <circle cx="18.5" cy="18.5" r="2.5" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                {isDone && (
                                                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#7A1F2B] text-white rounded-full p-0.5 border border-white shadow-md flex items-center justify-center w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-5 sm:h-5 z-20">
                                                    <Check className="w-2 h-2 sm:w-3 sm:h-3 stroke-[3]" />
                                                  </div>
                                                )}
                                              </div>
                                              <span className={`mt-2 text-center text-[7.5px] xs:text-[8.5px] sm:text-[10px] md:text-[11px] font-sans font-extrabold tracking-tight sm:tracking-wider uppercase leading-tight max-w-[55px] xs:max-w-[70px] sm:max-w-[100px] ${isDone ? 'text-[#7A1F2B] font-bold' : 'text-neutral-400'}`}>
                                                OUT FOR<br className="sm:hidden" /> DELIVERY
                                              </span>
                                            </div>
                                          );
                                        })()}

                                        {/* Node 4: DELIVERED */}
                                        {(() => {
                                          const isDone = ["Shipped", "Delivered"].includes(order.status);
                                          return (
                                            <div className="flex flex-col items-center w-[18%] sm:flex-1 relative min-w-0">
                                              <div className="relative z-10">
                                                <div className={`rounded-full p-0.5 sm:p-1 border sm:border-2 border-dashed transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-white' : 'border-neutral-200 bg-white'}`}>
                                                  <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border sm:border-2 border-solid transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-[#7A1F2B]/5 text-[#7A1F2B]' : 'border-neutral-200 bg-neutral-50 text-neutral-400'}`}>
                                                    {/* Beautiful Delivery Boy riding a Scooter Custom SVG Outline */}
                                                    <svg 
                                                      viewBox="0 0 24 24" 
                                                      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7 transition-colors duration-300" 
                                                      fill="none" 
                                                      stroke="currentColor" 
                                                      strokeWidth="1.75" 
                                                      strokeLinecap="round" 
                                                      strokeLinejoin="round"
                                                    >
                                                      {/* Wheels */}
                                                      <circle cx="6" cy="18" r="2" />
                                                      <circle cx="18" cy="18" r="2" />
                                                      {/* Scooter frame */}
                                                      <path d="M8 18h6" />
                                                      <path d="M18 18v-1c0-1-1-2-2-2h-3v3" />
                                                      <path d="M16 15l1-6M17 9h-2" />
                                                      {/* Delivery Box */}
                                                      <rect x="4" y="10" width="4" height="6" rx="1" />
                                                      {/* Rider head/helmet */}
                                                      <circle cx="12" cy="8.5" r="1.5" />
                                                      {/* Rider body */}
                                                      <path d="M10 13c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                {isDone && (
                                                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#7A1F2B] text-white rounded-full p-0.5 border border-white shadow-md flex items-center justify-center w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-5 sm:h-5 z-20">
                                                    <Check className="w-2 h-2 sm:w-3 sm:h-3 stroke-[3]" />
                                                  </div>
                                                )}
                                              </div>
                                              <span className={`mt-2 text-center text-[7.5px] xs:text-[8.5px] sm:text-[10px] md:text-[11px] font-sans font-extrabold tracking-tight sm:tracking-wider uppercase leading-tight max-w-[55px] xs:max-w-[70px] sm:max-w-[100px] ${isDone ? 'text-[#7A1F2B] font-bold' : 'text-neutral-400'}`}>
                                                DELIVERED
                                              </span>
                                            </div>
                                          );
                                        })()}

                                        {/* Node 5: ORDER DELIVERED */}
                                        {(() => {
                                          const isDone = ["Delivered"].includes(order.status);
                                          return (
                                            <div className="flex flex-col items-center w-[18%] sm:flex-1 relative min-w-0">
                                              <div className="relative z-10">
                                                <div className={`rounded-full p-0.5 sm:p-1 border sm:border-2 border-dashed transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-white' : 'border-neutral-200 bg-white'}`}>
                                                  <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border sm:border-2 border-solid transition-all duration-300 ${isDone ? 'border-[#7A1F2B] bg-[#7A1F2B]/5 text-[#7A1F2B]' : 'border-neutral-200 bg-neutral-50 text-neutral-400'}`}>
                                                    {/* Beautiful Delivery Box with Checkmark Custom SVG Outline */}
                                                    <svg 
                                                      viewBox="0 0 24 24" 
                                                      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7 transition-colors duration-300" 
                                                      fill="none" 
                                                      stroke="currentColor" 
                                                      strokeWidth="1.75" 
                                                      strokeLinecap="round" 
                                                      strokeLinejoin="round"
                                                    >
                                                      <path d="M21 7.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5" />
                                                      <path d="M21 7.5L12 3 3 7.5M21 7.5l-9 4.5-9-4.5" />
                                                      <path d="M12 12v8" />
                                                      <polyline points="16 13 18 15 22 11" strokeWidth="2" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                {isDone && (
                                                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#7A1F2B] text-white rounded-full p-0.5 border border-white shadow-md flex items-center justify-center w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-5 sm:h-5 z-20">
                                                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                                                  </div>
                                                )}
                                              </div>
                                              <span className={`mt-2 text-center text-[7.5px] xs:text-[8.5px] sm:text-[10px] md:text-[11px] font-sans font-extrabold tracking-tight sm:tracking-wider uppercase leading-tight max-w-[55px] xs:max-w-[70px] sm:max-w-[100px] ${isDone ? 'text-[#7A1F2B] font-bold' : 'text-neutral-400'}`}>
                                                ORDER<br className="sm:hidden" /> DELIVERED
                                              </span>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* 3. RETURN EXCHANGE FORM CHAMBERS */}
              <div className="bg-[#FCFBF8] border border-gold-mid/20 rounded-lg p-5 sm:p-7 shadow">
                <div className="flex items-center gap-2 border-b border-gold-mid/10 pb-4 mb-4">
                  <Undo2 className="w-5 h-5 text-maroon-mid" />
                  <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wide">
                    Maison Sovereign Return / Exchange Service
                  </h3>
                </div>

                <p className="text-xs text-neutral-500 font-light leading-relaxed mb-4">
                  If your custom filigree chokers, ruby crowns or ivory pearl drops require adjustments or sizing correction, utilize our dispatch warranty. Submit exchange parameters below.
                </p>

                {returnSuccess ? (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs p-5 rounded text-center class-animation font-light">
                    <p className="font-serif font-bold text-sm">Return Claim Ingested Successfully</p>
                    <p className="mt-1 text-[11px] text-[#A52A2A]">Your claim will be analyzed by a Maison supervisor within 24 working hours. Ref: RET-ARCHIVES</p>
                    <button
                      onClick={() => setReturnSuccess("")}
                      className="mt-4 px-4 py-1.5 bg-maroon-mid text-white rounded font-bold uppercase tracking-widest text-[10px]"
                    >
                      Log Another Refund/Exchange Form
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReturnRequest} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[11px] text-neutral-800 font-sans font-semibold uppercase block mb-1">Order ID *</label>
                      <select
                        required
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        className="w-full bg-white border border-[#800020] rounded p-2 outline-none focus:ring-1 focus:ring-[#800020] transition-all"
                      >
                        <option value="">-- Choose past order --</option>
                        {clientOrders.map(o => (
                          <option key={o.id} value={o.id}>{o.id} (₹{o.total?.toLocaleString()})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-800 font-sans font-semibold uppercase block mb-1">Jewel Name *</label>
                      <input
                        type="text"
                        required
                        value={returnJewelName}
                        onChange={(e) => setReturnJewelName(e.target.value)}
                        placeholder="e.g. Sovereign Ruby Choker"
                        className="w-full bg-white border border-[#800020] rounded p-2 outline-none focus:ring-1 focus:ring-[#800020] transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-neutral-800 font-sans font-semibold uppercase block mb-1">Description of adjustment/reason *</label>
                      <textarea
                        required
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="Provide details. e.g. Size variance. Gold wire is slightly tight on the wrist, would request resizing to 8-inches."
                        rows={3}
                        className="w-full bg-white border border-[#800020] rounded p-2 outline-none focus:ring-1 focus:ring-[#800020] transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={clientOrders.length === 0}
                      className={`sm:col-span-2 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded ${
                        clientOrders.length === 0
                          ? "bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-300"
                          : "bg-[#1C1817] text-gold-mid hover:text-white border border-gold-mid/20 transition-all duration-300"
                      }`}
                    >
                      Transmit Warranty Request To Goldsmiths
                    </button>
                  </form>
                )}

                {/* Return list display code */}
                {returnsList.length > 0 && (
                  <div className="mt-6 border-t border-gold-mid/15 pt-5 space-y-3">
                    <span className="text-[11px] text-neutral-800 font-sans uppercase tracking-wider block font-bold">Active Returns & Exchanges Log</span>
                    <div className="space-y-2">
                      {returnsList.map((ret, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border border-gold-mid/10 p-3 bg-white rounded font-mono">
                          <div>
                            <span className="font-semibold text-neutral-700 font-sans block">{ret.jewelName}</span>
                            <span className="text-[9px] text-neutral-400 mt-0.5 block">Log Ref: {ret.id} • Order: {ret.orderId}</span>
                          </div>
                          <div>
                            <span className={`text-[9px] font-bold py-1 px-2.5 rounded uppercase ${
                              ret.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                              ret.status === "Declined" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                              "bg-[#F7F4EB] text-gold-dark border border-gold-mid/25"
                            }`}>
                              {ret.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR COLS: WISHLIST CARDS & REFERRAL PROGRAM */}
            <div className="space-y-8 col-span-1">
              
              {/* Wishlist management */}
              <div id="customer-wishlist" className="bg-[#FCFBF8] border border-gold-mid/20 rounded-lg p-5 shadow space-y-4">
                <div className="flex items-center gap-2 border-b border-gold-mid/10 pb-3">
                  <Heart className="w-5 h-5 text-maroon-mid fill-maroon-mid" />
                  <h3 className="font-serif text-base font-bold text-neutral-800 tracking-wide">
                    Wished treasures ({wishlist.length})
                  </h3>
                </div>

                {wishlist.length === 0 ? (
                  <p className="text-center py-6 text-neutral-400 font-light text-xs italic">
                    Your personal showcase has no listed designs yet. Hit heart logos on the catalog to claim choices!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {wishlist.map((j) => (
                      <div
                        key={j.id}
                        className="flex gap-3 bg-white border border-gold-mid/10 p-2.5 rounded items-center relative group"
                      >
                        <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0 border border-gold-mid/10">
                          <img referrerPolicy="no-referrer" src={j.image} alt={j.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-grow text-xs truncate">
                          <h4 className="font-serif font-bold text-neutral-800 truncate">{j.name}</h4>
                          <span className="text-maroon-mid font-semibold block mt-0.5">₹{j.price?.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button
                            onClick={() => onAddToCart(j)}
                            className="p-1.5 bg-maroon-mid text-white rounded hover:bg-maroon-dark transition-colors"
                            title="Acquire jewel"
                          >
                            <Gem className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveWishlist(j)}
                            className="p-1 px-1.5 border border-gold-mid/25 text-[9px] text-neutral-500 rounded hover:border-maroon-mid hover:text-maroon-mid transition-colors block text-center"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CRM Referral Link & Program details */}
              <div className="bg-[#FCFBF8] border border-gold-mid/20 rounded-lg p-5 shadow space-y-4 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 text-7xl text-gold-mid/10 translate-x-4 translate-y-4 select-none pointer-events-none">
                  ⚜
                </div>

                <div className="flex items-center gap-2 border-b border-gold-mid/10 pb-3">
                  <Gift className="w-5 h-5 text-gold-mid" />
                  <h3 className="font-serif text-base font-bold text-neutral-800 tracking-wide">
                    Patrons Referral Tier
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-neutral-800 font-medium font-sans leading-relaxed">
                  Invite other royal connoisseurs down to Maison d'Aurelia. Upon their first high-end item checkout, we credit your ledger account with <strong className="text-maroon-mid font-bold font-sans">1,000 points</strong>.
                </p>

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] text-neutral-800 font-sans uppercase tracking-widest block font-bold">Your Noble Referral Key:</span>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      readOnly
                      value={refLink}
                      className="w-full bg-white border border-gold-mid/20 rounded py-1.5 px-2.5 text-[10px] font-mono outline-none text-neutral-600 truncate text-ellipsis select-all"
                    />
                    <button
                      onClick={copyRefLink}
                      className="p-1.5 px-2.5 bg-[#1C1817] hover:bg-neutral-800 text-gold-mid hover:text-white rounded transition-colors text-[10px] uppercase font-bold tracking-widest border border-gold-mid/10 flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Loyalty Tier milestones visualization */}
                <div className="bg-[#F7F4EB] border border-gold-mid/20 rounded p-3 text-xs space-y-2">
                  <span className="text-[9px] text-maroon-mid uppercase tracking-widest font-mono font-bold block">Points Rewards Milestones:</span>
                  <div className="space-y-1.5 text-[11px] text-neutral-600">
                    <div className="flex justify-between font-light">
                      <span>• 1,000 pts:</span>
                      <strong className="text-neutral-700">Ivory Stud Complimentary Ex</strong>
                    </div>
                    <div className="flex justify-between font-light">
                      <span>• 5,000 pts:</span>
                      <strong className="text-neutral-700">Vermeil Gold Sizing Adjust</strong>
                    </div>
                    <div className="flex justify-between font-light">
                      <span>• 10,000 pts:</span>
                      <strong className="text-neutral-700">Private Goldsmith Consultation</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
