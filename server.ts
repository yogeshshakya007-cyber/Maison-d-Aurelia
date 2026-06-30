import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { Jewel, Order, ReturnRequest, CustomerProfile, Campaign, BlogItem, Coupon, Review } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy_key",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Supabase Database Mappers to bridge the camelCase TypeScript interfaces to snake_case Postgres DB rows
function mapJewelFromDb(row: any): Jewel {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    price: Number(row.price),
    category: row.category,
    material: row.material || "",
    theme: row.theme,
    stock: Number(row.stock),
    image: row.image || "",
    views: Number(row.views || 0),
    purchasesCount: Number(row.purchases_count || 0),
    rating: Number(row.rating || 5.0),
    reviews: Array.isArray(row.reviews) ? row.reviews : (typeof row.reviews === 'string' ? JSON.parse(row.reviews) : []),
    isTrending: !!row.is_trending,
    isFlashSale: !!row.is_flash_sale,
    flashSalePrice: row.flash_sale_price ? Number(row.flash_sale_price) : undefined,
    sku: row.sku || "",
    seoKeywords: Array.isArray(row.seo_keywords) ? row.seo_keywords : []
  };
}

function mapJewelToDb(j: Jewel) {
  return {
    id: j.id,
    name: j.name,
    description: j.description,
    price: j.price,
    category: j.category,
    material: j.material,
    theme: j.theme,
    stock: j.stock,
    image: j.image,
    views: j.views,
    purchases_count: j.purchasesCount,
    rating: j.rating,
    is_trending: j.isTrending,
    is_flash_sale: j.isFlashSale,
    flash_sale_price: j.flashSalePrice || null,
    sku: j.sku,
    seo_keywords: j.seoKeywords,
    reviews: j.reviews
  };
}

function mapOrderFromDb(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone || "",
    items: Array.isArray(row.items) ? row.items : (typeof row.items === 'string' ? JSON.parse(row.items) : []),
    total: Number(row.total),
    discountApplied: Number(row.discount_applied || 0),
    status: row.status || "Pending",
    trackingCode: row.tracking_code || "",
    date: row.date || "",
    whatsappNotifications: !!row.whatsapp_notifications,
    notes: row.notes || "",
    pincode: row.pincode || "",
    city: row.city || "",
    state: row.state || "",
    houseAddress: row.house_address || "",
    landmark: row.landmark || "",
    customSizeOrEngraving: row.custom_size_or_engraving || ""
  };
}

function mapOrderToDb(o: Order) {
  return {
    id: o.id,
    customer_name: o.customerName,
    customer_email: o.customerEmail,
    customer_phone: o.customerPhone,
    items: o.items,
    total: o.total,
    discount_applied: o.discountApplied,
    status: o.status,
    tracking_code: o.trackingCode,
    date: o.date,
    whatsapp_notifications: o.whatsappNotifications,
    notes: o.notes || null,
    pincode: o.pincode || null,
    city: o.city || null,
    state: o.state || null,
    house_address: o.houseAddress || null,
    landmark: o.landmark || null,
    custom_size_or_engraving: o.customSizeOrEngraving || null
  };
}

function mapReturnFromDb(row: any): ReturnRequest {
  return {
    id: row.id,
    orderId: row.order_id,
    customerName: row.customer_name,
    jewelName: row.jewel_name,
    reason: row.reason || "",
    status: row.status || "Pending",
    date: row.date || ""
  };
}

function mapReturnToDb(r: ReturnRequest) {
  return {
    id: r.id,
    order_id: r.orderId,
    customer_name: r.customerName,
    jewel_name: r.jewelName,
    reason: r.reason,
    status: r.status,
    date: r.date
  };
}

function mapCustomerFromDb(row: any): CustomerProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    segment: row.segment || "Enthusiast",
    totalSpent: Number(row.total_spent || 0),
    purchaseCount: Number(row.purchase_count || 0),
    clv: Number(row.clv || 0),
    viewsList: Array.isArray(row.views_list) ? row.views_list : [],
    cartAbandoned: !!row.cart_abandoned,
    dateJoined: row.date_joined || ""
  };
}

function mapCustomerToDb(c: CustomerProfile) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    segment: c.segment,
    total_spent: c.totalSpent,
    purchase_count: c.purchaseCount,
    clv: c.clv,
    views_list: c.viewsList,
    cart_abandoned: c.cartAbandoned,
    date_joined: c.dateJoined
  };
}

function mapCampaignFromDb(row: any): Campaign {
  return {
    id: row.id,
    name: row.name,
    channel: row.channel,
    audience: row.audience || "",
    subjectOrHeader: row.subject_or_header || "",
    body: row.body || "",
    sentDate: row.sent_date || "",
    sentCount: Number(row.sent_count || 0),
    opensCount: Number(row.opens_count || 0),
    clicksCount: Number(row.clicks_count || 0)
  };
}

function mapCampaignToDb(c: Campaign) {
  return {
    id: c.id,
    name: c.name,
    channel: c.channel,
    audience: c.audience,
    subject_or_header: c.subjectOrHeader,
    body: c.body,
    sent_date: c.sentDate,
    sent_count: c.sentCount,
    opens_count: c.opensCount,
    clicks_count: c.clicksCount
  };
}


