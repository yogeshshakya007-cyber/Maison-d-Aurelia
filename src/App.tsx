import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AnnouncementBar from "./components/AnnouncementBar";
import FeaturesBar from "./components/FeaturesBar";
import LandingHero from "./components/LandingHero";
import AureliaHeroSection from "./components/AureliaHeroSection";
import OurCollections from "./components/OurCollections";
import ProductsSection from "./components/ProductsSection";
import ProductDetailModal from "./components/ProductDetailModal";
import CartDrawer from "./components/CartDrawer";
import CustomerPortal from "./components/CustomerPortal";
import AdminPanel from "./components/AdminPanel";
import LuxuryBlog from "./components/LuxuryBlog";
import CheckoutFlow from "./components/CheckoutFlow";
import SignInRegister from "./components/SignInRegister";
import { Jewel, CartItem, Order, ReturnRequest, CustomerProfile, Campaign, BlogItem } from "./types";
import { Sparkle, Check, X, ShieldAlert, Sparkles, Gem, Mail, MapPin, Truck, ShieldCheck, RotateCcw, Instagram, Facebook, Youtube, Search, Award, Lock, Home, Tag, Heart, User, MessageCircle } from "lucide-react";
// @ts-ignore
import lionMakeIndia from "./assets/images/lion_make_india.svg";

