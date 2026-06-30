export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface Jewel {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Rings" | "Necklaces" | "Earrings" | "Bracelets";
  material: string;
  theme: "Gold" | "Ivory" | "Maroon" | "Ensemble";
  stock: number;
  image: string;
  views: number;
  purchasesCount: number;
  rating: number;
  reviews: Review[];
  isTrending: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  sku: string;
  seoKeywords: string[];
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  minAmount?: number;
}

export interface CartItem {
  jewelId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    jewelId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  discountApplied: number;
  status: "Pending" | "Packed" | "Shipped" | "Delivered" | "Received" | "Crafting" | "Quality Check";
  trackingCode: string;
  date: string;
  whatsappNotifications: boolean;
  notes?: string;
  pincode?: string;
  city?: string;
  state?: string;
  houseAddress?: string;
  landmark?: string;
  customSizeOrEngraving?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  jewelName: string;
  reason: string;
  status: "Pending" | "Approved" | "Declined";
  date: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: "VVIP Patron" | "Aesthetic Collector" | "Enthusiast" | "Inactive";
  totalSpent: number;
  purchaseCount: number;
  clv: number; // Customer Lifetime Value formula-based metric
  viewsList: string[]; // List of viewed jewel IDs
  cartAbandoned: boolean;
  dateJoined: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: "WhatsApp" | "Email" | "Push";
  audience: string;
  subjectOrHeader: string;
  body: string;
  sentDate: string;
  sentCount: number;
  opensCount: number;
  clicksCount: number;
}

export interface BlogItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  date: string;
  author: string;
  keywords: string[];
}

export function getPrimaryImage(imageStr: string): string {
  if (!imageStr) return "";
  try {
    const trimmed = imageStr.trim();
    if (trimmed.startsWith("[")) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0] || "";
      }
    }
  } catch (e) {
    // Fallback to original string if parsing fails
  }
  return imageStr;
}