// In-Memory Database State for a true interactive high-fidelity demonstration
let jewels: Jewel[] = [
  {
    id: "j1",
    name: "Sovereign Ruby Choker",
    description: "A breathtaking neckpiece meticulously handcrafted in 22k gold vermeil. Features a central oval-cut royal maroon Burmese ruby synthetic crystal, bordered by ivory-toned seed pearls and delicate filigree work.",
    price: 1499,
    category: "Necklaces",
    material: "22K Gold Plated, Maroon Ruby Crystal, Ivory Seed Pearls",
    theme: "Maroon",
    stock: 5,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
    views: 450,
    purchasesCount: 12,
    rating: 4.9,
    isTrending: true,
    isFlashSale: false,
    sku: "AU-NKL-001",
    seoKeywords: ["luxury choker", "maroon ruby necklace", "gold royal filigree", "Burmese ruby"],
    reviews: [
      { id: "r1", customerName: "Duchess Eleanor", rating: 5, comment: "An heirloom of breathtaking caliber. The gold work is divine.", date: "2026-05-12", isVerified: true },
      { id: "r2", customerName: "Amelia Thorne", rating: 5, comment: "Stunning maroon rubies. Caught everyone's attention at the gala.", date: "2026-05-24", isVerified: true }
    ]
  },
  {
    id: "j2",
    name: "Vermeil Ivory Blossom Ring",
    description: "An exquisite statement ring presenting a hand-carved white ivory resin rose, nestled within deep maroon garnet petals and framed by leaf-patterned solid yellow gold borders.",
    price: 499,
    category: "Rings",
    material: "18K Gold Plated, Maroon Garnet Glass, Carved Resin Ivory",
    theme: "Ensemble",
    stock: 8,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600",
    views: 310,
    purchasesCount: 6,
    rating: 4.8,
    isTrending: false,
    isFlashSale: true,
    flashSalePrice: 399,
    sku: "AU-RNG-002",
    seoKeywords: ["gold blossom ring", "luxury ivory rose ring", "garnet gemstone", "Maison design"],
    reviews: [
      { id: "r3", customerName: "Sir Reginald Vance", rating: 5, comment: "I purchased this as an anniversary gift. Exceptional detailing.", date: "2026-04-18", isVerified: true }
    ]
  },
  {
    id: "j3",
    name: "Empress Maroon Drop Earrings",
    description: "Elegant droplets of cushion-cut Mozambique garnets simulated stones suspended from pristine 18k yellow gold plated filigree posts. Finished with ivory-white glaze accents for the ultimate imperial look.",
    price: 349,
    category: "Earrings",
    material: "18K Gold Plated, Mozambique Simulated Garnet, Ivory Enamel",
    theme: "Maroon",
    stock: 4,
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600",
    views: 289,
    purchasesCount: 7,
    rating: 4.7,
    isTrending: true,
    isFlashSale: false,
    sku: "AU-EAR-003",
    seoKeywords: ["drop earrings", "garnet earrings", "luxury gold drops", "ivory royal earrings"],
    reviews: [
      { id: "r4", customerName: "Lady Georgina", rating: 4, comment: "Extremely lightweight and gorgeous color pairing. Suits evening wear perfectly.", date: "2026-05-01", isVerified: true }
    ]
  },
  {
    id: "j4",
    name: "Aurelia Byzantine Cuff",
    description: "A heavy, masterfully woven Byzantine-link bracelet in 18k gold vermeil, featuring polished maroon carnelian beads and subtle ivory pearl drops representing absolute luck.",
    price: 799,
    category: "Bracelets",
    material: "18K Gold Plated, Carnelian Cabochons, Baroque Pearls",
    theme: "Gold",
    stock: 2,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
    views: 412,
    purchasesCount: 9,
    rating: 5.0,
    isTrending: true,
    isFlashSale: false,
    sku: "AU-BRC-004",
    seoKeywords: ["byzantine bracelet", "gold cuff", "carnelian jewellery", "ivory baroque pearls"],
    reviews: [
      { id: "r5", customerName: "Constance Croft", rating: 5, comment: "An architectural marvel in gold! Looks very luxurious on the wrist.", date: "2026-06-03", isVerified: true }
    ]
  },
  {
    id: "j5",
    name: "L'Amour Garnet Pendant",
    description: "A delicate, shimmering 24k gold plated necklace holding a masterfully carved heart-cut maroon simulated garnet, offset by an exquisite miniature ivory-white freshwater pearl.",
    price: 599,
    category: "Necklaces",
    material: "24K Gold Plated, Garnet Heart Crystal, Freshwater Pearl",
    theme: "Ensemble",
    stock: 12,
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=600",
    views: 520,
    purchasesCount: 22,
    rating: 4.9,
    isTrending: true,
    isFlashSale: true,
    flashSalePrice: 499,
    sku: "AU-NKL-005",
    seoKeywords: ["heart pendant", "gold garnet chain", "pearl jewelry", "minimalist luxury"],
    reviews: [
      { id: "r6", customerName: "Phoebe Vance", rating: 5, comment: "I wear this daily. Pure romantic luxury.", date: "2026-06-10", isVerified: true }
    ]
  },
  {
    id: "j6",
    name: "Aesthetic Ivory Marquise Earrings",
    description: "Crafted for connoisseurs of old-world royalty. Features marquise-cut ivory resin cabochons set flat on intricate floral crowns of maroon rubies in gold filigree earring casing.",
    price: 449,
    category: "Earrings",
    material: "18K Gold Plated, White Cabochon, Maroon Rubies",
    theme: "Ivory",
    stock: 6,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
    views: 198,
    purchasesCount: 4,
    rating: 4.6,
    isTrending: false,
    isFlashSale: false,
    sku: "AU-EAR-006",
    seoKeywords: ["marquise earrings", "ivory cabochon earrings", "royal jewel crown", "ruby border earrings"],
    reviews: []
  },
  {
    id: "j7",
    name: "Elysian Pearl Hoop Drops",
    description: "Classic high-luster ivory-style pearls on standard wide 18k gold plated bands. A timeless pairing of maroon ruby studs with dangling ivory drops suitable for modern royalty.",
    price: 349,
    category: "Earrings",
    material: "18K Gold Plated, Luster Ivory Pearls, Ruby Studs",
    theme: "Ivory",
    stock: 9,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600",
    views: 340,
    purchasesCount: 15,
    rating: 5.0,
    isTrending: false,
    isFlashSale: false,
    sku: "AU-EAR-007",
    seoKeywords: ["pearl hoops", "ruby stud accessories", "ivory drop earrings", "Maison earrings"],
    reviews: [
      { id: "r7", customerName: "Samantha Sterling", rating: 5, comment: "Perfect classic look. Highly Lustrous!", date: "2026-05-30", isVerified: true }
    ]
  },
  {
    id: "j8",
    name: "Adonis Ruby Link Bracelet",
    description: "An elegant sequence of faceted deep maroon ruby rounds alternating with intricate gold plated bead spacers, equipped with a custom-engineered signature safety hook clasp.",
    price: 899,
    category: "Bracelets",
    material: "22K Gold Plated, Maroon Rubies",
    theme: "Maroon",
    stock: 3,
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600",
    views: 245,
    purchasesCount: 5,
    rating: 4.9,
    isTrending: false,
    isFlashSale: false,
    sku: "AU-BRC-008",
    seoKeywords: ["ruby bracelet", "luxury red link", "fine maroon wristlet", "precious gold chain"],
    reviews: []
  }
];

