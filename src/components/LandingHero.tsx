import React, { useState, useEffect } from "react";
import { Clock, Gift, Star, ArrowRight, ShieldCheck, Gem } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    bgGradient: "from-[#0A120E] to-[#000000]",
    tag: "Limited Time. Unlimited Brilliance.",
    mainOffer: "Pay ₹299/gm*",
    subText: "MAKING CHARGES ON ALL DIAMOND JEWELLERY",
    desc: "Handcrafted in 18kt & 22kt pure Hallmarked gold & certified high-brilliance natural diamonds.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "AURELIA Inspired Premium Diamond Necklace Set"
  },
  {
    id: 2,
    bgGradient: "from-[#2C0A10] to-[#0D0204]",
    tag: "NEW ARRIVALS",
    mainOffer: "Flat 15% OFF",
    subText: "BRACELETS & BANGLES COLLECTION",
    desc: "Cast in magnificent 18kt rose gold & yellow gold with diamond highlight prongs.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Premium Bracelets and Bangles Collection"
  },
  {
    id: 3,
    bgGradient: "from-[#1C1504] to-[#070501]",
    tag: "FESTIVAL CELEBRATION",
    mainOffer: "Celebrate Elegance",
    subText: "FREE SHIPPING ON ALL ORDERS ABOVE ₹1,999",
    desc: "Cherish your festive alignments with customized hallmarked purity stamps and free insured express delivery.",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Festive Luxury Jewelry Set"
  }
];

export default function LandingHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 18 });
  const [startX, setStartX] = useState(0);

  // Auto-play interval - change slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Flash Sale countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 0, seconds: 0 }; // Loop simulation
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Swipe handlers for mobile touch
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    // minimum swipe threshold of 40px
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // swipe left -> next slide
        setActiveIndex(prev => (prev + 1) % SLIDES.length);
      } else {
        // swipe right -> previous slide
        setActiveIndex(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
      }
    }
  };

  return (
    <section className="relative w-full border-b border-gold-mid/20 bg-[#000000] overflow-hidden my-12 md:my-16">
      
      {/* Scrollable Track Container */}
      <div className="relative w-full overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full select-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {SLIDES.map((slide) => (
            <div 
              key={slide.id}
              className={`w-full flex-shrink-0 bg-gradient-to-r ${slide.bgGradient} transition-colors duration-500`}
            >
              <div className="relative min-h-[440px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[600px] w-full flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 md:py-8 gap-8">
                
                {/* Left Side: Luxury Offer Content */}
                <div className="w-full md:w-1/2 flex flex-col justify-center text-left space-y-4 sm:space-y-6 z-10">
                  
                  {/* Tag */}
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-mid animate-pulse"></span>
                    <span className="text-gold-mid text-[10px] sm:text-xs md:text-sm uppercase font-semibold font-sans tracking-[0.22em]">
                      {slide.tag}
                    </span>
                  </div>

                  {/* Heading / Main Offer */}
                  <div className="space-y-1 sm:space-y-2">
                    <h1 className="font-serif text-4xl sm:text-6xl md:text-5xl lg:text-7xl text-white font-extrabold tracking-wide leading-none">
                      {slide.mainOffer.includes("₹") ? (
                        <>Pay <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-mid to-gold-dark font-serif font-black">{slide.mainOffer}</span></>
                      ) : (
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-mid to-gold-dark font-serif font-black">{slide.mainOffer}</span>
                      )}
                    </h1>
                    <p className="text-[12px] sm:text-sm font-mono text-neutral-400 font-light select-none">
                      *Applicable on premium bookings
                    </p>
                  </div>

                  {/* Sub-text */}
                  <div className="border-l-2 border-[#D4AF37] pl-3 sm:pl-4 py-1">
                    <h3 className="font-sans text-sm sm:text-lg md:text-base lg:text-xl font-bold text-[#FCFBF8] tracking-widest uppercase leading-snug">
                      {slide.subText}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 font-light mt-1">
                      {slide.desc}
                    </p>
                  </div>

                  {/* Call to Actions */}
                  <div className="pt-4 flex flex-wrap gap-3">
                    <button 
                      onClick={() => {
                        const el = document.getElementById("boutique-collection");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-6 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-gold-mid to-gold-dark text-neutral-950 text-xs font-bold uppercase tracking-[0.2em] rounded-[4px] hover:from-gold-light hover:to-gold-mid transition-all duration-300 transform active:scale-95 shadow-md hover:shadow-lg hover:shadow-gold-mid/10 flex items-center gap-2 cursor-pointer"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        const el = document.getElementById("ai-smart-advisor");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-5 py-3 sm:px-6 sm:py-3.5 bg-transparent border border-neutral-700 hover:border-gold-mid text-[#F3EFE0] text-xs font-bold uppercase tracking-[0.2em] rounded-[4px] transition-all duration-300 flex items-center gap-2 cursor-pointer"
                    >
                      <Gem className="w-3.5 h-3.5 text-gold-mid" />
                      <span>AI Diamond Consult</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-2 text-[10px] text-neutral-400 font-mono select-none">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-mid" /> 100% Certified Diamonds
                    </span>
                    <span>•</span>
                    <span>BIS Hallmarked Gold</span>
                  </div>

                </div>

                {/* Right Side: High-Resolution Premium Jewels Photo */}
                <div className="w-full md:w-1/2 relative h-[300px] sm:h-[380px] md:h-[500px] lg:h-[540px] flex items-center justify-center overflow-hidden rounded-lg">
                  {/* Subtle background glow effect */}
                  <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gold-mid/5 blur-3xl -z-10" />
                  
                  <img 
                    src={slide.image} 
                    alt={slide.imageAlt} 
                    className="w-full h-full object-cover filter drop-shadow-[0_15px_30px_rgba(212,175,55,0.12)] hover:scale-102 transition-transform duration-700 ease-out select-none rounded-lg"
                  />
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Navigation Pagination Dots inside the slider block (positioned elegantly at the bottom center) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex 
                  ? "w-8 bg-gold-mid shadow-md shadow-gold-mid/40" 
                  : "w-2 bg-[#FCFBF8]/30 hover:bg-[#FCFBF8]/60"
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* Promos/Flash Sale Ticker & Badges */}
      <div className="bg-[#1C1817] shadow-inner text-[#F3EFE0] py-3.5 px-4 md:px-8 border-t border-gold-mid/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          
          {/* Flash Sale Countdown */}
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B33951] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B33951]"></span>
            </span>
            <div className="font-serif text-xs sm:text-sm tracking-wide flex items-center gap-2">
              <span className="text-gold-mid font-medium uppercase text-[10px] sm:text-xs">AURELIA Celebration Offer:</span>
              <span className="text-[#FCFBF8] font-bold">Flat 25% Off Making Charges for Walk-in Bookings today!</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Clock timer */}
            <div className="flex items-center gap-1.5 bg-[#800020]/20 border border-gold-mid/25 px-3.5 py-1.5 rounded text-xs font-mono font-bold text-gold-mid tracking-widest">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
              <span>{String(timeLeft.hours).padStart(2, '0')}H</span>:<span className="text-white">{String(timeLeft.minutes).padStart(2, '0')}M</span>:<span className="text-white">{String(timeLeft.seconds).padStart(2, '0')}S</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 text-[10px] sm:text-xs text-[#FCFBF8]/60 font-light font-mono">
              <Gift className="w-4 h-4 text-gold-mid" />
              <span>CODE: <strong className="text-gold-mid font-bold font-sans">AURELIA299</strong> (Lock Price)</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