const CIRCULAR_CATEGORIES = [
  { name: "Daily Wear", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=150", filter: "All" },
  { name: "Rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=150", filter: "Rings" },
  { name: "Earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=150", filter: "Earrings" },
  { name: "PENDANTS", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=150", filter: "Necklaces" },
  { name: "PENDANT SETS", image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=150", filter: "Necklaces" },
  { name: "Bracelets", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=150", filter: "Bracelets" },
  { name: "Bangles", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=150", filter: "Bracelets" },
  { name: "Necklace", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=150", filter: "Necklaces" },
  { name: "Necklace set", image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=150", filter: "Necklaces" },
  { name: "Mangalsutra", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=150", filter: "Necklaces" },
  { name: "Chains", image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=150", filter: "Necklaces" },
  { name: "For man", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=150", filter: "All" }
];

export default function App() {
  const [currentView, setView] = useState<"shop" | "portal" | "admin" | "blog" | "checkout" | "login">(() => {
    const path = window.location.pathname;
    if (path === "/admin-panel") return "admin";
    if (path === "/portal") return "portal";
    if (path === "/blog") return "blog";
    if (path === "/checkout") return "checkout";
    if (path === "/login") return "login";
    return "shop";
  });


  useEffect(() => {
    const currentPath = window.location.pathname;
    let expectedPath = "/";
    if (currentView === "admin") {
      expectedPath = "/admin-panel";
    } else if (currentView === "portal") {
      expectedPath = "/portal";
    } else if (currentView === "blog") {
      expectedPath = "/blog";
    } else if (currentView === "checkout") {
      expectedPath = "/checkout";
    } else if (currentView === "login") {
      expectedPath = "/login";
    }

    if (currentPath !== expectedPath) {
      window.history.pushState(null, "", expectedPath);
    }
  }, [currentView]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/admin-panel") {
        setView("admin");
      } else if (path === "/portal") {
        setView("portal");
      } else if (path === "/blog") {
        setView("blog");
      } else if (path === "/checkout") {
        setView("checkout");
      } else if (path === "/login") {
        setView("login");
      } else {
        setView("shop");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showOnlyTrending, setShowOnlyTrending] = useState<boolean>(false);
  const [showOnlySale, setShowOnlySale] = useState<boolean>(false);
  const [portalActiveTab, setPortalActiveTab] = useState<"wishlist" | "account">("account");
  const [activePolicy, setActivePolicy] = useState<{ title: string; content: string } | null>(null);
  
  // Vault Data catalogs
  const [jewels, setJewels] = useState<Jewel[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnsList, setReturnsList] = useState<ReturnRequest[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);

  // Local storage cart & wishlist arrays
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Jewel[]>([]);
  
  // Modal & Drawer drawers state
  const [selectedJewel, setSelectedJewel] = useState<Jewel | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Authentication State
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);

  // Checkout Selected Items State
  const [checkoutItems, setCheckoutItems] = useState<{ jewel: Jewel; quantity: number }[]>([]);

  // Purchase overlay confirmation alert
  const [recentOrderJoined, setRecentOrderJoined] = useState<Order | null>(null);

  // AI Smart search lifted states
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // WhatsApp Settings parent state
  const [whatsappSettings, setWhatsappSettings] = useState<{
    whatsapp_enabled: boolean;
    whatsapp_number: string;
    whatsapp_default_message: string;
  } | null>(null);

  const fetchWhatsAppSettings = () => {
    fetch("/api/whatsapp-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setWhatsappSettings(data);
        }
      })
      .catch((err) => console.error("Error loading WhatsApp settings:", err));
  };

  // Trigger AI Smart Search through the Gemini backend
  const handleAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setAiMatchedIds(null);
      setAiInsight("");
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();
      if (data) {
        setAiMatchedIds(data.matchedIds || []);
        setAiInsight(data.aiInsight || "");
        
        // Scroll smoothly to boutique collection instantly
        setTimeout(() => {
          const el = document.getElementById("boutique-collection");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    } catch (err) {
      console.error("AI filter failed", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCircularCategoryClick = (categoryFilter: string) => {
    setSelectedCategory(categoryFilter);
    setTimeout(() => {
      const el = document.getElementById("boutique-collection");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Fetch precious data arrays from the server engine on load
  const loadDatabaseState = async () => {
    try {
      const [resJewels, resOrders, resReturns, resCust, resCamp, resBlogs] = await Promise.all([
        fetch("/api/jewels"),
        fetch("/api/orders"),
        fetch("/api/returns"),
        fetch("/api/customers"),
        fetch("/api/campaigns"),
        fetch("/api/blogs")
      ]);

      const [jVal, oVal, rVal, cVal, caVal, bVal] = await Promise.all([
        resJewels.json(),
        resOrders.json(),
        resReturns.json(),
        resCust.json(),
        resCamp.json(),
        resBlogs.json()
      ]);

      setJewels(jVal || []);
      setOrders(oVal || []);
      setReturnsList(rVal || []);
      setCustomers(cVal || []);
      setCampaigns(caVal || []);
      setBlogs(bVal || []);
    } catch (err) {
      console.error("Could not fetch remote Maison state", err);
    }
  };

  useEffect(() => {
    loadDatabaseState();
    fetchWhatsAppSettings();

    // Cache local wishlists
    const storedWishlist = localStorage.getItem("aurelia_wishlist");
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (e) {
        console.warn("Could not parse cached wishlist", e);
      }
    }
    const storedCart = localStorage.getItem("aurelia_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.warn("Could not parse cached cart", e);
      }
    }

    // Default simulation login to speed up the presentation
    setLoggedInUser({
      name: "Yogesh Shakya",
      email: "yogesh.shakya007@gmail.com"
    });
  }, []);

  // Update in-memory local caches
  const handleSetWishlist = (newList: Jewel[]) => {
    setWishlist(newList);
    localStorage.setItem("aurelia_wishlist", JSON.stringify(newList));
  };

  const handleSetCart = (newList: CartItem[]) => {
    setCart(newList);
    localStorage.setItem("aurelia_cart", JSON.stringify(newList));
  };

  // E-commerce cart modifiers
  const handleAddToCart = (jewel: Jewel) => {
    const existing = cart.find(c => c.jewelId === jewel.id);
    if (existing) {
      handleSetCart(cart.map(c => c.jewelId === jewel.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      handleSetCart([...cart, { jewelId: jewel.id, quantity: 1 }]);
    }
    // Automatically trigger cart open feedback
    setIsCartOpen(true);
  };

  const handleAddBundleToCart = (j1: Jewel, j2: Jewel) => {
    let tempCart = [...cart];
    // Add j1
    const ex1 = tempCart.find(c => c.jewelId === j1.id);
    if (ex1) {
      tempCart = tempCart.map(c => c.jewelId === j1.id ? { ...c, quantity: c.quantity + 1 } : c);
    } else {
      tempCart.push({ jewelId: j1.id, quantity: 1 });
    }
    // Add j2 (Bundle related accessory)
    const ex2 = tempCart.find(c => c.jewelId === j2.id);
    if (ex2) {
      tempCart = tempCart.map(c => c.jewelId === j2.id ? { ...c, quantity: c.quantity + 1 } : c);
    } else {
      tempCart.push({ jewelId: j2.id, quantity: 1 });
    }
    handleSetCart(tempCart);
    setIsCartOpen(true);
  };

  const handleUpdateQty = (jewelId: string, delta: number) => {
    const updated = cart.map(c => {
      if (c.jewelId === jewelId) {
        const nextQty = c.quantity + delta;
        return nextQty > 0 ? { ...c, quantity: nextQty } : null;
      }
      return c;
    }).filter(Boolean) as CartItem[];
    handleSetCart(updated);
  };

  const handleRemoveItem = (jewelId: string) => {
    handleSetCart(cart.filter(c => c.jewelId !== jewelId));
  };

  const handleToggleWishlist = (jewel: Jewel) => {
    const isWished = wishlist.find(w => w.id === jewel.id);
    if (isWished) {
      handleSetWishlist(wishlist.filter(w => w.id !== jewel.id));
    } else {
      handleSetWishlist([...wishlist, jewel]);
    }
  };

  // Secure checkout success response callback
  const handleCheckoutSuccess = (order: Order) => {
    setRecentOrderJoined(order);
    handleSetCart([]); // Wipe cart cleanly
    setSelectedJewel(null);
    loadDatabaseState(); // Sync servers arrays instantly!
  };

  const handleStartCartCheckout = () => {
    const mappedItems = cart.map(item => {
      const target = jewels.find(j => j.id === item.jewelId);
      return target ? { jewel: target, quantity: item.quantity } : null;
    }).filter(Boolean) as { jewel: Jewel; quantity: number }[];

    if (mappedItems.length > 0) {
      setCheckoutItems(mappedItems);
      setView("checkout");
    }
  };

  const handleDirectBuyNowCheckout = (jewel: Jewel) => {
    setCheckoutItems([{ jewel, quantity: 1 }]);
    setView("checkout");
  };

  const currentAppUrlStr = window.location.origin;

  // ================= ADMIN DISPATCH HANDLERS =================
  const handleUpdateJewelParams = async (id: string, updatedParams: any) => {
    try {
      const response = await fetch(`/api/jewels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedParams)
      });
      if (response.ok) {
        loadDatabaseState();
      }
    } catch (e) {
      console.error("Goldsmith inventory update failed", e);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        loadDatabaseState();
      }
    } catch (e) {
      console.error("Ledger status change failed", e);
    }
  };

  const handleUpdateReturnStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/returns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        loadDatabaseState();
      }
    } catch (e) {
      console.error("Return state modification failed", e);
    }
  };

  const handleCreateNewCampaign = async (campaign: any) => {
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign)
      });
      if (response.ok) {
        loadDatabaseState();
      }
    } catch (e) {
      console.error("Building campaign failed", e);
    }
  };

  const handleTriggerSimulatedRecovery = async (email: string) => {
    console.log(`[Maison CRM Trigger]: Dispatched Cart Abandonment Recovery notifications to: ${email}`);
    alert(`[Simulated WhatsApp Recovery] Dispatched personalized checkout reminder to patron: ${email}. Code: ROYAL20.`);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col justify-between relative selection:bg-[#800020] selection:text-white">
      
      {/* Announcement bar at the absolute top */}
      <AnnouncementBar />

      {/* Brand Navigation Header */}
      <Navbar
        currentView={currentView}
        setView={setView}
        cartCount={cart.reduce((acc, c) => acc + c.quantity, 0)}
        wishlistCount={wishlist.length}
        openCart={() => setIsOpenCartDev(true)}
        loggedInUser={loggedInUser}
        onLogout={() => setLoggedInUser(null)}
        onLogin={(name, email) => setLoggedInUser({ name, email })}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showOnlyTrending={showOnlyTrending}
        setShowOnlyTrending={setShowOnlyTrending}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleAiSearch={handleAiSearch}
        isAiLoading={isAiLoading}
        showOnlySale={showOnlySale}
        setShowOnlySale={setShowOnlySale}
      />

      {/* Dynamic Success Order Confirmation Popup Modal */}
      {recentOrderJoined && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FCFBF8] border-2 border-gold-mid p-6 sm:p-8 rounded max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="h-14 w-14 rounded-full bg-gold-light border border-gold-mid flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-7 h-7 text-maroon-mid" />
            </div>
            <span className="text-[10px] text-gold-dark font-mono uppercase tracking-widest block font-bold">Maison Certificate Logged</span>
            
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-maroon-mid">Acquisition Registered</h3>
            
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Dearest patron, your invoice request has been secured at the workshop. Goldsmiths have commenced sizing and settings operations.
            </p>

            <div className="bg-white border border-gold-mid/10 rounded p-4 text-xs font-mono select-all space-y-1">
              <div>Invoice Reference: <strong className="font-bold text-maroon-dark">{recentOrderJoined.id}</strong></div>
              <div>Tracking Cipher: <span className="text-gold-dark font-bold font-mono">{recentOrderJoined.trackingCode}</span></div>
              <div className="text-[11px] text-neutral-400">Pings dispatched via WhatsApp matching {recentOrderJoined.customerPhone}</div>
            </div>

            <button
              onClick={() => {
                setRecentOrderJoined(null);
                setView("portal");
              }}
              className="w-full py-2.5 bg-maroon-mid hover:bg-neutral-900 text-white font-bold uppercase tracking-widest text-[9px] rounded border border-gold-mid/20 transition-all font-mono"
            >
              Verify Tracking Timeline
            </button>
          </div>
        </div>
      )}

      {/* Dynamic View Main Body Sections */}
      <main className="flex-grow">
        {currentView === "shop" && (
          <div className="animate-fadeIn">
            
            {/* Elegant square catalogue row and premium hero banner */}
            <AureliaHeroSection
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {/* Premium "Our Collections" Section */}
            <OurCollections onSelectCollection={handleCircularCategoryClick} />

            {/* Fine jewellery product catalog */}
            <ProductsSection
              jewels={jewels}
              onQuickView={setSelectedJewel}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlist.map(w => w.id)}
              userEmail={loggedInUser ? loggedInUser.email : null}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showOnlyTrending={showOnlyTrending}
              setShowOnlyTrending={setShowOnlyTrending}
              showOnlySale={showOnlySale}
              setShowOnlySale={setShowOnlySale}
              onBuyNow={handleDirectBuyNowCheckout}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              aiInsight={aiInsight}
              setAiInsight={setAiInsight}
              aiMatchedIds={aiMatchedIds}
              setAiMatchedIds={setAiMatchedIds}
              isAiLoading={isAiLoading}
              setIsAiLoading={setIsAiLoading}
              handleAiSearch={handleAiSearch}
            />

            {/* Regal Features Trust Badge Bar */}
            <FeaturesBar />
          </div>
        )}

        {currentView === "portal" && (
          <CustomerPortal
            loggedInUser={loggedInUser}
            onLogin={(n, e) => setLoggedInUser({ name: n, email: e })}
            onLogout={() => setLoggedInUser(null)}
            wishlist={wishlist}
            onRemoveWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            orders={orders}
            returnsList={returnsList}
            onTriggerReturn={async (orderId, jewelName, reason) => {
              try {
                const response = await fetch("/api/returns", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId, customerName: loggedInUser?.name, jewelName, reason })
                });
                if (response.ok) {
                  loadDatabaseState();
                }
              } catch (e) {
                console.error("Return order trigger failed", e);
              }
            }}
            currentAppUrl={currentAppUrlStr}
          />
        )}

        {currentView === "admin" && (
          <AdminPanel
            jewels={jewels}
            orders={orders}
            returnsList={returnsList}
            customers={customers}
            campaigns={campaigns}
            onUpdateJewel={handleUpdateJewelParams}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateReturnStatus={handleUpdateReturnStatus}
            onCreateCampaign={handleCreateNewCampaign}
            onTriggerSimulatedRecovery={handleTriggerSimulatedRecovery}
            onRefresh={loadDatabaseState}
            whatsappSettings={whatsappSettings}
            onUpdateWhatsAppSettings={setWhatsappSettings}
          />
        )}

        {currentView === "blog" && (
          <LuxuryBlog blogs={blogs} />
        )}

        {currentView === "checkout" && (
          <CheckoutFlow
            checkoutItems={checkoutItems}
            onBackToShop={() => setView("shop")}
            onCheckoutSuccess={handleCheckoutSuccess}
            couponApplied={null}
            onApplyCoupon={async (code) => {
              return true;
            }}
            onClearCart={() => handleSetCart([])}
          />
        )}

        {currentView === "login" && (
          <SignInRegister
            loggedInUser={loggedInUser}
            onLogin={(n, e) => setLoggedInUser({ name: n, email: e })}
            onLogout={() => setLoggedInUser(null)}
            setView={setView}
          />
        )}
      </main>

      {/* Slide drawer Cart Drawer console */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsOpenCartDev(false)}
        cart={cart}
        jewels={jewels}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckoutSuccess={handleCheckoutSuccess}
        onStartCheckout={handleStartCartCheckout}
      />

      {/* Redesigned 3-Column Professional Indian E-commerce Footer */}
      <footer id="footer-contact" className="bg-[#141110] text-[#EAD0A8] py-14 px-6 md:px-12 border-t border-[#D4AF37]/35 font-sans relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-xs text-left">
          {/* Column 1: Brand & Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-gold-mid" />
              <span className="font-sans text-[15px] font-bold tracking-[1.5px] text-[#FCFBF8] uppercase">
                Maison d'Aurelia
              </span>
            </div>
            <p className="font-sans text-[12.5px] leading-[1.6] text-[#CECECE] font-normal">
              Maison d'Aurelia is India's premier boutique for avant-garde gold filigree and regal vermeil jewelry. We weave the deep prestige of royal maroon accents and ivory aesthetics, hand-forging perfection for the modern connoisseur.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="font-sans text-[11px] text-[#CECECE]/60 font-semibold tracking-[1px] mr-1">FOLLOW US:</span>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:scale-110 hover:shadow-[0_0_10px_rgba(238,42,123,0.4)] transition-all duration-300 transform" 
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-full bg-[#1877F2] text-white hover:scale-110 hover:shadow-[0_0_10px_rgba(24,119,242,0.4)] transition-all duration-300 transform" 
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5 fill-white text-[#1877F2]" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-full bg-[#FF0000] text-white hover:scale-110 hover:shadow-[0_0_10px_rgba(255,0,0,0.4)] transition-all duration-300 transform" 
                aria-label="YouTube"
              >
                <Youtube className="w-3.5 h-3.5 fill-white text-[#FF0000]" />
              </a>
            </div>
            <div className="font-sans text-[11px] text-[#CECECE]/60 tracking-[1px] pt-1">
              © 1892 - 2026 MAISON D'AURELIA • REGISTERED TRUST
            </div>
          </div>

          {/* Column 2: Essential Links */}
          <div className="space-y-6">
            <h5 className="font-sans text-[13px] font-bold tracking-[1.5px] text-[#FCFBF8] uppercase border-b border-[#D4AF37]/15 pb-2.5">
              Essential Policies
            </h5>
            <ul className="space-y-3 font-normal text-[#CECECE]">
              <li>
                <button 
                  onClick={() => setActivePolicy({ title: "Privacy Policy", content: "We respect your security with absolute dedication. Our databases secured with transit encryptions ensure that your sizes, custom engravings, and VVIP commission archives remain 100% confidential. No sensitive logs or credentials are shared." })}
                  className="font-sans text-[13px] font-normal leading-[1.8] hover:text-gold-mid transition-all hover:translate-x-1.5 duration-200 block text-left py-1 cursor-pointer w-full text-[#CECECE]"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicy({ title: "Shipping & Transit Policy", content: "We offer complimentary insurable door-to-door delivery across all pin codes in India. Every masterpiece is encased in steel-reinforced secure timber lockets, tracked with satellite telemetry directly from our Lucknow workshop." })}
                  className="font-sans text-[13px] font-normal leading-[1.8] hover:text-gold-mid transition-all hover:translate-x-1.5 duration-200 block text-left py-1 cursor-pointer w-full text-[#CECECE]"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicy({ title: "Return & Exchange Policy", content: "In keeping with custom bespoke honor rules, we offer an unconditional 15-day return and exchange program. Log into your Patron Portal to file automated return requests and generated dispatch certificates instantly." })}
                  className="font-sans text-[13px] font-normal leading-[1.8] hover:text-gold-mid transition-all hover:translate-x-1.5 duration-200 block text-left py-1 cursor-pointer w-full text-[#CECECE]"
                >
                  Return Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setView("portal"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="font-sans text-[13px] font-normal leading-[1.8] hover:text-gold-mid transition-all hover:translate-x-1.5 duration-200 block text-left py-1 cursor-pointer w-full text-[#CECECE]"
                >
                  Loyalty Patron Club
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Indian Address */}
          <div className="space-y-6">
            <h5 className="font-sans text-[13px] font-bold tracking-[1.5px] text-[#FCFBF8] uppercase border-b border-[#D4AF37]/15 pb-2.5">
              Customer Support
            </h5>
            <div className="space-y-5.5 font-normal text-[#CECECE]">
              <div className="flex items-start gap-3">
                <Mail className="w-4.5 h-4.5 text-gold-mid mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-sans text-[11px] uppercase font-semibold block text-[#FCFBF8]/45 tracking-[1px] mb-1">Maison Desk</span>
                  <a href="mailto:support@maisondaurelia.in" className="font-sans text-[13px] font-normal leading-[1.8] text-[#CECECE] hover:text-gold-mid transition-colors select-all">
                    support@maisondaurelia.in
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-gold-mid mt-0.5 flex-shrink-0" />
                <div className="leading-relaxed">
                  <span className="font-sans text-[11px] uppercase font-semibold block text-[#FCFBF8]/45 tracking-[1px] mb-1">Corporate Atelier</span>
                  <p className="font-sans text-[12.5px] leading-[1.6] text-[#CECECE] font-normal">
                    Sector 4/R Avas Vikas colony,<br />
                    Bodla Agra, Uttar Pradesh,<br />
                    282007, India
                  </p>
                </div>
              </div>
            </div>

            {/* Make In India badge relocated below Customer Support details */}
            <div className="pt-6 flex justify-end mr-0 mb-[-10px]">
              <button 
                id="make-in-india-admin-btn"
                onClick={() => { setView("admin"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="block p-0 bg-transparent border-none cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none w-fit"
                title="Admin Access"
              >
                <img 
                  src={lionMakeIndia} 
                  alt="Make In India" 
                  className="w-[130px] md:w-[180px] h-auto object-contain transition-opacity duration-300 opacity-95 hover:opacity-100 block"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Global Footer Bottom Credit */}
        <div className="mt-10 pt-6 border-t border-[#D4AF37]/15 text-center">
          <p className="font-sans text-[11px] text-neutral-500 uppercase tracking-[2px] text-center leading-relaxed">
            ESTABLISHED IN PARIS • BROUGHT TO LIFE BY ELITE SCULPTORS IN UTTAR PRADESH • SECURE INTEGRATIONS GUARANTEED
          </p>
        </div>
      </footer>

      {/* Policy Overlay Modal */}
      {activePolicy && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FCFBF8] border-2 border-gold-mid p-6 sm:p-8 rounded max-w-md w-full relative text-center space-y-4 shadow-2xl">
            <button 
              onClick={() => setActivePolicy(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-10 w-10 rounded-full bg-gold-light/40 border border-gold-mid/30 flex items-center justify-center mx-auto">
              <Sparkle className="w-5 h-5 text-maroon-mid" />
            </div>
            <h3 className="font-serif text-lg font-bold text-maroon-dark">{activePolicy.title}</h3>
            <p className="text-xs text-neutral-600 font-light leading-relaxed font-sans">{activePolicy.content}</p>
            <button
              onClick={() => setActivePolicy(null)}
              className="w-full py-2 bg-maroon-mid hover:bg-neutral-900 text-white font-bold uppercase tracking-widest text-[9px] rounded border border-gold-mid/20 transition-all font-mono"
            >
              Understand Accord
            </button>
          </div>
        </div>
      )}

      {/* Product Detail / Quick View Modal */}
      {selectedJewel && (
        <ProductDetailModal
          jewel={selectedJewel}
          onClose={() => setSelectedJewel(null)}
          allJewels={jewels}
          onAddToCart={handleAddToCart}
          onAddBundleToCart={handleAddBundleToCart}
          onBuyNow={handleDirectBuyNowCheckout}
        />
      )}

      {/* Sticky Bottom Navigation Bar for Mobile */}
      <div className="mobile-bottom-nav">
        <button 
          onClick={() => {
            setView("shop");
            setShowOnlyTrending(false);
            setShowOnlySale(false);
            setSelectedCategory("All");
            setSearchQuery("");
            setAiMatchedIds(null);
            setAiInsight("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`nav-item ${currentView === "shop" && !showOnlyTrending && !showOnlySale ? "active" : ""}`}
        >
          <span className="nav-icon">
            <Home className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <span className="nav-label">Home</span>
        </button>
        <button 
          onClick={() => {
            setView("shop");
            setShowOnlyTrending(true);
            setShowOnlySale(false);
            setSelectedCategory("All");
            setSearchQuery("");
            setAiMatchedIds(null);
            setAiInsight("");
            setTimeout(() => {
              const el = document.getElementById("boutique-collection");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          className={`nav-item ${currentView === "shop" && showOnlyTrending ? "active" : ""}`}
        >
          <span className="nav-icon">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <span className="nav-label">New</span>
        </button>
        <button 
          onClick={() => {
            setView("shop");
            setShowOnlyTrending(false);
            setShowOnlySale(true);
            setSelectedCategory("All");
            setSearchQuery("");
            setAiMatchedIds(null);
            setAiInsight("");
            setTimeout(() => {
              const el = document.getElementById("boutique-collection");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          className={`nav-item ${currentView === "shop" && showOnlySale ? "active" : ""}`}
        >
          <span className="nav-icon">
            <Tag className="w-5 h-5 animate-pulse" strokeWidth={1.5} />
          </span>
          <span className="nav-label">Sale</span>
        </button>
        <button 
          onClick={() => {
            setView("portal");
            setPortalActiveTab("wishlist");
            setTimeout(() => {
              const el = document.getElementById("customer-wishlist");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }, 150);
          }}
          className={`nav-item ${currentView === "portal" && portalActiveTab === "wishlist" ? "active" : ""}`}
        >
          <span className="nav-icon">
            <Heart className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <span className="nav-label">Wishlist</span>
        </button>
        <button 
          onClick={() => {
            setView("portal");
            setPortalActiveTab("account");
            setTimeout(() => {
              const el = document.getElementById("customer-portal-root");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }, 150);
          }}
          className={`nav-item ${currentView === "portal" && portalActiveTab === "account" ? "active" : ""}`}
        >
          <span className="nav-icon">
            <User className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <span className="nav-label">Account</span>
        </button>
      </div>

      {/* Floating WhatsApp Chat Button */}
      {whatsappSettings?.whatsapp_enabled && whatsappSettings?.whatsapp_number && (
        <a
          id="whatsapp-floating-button"
          href={`https://wa.me/${whatsappSettings.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappSettings.whatsapp_default_message || "Hello, I need assistance.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[24px] right-[24px] z-[9999] flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer rounded-full w-[56px] h-[56px] md:w-[60px] md:h-[60px]"
          title="Chat with us on WhatsApp"
        >
          <MessageCircle id="whatsapp-icon" className="w-7 h-7 md:w-8 md:h-8" />
        </a>
      )}

    </div>
  );

  // Cart drawer open/close wrapper hooks to bypass strict typologies
  function setIsOpenCartDev(openVal: boolean) {
    setIsCartOpen(openVal);
  }
}