let orders: Order[] = [
  {
    id: "ORD-9482",
    customerName: "Charlotte de Bourgogne",
    customerEmail: "charlotte.bourgogne@patron.com",
    customerPhone: "+33 6 1234 5678",
    items: [
      { jewelId: "j1", name: "Sovereign Ruby Choker", price: 1499, quantity: 1 }
    ],
    total: 1499,
    discountApplied: 0,
    status: "Quality Check",
    trackingCode: "TRK-SOV-8374",
    date: "2026-06-13",
    whatsappNotifications: true,
    customSizeOrEngraving: "Engraving: 'A.D. 1430'"
  },
  {
    id: "ORD-2391",
    customerName: "Sir Reginald Vance",
    customerEmail: "reginald.vance@vancemanor.org",
    customerPhone: "+44 7911 123456",
    items: [
      { jewelId: "j2", name: "Vermeil Ivory Blossom Ring", price: 399, quantity: 1 }
    ],
    total: 399,
    discountApplied: 100,
    status: "Shipped",
    trackingCode: "TRK-IVY-1102",
    date: "2026-06-10",
    whatsappNotifications: true
  }
];

let returnRequests: ReturnRequest[] = [
  {
    id: "RET-0102",
    orderId: "ORD-2391",
    customerName: "Sir Reginald Vance",
    jewelName: "Vermeil Ivory Blossom Ring",
    reason: "Slight size variance, would like to exchange for custom size 7.",
    status: "Pending",
    date: "2026-06-12"
  }
];

let customers: CustomerProfile[] = [
  {
    id: "c1",
    name: "Charlotte de Bourgogne",
    email: "charlotte.bourgogne@patron.com",
    phone: "+33 6 1234 5678",
    segment: "VVIP Patron",
    totalSpent: 4500,
    purchaseCount: 3,
    clv: 6750,
    viewsList: ["j1", "j4", "j3"],
    cartAbandoned: false,
    dateJoined: "2025-01-14"
  },
  {
    id: "c2",
    name: "Sir Reginald Vance",
    email: "reginald.vance@vancemanor.org",
    phone: "+44 7911 123456",
    segment: "Aesthetic Collector",
    totalSpent: 1200,
    purchaseCount: 2,
    clv: 1800,
    viewsList: ["j2", "j5"],
    cartAbandoned: false,
    dateJoined: "2025-03-22"
  },
  {
    id: "c3",
    name: "Lady Georgina Sterling",
    email: "georgina@sterlingmanor.co",
    phone: "+1 202 555 0143",
    segment: "Enthusiast",
    totalSpent: 349,
    purchaseCount: 1,
    clv: 520,
    viewsList: ["j3", "j1", "j5", "j6"],
    cartAbandoned: true,
    dateJoined: "2025-11-05"
  }
];

let campaigns: Campaign[] = [
  {
    id: "camp1",
    name: "Summer Solstice Crimson Collection Launch",
    channel: "WhatsApp",
    audience: "VVIP Patrons & Collectors",
    subjectOrHeader: "The Royal Crimson Beckons",
    body: "Salutations, cherished patron. Maison d'Aurelia is pleased to invite you to an exclusive virtual tasting of Burmese Ruby chokers. Reply VIP to reserve an online viewing with our master jeweler.",
    sentDate: "2026-06-12",
    sentCount: 154,
    opensCount: 148,
    clicksCount: 92
  },
  {
    id: "camp2",
    name: "Ivory Enamel Heirlooms Newsletter",
    channel: "Email",
    audience: "All Subscribers",
    subjectOrHeader: "The Ivory & Ruby Narrative - Collection Elysian",
    body: "Cherished connoisseurs, this evening we explore the timeless history of ivory enamelling paired with Burmese garnet details. Read the Maison chronicle and earn 500 loyalty points.",
    sentDate: "2026-06-08",
    sentCount: 1205,
    opensCount: 840,
    clicksCount: 310
  }
];

