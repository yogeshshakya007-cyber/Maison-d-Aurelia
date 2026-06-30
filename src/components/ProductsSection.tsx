import React, { useState, useEffect } from "react";
import { Search, Sparkles, Filter, Check, Heart, Eye, ArrowUpDown, ChevronDown, RotateCcw } from "lucide-react";
import { Jewel, getPrimaryImage } from "../types";
import ImageLightbox from "./ImageLightbox";

// Helper to generate 3 high-quality luxury images for the gallery matching types
export function getJewelImages(jewel: Jewel): string[] {
  let baseImages: string[] = [];
  try {
    if (jewel.image && jewel.image.trim().startsWith("[")) {
      const parsed = JSON.parse(jewel.image.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        baseImages = parsed.filter(img => img && img.trim() !== "");
      }
    }
  } catch (e) {
    // Not a JSON array
  }

  if (baseImages.length === 0) {
    baseImages = [jewel.image || ""];
  }

  const images = [...baseImages];
  if (images.length < 3) {
    if (jewel.category === "Rings") {
      images.push(
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80",
        "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=1000&q=80"
      );
    } else if (jewel.category === "Necklaces") {
      images.push(
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=80",
        "https://images.unsplash.com/photo-1611085583191-a3b1a3a30c5e?w=1000&q=80"
      );
    } else if (jewel.category === "Earrings") {
      images.push(
        "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1000&q=80",
        "https://images.unsplash.com/photo-1635767790028-3e9a53fef3c2?w=1000&q=80"
      );
    } else if (jewel.category === "Bracelets") {
      images.push(
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1000&q=80",
        "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80"
      );
    } else {
      images.push(
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=80",
        "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=1000&q=80"
      );
    }
  }
  return images;
}

export function matchesStrictKeyword(j: Jewel, queryStr: string): boolean {
  const normalizedQuery = queryStr.toLowerCase().trim();
  if (!normalizedQuery) return true;

  // Split query into terms
  const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 1);
  if (terms.length === 0) return true;

  // Explicit category matching constraints
  const categoryTerms = [
    { key: "necklace", category: "Necklaces" },
    { key: "ring", category: "Rings" },
    { key: "earring", category: "Earrings" },
    { key: "bracelet", category: "Bracelets" },
    { key: "pendant", category: "Necklaces" },
    { key: "mangalsutra", category: "Necklaces" },
    { key: "chain", category: "Necklaces" },
    { key: "cuff", category: "Bracelets" }
  ];

  // If a categoric item key exists in the query, the product must strictly matches:
  // Either belong to that category, or have the key specified directly in its title
  for (const item of categoryTerms) {
    if (normalizedQuery.includes(item.key)) {
      const matchCategory = j.category.toLowerCase() === item.category.toLowerCase();
      const matchTitle = j.name.toLowerCase().includes(item.key);
      if (!matchCategory && !matchTitle) {
        return false;
      }
    }
  }

  // All query terms must be present in Either title, category, or seoKeywords (tags)
  return terms.every(term => {
    // Check title/name
    if (j.name.toLowerCase().includes(term)) return true;
    // Check category
    if (j.category.toLowerCase().includes(term)) return true;
    // Check tags (seoKeywords)
    if (j.seoKeywords && j.seoKeywords.some((tag: string) => tag.toLowerCase().includes(term))) return true;
    
    return false;
  });
}

export function getMatchScore(j: Jewel, queryStr: string): number {
  const normalizedQuery = queryStr.toLowerCase().trim();
  if (!normalizedQuery) return 0;

  let score = 0;
  const nameLower = j.name.toLowerCase();
  
  // Exact name matches full query
  if (nameLower === normalizedQuery) {
    score += 100;
  }
  // Name starts with query
  else if (nameLower.startsWith(normalizedQuery)) {
    score += 50;
  }
  // Name includes query
  else if (nameLower.includes(normalizedQuery)) {
    score += 30;
  }

  // Exact category match
  if (j.category.toLowerCase() === normalizedQuery) {
    score += 40;
  }

  // Exact keyword match
  if (j.seoKeywords && j.seoKeywords.some((tag: string) => tag.toLowerCase() === normalizedQuery)) {
    score += 20;
  }

  return score;
}

interface ProductsSectionProps {
  jewels: Jewel[];
  onQuickView: (jewel: Jewel) => void;
  onAddToCart: (jewel: Jewel) => void;
  onToggleWishlist: (jewel: Jewel) => void;
  wishlistIds: string[];
  userEmail: string | null;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  showOnlyTrending: boolean;
  setShowOnlyTrending: (val: boolean) => void;
  onBuyNow?: (jewel: Jewel) => void;
  showOnlySale?: boolean;
  setShowOnlySale?: (val: boolean) => void;
  
