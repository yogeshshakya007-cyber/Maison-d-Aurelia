import React, { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

interface SquareCategory {
  name: string;
  image: string;
  filter: string;
}

const SQUARE_CATEGORIES: SquareCategory[] = [
  { 
    name: "Sets", 
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=500", 
    filter: "Necklaces" 
  },
  { 
    name: "Earrings", 
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=500", 
    filter: "Earrings" 
  },
  { 
    name: "Rings", 
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=500", 
    filter: "Rings" 
  },
  { 
    name: "Bracelets", 
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=500", 
    filter: "Bracelets" 
  },
  { 
    name: "Pendants", 
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=500", 
    filter: "Necklaces" 
  },
  { 
    name: "All Jewelry", 
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=500", 
    filter: "All" 
  }
];

interface HeroSlide {
  id: number;
  label: string;
  title: string;
  tagline: string;
  image: string;
  filter: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    label: "THE CAVE CHRONICLES",
    title: "Cave Chronicles",
    tagline: "Earthy, raw, and absolutely timeless hand-cast gold masterpieces.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200",
    filter: "Necklaces"
  },
  {
    id: 2,
    label: "SOLITAIRE SYMPHONIES",
    title: "Prism Solitaires",
    tagline: "Indulge in certified high-brilliance natural flawless diamonds.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200",
    filter: "Rings"
  },
  {
    id: 3,
    label: "ARTISANAL HEIRLOOM",
    title: "Imperial Antiquities",
    tagline: "Intricately detailed 22kt premium traditional temple craft revival.",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200",
    filter: "All"
  }
];

interface AureliaHeroSectionProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export default function AureliaHeroSection({
  selectedCategory,
  setSelectedCategory
}: AureliaHeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-slide effect to cycle every 4.5 seconds smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleShopNowClick = (filter: string) => {
    setSelectedCategory(filter);
    const el = document.getElementById("boutique-collection");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="aurelia-home-hero-collection" className="w-full bg-[#FCFBF8]">
      
      {/* 1. Upper Section: Square Product Catalogue/Cards Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-6">
        <div className="flex flex-col space-y-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-2.5 gap-2">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#800020] tracking-wider uppercase">
              Curated Collections
            </h3>
            <span className="text-xs sm:text-sm md:text-base font-sans font-semibold text-neutral-800 uppercase tracking-wide block">
              Select Category To Filter Catalog
            </span>
          </div>

          {/* Square Cards horizontal row */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth select-none snap-x snap-mandatory">
            {SQUARE_CATEGORIES.map((cat, idx) => {
              const isActive = selectedCategory === cat.filter;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat.filter);
                    const el = document.getElementById("boutique-collection");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  id={`cat-card-${cat.name.toLowerCase()}`}
                  className="flex flex-col items-center space-y-3 focus:outline-none group flex-shrink-0 snap-start text-center cursor-pointer"
                >
                  {/* Square container 1:1 Aspect ratio */}
                  <div className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-neutral-100 rounded-sm overflow-hidden p-[2px] transition-all duration-300 transform group-hover:scale-[1.03] ${
                    isActive 
                      ? "ring-2 ring-[#800020] shadow-sm"
                      : "border border-neutral-200"
                  }`}>
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-sm transition-transform duration-500 group-hover:scale-105" 
                      id={`cat-img-${cat.name.toLowerCase()}`}
                    />
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 bg-[#800020] text-[#FCFBF8] p-0.5 rounded-full shadow">
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Category Title Typography */}
                  <span className={`text-[13px] sm:text-sm font-serif font-bold tracking-wide transition-colors duration-200 block text-center ${
                    isActive ? "text-[#800020]" : "text-neutral-900 group-hover:text-[#800020]"
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* 2. Lower Section: Premium Hero Banner Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-8">
        <div className="relative w-full aspect-[21/9] min-h-[280px] sm:min-h-[380px] md:min-h-[440px] bg-[#111] overflow-hidden rounded-sm shadow-md border border-neutral-100">
          
          {/* Slider Slides Track */}
          <div className="relative w-full h-full">
            {HERO_SLIDES.map((slide, idx) => {
              const isCurrent = idx === activeSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out flex items-center ${
                    isCurrent ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-[1.01]"
                  }`}
                >
                  {/* Background Image Canvas - Jewelry product flows elegantly across */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-[4500ms] ease-out scale-[1.03]"
                    />
                    {/* Deep gradient overlay that darkens towards the right side on desktop/tablet to make text pop */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/85 md:from-black/55 md:via-black/50 md:to-black/85 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  {/* Split Layout Content Area: Right side aligned subtle card element with pure elegance */}
                  <div className="absolute inset-y-0 right-0 w-full md:w-[48%] flex flex-col justify-center items-start px-6 sm:px-10 lg:px-12 z-20 text-left select-none space-y-3 sm:space-y-4 md:space-y-5">
                    
                    {/* Gold Label Label */}
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                      <span className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
                        {slide.label}
                      </span>
                    </div>

                    {/* Highly stylized title heading */}
                    <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-5xl text-white font-extrabold tracking-wide leading-tight drop-shadow-sm">
                      {slide.title}
                    </h2>

                    {/* Secondary tagline */}
                    <p className="font-sans text-[11px] sm:text-xs md:text-sm text-neutral-300 font-light max-w-sm sm:max-w-md tracking-wide leading-relaxed">
                      {slide.tagline}
                    </p>

                    {/* Solid White Rectangular 'SHOP NOW' Button */}
                    <button
                      onClick={() => handleShopNowClick(slide.filter)}
                      id={`hero-shop-button-${idx}`}
                      className="px-6 py-2.5 sm:px-8 sm:py-3.5 bg-white text-neutral-900 text-[10px] sm:text-xs font-bold font-sans uppercase tracking-[0.18em] rounded-sm hover:bg-[#800020] hover:text-white transition-all duration-300 shadow-lg active:scale-[0.97] cursor-pointer"
                    >
                      Shop Now
                    </button>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Indicators centered at the bottom */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex items-center space-x-2.5 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                  activeSlide === idx 
                    ? "w-7 bg-[#FCFBF8] shadow-inner" 
                    : "w-2.5 bg-neutral-400/40 hover:bg-neutral-300"
                }`}
                title={`Select Slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