const coupons: Coupon[] = [
  { code: "ROYAL20", discountType: "percentage", value: 20, minAmount: 500 },
  { code: "GOLDEN10", discountType: "percentage", value: 10 },
  { code: "MAISON150", discountType: "fixed", value: 150, minAmount: 1000 }
];

let blogPosts: BlogItem[] = [
  {
    id: "b1",
    title: "Filigree and Faith: Handcrafting Yellow Gold in the Modern Era",
    summary: "Refining historical 22k gold handweaving techniques tailored for modern high-society events.",
    content: "The creation of fine yellow gold filigree demands a meticulous convergence of high-purity metals and steady hands under intense loupe examination. At Maison d'Aurelia, each golden lace requires hours of annealing, pulling wire through fine diamonds dies, and micro-welding onto maroon foundations. In this editorial, we sit down with our Lead Goldsmith, Henri, to dissect how high-purity vermeil captures candlelight unlike any modern machine.",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=400",
    date: "2026-06-11",
    author: "Henri Laurent, Lead Goldsmith",
    keywords: ["gold filigree", "handcrafted jewellery", "22k gold wire", "artisan goldsmith"]
  },
  {
    id: "b2",
    title: "Symbolism of Maroon Burma Rubies and Pearls",
    summary: "Discovering why high-contrast royal crimson and ivory tones dominated European nobility archives.",
    content: "Dating back to the Renaissance, high-contrast jewelry pairings involving Burmese rubies (known as Pigeon's Blood or Maroon) and lustrous white pearls represented an alliance of bloodlines and pure spiritual light. Ivory resins and pearls provide a quiet cream background that absorbs harsh spectral glare, letting the fiery maroon ruby scatter amber embers under warm candlelight. Maison d'Aurelia honors this classic dynasty contrast throughout the entire Elysian ensemble.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400",
    date: "2026-06-05",
    author: "Countess Isabella Sterling, Jewelry Historian",
    keywords: ["ruby history", "gothic aesthetics", "burma maroon", "ivory pearls"]
  }
];

// Helper to check and fallback Gemini response safely
function cleanAIResponse(txt: string | undefined): string {
  if (!txt) return "";
  // Remove markdown code block if model returned it as a wrapper
  let formatted = txt.trim();
  if (formatted.startsWith("```json")) {
    formatted = formatted.substring(7);
  } else if (formatted.startsWith("```")) {
    formatted = formatted.substring(3);
  }
  if (formatted.endsWith("```")) {
    formatted = formatted.substring(0, formatted.length - 3);
  }
  return formatted.trim();
}

// API Endpoints
app.get("/api/jewels", (req, res) => {
  res.json(jewels);
});

app.post("/api/jewels/review", (req, res) => {
  const { jewelId, customerName, rating, comment } = req.body;
  const jewel = jewels.find(j => j.id === jewelId);
  if (!jewel) {
    return res.status(404).json({ error: "Jewel not found" });
  }
  
  const newReview: Review = {
    id: "rev-" + Date.now(),
    customerName: customerName || "Anonyme Patron",
    rating: Number(rating) || 5,
    comment: comment || "",
    date: new Date().toISOString().split('T')[0],
    isVerified: true
  };

  jewel.reviews.push(newReview);
  
  // Recalculate average rating
  const totalRating = jewel.reviews.reduce((acc, r) => acc + r.rating, 0);
  jewel.rating = parseFloat((totalRating / jewel.reviews.length).toFixed(1));

  if (supabase) {
    supabase.from("jewels")
      .update({ reviews: jewel.reviews, rating: jewel.rating })
      .eq("id", jewelId)
      .then(({ error }) => {
        if (error) console.error("[Supabase] Failed to update reviews:", error);
      });
  }

  res.json({ success: true, reviews: jewel.reviews, rating: jewel.rating });
});

// Add new jewel (Admin inventory)
app.post("/api/jewels", (req, res) => {
  const { name, description, price, category, material, theme, stock, image, isTrending, isFlashSale, flashSalePrice, sku } = req.body;
  
  if (!name || !price || !category || !theme) {
    return res.status(400).json({ error: "Missing required fields: name, price, category, and theme are required." });
  }

  if (sku) {
    const normalizedSku = sku.trim().toUpperCase();
    const duplicate = jewels.find(j => j.sku && j.sku.trim().toUpperCase() === normalizedSku);
    if (duplicate) {
      return res.status(400).json({ error: `Duplicate SKU: ${sku} is already assigned to another product!` });
    }
  }

  const id = "jwl-" + Date.now();
  const newJewel: Jewel = {
    id,
    name,
    description: description || "",
    price: Number(price),
    category,
    material: material || "Gold",
    theme,
    stock: stock !== undefined ? Number(stock) : 10,
    image: image || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600",
    views: 0,
    purchasesCount: 0,
    rating: 5.0,
    reviews: [],
    isTrending: !!isTrending,
    isFlashSale: !!isFlashSale,
    flashSalePrice: flashSalePrice ? Number(flashSalePrice) : undefined,
    sku: sku || ("SKU-" + Math.floor(100000 + Math.random() * 900000)),
    seoKeywords: [name.toLowerCase(), category.toLowerCase(), theme.toLowerCase()]
  };

  jewels.unshift(newJewel);

  if (supabase) {
    supabase.from("jewels")
      .insert(mapJewelToDb(newJewel))
      .then(({ error }) => {
        if (error) console.error("[Supabase] Failed to insert new jewel:", error);
      });
  }

  res.json({ success: true, jewel: newJewel });
});

