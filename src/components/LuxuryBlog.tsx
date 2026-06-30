import React from "react";
import { BookOpen, Calendar, User, Search, Hash, Globe, FileJson } from "lucide-react";
import { BlogItem } from "../types";

interface LuxuryBlogProps {
  blogs: BlogItem[];
}

export default function LuxuryBlog({ blogs }: LuxuryBlogProps) {
  // Simulated structured schema markup data displaying our SEO schema configurations
  const structuralSchema = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "name": "Maison d'Aurelia",
    "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
    "priceRange": "$$$$",
    "telephone": "+33 6 1234 5678",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "12 Place Vendôme",
      "addressLocality": "Paris",
      "postalCode": "75001",
      "addressCountry": "FR"
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12 animate-fadeIn">
      {/* Blog header block */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-gold-mid font-mono text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase">
          Maison Chronicles & Editorial Insight
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-maroon-mid font-medium tracking-wide">
          The Journal d'Aurelia
        </h2>
        <div className="h-0.5 w-16 bg-gold-mid/40 mx-auto my-3" />
        <p className="text-sm font-light text-neutral-500 leading-relaxed tracking-wide">
          Delve into traditional yellow gold wire pulling filigree techniques, Burmese pigeon's blood garnet history, and luxury styling philosophies.
        </p>
      </div>

      {/* Grid of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.map((item) => (
          <article
            key={item.id}
            className="bg-white border border-gold-mid/10 p-5 sm:p-6 rounded shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="h-64 w-full rounded overflow-hidden border border-gold-mid/10">
                <img
                  referrerPolicy="no-referrer"
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
              </div>

              <div className="flex gap-4 text-[10px] font-mono tracking-wider text-gold-dark uppercase font-semibold">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gold-mid" />
                  {item.date}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gold-mid" />
                  {item.author}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-[#1C1817] leading-snug tracking-wide">
                {item.title}
              </h3>

              <p className="text-xs text-neutral-500 leading-relaxed font-light">
                {item.summary}
              </p>

              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light font-sans pt-2 border-t border-gold-mid/10">
                {item.content}
              </p>
            </div>

            {/* Keyword tags (SEO Optimization) */}
            <div className="flex flex-wrap gap-2 pt-5 select-none text-[9px] font-mono uppercase text-neutral-500">
              {item.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="bg-gold-light/40 border border-gold-mid/10 rounded-full px-2.5 py-0.5 flex items-center gap-0.5"
                >
                  <Hash className="w-2.5 h-2.5" />
                  {kw}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* SEO Core Configurator Panel */}
      <div className="bg-[#1C1817] border border-gold-mid/25 p-5 sm:p-7 rounded-lg text-[#FCFBF8]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gold-mid/10">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gold-mid" />
            <h4 className="font-serif text-base font-bold text-gold-light">Google SEO Schema & Category Metadata</h4>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono uppercase font-bold py-0.5 px-2 rounded">
            Live JSON-LD Injected
          </span>
        </div>

        <p className="text-xs text-neutral-400 font-light mt-3 leading-relaxed">
          To comply with premium Jewelry search indexation standards, Maison d'Aurelia structures all product parameters inside the virtual DOM. Standard search crawlers parse material specs, SKU availability, and coordinates dynamically.
        </p>

        {/* Display JSON schema code beautifully */}
        <div className="mt-5 bg-black/40 border border-gold-mid/10 rounded p-4 text-[10px] sm:text-xs font-mono text-gold-mid/90 overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] text-[#FCFBF8]/40 pb-2 border-b border-white/5 mb-3">
            <span className="flex items-center gap-1"><FileJson className="w-4 h-4 text-gold-mid" /> structured-schema.jsonld</span>
            <span>SEO LEVEL: SUPREME</span>
          </div>
          <pre>{JSON.stringify(structuralSchema, null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}
