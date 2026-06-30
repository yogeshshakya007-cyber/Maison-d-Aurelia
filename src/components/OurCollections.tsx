import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

interface CollectionItem {
  name: string;
  subtitle: string;
  image: string;
  filter: string;
  desc: string;
}

const COLLECTIONS_DATA: CollectionItem[] = [
  {
    name: "Solis",
    subtitle: "Celestial Solar Brilliance",
    desc: "The golden warmth of the sun, hand-forged in royal 22kt filigree and vermeil.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    filter: "Necklaces"
  },
  {
    name: "Crown Star",
    subtitle: "Regal Starburst Solitaires",
    desc: "Prestige crown diamonds reflecting celestial light and unmatched high brilliance.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    filter: "Rings"
  },
  {
    name: "Aekta",
    subtitle: "Artisanal Heritage Harmony",
    desc: "A beautiful union of ancient temple engraving, imperial accents, and cultural legacy.",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800",
    filter: "All"
  },
  {
    name: "Desired",
    subtitle: "Contemporary Minimalist Allure",
    desc: "Sleek modern silhouettes sculpted in precious 18kt rose gold and diamond clusters.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    filter: "Bracelets"
  }
];

interface OurCollectionsProps {
  onSelectCollection: (filter: string) => void;
}

export default function OurCollections({ onSelectCollection }: OurCollectionsProps) {
  return (
    <motion.section
      id="our-collections-section"
      className="bg-[#FCFBF8] py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full border-t border-b border-gold-mid/10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Centered Editorial Title with Ornaments */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 mb-4">
          {/* Left Decorative Flourish */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="h-[1px] w-6 sm:w-16 md:w-24 bg-[#D4AF37]" />
            <div className="rotate-45 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#D4AF37] shrink-0" />
          </div>

          <h2 className="font-serif text-lg sm:text-2xl md:text-3xl lg:text-4xl text-[#800020] font-bold tracking-[0.2em] uppercase text-center whitespace-nowrap leading-none">
            Our Collections
          </h2>

          {/* Right Decorative Flourish */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="rotate-45 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#D4AF37] shrink-0" />
            <div className="h-[1px] w-6 sm:w-16 md:w-24 bg-[#D4AF37]" />
          </div>
        </div>

        <div className="text-center">
          <span className="text-[#D4AF37] font-mono text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.35em] uppercase block mb-3">
            Epitome of Royal Indian Artistry
          </span>
          <p className="text-xs sm:text-sm font-light text-neutral-500 leading-relaxed max-w-xl mx-auto tracking-wide">
            Traverse our hand-curated archives of high prestige. Each set whispers stories of ancient goldsmithing heritage balanced with visionary modernity.
          </p>
        </div>
      </div>

      {/* 2x2 Grid Layout with strict Horizontal (Landscape) Cards */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        {COLLECTIONS_DATA.map((col, idx) => (
          <motion.div
            key={col.name}
            id={`collection-card-${col.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="group relative overflow-hidden rounded-sm aspect-[3/2] bg-[#141110] shadow-md border border-[#D4AF37]/15 cursor-pointer"
            onClick={() => onSelectCollection(col.filter)}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
          >
            {/* Full-width Premium Image */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img
                src={col.image}
                alt={`${col.name} Collection`}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
              />
              {/* Premium Luxury Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 transition-opacity duration-300 group-hover:opacity-95" />
            </div>

            {/* Typography Content & Spacing */}
            <div className="absolute inset-0 p-2 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center z-10 select-none">
              
              {/* Collection Name */}
              <h3 className="font-serif text-xs sm:text-xl md:text-2xl lg:text-3xl text-[#FCFBF8] font-bold tracking-[0.2em] uppercase mb-0.5 sm:mb-1 drop-shadow-md">
                {col.name}
              </h3>

              {/* Decorative Gold Divider Accent Line */}
              <div className="h-[1px] w-4 sm:w-10 bg-[#D4AF37] my-1 sm:my-3.5 group-hover:w-14 transition-all duration-500" />

              {/* Short Premium Subtitle */}
              <span className="font-sans text-[7px] sm:text-[9px] md:text-[10px] lg:text-[11px] text-[#EAD0A8] uppercase tracking-[0.2em] font-semibold leading-tight max-w-[120px] sm:max-w-xs block mb-0.5 sm:mb-1 opacity-95">
                {col.subtitle}
              </span>

              {/* Detailed elegant description (visible on tablet and larger screens) */}
              <p className="hidden sm:block font-sans text-[8px] md:text-[10px] lg:text-[11px] text-neutral-300 font-light max-w-xs md:max-w-md leading-relaxed tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                {col.desc}
              </p>

              {/* Interactive subtle discover label */}
              <span className="text-[6.5px] sm:text-[8px] md:text-[9.5px] text-[#FCFBF8] font-mono uppercase tracking-[0.25em] mt-1 sm:mt-3.5 flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                Discover <ArrowUpRight className="w-1.5 sm:w-2 md:w-2.5 h-1.5 sm:h-2 md:h-2.5 text-[#D4AF37]" />
              </span>

            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