// Update jewel (Admin inventory)
app.put("/api/jewels/:id", (req, res) => {
  const { id } = req.params;
  const { price, stock, isTrending, isFlashSale, flashSalePrice } = req.body;
  const index = jewels.findIndex(j => j.id === id);
  if (index !== -1) {
    jewels[index] = {
      ...jewels[index],
      price: price !== undefined ? Number(price) : jewels[index].price,
      stock: stock !== undefined ? Number(stock) : jewels[index].stock,
      isTrending: isTrending !== undefined ? !!isTrending : jewels[index].isTrending,
      isFlashSale: isFlashSale !== undefined ? !!isFlashSale : jewels[index].isFlashSale,
      flashSalePrice: flashSalePrice !== undefined ? Number(flashSalePrice) : jewels[index].flashSalePrice
    };

    if (supabase) {
      supabase.from("jewels")
        .update(mapJewelToDb(jewels[index]))
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("[Supabase] Failed to update jewel inventory:", error);
        });
    }

    return res.json({ success: true, jewel: jewels[index] });
  }
  res.status(404).json({ error: "Jewel not found" });
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { customerName, customerEmail, customerPhone, items, total, discountApplied, whatsappNotifications, notes, pincode, city, state, houseAddress, landmark, customSizeOrEngraving } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items provided" });
  }

  // Deduct stock
  items.forEach((item: any) => {
    const jewel = jewels.find(j => j.id === item.jewelId);
    if (jewel) {
      jewel.stock = Math.max(0, jewel.stock - item.quantity);
      jewel.purchasesCount += item.quantity;
    }
  });

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingCode = `TRK-${items[0]?.name?.substring(0, 3).toUpperCase() || "MAI"}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id: orderId,
    customerName,
    customerEmail,
    customerPhone,
    items,
    total,
    discountApplied: discountApplied || 0,
    status: "Pending",
    trackingCode,
    date: new Date().toISOString().split('T')[0],
    whatsappNotifications: !!whatsappNotifications,
    notes,
    pincode,
    city,
    state,
    houseAddress,
    landmark,
    customSizeOrEngraving
  };

  orders.unshift(newOrder);

  // Update or insert Customer Profile for Customer Analytics
  const existingCust = customers.find(c => c.email.toLowerCase() === customerEmail.toLowerCase());
  let targetCustomer: CustomerProfile;
  if (existingCust) {
    existingCust.totalSpent += total;
    existingCust.purchaseCount += 1;
    existingCust.clv = Math.round(existingCust.totalSpent * 1.5); // Rich simulated CLV projections
    existingCust.cartAbandoned = false;
    targetCustomer = existingCust;
  } else {
    targetCustomer = {
      id: "c-" + Date.now(),
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      segment: total > 3500 ? "VVIP Patron" : "Enthusiast",
      totalSpent: total,
      purchaseCount: 1,
      clv: Math.round(total * 1.5),
      viewsList: items.map((i: any) => i.jewelId),
      cartAbandoned: false,
      dateJoined: new Date().toISOString().split('T')[0]
    };
    customers.push(targetCustomer);
  }

  // Write to Supabase if connected
  if (supabase) {
    // 1. Insert order
    supabase.from("orders").insert(mapOrderToDb(newOrder)).then(({ error }) => {
      if (error) console.error("[Supabase] Failed to insert new order:", error);
    });

    // 2. Update stock of modified jewels
    items.forEach((item: any) => {
      const j = jewels.find(x => x.id === item.jewelId);
      if (j) {
        supabase.from("jewels")
          .update({ stock: j.stock, purchases_count: j.purchasesCount })
          .eq("id", j.id)
          .then(({ error }) => {
            if (error) console.error(`[Supabase] Failed to update stock for jewel ${j.id}:`, error);
          });
      }
    });

    // 3. Upsert customer profile
    supabase.from("customers").upsert(mapCustomerToDb(targetCustomer)).then(({ error }) => {
      if (error) console.error("[Supabase] Failed to upsert customer:", error);
    });
  }

  res.json({ success: true, order: newOrder });
});

// Update order status (Admin management)
app.put("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status as any;

    if (supabase) {
      supabase.from("orders")
        .update({ status })
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("[Supabase] Failed to update order status:", error);
        });
    }

    return res.json({ success: true, order });
  }
  res.status(404).json({ error: "Order not found" });
});

// Returns API
app.get("/api/returns", (req, res) => {
  res.json(returnRequests);
});

app.post("/api/returns", (req, res) => {
  const { orderId, customerName, jewelName, reason } = req.body;
  const newReturn: ReturnRequest = {
    id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
    orderId,
    customerName,
    jewelName,
    reason,
    status: "Pending",
    date: new Date().toISOString().split('T')[0]
  };
  returnRequests.unshift(newReturn);

  if (supabase) {
    supabase.from("return_requests")
      .insert(mapReturnToDb(newReturn))
      .then(({ error }) => {
        if (error) console.error("[Supabase] Failed to insert return request:", error);
      });
  }

  res.json({ success: true, returnRequest: newReturn });
});

app.put("/api/returns/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const reqItem = returnRequests.find(r => r.id === id);
  if (reqItem) {
    reqItem.status = status;

    if (supabase) {
      supabase.from("return_requests")
        .update({ status })
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("[Supabase] Failed to update return request status:", error);
        });
    }

    return res.json({ success: true, returnRequest: reqItem });
  }
  res.status(404).json({ error: "Return request not found" });
});

// Customers Profile list
app.get("/api/customers", (req, res) => {
  res.json(customers);
});

// Send simulated Cart Abandonment trigger
app.post("/api/customers/abandon", (req, res) => {
  const { email, name, phone } = req.body;
  const existing = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  let target: CustomerProfile;
  if (existing) {
    existing.cartAbandoned = true;
    target = existing;
  } else {
    target = {
      id: "c-" + Date.now(),
      name: name || "Anonymous Visitor",
      email,
      phone: phone || "",
      segment: "Inactive",
      totalSpent: 0,
      purchaseCount: 0,
      clv: 0,
      viewsList: [],
      cartAbandoned: true,
      dateJoined: new Date().toISOString().split('T')[0]
    };
    customers.push(target);
  }

  if (supabase) {
    supabase.from("customers")
      .upsert(mapCustomerToDb(target))
      .then(({ error }) => {
        if (error) console.error("[Supabase] Failed to upsert customer after abandonment:", error);
      });
  }

  res.json({ success: true });
});

// Coupon verification
app.post("/api/coupons/verify", (req, res) => {
  const { code, amount } = req.body;
  const target = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (!target) {
    return res.status(404).json({ error: "Invalid coupon code." });
  }
  if (target.minAmount && amount < target.minAmount) {
    return res.status(400).json({ error: `Requires a minimum purchase of ₹${target.minAmount}.` });
  }
  res.json(target);
});

// Blog Posts API
app.get("/api/blogs", (req, res) => {
  res.json(blogPosts);
});

// Campaigns API
app.get("/api/campaigns", (req, res) => {
  res.json(campaigns);
});

app.post("/api/campaigns", (req, res) => {
  const { name, channel, audience, subjectOrHeader, body } = req.body;
  const newCamp: Campaign = {
    id: "camp" + Date.now(),
    name,
    channel,
    audience,
    subjectOrHeader,
    body,
    sentDate: new Date().toISOString().split('T')[0],
    sentCount: channel === "WhatsApp" ? 180 : 1450,
    opensCount: channel === "WhatsApp" ? 172 : 540,
    clicksCount: channel === "WhatsApp" ? 111 : 190
  };
  campaigns.unshift(newCamp);

  if (supabase) {
    supabase.from("campaigns")
      .insert(mapCampaignToDb(newCamp))
      .then(({ error }) => {
        if (error) console.error("[Supabase] Failed to insert campaign:", error);
      });
  }

  res.json({ success: true, campaign: newCamp });
});

app.post("/api/customers/view-item", (req, res) => {
  const { email, jewelId } = req.body;
  const jewel = jewels.find(j => j.id === jewelId);
  if (jewel) {
    jewel.views += 1;

    if (supabase) {
      supabase.from("jewels")
        .update({ views: jewel.views })
        .eq("id", jewelId)
        .then(({ error }) => {
          if (error) console.error("[Supabase] Failed to update views count:", error);
        });
    }
  }

  if (email) {
    const cust = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (cust && !cust.viewsList.includes(jewelId)) {
      cust.viewsList.push(jewelId);

      if (supabase) {
        supabase.from("customers")
          .update({ views_list: cust.viewsList })
          .eq("email", email.toLowerCase())
          .then(({ error }) => {
            if (error) console.error("[Supabase] Failed to update customer view list:", error);
          });
      }
    }
  }
  res.json({ success: true, views: jewel ? jewel.views : 0 });
});


// ==========================================
// GEMINI AI INTEGRATIONS
// ==========================================

// 1. AI Recommendation Concierge / Advisor Chatbot
app.post("/api/ai/concierge", async (req, res) => {
  const { message, chatHistory } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Pre-formatted background context about our beautiful products
  const productsSnippet = jewels.map(j => (
    `- [ID: ${j.id}] ${j.name} (${j.category}, ₹${j.price}): ${j.description} High stock: ${j.stock}`
  )).join("\n");

  const systemPrompt = `You are the master designer and chief gemologist of 'Maison d'Aurelia', an elite luxury jewelry house built on Gold, Ivory, and Deep Maroon aesthetics.