  // Lifted AI Search states
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  aiInsight: string;
  setAiInsight: (val: string) => void;
  aiMatchedIds: string[] | null;
  setAiMatchedIds: (ids: string[] | null) => void;
  isAiLoading: boolean;
  setIsAiLoading: (val: boolean) => void;
  handleAiSearch: (e?: React.FormEvent) => Promise<void>;
}

export default function ProductsSection({
  jewels,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  userEmail,
  selectedCategory,
  setSelectedCategory,
  showOnlyTrending,
  setShowOnlyTrending,
  onBuyNow,
  showOnlySale,
  setShowOnlySale,
  
  searchQuery,
  setSearchQuery,
  aiInsight,
  setAiInsight,
  aiMatchedIds,
  setAiMatchedIds,
  isAiLoading,
  setIsAiLoading,
  handleAiSearch
}: ProductsSectionProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("popular");

  // Gallery view lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxProductName, setLightboxProductName] = useState("");

  // Trigger search view count tracker on the backend whenever product views list loaded
  const recordView = async (jId: string) => {
    try {
      await fetch("/api/customers/view-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, jewelId: jId })
      });
    } catch (e) {
      console.warn("Could not log view", e);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setAiMatchedIds(null);
    setAiInsight("");
    setSelectedCategory("All");
    setSelectedTheme("All");
    setSortBy("popular");
    setShowOnlyTrending(false);
    if (setShowOnlySale) {
      setShowOnlySale(false);
    }
  };

  // Filter & Sort logic combination
  const filteredJewels = jewels.filter(j => {
    // 1. AI Filter matches
    if (aiMatchedIds !== null && !aiMatchedIds.includes(j.id)) {
      return false;
    }
    // 2. Standard Category filter
    if (selectedCategory !== "All") {
      if (selectedCategory === "Mangalsutra" || selectedCategory === "Chains") {
        if (j.category !== "Necklaces") return false;
      } else if (selectedCategory === "For Man") {
        if (j.category !== "Bracelets" && j.category !== "Rings") return false;
      } else if (j.category !== selectedCategory) {
        return false;
      }
    }
    // 3. Theme filter
    if (selectedTheme !== "All" && j.theme !== selectedTheme) {
      return false;
    }
    // 4. "New Arrivals" (Trending) filter
    if (showOnlyTrending && !j.isTrending) {
      return false;
    }
    // 4b. "Sale" (Flash Sale) filter
    if (showOnlySale && !j.isFlashSale) {
      return false;
    }
    // 5. Strict search inquiry keyword matches
    if (searchQuery.trim()) {
      if (!matchesStrictKeyword(j, searchQuery)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    // Prioritize exact keyword/phrase matches at the top of the search result
    if (searchQuery.trim()) {
      const scoreA = getMatchScore(a, searchQuery);
      const scoreB = getMatchScore(b, searchQuery);
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // highest score first
      }
    }

    const aPrice = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price;
    const bPrice = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price;

    if (sortBy === "price-low") return aPrice - bPrice;
    if (sortBy === "price-high") return bPrice - aPrice;
    if (sortBy === "popular") return b.purchasesCount - a.purchasesCount;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <section id="boutique-collection" className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      {/* Editorial Title */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-gold-mid font-mono text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase">
          Maison Curation Archives
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-maroon-mid font-medium tracking-wide mt-2">
          The Vault of Aurelia
        </h2>
        <div className="h-0.5 w-16 bg-gold-mid/40 mx-auto my-4" />
        <p className="text-sm font-light text-neutral-500 leading-relaxed tracking-wide">
          Filter handcrafted rings, dangling drop pendants, and pristine gold cuffs by royal material palettes. Invoke our AI Gemologist scanner to reason semantically.
        </p>
      </div>

      {/* Main Filter Suite */}
      <div className="border-b border-gold-mid/10 pb-4 mb-8 flex flex-col lg:flex-row lg:justify-between items-center gap-4">
        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 select-none">
          {["All", "Rings", "Necklaces", "Earrings", "Bracelets"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2 rounded text-xs font-semibold tracking-wider transition-all duration-300 border uppercase ${
                selectedCategory === cat
                  ? "bg-maroon-mid text-[#FCFBF8] border-maroon-mid shadow-md"
                  : "border-gold-mid/10 text-neutral-600 hover:border-gold-mid/50 hover:bg-gold-light/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters dropdowns and tools */}
        <div className="flex flex-col items-center justify-center gap-3 w-full max-w-xl mx-auto text-xs px-2">
          {/* Multi-dropdown control row */}
          <div className="flex flex-row justify-between items-center w-full gap-4">
            {/* Theme selection */}
            <div className="flex items-center gap-2 flex-grow justify-start">
              <span className="text-neutral-500 font-mono text-[10px] sm:text-xs tracking-wide whitespace-nowrap select-none">Theme:</span>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="bg-[#FCFBF8] border border-gold-mid/20 hover:border-gold-mid/50 py-1.5 px-2 sm:px-3 rounded text-neutral-700 outline-none cursor-pointer transition-colors text-[11px] sm:text-xs w-full max-w-[150px] sm:max-w-[180px]"
              >
                <option value="All">All Themes</option>
                <option value="Gold">Pure Gold</option>
                <option value="Ivory">Sovereign Ivory</option>
                <option value="Maroon">Royal Maroon</option>
                <option value="Ensemble">Classic Combo</option>
              </select>
            </div>

            {/* Sort selection */}
            <div className="flex items-center gap-2 flex-grow justify-end">
              <span className="text-neutral-500 font-mono text-[10px] sm:text-xs tracking-wide whitespace-nowrap select-none">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#FCFBF8] border border-gold-mid/20 hover:border-gold-mid/50 py-1.5 px-2 sm:px-3 rounded text-neutral-700 outline-none cursor-pointer transition-colors text-[11px] sm:text-xs w-full max-w-[150px] sm:max-w-[180px]"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Dynamic Reset Button */}
          {(selectedCategory !== "All" || selectedTheme !== "All" || aiMatchedIds !== null || sortBy !== "popular") && (
            <button
              onClick={clearFilters}
              className="mt-1 p-2 px-3 rounded hover:bg-maroon-mid/5 border border-maroon-mid/20 text-maroon-mid flex items-center gap-1.5 animate-fadeIn"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid rendering */}
      {filteredJewels.length === 0 ? (
        <div className="border border-dashed border-gold-mid/20 rounded-lg p-16 text-center text-neutral-500 font-light max-w-lg mx-auto">
          <p className="font-serif text-lg mb-2 text-maroon-mid">No heirlooms matching this pattern</p>
          <p className="text-xs text-neutral-400">Pardon us, deary patron. Our workshop is continuously preparing custom requests. Try search alternatives or hit clear filters to resume catalog views.</p>
          <button
            onClick={clearFilters}
            className="mt-6 px-5 py-2.5 bg-gold-mid text-neutral-900 text-[10px] font-bold uppercase tracking-widest rounded"
          >
            Reset Catalog Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
          {filteredJewels.map((jewel) => {
            // Standardize pricing using helper logic so every item has a gorgeous strike-through price and discount %
            let salePrice = jewel.price;
            let originalPrice = jewel.price;
            let discount = 0;

            if (jewel.isFlashSale && jewel.flashSalePrice) {
              salePrice = jewel.flashSalePrice;
              originalPrice = jewel.price;
              discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
            } else {
              // Generate dynamic deterministic original price to display amazing Voylla-style discounts (e.g., 35%-55% off)
              const idNum = parseInt(jewel.id.replace(/\D/g, "")) || 3;
              const discountPercent = 35 + ((idNum * 8) % 21); // results in 35%, 43%, 51%, etc.
              salePrice = jewel.price;
              originalPrice = Math.round(salePrice / (1 - discountPercent / 100));
              discount = discountPercent;
            }

            const isWishlisted = wishlistIds.includes(jewel.id);

            return (
              <div
                key={jewel.id}
                className="group flex flex-col justify-between h-[300px] xs:h-[315px] sm:h-[415px] md:h-[435px] lg:h-[445px] bg-[#FCFBF8] border border-gold-mid/15 hover:border-gold-mid/45 rounded overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
              >
                {/* Visual Label Icons (Trending) - Left Top */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-white">
                  {jewel.isTrending && (
                    <span className="bg-maroon-mid/90 px-1.5 py-0.5 border border-gold-mid/30 rounded shadow-sm">
                      Trending
                    </span>
                  )}
                </div>

                {/* Voylla-Style Discount Badge - Top Right Corner - Floated Inside */}
                <div className="absolute top-3 right-3 z-10 bg-[#B33951] text-[#FCFBF8] text-[8px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-[3px] tracking-wide shadow-md select-none">
                  -{discount}% OFF
                </div>

                {/* Heart/Wishlist Button - Positioned beautifully inside the Image frame */}
                <button
                  onClick={() => onToggleWishlist(jewel)}
                  className={`absolute top-[44px] right-3 z-10 p-1.5 rounded-full bg-[#FCFBF8]/95 hover:bg-neutral-100 shadow-md border border-gold-mid/10 transition-all duration-200 cursor-pointer ${
                    isWishlisted ? "text-[#B33951]" : "text-neutral-500 hover:text-maroon-mid"
                  }`}
                  title="Toggle Wishlist"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-[#B33951] text-[#B33951]" : ""}`} />
                </button>
 
                {/* Cover Image - Perfectly equal squared size ratio */}
                <div 
                  className="aspect-square w-full overflow-hidden relative flex-shrink-0 cursor-pointer bg-white border-b border-gold-mid/10"
                  onClick={() => {
                    recordView(jewel.id);
                    // Open the full-screen lightbox when the image is clicked
                    setLightboxImages(getJewelImages(jewel));
                    setLightboxProductName(jewel.name);
                    setIsLightboxOpen(true);
                  }}
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={getPrimaryImage(jewel.image)}
                    alt={jewel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                    <span 
                      className="bg-gold-light/95 font-semibold text-[9px] sm:text-[10px] text-maroon-dark uppercase tracking-widest border border-gold-mid px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1 z-20 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Stop propagation so it doesn't open the full lightbox!
                        recordView(jewel.id);
                        onQuickView(jewel);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Quick View
                    </span>
                  </div>
                </div>
 
                {/* Text Metadata Details with Auto-Height Flex Alignment and Clean Spacing */}
                <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between overflow-hidden bg-white">
                  <div className="space-y-1 sm:space-y-2 flex-grow flex flex-col justify-between overflow-hidden">
                    
                    {/* Free Gift & Category Row */}
                    <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-mono tracking-wider overflow-hidden select-none">
                      <span className="text-[#800020] font-sans font-extrabold flex items-center gap-0.5 sm:gap-1 leading-none shrink-0">
                        🎁 Free Gift
                      </span>
                      <span className="text-neutral-500 truncate max-w-[65px] sm:max-w-none">{jewel.category}</span>
                    </div>

                    {/* Product Rating Block: Kalyan Jewellers style tiny status box */}
                    <div className="flex items-center gap-1 text-[8px] sm:text-[11px] select-none h-4 sm:h-5">
                      <div className="bg-emerald-600 text-white font-bold px-1 py-0.5 rounded text-[8px] sm:text-[10px] flex items-center gap-0.5 shadow-sm leading-none shrink-0">
                        <span>{jewel.rating}</span>
                        <span className="text-[7px] sm:text-[8px]">★</span>
                      </div>
                      <span className="text-neutral-300">|</span>
                      <span className="text-neutral-500 font-mono text-[9px] sm:text-[11px] font-medium leading-none truncate">
                        {jewel.reviews?.length || 24} reviews
                      </span>
                    </div>

                    {/* Product Text Details (Title fixed in 2-line auto-height container) */}
                    <h3 
                      onClick={() => {
                        recordView(jewel.id);
                        onQuickView(jewel);
                      }}
                      className="font-serif text-[11px] xs:text-[12px] sm:text-[14px] md:text-[14px] font-bold text-neutral-800 leading-tight sm:leading-snug tracking-wide group-hover:text-maroon-mid line-clamp-2 h-[30px] sm:h-[40px] overflow-hidden text-ellipsis transition-colors duration-150 cursor-pointer"
                      title={jewel.name}
                    >
                      {jewel.name}
                    </h3>

                    {/* Product Price: Old slashed & bold prices */}
                    <div className="border-t border-gold-mid/10 pt-1.5 sm:pt-2 flex items-baseline flex-wrap gap-1 sm:gap-1.5 mt-auto h-7 sm:h-9 overflow-hidden">
                      <span className="text-[#800020] font-extrabold text-[12px] min-[375px]:text-[13px] sm:text-base md:text-[17px] font-serif">
                        ₹{salePrice.toLocaleString()}
                      </span>
                      <span className="text-neutral-450 line-through text-[9px] sm:text-[11px] font-light">
                        ₹{originalPrice.toLocaleString()}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-Screen Image Lightbox & Zoom Viewer */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        images={lightboxImages}
        productName={lightboxProductName}
        onClose={() => setIsLightboxOpen(false)}
      />
    </section>
  );
}
