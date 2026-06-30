import React, { useState, useEffect } from "react";
import { X, Star, Sparkles, Check, ShoppingBag, ArrowRight, UserCheck } from "lucide-react";
import { Jewel, Review, getPrimaryImage } from "../types";
import ImageLightbox from "./ImageLightbox";
import { getJewelImages } from "./ProductsSection";

interface ProductDetailModalProps {
  jewel: Jewel;
  onClose: () => void;
  allJewels: Jewel[];
  onAddToCart: (jewel: Jewel) => void;
  onAddBundleToCart: (j1: Jewel, j2: Jewel) => void;
  onBuyNow?: (jewel: Jewel) => void;
}

export default function ProductDetailModal({
  jewel,
  onClose,
  allJewels,
  onAddToCart,
  onAddBundleToCart,
  onBuyNow
}: ProductDetailModalProps) {
  // Review form states
  const [reviewsList, setReviewsList] = useState<Review[]>(jewel.reviews);
  const [averageRating, setAverageRating] = useState<number>(jewel.rating);
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  // Gallery view lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Bundle offer product selection (Frequently Bought Together)
  const [fbtJewel, setFbtJewel] = useState<Jewel | null>(null);
  const [includeFbt, setIncludeFbt] = useState(true);

  // Search product of a similar theme or category for the FBT bundle recommendation
  useEffect(() => {
    const matching = allJewels.find(j => j.id !== jewel.id && (j.category === "Earrings" || j.theme === jewel.theme));
    setFbtJewel(matching || allJewels.find(j => j.id !== jewel.id) || null);
    // Reset review states on product shift
    setReviewsList(jewel.reviews);
    setAverageRating(jewel.rating);
    setReviewSuccess(false);
    setFormName("");
    setFormComment("");
  }, [jewel, allJewels]);

  // Handle Review submission directly connected to the server endpoint
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const response = await fetch("/api/jewels/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jewelId: jewel.id,
          customerName: formName || "Anonyme Patron",
          rating: formRating,
          comment: formComment
        })
      });
      const data = await response.json();
      if (data && data.success) {
        setReviewsList(data.reviews);
        setAverageRating(data.rating);
        setReviewSuccess(true);
        setFormComment("");
        setFormName("");
      }
    } catch (err) {
      console.error("Failed to post custom review", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Pricing calculations for individual and FBT packages
  const activePrice = jewel.isFlashSale && jewel.flashSalePrice ? jewel.flashSalePrice : jewel.price;
  
  // Standardize pricing using helper logic so every item has a gorgeous strike-through price and discount % matching the products grid
  let originalPrice = jewel.price;
  let discount = 0;

  if (jewel.isFlashSale && jewel.flashSalePrice) {
    originalPrice = jewel.price;
    discount = Math.round(((originalPrice - activePrice) / originalPrice) * 100);
  } else {
    // Generate dynamic deterministic original price to display amazing Voylla-style discounts (e.g., 35%-55% off)
    const idNum = parseInt(jewel.id.replace(/\D/g, "")) || 3;
    const discountPercent = 35 + ((idNum * 8) % 21); // results in 35%, 43%, 51%, etc.
    originalPrice = Math.round(activePrice / (1 - discountPercent / 100));
    discount = discountPercent;
  }

  const fbtPrice = fbtJewel ? (fbtJewel.isFlashSale && fbtJewel.flashSalePrice ? fbtJewel.flashSalePrice : fbtJewel.price) : 0;
  
  // 10% bundle coupon discount
  const bundleTotal = Math.round((activePrice + fbtPrice) * 0.9);

  // Dynamic adjustments to match image (Earrings vs Rings)
  const primaryImgUrl = getPrimaryImage(jewel.image);
  const isEarringsImage = primaryImgUrl && (primaryImgUrl.includes("photo-1535632066927-ab7c9ab60908") || primaryImgUrl.includes("1535632066927-ab7c9ab60908"));
  const cleanCategory = isEarringsImage ? "Earrings" : jewel.category;
  const cleanName = isEarringsImage 
    ? jewel.name.replace(/Ring/gi, "Earrings") 
    : jewel.name;

  // WhatsApp purchase payload link
  const whatsappNumber = "918445912476";
  const whatsappMessage = `नमस्ते Maison d'Aurelia, मैं इस आभूषण को खरीदना चाहता हूँ:\n\nनाम: ${cleanName}\nSKU: ${jewel.sku}\nश्रेणी: ${cleanCategory}\nअनुमानित मूल्य: ₹${activePrice.toLocaleString()}\n\nकृपया मुझे खरीद, अनुकूलन (Customization) और भुगतान से जुड़ी जानकारी प्रदान करें।`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-neutral-900/80 p-4 backdrop-blur-sm animate-fadeIn">
      {/* Container Card */}
      <div className="bg-[#FCFBF8] border-2 border-gold-mid/35 rounded max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col pt-10 sm:pt-4">
        {/* Absolute Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 text-neutral-600 hover:text-maroon-mid bg-gold-light/40 hover:bg-gold-light rounded-full border border-gold-mid/10 transition-colors shadow-sm cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Details Grid */}
        <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Pane and Metadata code */}
          <div className="space-y-4">
            <div 
              className="h-80 sm:h-96 w-full rounded overflow-hidden relative border border-gold-mid/10 bg-neutral-50 cursor-pointer group/modalimg flex items-center justify-center p-3"
              onClick={() => setIsLightboxOpen(true)}
              title="Click to view full-screen gallery"
            >
              <img
                referrerPolicy="no-referrer"
                src={primaryImgUrl}
                alt={cleanName}
                className="max-w-full max-h-full object-contain group-hover/modalimg:scale-102 transition-transform duration-700 select-none"
              />
              {/* Voylla-Style Discount Badge - Top Right Corner */}
              <div className="absolute top-3 right-3 z-10 bg-[#B33951] text-[#FCFBF8] text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-[4px] tracking-wide shadow-md select-none">
                -{discount}% OFF
              </div>
              <span className="absolute bottom-3 left-3 bg-neutral-900/90 text-gold-mid border border-gold-mid/35 px-3 py-1 font-mono text-[9px] tracking-widest rounded uppercase">
                {jewel.material}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono tracking-widest uppercase">
              <div className="bg-gold-light/40 border border-gold-mid/10 py-2.5 rounded">
                <span className="text-neutral-500 block">ITEM SKU</span>
                <span className="text-maroon-mid font-semibold block mt-0.5">{jewel.sku}</span>
              </div>
              <div className="bg-gold-light/40 border border-gold-mid/10 py-2.5 rounded">
                <span className="text-neutral-500 block">AVAILABILITY</span>
                <span className="text-maroon-mid font-semibold block mt-0.5">
                  {jewel.stock > 0 ? `${jewel.stock} Units Left` : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>

          {/* Core Buy / Action pane */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap justify-between items-center text-xs font-mono text-gold-dark uppercase tracking-widest gap-2 pr-12 md:pr-0">
                <span>Category: {cleanCategory}</span>
                <span>Theme: {jewel.theme} Aura</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1C1817] tracking-wide">
                {cleanName}
              </h1>

              {/* Star line */}
              <div className="flex items-center gap-1">
                <div className="flex text-gold-mid text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < Math.round(averageRating) ? "★" : "☆"}</span>
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-neutral-600">{averageRating} Index</span>
                <span className="text-xs text-neutral-400">({reviewsList.length} Verified Patrons)</span>
              </div>

              <p className="text-sm font-light text-neutral-600 leading-relaxed tracking-wide">
                {jewel.description}
              </p>

              {/* Price Line */}
              <div className="bg-gold-light/30 border-l-2 border-gold-mid py-2 pl-4 flex items-center gap-3 mt-4">
                <span className="text-[10px] text-[#800020] font-sans font-extrabold uppercase tracking-[0.2em]">SPECIAL PRICE:</span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-serif text-2xl font-bold text-[#800020]">
                    ₹{activePrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-400 line-through font-light">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-[#B33951] font-mono">
                    ({discount}% OFF)
                  </span>
                </div>
              </div>
            </div>

            {/* FBT Bundle Feature */}
            {fbtJewel && (
              <div className="bg-[#FAF9F5] border border-dashed border-neutral-350 rounded-lg p-4 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-sans text-neutral-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    OPTIONAL COMPLEMENTARY DEALS
                  </span>
                  <span className="bg-[#800020]/10 text-[#800020] border border-[#800020]/25 text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">
                    Save 10% on bundle
                  </span>
                </div>

                <label className="flex items-center gap-3.5 pt-1.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={includeFbt}
                    onChange={(e) => setIncludeFbt(e.target.checked)}
                    className="w-5 h-5 accent-[#800020] border-neutral-300 rounded cursor-pointer transition-all shrink-0"
                  />
                  <div className="h-14 w-14 rounded overflow-hidden border border-gold-mid/10 flex-shrink-0 bg-white">
                    <img referrerPolicy="no-referrer" src={fbtJewel.image} alt={fbtJewel.name} className="h-full w-full object-contain p-1" />
                  </div>
                  <div className="flex-1 text-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Matching Style Match</span>
                    <h4 className="font-bold font-serif text-neutral-800 tracking-wide group-hover:text-maroon-mid transition-colors">{fbtJewel.name}</h4>
                    <span className="text-neutral-500 font-light block mt-0.5">Optional add-on for ₹{fbtPrice.toLocaleString()}</span>
                  </div>
                </label>

                {includeFbt ? (
                  <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-neutral-200 text-xs">
                    <span className="font-medium text-neutral-500">Optional Bundle Price (10% Off Applied):</span>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 line-through text-[11px]">₹{(activePrice + fbtPrice).toLocaleString()}</span>
                      <span className="font-serif font-bold text-[#800020] text-sm">₹{bundleTotal.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-neutral-200 text-xs text-neutral-500 italic">
                    <span>Showing individual product price above. Check checkbox above to add bundle!</span>
                  </div>
                )}
              </div>
            )}

            {/* Direct Action triggers */}
            <div className="pt-4 flex flex-col">
              {includeFbt && fbtJewel ? (
                <button
                  onClick={() => {
                    onAddBundleToCart(jewel, fbtJewel);
                    onClose();
                  }}
                  className="w-full mb-3.5 py-3.5 bg-[#FCFBF8] hover:bg-[#FAF6EE] text-neutral-800 border border-neutral-300 hover:border-neutral-400 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 select-none cursor-pointer shadow-sm hover:shadow"
                >
                  <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                  <span>Add Bundle to cart</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAddToCart(jewel);
                    onClose();
                  }}
                  disabled={jewel.stock === 0}
                  className={`w-full mb-3.5 py-3.5 text-xs font-bold uppercase tracking-wider rounded-[4px] border flex items-center justify-center gap-2 transition-all duration-300 ${
                    jewel.stock === 0
                      ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                      : "bg-[#FCFBF8] text-neutral-800 border-neutral-300 hover:bg-[#FAF6EE] hover:border-neutral-450 active:scale-[0.99] select-none cursor-pointer shadow-sm hover:shadow"
                  }`}
                >
                  <ShoppingBag className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{jewel.stock === 0 ? "Sold Out" : "Add to cart"}</span>
                </button>
              )}

              {/* Purchase via Direct Checkout Action Button */}
              <button
                onClick={() => {
                  if (onBuyNow) {
                    onBuyNow(jewel);
                  } else {
                    const whatsappNumber = "918445912476";
                    const whatsappMessage = `नमस्ते Maison d'Aurelia, मैं इस आभूषण को खरीदना चाहता हूँ:\n\nनाम: ${cleanName}\nSKU: ${jewel.sku}\nश्रेणी: ${cleanCategory}\nअनुमानित मूल्य: ₹${activePrice.toLocaleString()}\n\nकृपया मुझे खरीद, अनुकूलन (Customization) और भुगतान से जुड़ी जानकारी प्रदान करें।`;
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                    window.open(whatsappUrl, "_blank");
                  }
                  onClose();
                }}
                disabled={jewel.stock === 0}
                className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-[4px] flex items-center justify-center gap-2 transition-all duration-300 ${
                  jewel.stock === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-[#800020] text-white hover:bg-[#600018] hover:scale-[1.01] active:scale-[0.99] shadow-sm select-none cursor-pointer"
                }`}
              >
                Buy it now
              </button>
            </div>
          </div>
        </div>

        {/* Division Tab: Product Reviews Submission & Viewing */}
        <div className="border-t border-gold-mid/15 p-5 sm:p-8 bg-[#FCFBF8]">
          <h3 className="font-serif text-lg font-bold text-maroon-dark tracking-wide mb-4">
            Customer Reviews ({reviewsList.length})
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Displaying existing reviews list */}
            <div className="lg:col-span-2 space-y-4 max-h-72 overflow-y-auto pr-3">
              {reviewsList.length === 0 ? (
                <p className="text-neutral-400 font-light text-xs italic">
                  No registered evaluations for this piece yet. Be the first to catalog your verification.
                </p>
              ) : (
                reviewsList.map((rev) => (
                  <div key={rev.id} className="border-b border-gold-mid/10 pb-3 flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-neutral-800">{rev.customerName}</span>
                        {rev.isVerified && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Maison purchase proven">
                            <UserCheck className="w-2.5 h-2.5" /> VERIFIED PATRON
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{rev.date}</span>
                    </div>
                    {/* Stars */}
                    <div className="text-gold-mid text-[10px]">{"★".repeat(rev.rating)}{"☆".repeat(5-rev.rating)}</div>
                    <p className="text-neutral-600 font-light italic leading-relaxed mt-1">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write review form widget */}
            <div className="border-t lg:border-t-0 lg:border-l border-gold-mid/20 pt-4 lg:pt-0 lg:pl-6 write-review-container-or-form-class">
              <h4 className="text-xs uppercase font-bold tracking-widest font-mono text-neutral-700 mb-3 block">
                WRITE A REVIEW
              </h4>

              {reviewSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs p-4 rounded text-center">
                  <p className="font-serif font-bold">Review Submitted Successfully</p>
                  <p className="text-neutral-500 font-light mt-1 text-[11px]">Thank you! Your feedback has been posted.</p>
                  <button
                    onClick={() => setReviewSuccess(false)}
                    className="mt-3 text-maroon-mid underline font-bold uppercase tracking-wider text-[10px]"
                  >
                    Post Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Charlotte Sterling"
                      className="w-full border border-gold-mid/20 rounded p-2 text-xs bg-white outline-none focus:border-maroon-mid transform duration-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Rating</label>
                    <select
                      value={formRating}
                      onChange={(e) => setFormRating(Number(e.target.value))}
                      className="w-full border border-gold-mid/20 rounded p-2 text-xs bg-white outline-none focus:border-maroon-mid text-neutral-800"
                    >
                      <option value="5">★★★★★ Supreme (5/5)</option>
                      <option value="4">★★★★☆ Excellent (4/5)</option>
                      <option value="3">★★★☆☆ Average (3/5)</option>
                      <option value="2">★★☆☆☆ Fair (2/5)</option>
                      <option value="1">★☆☆☆☆ Poor (1/5)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Your Review</label>
                    <textarea
                      required
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      placeholder="Share your experience with the jewelry quality, finish, and wear..."
                      rows={3}
                      className="w-full border border-gold-mid/20 rounded p-2 text-xs bg-white outline-none focus:border-maroon-mid transform duration-200 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-maroon-mid hover:bg-maroon-dark text-[#FCFBF8] border border-maroon-mid/30 font-bold py-2.5 rounded text-[10px] uppercase tracking-widest transition-all duration-300 transform active:scale-97 cursor-pointer"
                  >
                    {isSubmittingReview ? "Submitting..." : "SUBMIT REVIEW"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Image Lightbox & Zoom Viewer */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        images={getJewelImages(jewel)}
        productName={jewel.name}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}