You speak with exceptional poise, elegant warmth, and poetic vocabulary. Always make the customer feel like royalty (a cherished patron of the Maison).
Your theme colors are Rich Gold (vermeil), Creamy Ivory (lustrous beads and lacquer), and Imperial Maroon (royal Burmese rubies, Mozambique garnets, deep carnelian).

Here is our active gold collection available right now:
${productsSnippet}

Use this collection to suggest direct pieces. Guide them exquisitely on matching tones, materials, and luxury styling for high-profile galas or custom anniversary celebrations. Seek to inspire them with historical golden lore. Keep your responses compact, stunningly punctuated, and beautifully structured (2-3 paragraphs max). Don't explain internals.`;

  try {
    // We package the system instruction and chat history neatly
    const contentsPayload: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      // Limit to last 8 turns of history
      chatHistory.slice(-8).forEach((h: any) => {
        contentsPayload.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        });
      });
    }
    contentsPayload.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsPayload,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text || "Pardon, dearest patron, my thoughts drifted near the golden furnace. Could you repeat that?" });
  } catch (error: any) {
    console.error("Gemini chatbot error:", error);
    res.json({ text: "Dearest patron, our celestial server is resting. Rest assured, our craftsmanship remains absolute. Standard: Maison recommends the Sovereign Ruby Choker (₹1,499) for a touch of royal maroon." });
  }
});

