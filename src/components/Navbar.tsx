import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  User, 
  ShieldCheck, 
  TrendingUp, 
  Gem, 
  Sparkle, 
  Menu, 
  X,
  Home,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  LogIn,
  UserPlus,
  LogOut,
  Search
} from "lucide-react";

interface NavbarProps {
  currentView: "shop" | "portal" | "admin" | "blog" | "checkout" | "login";
  setView: (view: "shop" | "portal" | "admin" | "blog" | "checkout" | "login") => void;
  cartCount: number;
  wishlistCount: number;
  openCart: () => void;
  loggedInUser: { name: string; email: string } | null;
  onLogout: () => void;
  onLogin?: (name: string, email: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  showOnlyTrending: boolean;
  setShowOnlyTrending: (val: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  handleAiSearch?: (e?: React.FormEvent) => Promise<void>;
  isAiLoading?: boolean;
  showOnlySale?: boolean;
  setShowOnlySale?: (val: boolean) => void;
}

export default function Navbar({
  currentView,
  setView,
  cartCount,
  wishlistCount,
  openCart,
  loggedInUser,
  onLogout,
  onLogin,
  selectedCategory,
  setSelectedCategory,
  showOnlyTrending,
  setShowOnlyTrending,
  searchQuery = "",
  setSearchQuery = () => {},
  handleAiSearch = async () => {},
  isAiLoading = false,
  showOnlySale = false,
  setShowOnlySale
}: NavbarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Sync state when parent search query changes (e.g. Cleared)
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Debounced search trigger (300ms delay) to optimize keystroke speed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery, searchQuery]);