// 2. AI Product Recommendation based on behavior
app.post("/api/ai/recommend", async (req, res) => {
  const { viewedIds, segment } = req.body;
  const viewedJewels = jewels.filter(j => viewedIds && viewedIds.includes(j.id));
  const viewedNames = viewedJewels.map(v => v.name).join(", ") || "none";

  const prompt = `Provide 1 recommended jewelry piece from our inventory below for a client whose profile segment is "${segment || "Luxury Enthusiast"}" and who has recently toured: "${viewedNames}".
Write a highly personalized, poetic, 3-sentence 'Maison Certificate of Choice' describing why this piece matches their exquisite aesthetic sense.

Our Collection:
${JSON.stringify(jewels.map(j => ({ id: j.id, name: j.name, theme: j.theme, price: j.price, description: j.description })))}

Respond with a raw JSON object only. Do not wrap in markdown tags except of format {"recommendedJewelId": "jX", "poeticAdvice": "text here"}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedJewelId: { type: Type.STRING },
            poeticAdvice: { type: Type.STRING }
          },
          required: ["recommendedJewelId", "poeticAdvice"]
        }
      }
    });

    const parsed = JSON.parse(cleanAIResponse(response.text));
    res.json(parsed);
  } catch (error) {
    console.error("AI Recommendation error:", error);
    // Graceful fallback
    res.json({
      recommendedJewelId: jewels[0].id,
      poeticAdvice: "For a patron of your pristine caliber, the Sovereign Ruby Choker is recommended. Its central maroon ruby glows with the heat of golden legends, ensuring your presence is unforgettable."
    });
  }
});

// 3. AI Smart Search & Reasoning Engine
app.post("/api/ai/smart-search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.json({ matchedIds: jewels.map(j => j.id), aiInsight: "Presenting the full spectrum of Maison d'Aurelia royal heirlooms." });
  }

  const prompt = `Analyze our jewelry catalog for the luxury search query: "${query}".
Identify which of our pieces match this semantic sentiment or theme. Provide an elegant, brief (15-word max) gemologist insight explaining the curation.

CRITICAL PRECISION RULES:
1. If the query mentions a specific category of jewelry (such as 'necklace', 'earring', 'ring', 'bracelet', or plurals like 'necklaces', 'earrings', 'rings', 'bracelets'), you MUST ONLY match and include products of that exact category. Do not match any other categories (e.g., if query has "necklace", do not return any earrings or rings).
2. If the query has specific terms like "ring", prioritize rings.
3. If no category is mentioned, feel free to matches across categories based on the theme (e.g., "Gold").

Catalog:
${JSON.stringify(jewels.map(j => ({ id: j.id, name: j.name, category: j.category, theme: j.theme, price: j.price, description: j.description, material: j.material })))}

Respond with a raw JSON object of format:
{
  "matchedIds": ["j1", "j3"],
  "aiInsight": "A tailored selection of Crimson gems fit for candlelight galas."
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            aiInsight: { type: Type.STRING }
          },
          required: ["matchedIds", "aiInsight"]
        }
      }
    });

    const parsed = JSON.parse(cleanAIResponse(response.text));
    res.json(parsed);
  } catch (error) {
    console.error("AI smart search error:", error);
    // Client-side fallback: substring match
    const lower = query.toLowerCase();
    const matched = jewels.filter(j => 
      j.name.toLowerCase().includes(lower) || 
      j.description.toLowerCase().includes(lower) ||
      j.theme.toLowerCase().includes(lower) ||
      j.category.toLowerCase().includes(lower)
    ).map(j => j.id);

    res.json({
      matchedIds: matched.length > 0 ? matched : jewels.map(j => j.id),
      aiInsight: "Hand-curated treasures featuring our signature Gold, Ivory, and Maroon designs."
    });
  }
});


// ==========================================
// SUPABASE SYNCHRONIZATION SYSTEM
// ==========================================

async function syncWithSupabase() {
  if (!supabase) {
    console.log("[Supabase] Client not initialized. Running in standard in-memory mode.");
    return;
  }

  console.log("[Supabase] Initializing sync with Supabase...");

  // 1. Sync jewels
  try {
    const { data, error } = await supabase.from("jewels").select("*");
    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`[Supabase] Loaded ${data.length} jewels from Supabase.`);
      jewels = data.map(mapJewelFromDb);
    } else {
      console.log("[Supabase] Jewels table is empty. Seeding initial jewels...");
      for (const j of jewels) {
        const { error: insertErr } = await supabase.from("jewels").insert(mapJewelToDb(j));
        if (insertErr) console.error(`[Supabase] Seeding jewel ${j.id} failed:`, insertErr);
      }
    }
  } catch (err: any) {
    console.warn("[Supabase] Jewels sync warning (table may not exist yet):", err.message || err);
  }

  // 2. Sync orders
  try {
    const { data, error } = await supabase.from("orders").select("*");
    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`[Supabase] Loaded ${data.length} orders from Supabase.`);
      orders = data.map(mapOrderFromDb);
    } else {
      console.log("[Supabase] Orders table is empty. Seeding initial orders...");
      for (const o of orders) {
        const { error: insertErr } = await supabase.from("orders").insert(mapOrderToDb(o));
        if (insertErr) console.error(`[Supabase] Seeding order ${o.id} failed:`, insertErr);
      }
    }
  } catch (err: any) {
    console.warn("[Supabase] Orders sync warning (table may not exist yet):", err.message || err);
  }

  // 3. Sync return_requests
  try {
    const { data, error } = await supabase.from("return_requests").select("*");
    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`[Supabase] Loaded ${data.length} return requests from Supabase.`);
      returnRequests = data.map(mapReturnFromDb);
    } else {
      console.log("[Supabase] Return requests table is empty. Seeding...");
      for (const r of returnRequests) {
        const { error: insertErr } = await supabase.from("return_requests").insert(mapReturnToDb(r));
        if (insertErr) console.error(`[Supabase] Seeding return ${r.id} failed:`, insertErr);
      }
    }
  } catch (err: any) {
    console.warn("[Supabase] Return requests sync warning (table may not exist yet):", err.message || err);
  }

  // 4. Sync customers
  try {
    const { data, error } = await supabase.from("customers").select("*");
    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`[Supabase] Loaded ${data.length} customers from Supabase.`);
      customers = data.map(mapCustomerFromDb);
    } else {
      console.log("[Supabase] Customers table is empty. Seeding...");
      for (const c of customers) {
        const { error: insertErr } = await supabase.from("customers").insert(mapCustomerToDb(c));
        if (insertErr) console.error(`[Supabase] Seeding customer ${c.id} failed:`, insertErr);
      }
    }
  } catch (err: any) {
    console.warn("[Supabase] Customers sync warning (table may not exist yet):", err.message || err);
  }

  // 5. Sync campaigns
  try {
    const { data, error } = await supabase.from("campaigns").select("*");
    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`[Supabase] Loaded ${data.length} campaigns from Supabase.`);
      campaigns = data.map(mapCampaignFromDb);
    } else {
      console.log("[Supabase] Campaigns table is empty. Seeding...");
      for (const c of campaigns) {
        const { error: insertErr } = await supabase.from("campaigns").insert(mapCampaignToDb(c));
        if (insertErr) console.error(`[Supabase] Seeding campaign ${c.id} failed:`, insertErr);
      }
    }
  } catch (err: any) {
    console.warn("[Supabase] Campaigns sync warning (table may not exist yet):", err.message || err);
  }
}

// WhatsApp Settings Store with Local File Persistence (survives container restarts)
let whatsappSettings = {
  whatsapp_enabled: true,
  whatsapp_number: "919876543210",
  whatsapp_default_message: "Hello, I need assistance."
};

const WHATSAPP_SETTINGS_FILE = path.join(process.cwd(), "whatsapp_settings.json");
if (fs.existsSync(WHATSAPP_SETTINGS_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(WHATSAPP_SETTINGS_FILE, "utf-8"));
    whatsappSettings = { ...whatsappSettings, ...data };
  } catch (err) {
    console.error("Failed to load whatsapp settings file:", err);
  }
}

// WhatsApp Settings API Endpoints
app.get("/api/whatsapp-settings", (req, res) => {
  res.json(whatsappSettings);
});

app.post("/api/whatsapp-settings", (req, res) => {
  const { whatsapp_enabled, whatsapp_number, whatsapp_default_message } = req.body;
  
  if (whatsapp_enabled) {
    if (!whatsapp_number) {
      return res.status(400).json({ error: "WhatsApp number is required when enabled." });
    }
    const cleanNum = String(whatsapp_number).trim();
    if (!/^\d+$/.test(cleanNum)) {
      return res.status(400).json({ error: "Invalid phone number. Only country code and numbers are allowed (no spaces, dashes, or symbols)." });
    }
  }

  whatsappSettings = {
    whatsapp_enabled: !!whatsapp_enabled,
    whatsapp_number: String(whatsapp_number || "").trim(),
    whatsapp_default_message: String(whatsapp_default_message || "").trim()
  };

  try {
    fs.writeFileSync(WHATSAPP_SETTINGS_FILE, JSON.stringify(whatsappSettings, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save whatsapp settings file:", err);
  }

  res.json({ success: true, settings: whatsappSettings });
});

// Supabase Connection Status Endpoint
app.get("/api/supabase/status", async (req, res) => {
  if (!supabase) {
    return res.json({
      connected: false,
      message: "Supabase client not initialized. Check your environment variables.",
      url: null,
      tables: { jewels: false, orders: false, return_requests: false, customers: false, campaigns: false }
    });
  }

  const status = {
    connected: true,
    url: supabaseUrl,
    tables: { jewels: false, orders: false, return_requests: false, customers: false, campaigns: false }
  };

  try {
    const check1 = await supabase.from("jewels").select("id").limit(1);
    status.tables.jewels = !check1.error;
    
    const check2 = await supabase.from("orders").select("id").limit(1);
    status.tables.orders = !check2.error;
    
    const check3 = await supabase.from("return_requests").select("id").limit(1);
    status.tables.return_requests = !check3.error;
    
    const check4 = await supabase.from("customers").select("id").limit(1);
    status.tables.customers = !check4.error;
    
    const check5 = await supabase.from("campaigns").select("id").limit(1);
    status.tables.campaigns = !check5.error;
  } catch (err) {
    console.error("[Supabase] Status check failed:", err);
  }

  res.json(status);
});

// ==========================================
// VITE DEV MIDDLEWARE / STATIC SERVING
// ==========================================

async function startServer() {
  // Sync with database on server bootup
  await syncWithSupabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Unexpected Maison server error." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Maison Server] Listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