  // Premium Indian e-commerce navigation triggers
  const handleHomeClick = () => {
    setView("shop");
    setSelectedCategory("All");
    setShowOnlyTrending(false);
    if (setShowOnlySale) {
      setShowOnlySale(false);
    }
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleNewArrivalsClick = () => {
    setView("shop");
    setSelectedCategory("All");
    setShowOnlyTrending(true);
    if (setShowOnlySale) {
      setShowOnlySale(false);
    }
    setTimeout(() => {
      const el = document.getElementById("boutique-collection");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCategoryClick = (category: string) => {
    setView("shop");
    setSelectedCategory(category);
    setShowOnlyTrending(false);
    if (setShowOnlySale) {
      setShowOnlySale(false);
    }
    setTimeout(() => {
      const el = document.getElementById("boutique-collection");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleContactClick = () => {
    setView("shop");
    setTimeout(() => {
      const el = document.getElementById("footer-contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gold-mid/20 bg-[#FCFBF8]/95 backdrop-blur-md">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">
        {/* Navigation Section */}
        <div className="flex items-center gap-2">
          {/* Hamburger Button visible across all devices */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-1 text-neutral-700 hover:text-maroon-mid transition-all duration-150 cursor-pointer flex items-center justify-center focus:outline-none"
            title="Open Sidebar"
            id="mobile-drawer-hamburger"
          >
            <Menu className="w-5.5 h-5.5 text-neutral-700" />
          </button>
        </div>

        {/* Brand Identity / Logo */}
        <div className="flex flex-col items-center select-none cursor-pointer" onClick={() => setView("shop")}>
          <div className="flex items-center gap-1.5">
            <Gem className="w-5 h-5 text-gold-mid" />
            <span className="font-serif text-xl sm:text-2xl font-semibold tracking-[0.15em] text-maroon-mid">
              AURELIA
            </span>
          </div>
          <span className="text-[8px] tracking-[0.35em] text-gold-dark font-medium uppercase mt-0.5">
            Haute Fine Joaillerie
          </span>
        </div>

        {/* Right Menu Icons */}
        <div className="flex items-center gap-2 sm:gap-4 text-neutral-700">
          {/* Admin panel anchor - ONLY accessible and visible on the secret '/admin-panel' page */}
          {currentView === "admin" && (
            <button
              onClick={() => setView("admin")}
              title="Maison Command Suite"
              className="inline-flex p-2 rounded-full border transition-all duration-300 relative bg-maroon-mid text-white border-gold-mid"
            >
              <ShieldCheck className="w-4 h-4 text-gold-mid" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-maroon-mid"></span>
              </span>
            </button>
          )}

          {/* Minimalist Search Icon */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer focus:outline-none ${
              isSearchOpen 
                ? "bg-[#800020] text-[#FCFBF8] shadow-inner font-bold" 
                : "text-[#800020] hover:bg-[#800020]/10 hover:text-maroon-dark"
            }`}
            title="Search Collection"
          >
            <Search className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Cart Bag */}
          <button
            onClick={openCart}
            className="p-2.5 rounded-full bg-maroon-mid text-[#F3EFE0] hover:bg-maroon-dark transition-all duration-300 relative shadow-md shadow-maroon-mid/10"
            title="Maison Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-mid text-maroon-dark text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold border border-maroon-mid">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile/Account Button */}
          <button
            onClick={() => setView("login")}
            className={`p-2.5 rounded-full border transition-all duration-300 flex items-center justify-center relative cursor-pointer ${
              currentView === "login"
                ? "bg-[#800020] text-[#FCFBF8] border-[#D4AF37] shadow-inner font-bold"
                : "border-[#800020]/15 hover:border-[#800020]/40 text-[#800020] hover:bg-gold-light/20"
            }`}
            title="Maison Account Profile"
            id="nav-profile-account"
          >
            <User className="w-4 h-4" />
            {loggedInUser && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Premium Slide-Down Search Bar */}
      <div 
        className={`border-t border-gold-mid/10 bg-white transition-all duration-300 ease-in-out overflow-hidden shadow-sm ${
          isSearchOpen ? "max-h-24 opacity-100 py-3 sm:py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setView("shop");
              setSearchQuery(localQuery); // Instant state synchronisation
              handleAiSearch(e);
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-4 h-4 text-[#800020]/75" strokeWidth={1.8} />
              </span>
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search for necklaces, earrings, rings..."
                className="w-full pl-9 pr-8 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-[#800020] rounded text-xs sm:text-sm text-neutral-800 outline-none placeholder-neutral-400 font-sans tracking-wide transition-all duration-200"
                autoFocus={isSearchOpen}
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalQuery("");
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Match premium design style */}
            <button
              type="submit"
              disabled={isAiLoading}
              className="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-white rounded font-sans font-semibold text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
            >
              {isAiLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-gold-mid animate-pulse" />
                  <span>Search</span>
                </>
              )}
            </button>

            {/* Explicit Close Button inside box */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 border border-neutral-200 hover:border-neutral-300 text-neutral-500 hover:text-black rounded transition-all duration-200 flex items-center justify-center cursor-pointer"
              title="Close Search"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Nav Drawer links */}
      <div className="md:hidden bg-gold-light/40 border-t border-gold-mid/10 flex justify-around py-2 text-[9px] font-semibold tracking-wider uppercase text-neutral-600">
        <button
          onClick={handleHomeClick}
          className={`py-1 px-1.5 transition-colors ${currentView === "shop" && !showOnlyTrending && selectedCategory === "All" ? "text-maroon-mid font-bold border-b border-gold-mid" : "text-neutral-500"}`}
        >
          Home
        </button>
        <button
          onClick={handleNewArrivalsClick}
          className={`py-1 px-1.5 transition-colors ${currentView === "shop" && showOnlyTrending ? "text-maroon-mid font-bold border-b border-gold-mid" : "text-neutral-500"}`}
        >
          New Arrivals
        </button>
        <button
          onClick={() => handleCategoryClick("Necklaces")}
          className={`py-1 px-1.5 transition-colors ${currentView === "shop" && selectedCategory === "Necklaces" ? "text-maroon-mid font-bold border-b border-gold-mid" : "text-neutral-500"}`}
        >
          Necklaces
        </button>
        <button
          onClick={() => handleCategoryClick("Earrings")}
          className={`py-1 px-1.5 transition-colors ${currentView === "shop" && selectedCategory === "Earrings" ? "text-maroon-mid font-bold border-b border-gold-mid" : "text-neutral-500"}`}
        >
          Earrings
        </button>
        <button
          onClick={handleContactClick}
          className="py-1 px-1.5 text-neutral-500 font-medium"
        >
          Contact Us
        </button>
      </div>

      {/* 
        Side Drawer Mobile Menu (PRAO Style)
        Slides smoothly from left (translate-x)
      */}
      {/* Drawer Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 99999 }}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Panel Container */}
      <div
        className={`fixed left-0 w-[290px] sm:w-[320px] bg-[#FCFBF8] border-r border-[#721c3a]/10 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          height: "100vh",
          minHeight: "100vh",
          zIndex: 99999,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {/* Drawer Header */}
        <div className="px-5 py-5 border-b border-gold-mid/15 flex items-center justify-between bg-[#FCFBF8]">
          <div className="flex items-center gap-1.5 select-none cursor-pointer" onClick={() => { setIsDrawerOpen(false); handleHomeClick(); }}>
            <Gem className="w-4.5 h-4.5 text-gold-mid" />
            <span className="font-serif text-base font-bold tracking-[0.15em] text-[#721c3a]">
              AURELIA
            </span>
          </div>
          
          {/* Close (X) button with gold-ring accent hover */}
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 border border-[#721c3a]/20 hover:border-[#721c3a] text-neutral-500 hover:text-[#721c3a] rounded transition-all duration-150 flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider cursor-pointer"
            title="Close Menu"
          >
            <X className="w-3.5 h-3.5" />
            <span>CLOSE</span>
          </button>
        </div>

        {/* Scrollable Drawer Body with Beautiful Luxury Links */}
        <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col bg-[#FCFBF8]">
          {/* Top Banner Container - forced full bleed */}
          <div 
            className="w-full" 
            style={{ margin: "0 !important", padding: "0 !important" }}
          >
            {/* The banner itself */}
            <div 
              onClick={() => {
                setIsDrawerOpen(false);
                setView("shop");
                setSelectedCategory("All");
                setShowOnlyTrending(false);
                if (setShowOnlySale) {
                  setShowOnlySale(false);
                }
                setTimeout(() => {
                  const el = document.getElementById("boutique-collection");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 150);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "linear-gradient(135deg, #4A0011 0%, #1A0006 100%)",
                borderBottom: "2px solid #D4AF37"
              }}
              className="cursor-pointer group relative overflow-hidden py-7 px-5 text-center transition-all duration-300 hover:opacity-95"
            >
              {/* Elegant luxury vector highlight element on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              
              <div className="relative space-y-2.5 z-10">
                <span className="text-[8px] font-mono font-medium tracking-[0.25em] text-gold-mid uppercase block">
                  • Luxury Couture •
                </span>
                <h4 className="font-serif text-sm font-bold text-[#FCFBF8] tracking-[0.16em] leading-snug uppercase">
                  AURELIA HAUTE JOAILLERIE
                </h4>
                <p className="text-[10px] text-neutral-200/90 font-serif tracking-wide leading-relaxed font-light px-4">
                  The Front Row Seat to Luxury. Explore Handcrafted Masterpieces.
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1.5 border border-gold-mid/50 group-hover:border-gold-mid text-[9px] font-sans font-bold uppercase tracking-[0.18em] text-gold-mid bg-black/10 transition-all duration-300">
                    DISCOVER NOW →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of the navigation content with original padding */}
          <div className="flex-1 px-5 py-5 space-y-6">
            <span className="text-[9px] font-mono text-gold-dark uppercase tracking-widest block mb-1 border-b border-gold-mid/10 pb-1">
              Maison Navigation
            </span>

            <div className="space-y-1.5">
            {/* 1. HOME */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                handleHomeClick();
              }}
              className="w-full h-[56px] flex items-center gap-[12px] text-[12px] font-medium font-serif uppercase tracking-[0.18em] text-neutral-700 hover:text-[#721c3a] border-b border-[#721c3a]/5 transition-all duration-150 cursor-pointer group"
            >
              <Home className="w-[18px] h-[18px] text-[#721c3a]/70 group-hover:text-[#721c3a] transition-colors" strokeWidth={1.2} />
              <span className={`whitespace-nowrap ${currentView === "shop" && selectedCategory === "All" && !showOnlyTrending ? "text-[#721c3a]" : ""}`}>Home</span>
            </button>
 
            {/* 2. NEW ARRIVALS */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                handleNewArrivalsClick();
              }}
              className="w-full h-[56px] flex items-center gap-[12px] text-[12px] font-medium font-serif uppercase tracking-[0.18em] text-neutral-700 hover:text-[#721c3a] border-b border-[#721c3a]/5 transition-all duration-150 cursor-pointer group"
            >
              <Sparkles className="w-[18px] h-[18px] text-[#721c3a]/70 group-hover:text-[#721c3a] transition-colors" strokeWidth={1.2} />
              <span className={`whitespace-nowrap ${currentView === "shop" && showOnlyTrending ? "text-[#721c3a]" : ""}`}>New Arrivals</span>
            </button>
 
            {/* 3. SHOP BY CATEGORY Accordion */}
            <div className="border-b border-[#721c3a]/5">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full h-[56px] flex items-center justify-between text-[12px] font-medium font-serif uppercase tracking-[0.18em] text-neutral-700 hover:text-[#721c3a] transition-all duration-150 cursor-pointer group"
              >
                <div className="flex items-center gap-[12px]">
                  <ShoppingBag className="w-[18px] h-[18px] text-[#721c3a]/70 group-hover:text-[#721c3a] transition-colors" strokeWidth={1.2} />
                  <span className="whitespace-nowrap">Shop by Category</span>
                </div>
                {isCategoryOpen ? (
                  <ChevronUp className="w-4 h-4 text-gold-mid" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gold-mid" strokeWidth={1.5} />
                )}
              </button>
 
              {/* Sub items collapsible list */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out pl-8 space-y-2.5 ${
                  isCategoryOpen ? "max-h-[220px] mt-2 mb-3 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                {[
                  { name: "Rings", key: "Rings" },
                  { name: "Necklaces", key: "Necklaces" },
                  { name: "Earrings", key: "Earrings" },
                  { name: "Bracelets", key: "Bracelets" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setIsDrawerOpen(false);
                      handleCategoryClick(item.key);
                    }}
                    className={`w-full text-left text-[10px] uppercase tracking-[0.12em] block py-1.5 hover:text-[#721c3a] transition-colors ${
                      selectedCategory === item.key && currentView === "shop"
                        ? "text-[#721c3a] font-bold"
                        : "text-neutral-500 font-normal"
                     }`}
                  >
                    — &nbsp; {item.name}
                  </button>
                ))}
              </div>
            </div>
 
            {/* 4. BEST SELLERS */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                handleNewArrivalsClick();
              }}
              className="w-full h-[56px] flex items-center gap-[12px] text-[12px] font-medium font-serif uppercase tracking-[0.18em] text-neutral-700 hover:text-[#721c3a] border-b border-[#721c3a]/5 transition-all duration-150 cursor-pointer group"
            >
              <TrendingUp className="w-[18px] h-[18px] text-[#721c3a]/70 group-hover:text-[#721c3a] transition-colors" strokeWidth={1.2} />
              <span className="whitespace-nowrap">Best Sellers</span>
            </button>
 
            {/* 5. TRACK ORDER */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setView("portal");
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }, 100);
              }}
              className="w-full h-[56px] flex items-center gap-[12px] text-[12px] font-medium font-serif uppercase tracking-[0.18em] text-neutral-700 hover:text-[#721c3a] border-b border-[#721c3a]/5 transition-all duration-150 cursor-pointer group"
            >
              <MapPin className="w-[18px] h-[18px] text-[#721c3a]/70 group-hover:text-[#721c3a] transition-colors" strokeWidth={1.2} />
              <span className={`whitespace-nowrap ${currentView === "portal" ? "text-[#721c3a]" : ""}`}>Track Order</span>
            </button>
 
            {/* 6. CONTACT US */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                handleContactClick();
              }}
              className="w-full h-[56px] flex items-center gap-[12px] text-[12px] font-medium font-serif uppercase tracking-[0.18em] text-neutral-700 hover:text-[#721c3a] border-b border-[#721c3a]/5 transition-all duration-150 cursor-pointer group"
            >
              <Phone className="w-[18px] h-[18px] text-[#721c3a]/70 group-hover:text-[#721c3a] transition-colors" strokeWidth={1.2} />
              <span className="whitespace-nowrap">Contact Us</span>
            </button>
          </div>  </div>

          {/* Quick Assurance banner */}
          <div className="border border-gold-mid/15 bg-gold-light/5 p-3 rounded-sm text-center">
            <span className="text-[8px] font-mono uppercase tracking-[0.18em] text-[#721c3a] block mb-0.5 font-semibold">
              • 100% Certified Ledger •
            </span>
            <span className="text-[8.5px] text-neutral-500 font-serif leading-tight block">
              Direct door assurance from Maison d'Aurelia.
            </span>
          </div>
        </div>

        {/* Drawer Footer with Sleek, Thin-bordered Account buttons matching style */}
        <div className="p-5 border-t border-gold-mid/15 bg-[#FCFBF8]/50 space-y-3 shrink-0">
          {loggedInUser ? (
            <div className="space-y-2">
              <div className="flex flex-col items-center text-center pb-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">Signed in as</span>
                <span className="text-xs font-serif font-semibold text-[#721c3a]">{loggedInUser.name}</span>
              </div>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 border border-[#721c3a]/30 hover:bg-[#721c3a]/5 text-[#721c3a] rounded-[2px] text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#721c3a]" strokeWidth={1.5} />
                <span>LOG OUT</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setView("portal");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-transparent border border-[#721c3a]/50 hover:bg-[#721c3a]/5 text-[#721c3a] rounded-[2px] text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer"
                title="Log In"
              >
                <LogIn className="w-3.5 h-3.5 text-[#721c3a]" strokeWidth={1.5} />
                <span>LOG IN</span>
              </button>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setView("portal");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-transparent border border-gold-mid/50 hover:bg-gold-light/20 text-gold-dark rounded-[2px] text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer"
                title="Register Account"
              >
                <UserPlus className="w-3.5 h-3.5 text-gold-dark" strokeWidth={1.5} />
                <span>REGISTER</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
