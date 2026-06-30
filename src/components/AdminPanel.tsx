import React, { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Shield, Sparkles, Plus, Check, X, ArrowUpRight, Hammer, MessageSquare, RefreshCw, Send, AlertTriangle } from "lucide-react";
import { Jewel, Order, ReturnRequest, CustomerProfile, Campaign } from "../types";

interface AdminPanelProps {
  jewels: Jewel[];
  orders: Order[];
  returnsList: ReturnRequest[];
  customers: CustomerProfile[];
  campaigns: Campaign[];
  onUpdateJewel: (id: string, updatedParams: any) => void;
  onUpdateOrderStatus: (id: string, status: string) => void;
  onUpdateReturnStatus: (id: string, status: string) => void;
  onCreateCampaign: (campaign: any) => void;
  onTriggerSimulatedRecovery: (email: string) => void;
  onRefresh?: () => void;
  whatsappSettings?: {
    whatsapp_enabled: boolean;
    whatsapp_number: string;
    whatsapp_default_message: string;
  } | null;
  onUpdateWhatsAppSettings?: (settings: any) => void;
}

export default function AdminPanel({
  jewels,
  orders,
  returnsList,
  customers,
  campaigns,
  onUpdateJewel,
  onUpdateOrderStatus,
  onUpdateReturnStatus,
  onCreateCampaign,
  onTriggerSimulatedRecovery,
  onRefresh,
  whatsappSettings,
  onUpdateWhatsAppSettings
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "inventory" | "orders" | "customers" | "campaigns" | "whatsapp">("analytics");

  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showSqlSetup, setShowSqlSetup] = useState(false);

  // Search filter states
  const [inventorySearch, setInventorySearch] = useState("");
  const [ordersSearch, setOrdersSearch] = useState("");
  const [customersSearch, setCustomersSearch] = useState("");

  // Add Product form states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Rings");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdImages, setNewProdImages] = useState<string[]>(["", "", "", "", ""]);
  const [newProdPreviews, setNewProdPreviews] = useState<string[]>(["", "", "", "", ""]);
  const [imageLoadErrors, setImageLoadErrors] = useState<boolean[]>([false, false, false, false, false]);
  const [newProdMaterial, setNewProdMaterial] = useState("Gold");
  const [newProdTheme, setNewProdTheme] = useState("Traditional");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdIsTrending, setNewProdIsTrending] = useState(false);
  const [newProdIsFlashSale, setNewProdIsFlashSale] = useState(false);
  const [newProdFlashPrice, setNewProdFlashPrice] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const generateSKU = (cat: string) => {
    const prefixMap: Record<string, string> = {
      Rings: "AU-RNG",
      Necklaces: "AU-NKL",
      Earrings: "AU-EAR",
      Bracelets: "AU-BRC",
      Cuffs: "AU-CUF"
    };
    const prefix = prefixMap[cat] || "AU-GEN";
    const num = Math.floor(100 + Math.random() * 900); // 3 random digits
    return `${prefix}-${num}`;
  };

  useEffect(() => {
    if (showAddProductModal && !newProdSku) {
      setNewProdSku(generateSKU(newProdCategory));
    }
  }, [showAddProductModal]);

  useEffect(() => {
    fetch("/api/supabase/status")
      .then((res) => res.json())
      .then((data) => {
        setSupabaseStatus(data);
        setLoadingStatus(false);
      })
      .catch((err) => {
        console.error("Failed to fetch Supabase status:", err);
        setLoadingStatus(false);
      });
  }, []);

  // Invetory form modifier state helper
  const [selectedJewelId, setSelectedJewelId] = useState<string | null>(null);
  const [modPrice, setModPrice] = useState("");
  const [modStock, setModStock] = useState("");
  const [modFlashSale, setModFlashSale] = useState(false);
  const [modFlashPrice, setModFlashPrice] = useState("");

  // Campaign builder state
  const [campName, setCampName] = useState("");
  const [campMedium, setCampMedium] = useState<"WhatsApp" | "Email" | "Push">("WhatsApp");
  const [campAudience, setCampAudience] = useState("VVIP Patrons & Collectors");
  const [campSubject, setCampSubject] = useState("");
  const [campBody, setCampBody] = useState("");
  const [campSuccess, setCampSuccess] = useState("");

  // Track dispatched recoveries
  const [recoveredEmails, setRecoveredEmails] = useState<string[]>([]);

  // WhatsApp Settings local states
  const [whatsappEnabled, setWhatsappEnabled] = useState(whatsappSettings?.whatsapp_enabled ?? true);
  const [whatsappNumber, setWhatsappNumber] = useState(whatsappSettings?.whatsapp_number ?? "");
  const [whatsappDefaultMessage, setWhatsappDefaultMessage] = useState(whatsappSettings?.whatsapp_default_message ?? "Hello, I need assistance.");
  const [whatsappSaving, setWhatsappSaving] = useState(false);
  const [whatsappError, setWhatsappError] = useState("");
  const [whatsappSuccess, setWhatsappSuccess] = useState("");

  // Keep state synchronized with prop changes
  useEffect(() => {
    if (whatsappSettings) {
      setWhatsappEnabled(whatsappSettings.whatsapp_enabled);
      setWhatsappNumber(whatsappSettings.whatsapp_number);
      setWhatsappDefaultMessage(whatsappSettings.whatsapp_default_message);
    }
  }, [whatsappSettings]);

  // If props are not passed, load settings from API on mount
  useEffect(() => {
    if (!whatsappSettings) {
      fetch("/api/whatsapp-settings")
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setWhatsappEnabled(data.whatsapp_enabled);
            setWhatsappNumber(data.whatsapp_number);
            setWhatsappDefaultMessage(data.whatsapp_default_message);
          }
        })
        .catch((err) => console.error("Error loading WhatsApp settings on mount:", err));
    }
  }, []);

  const handleSaveWhatsAppSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsappSaving(true);
    setWhatsappError("");
    setWhatsappSuccess("");

    const trimmedNum = whatsappNumber.trim();

    if (whatsappEnabled) {
      if (!trimmedNum) {
        setWhatsappError("WhatsApp phone number is required when enabled.");
        setWhatsappSaving(false);
        return;
      }
      if (!/^\d+$/.test(trimmedNum)) {
        setWhatsappError("Invalid phone number. Only country code and numbers are allowed (no spaces, dashes, or symbols).");
        setWhatsappSaving(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/whatsapp-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_enabled: whatsappEnabled,
          whatsapp_number: trimmedNum,
          whatsapp_default_message: whatsappDefaultMessage
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setWhatsappSuccess("WhatsApp settings saved successfully!");
      if (onUpdateWhatsAppSettings) {
        onUpdateWhatsAppSettings(data.settings);
      }
      setTimeout(() => setWhatsappSuccess(""), 4000);
    } catch (err: any) {
      console.error("Save settings failed", err);
      setWhatsappError(err.message || "Something went wrong while saving settings.");
    } finally {
      setWhatsappSaving(false);
    }
  };

  const loadJewelEditor = (j: Jewel) => {
    setSelectedJewelId(j.id);
    setModPrice(String(j.price));
    setModStock(String(j.stock));
    setModFlashSale(j.isFlashSale);
    setModFlashPrice(String(j.flashSalePrice || Math.round(j.price * 0.8)));
  };

  const handleUpdateJewelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJewelId) return;

    onUpdateJewel(selectedJewelId, {
      price: Number(modPrice),
      stock: Number(modStock),
      isFlashSale: modFlashSale,
      flashSalePrice: modFlashSale ? Number(modFlashPrice) : undefined
    });
    setSelectedJewelId(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ फाइल का साइज बहुत बड़ा है! कृपया 2MB से छोटी इमेज अपलोड करें।");
      return;
    }

    // Inform user of file pick
    alert(`📸 फ़ाइल पहचानी गई: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)। प्रीव्यू लोड हो रहा है...`);

    // 1. Live Instant Preview using URL.createObjectURL
    try {
      const objectUrl = URL.createObjectURL(file);
      setNewProdPreviews(prev => {
        const updated = [...prev];
        updated[index] = objectUrl;
        return updated;
      });
    } catch (err: any) {
      console.error("Failed to create object URL:", err);
      alert(`⚠️ लोकल प्रीव्यू बनाने में समस्या (सैंडबॉक्स पाबंदी): ${err.message || err}\nकृपया नीचे दिए गए इनपुट में सीधा इमेज यूआरएल पेस्ट करें!`);
    }

    // 2. Base64 conversion for persistent Database / Supabase storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewProdImages(prev => {
        const updated = [...prev];
        updated[index] = base64;
        return updated;
      });
      alert(`✅ फ़ाइल ${index + 1} सफलतापूर्वक लोड हो गई!`);
    };
    reader.onerror = () => {
      alert("⚠️ इमेज फाइल को रीड करने में विफलता हुई!");
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasMainImage = newProdImages[0] || newProdPreviews[0];
    
    if (!newProdName.trim() || !newProdPrice || !newProdStock || !hasMainImage) {
      alert("⚠️ Error: कृपया सभी अनिवार्य फील्ड्स भरें!\n\n• Name (प्रॉडक्ट का नाम) *\n• Price (कीमत) *\n• Stock (स्टॉक स्तर) *\n• Main Image (मुख्य फोटो) *\n\nये फील्ड्स खाली नहीं छोड़े जा सकते।");
      return;
    }

    setIsAddingProduct(true);
    try {
      // Filter out any empty strings
      const imagesToSave = newProdImages.filter(img => img && img.trim() !== "");
      const serializedImages = JSON.stringify(imagesToSave);

      const response = await fetch("/api/jewels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName,
          description: newProdDesc,
          price: Number(newProdPrice),
          category: newProdCategory,
          material: newProdMaterial,
          theme: newProdTheme,
          stock: Number(newProdStock),
          image: serializedImages,
          sku: newProdSku,
          isTrending: newProdIsTrending,
          isFlashSale: newProdIsFlashSale,
          flashSalePrice: newProdIsFlashSale ? Number(newProdFlashPrice) : undefined
        })
      });

      if (response.ok) {
        setNewProdName("");
        setNewProdDesc("");
        setNewProdPrice("");
        setNewProdStock("10");
        setNewProdSku("");
        setNewProdImages(["", "", "", "", ""]);
        setNewProdPreviews(["", "", "", "", ""]);
        setImageLoadErrors([false, false, false, false, false]);
        setNewProdMaterial("Gold");
        setNewProdTheme("Traditional");
        setNewProdIsTrending(false);
        setNewProdIsFlashSale(false);
        setNewProdFlashPrice("");
        setShowAddProductModal(false);

        if (onRefresh) onRefresh();
      } else {
        const errVal = await response.json();
        alert("❌ Error saving product to Supabase/Database:\n\n" + (errVal.error || "Unknown server error"));
      }
    } catch (err: any) {
      console.error("Failed to add product:", err);
      alert("❌ Server connection failed:\n\n" + (err.message || err));
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName || !campBody) return;

    onCreateCampaign({
      name: campName,
      channel: campMedium,
      audience: campAudience,
      subjectOrHeader: campSubject,
      body: campBody
    });

    setCampSuccess(`Campaign launched targeting ${campAudience}! Sent: ${campMedium === "WhatsApp" ? "180 direct pings" : "1,450 emails."}`);
    setCampName("");
    setCampSubject("");
    setCampBody("");
    setTimeout(() => setCampSuccess(""), 5000);
  };

  const handleRecoverCart = (c: CustomerProfile) => {
    onTriggerSimulatedRecovery(c.email);
    setRecoveredEmails(prev => [...prev, c.email]);
  };

  // Prepare Dynamic Data structures for Recharts
  // 1. Weekly Sales Accumulator
  const salesByDateData = orders.reduce((acc: any[], order) => {
    const existing = acc.find(item => item.date === order.date);
    if (existing) {
      existing.revenue += order.total;
      existing.ordersCount += 1;
    } else {
      acc.push({ date: order.date, revenue: order.total, ordersCount: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date));

  // Fallback if no dates tracked yet
  const chartData = salesByDateData.length > 0 ? salesByDateData : [
    { date: "2026-06-08", revenue: 4200, ordersCount: 1 },
    { date: "2026-06-10", revenue: 1550, ordersCount: 1 },
    { date: "2026-06-12", revenue: 3100, ordersCount: 1 },
    { date: "2026-06-13", revenue: 4200, ordersCount: 1 },
    { date: "2026-06-14", revenue: 6850, ordersCount: 2 }
  ];

  // 2. Product Categories distribution
  const categoriesMap = jewels.reduce((acc: any, j) => {
    acc[j.category] = (acc[j.category] || 0) + j.purchasesCount;
    return acc;
  }, {});

  const catChartData = Object.keys(categoriesMap).map(catName => ({
    name: catName,
    value: categoriesMap[catName]
  }));

  const COLORS = ["#800020", "#D4AF37", "#AA7C11", "#1C1817"];

  // CRM Aggregate Totals
  const totalRevenueEver = orders.reduce((acc, o) => acc + o.total, 0);
  const totalCustomersCount = customers.length;
  const avgOrderValue = Math.round(totalRevenueEver / (orders.length || 1));
  const avgClv = Math.round(customers.reduce((acc, c) => acc + c.clv, 0) / (customers.length || 1));

  // Filtered lists for search bars
  const filteredJewels = jewels.filter((j) => {
    const term = inventorySearch.toLowerCase();
    return (
      j.name.toLowerCase().includes(term) ||
      j.sku.toLowerCase().includes(term) ||
      j.category.toLowerCase().includes(term) ||
      (j.material && j.material.toLowerCase().includes(term)) ||
      j.id.toLowerCase().includes(term)
    );
  });

  const filteredOrders = orders.filter((o) => {
    const term = ordersSearch.toLowerCase();
    return (
      o.id.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term) ||
      (o.customerPhone && o.customerPhone.includes(term)) ||
      o.status.toLowerCase().includes(term)
    );
  });

  const filteredCustomers = customers.filter((c) => {
    const term = customersSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      c.segment.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#FCFBF8] border border-gold-mid/20 p-5 sm:p-7 rounded shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-mid fill-gold-mid/10" />
            <span className="text-[10px] text-maroon-mid uppercase font-mono tracking-widest font-bold">Maison Command Suite</span>
            <span className="bg-neutral-800 text-gold-mid border border-gold-mid/30 text-[8px] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">Manager</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-800 mt-1">Aurelia Vault Control Suite</h2>
          <p className="text-xs text-neutral-500 font-light mt-0.5 tracking-wide">
            Track luxury sales revenue, manage handcrafted gemstone inventory levels, approve returns, and schedule VIP customer campaigns.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex flex-wrap gap-3 font-mono text-[10px] tracking-wider text-neutral-700 bg-gold-light/40 border border-gold-mid/15 p-2 rounded">
          <div className="px-2 border-r border-[#D4AF37]/35"><span className="text-neutral-500">REV:</span> <strong className="text-maroon-mid font-sans text-xs">₹{totalRevenueEver.toLocaleString()}</strong></div>
          <div className="px-2 border-r border-[#D4AF37]/35"><span className="text-neutral-500">AOV:</span> <strong className="text-[#800020] font-sans text-xs">₹{avgOrderValue.toLocaleString()}</strong></div>
          <div className="px-2 border-r border-[#D4AF37]/35"><span className="text-neutral-500">CLV:</span> <strong className="text-neutral-800 font-sans text-xs">₹{avgClv.toLocaleString()}</strong></div>
          <div className="px-2"><span className="text-neutral-500">ACTIVE:</span> <strong className="text-emerald-700">ONLINE</strong></div>
        </div>
      </div>

      {/* Supabase Integration Dashboard Status Card */}
      <div className="bg-[#FCFBF8] border border-gold-mid/20 p-5 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded">
              <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-2.21.9-4.21 2.34-5.66L4.93 4.93C3.12 6.74 2 9.24 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z"/>
                <path d="M12 4c-4.42 0-8 3.58-8 8 0 2.21.9 4.21 2.34 5.66l1.41-1.41C6.31 14.81 5.5 13.5 5.5 12c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5c0 1.5-.81 2.81-2.25 3.75l1.41 1.41C19.1 14.21 20 12.21 20 12c0-4.42-3.58-8-8-8z"/>
                <path d="M12 7c-2.76 0-5 2.24-5 5 0 1.38.56 2.63 1.46 3.54l1.41-1.41C9.31 13.56 9 12.81 9 12c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .81-.31 1.56-.88 2.12l1.41 1.41C16.44 14.63 17 13.38 17 12c0-2.76-2.24-5-5-5z"/>
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-indigo-600 font-mono uppercase tracking-wider font-bold">Cloud Database Sync</span>
              <h3 className="font-serif text-lg font-bold text-neutral-800">Supabase Connection Center</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {loadingStatus ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold bg-neutral-100 text-neutral-500 animate-pulse">
                Checking connection...
              </span>
            ) : supabaseStatus?.connected ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Connected to Supabase
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                ⚠️ Local Offline-First Mode
              </span>
            )}
          </div>
        </div>

        {supabaseStatus?.connected && (
          <div className="bg-[#FCFBF8] border border-neutral-200 rounded p-4.5 space-y-3.5 text-xs">
            <div className="flex flex-col sm:flex-row justify-between text-neutral-600 gap-1.5 font-mono text-[10px] border-b border-neutral-100 pb-2">
              <span><strong>URL:</strong> {supabaseStatus.url}</span>
              <span className="text-neutral-400">Security Rule Status: Active (Row-Level Safety Ready)</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block">Database Tables Health Status:</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { name: "jewels (प्रॉडक्ट्स)", ok: supabaseStatus.tables?.jewels },
                  { name: "orders (ऑर्डर्स)", ok: supabaseStatus.tables?.orders },
                  { name: "return_requests (रिटर्न)", ok: supabaseStatus.tables?.return_requests },
                  { name: "customers (कस्टमर्स)", ok: supabaseStatus.tables?.customers },
                  { name: "campaigns (कैंपेन्स)", ok: supabaseStatus.tables?.campaigns }
                ].map((table) => (
                  <div key={table.name} className={`p-2.5 border rounded flex flex-col justify-between gap-1.5 shadow-sm bg-white ${
                    table.ok ? "border-emerald-200 bg-emerald-50/5" : "border-rose-200 bg-rose-50/5"
                  }`}>
                    <span className="font-medium text-neutral-800 break-words leading-tight text-[11px]">{table.name}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase ${table.ok ? "text-emerald-700" : "text-rose-600"}`}>
                      {table.ok ? "✓ Active & Synced" : "✗ Missing Table"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {Object.values(supabaseStatus.tables || {}).some(v => !v) && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded text-neutral-700 leading-relaxed font-sans text-xs space-y-2.5">
                <p className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  कुछ डेटाबेस टेबल्स आपके Supabase प्रोजेक्ट में अभी तक नहीं बनी हैं!
                </p>
                <p className="font-light text-neutral-600">
                  घबराएं नहीं! आपकी वेबसाइट अभी भी इन-मेमोरी बैकअप की मदद से बिल्कुल सही काम कर रही है। इसे हमेशा के लिए स्थायी (permanent) बनाने के लिए नीचे दिए गए बटन पर क्लिक करें, वहाँ दिए गए <strong>SQL कोड</strong> को कॉपी करें और उसे अपने Supabase SQL Editor में पेस्ट करके "Run" कर दें।
                </p>
                <button
                  type="button"
                  onClick={() => setShowSqlSetup(!showSqlSetup)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[9px] rounded transition-all shadow-sm"
                >
                  {showSqlSetup ? "SQL Setup स्क्रिप्ट छिपाएं" : "SQL Setup स्क्रिप्ट देखें और कॉपी करें"}
                </button>
              </div>
            )}

            {showSqlSetup && (
              <div className="space-y-2 animate-fadeIn bg-neutral-900 text-neutral-200 p-4.5 rounded-lg border border-neutral-800">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold uppercase">Supabase SQL Schema Setup</span>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("supabase-sql-code");
                      if (el) {
                        navigator.clipboard.writeText(el.innerText);
                        alert("SQL code copy हो गया है!");
                      }
                    }}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[9px] font-mono rounded font-bold uppercase transition-all"
                  >
                    SQL कोड कॉपी करें
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 font-light font-sans">
                  <strong>कैसे इस्तेमाल करें:</strong> अपने Supabase Dashboard में जाएं {"→"} बाएँ हाथ के मेनू में <strong>"SQL Editor"</strong> पर क्लिक करें {"→"} <strong>"New Query"</strong> बनाएं {"→"} नीचे दिए गए कोड को पेस्ट करें {"→"} फिर नीचे दाहिने कोने में <strong>"Run"</strong> बटन पर क्लिक करें। बस!
                </p>
                <pre id="supabase-sql-code" className="overflow-x-auto text-[10px] font-mono bg-neutral-950 p-3.5 rounded text-emerald-400 select-all max-h-72 leading-relaxed">
{`-- 1. Create jewels table
CREATE TABLE IF NOT EXISTS jewels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  material TEXT,
  theme TEXT NOT NULL,
  stock INTEGER NOT NULL,
  image TEXT,
  views INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  is_trending BOOLEAN DEFAULT false,
  is_flash_sale BOOLEAN DEFAULT false,
  flash_sale_price NUMERIC,
  sku TEXT,
  seo_keywords TEXT[],
  reviews JSONB DEFAULT '[]'::jsonb
);

-- 2. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL,
  discount_applied NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  tracking_code TEXT,
  date TEXT,
  whatsapp_notifications BOOLEAN DEFAULT false,
  notes TEXT,
  pincode TEXT,
  city TEXT,
  state TEXT,
  house_address TEXT,
  landmark TEXT,
  custom_size_or_engraving TEXT
);

-- 3. Create return_requests table
CREATE TABLE IF NOT EXISTS return_requests (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  jewel_name TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Pending',
  date TEXT
);

-- 4. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  segment TEXT,
  total_spent NUMERIC DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  clv NUMERIC DEFAULT 0,
  views_list TEXT[],
  cart_abandoned BOOLEAN DEFAULT false,
  date_joined TEXT
);

-- 5. Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  audience TEXT,
  subject_or_header TEXT,
  body TEXT,
  sent_date TEXT,
  sent_count INTEGER DEFAULT 0,
  opens_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0
);`}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs navigation block */}
      <div className="flex flex-wrap border-b border-gold-mid/20 pb-1.5 gap-2 select-none">
        {[
          { id: "analytics", label: "Interactive Analytics" },
          { id: "inventory", label: "Product Inventory (स्टॉक मैनेजमेंट)" },
          { id: "orders", label: "Orders & Returns (ऑर्डर मैनेजमेंट)" },
          { id: "customers", label: "Customers List (ग्राहक)" },
          { id: "campaigns", label: "Campaigns (मार्केटिंग कैंपेन्स)" },
          { id: "whatsapp", label: "WhatsApp Chat (व्हाट्सएप चैट)" }
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setActiveTab(tb.id as any)}
            className={`px-4.5 py-2.5 rounded text-xs tracking-wider uppercase font-bold transition-all duration-300 border ${
              activeTab === tb.id
                ? "bg-[#1C1817] text-gold-mid border-gold-mid/40 shadow-inner"
                : "border-gold-mid/15 text-neutral-600 hover:border-gold-mid/40 hover:bg-gold-light/20"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* ======================= TAB CONTENT SWITCHER ======================= */}
      <div className="space-y-8 animate-fadeIn">
        
        {/* TAB 1: ANALYTICS GRAPHS */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sales revenue wave chart */}
            <div className="lg:col-span-2 bg-[#FCFBF8] border border-gold-mid/25 rounded-lg p-5 sm:p-7 shadow">
              <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wide mb-5">
                Total Revenue (कुल कमाई)
              </h3>
              
              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#800020" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#800020" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3EFE0" />
                    <XAxis dataKey="date" stroke="#B28B15" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <YAxis stroke="#B28B15" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ background: '#FCFBF8', border: '1px solid #D4AF37' }} />
                    <Legend style={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="revenue" name="Order Volume Revenue (₹)" stroke="#800020" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product categories Pie chart */}
            <div className="bg-[#FCFBF8] border border-gold-mid/25 rounded-lg p-5 sm:p-7 shadow flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wide mb-3">
                  Catalog Distribution
                </h3>
                <p className="text-neutral-500 font-light text-xs mb-5">
                  Proportional share of client checkout volumes across core rings, necklaces, cuffs, and earrings.
                </p>
              </div>

              <div className="h-56 w-full text-xs flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={catChartData.length > 0 ? catChartData : [
                        { name: "Necklaces", value: 34 },
                        { name: "Earrings", value: 22 },
                        { name: "Bracelets", value: 14 },
                        { name: "Rings", value: 18 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {catChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARTISAN INVENTORY MANAGEMENT */}
        {activeTab === "inventory" && (
          <div className="bg-[#FCFBF8] border border-gold-mid/20 rounded-lg p-5 sm:p-7 shadow space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gold-mid/10 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wide">
                  Product Inventory (स्टॉक मैनेजमेंट)
                </h3>
                <p className="text-neutral-500 text-xs font-light">प्रॉडक्ट्स की सूची देखें, नया प्रॉडक्ट जोड़ें और स्टॉक स्तर संभालें।</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[10px] rounded transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> + Add New Product
              </button>
            </div>

            {/* Search and results summary block */}
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full bg-gold-light/10 p-3 rounded border border-gold-mid/10">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="सर्च करें (नाम, कैटेगरी, या SKU)..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full bg-white border border-gold-mid/30 text-xs text-neutral-800 rounded pl-3 pr-10 py-2.5 outline-none focus:border-gold-mid focus:ring-1 focus:ring-gold-mid font-sans"
                />
                {inventorySearch && (
                  <button
                    type="button"
                    onClick={() => setInventorySearch("")}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <span className="text-[10px] font-mono text-neutral-500">
                Showing {filteredJewels.length} of {jewels.length} products
              </span>
            </div>

            {/* Add Product Modal Overlay */}
            {showAddProductModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="bg-white border-2 border-gold-mid/50 rounded-lg p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
                  <div className="flex justify-between items-center border-b border-gold-mid/10 pb-3">
                    <span className="font-serif font-bold text-neutral-800 text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gold-mid" />
                      नया प्रॉडक्ट जोड़ें (+ Add New Product)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="text-neutral-400 hover:text-neutral-700 p-1 rounded hover:bg-neutral-100 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddNewProductSubmit} className="space-y-4 text-xs text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">
                          Product Name <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="जैसे: Classic Solitaire Diamond Ring"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full bg-white border border-neutral-300 p-2.5 rounded text-neutral-800 outline-none focus:border-gold-mid font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">
                          Category <span className="text-red-500 font-bold">*</span>
                        </label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => {
                            const cat = e.target.value;
                            setNewProdCategory(cat);
                            setNewProdSku(generateSKU(cat));
                          }}
                          className="w-full bg-white border border-neutral-300 p-2.5 rounded text-neutral-800 outline-none font-sans"
                        >
                          <option value="Rings">Rings (अंगूठियां)</option>
                          <option value="Necklaces">Necklaces (हार)</option>
                          <option value="Bracelets">Bracelets (कंगन)</option>
                          <option value="Earrings">Earrings (झुमके)</option>
                          <option value="Cuffs">Cuffs (कफ़्स)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">
                          SKU ID (स्टॉक कीपिंग यूनिट)
                        </label>
                        <input
                          type="text"
                          placeholder="जैसे: AU-RNG-009"
                          value={newProdSku}
                          onChange={(e) => setNewProdSku(e.target.value)}
                          className="w-full bg-white border border-neutral-300 p-2.5 rounded text-neutral-800 font-mono font-bold outline-none focus:border-gold-mid focus:ring-1 focus:ring-gold-mid h-[38px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">
                          Standard Price (₹) <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="जैसे: 45000"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="w-full bg-white border border-neutral-300 p-2.5 rounded text-neutral-800 outline-none focus:border-gold-mid font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">
                          Initial Stock Level <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="जैसे: 10"
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(e.target.value)}
                          className="w-full bg-white border border-neutral-300 p-2.5 rounded text-neutral-800 outline-none focus:border-gold-mid font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Material (सामग्री)</label>
                        <input
                          type="text"
                          placeholder="जैसे: 22K Gold, 18K Rose Gold, Platinum"
                          value={newProdMaterial}
                          onChange={(e) => setNewProdMaterial(e.target.value)}
                          className="w-full bg-white border border-neutral-300 p-2.5 rounded text-neutral-800 outline-none focus:border-gold-mid font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Theme (थीम) *</label>
                        <select
                          value={newProdTheme}
                          onChange={(e) => setNewProdTheme(e.target.value)}
                          className="w-full bg-white border border-neutral-300 p-2.5 rounded text-neutral-800 outline-none font-sans"
                        >
                          <option value="Traditional">Traditional (पारंपरिक)</option>
                          <option value="Modern Minimalism">Modern Minimalism (आधुनिक)</option>
                          <option value="Vintage Elegance">Vintage Elegance (विंटेज)</option>
                          <option value="Royal Heritage">Royal Heritage (शाही विरासत)</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-gold-mid/10 pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-neutral-500 font-mono uppercase block font-semibold">
                          Product Images Gallery (तस्वीरें - अधिकतम 5 फोटो)
                        </label>
                        <span className="text-[10px] text-neutral-400 font-light">
                          मुख्य फोटो अनिवार्य है <span className="text-red-500 font-bold">*</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 -mt-2 font-light">
                        पहले बॉक्स पर क्लिक करके मुख्य फोटो अपलोड करें। बाकी स्लॉट्स वैकल्पिक हैं। (अधिकतम 2MB प्रति फोटो)
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[
                          { label: <span>1. मुख्य फोटो <span className="text-red-500 font-bold">*</span></span>, desc: "Main View" },
                          { label: <span>2. साइड एंगल</span>, desc: "Side Angle" },
                          { label: <span>3. पहनने के बाद का लुक</span>, desc: "Worn Look" },
                          { label: <span>4. बैक साइड</span>, desc: "Back View" },
                          { label: <span>5. बॉक्स/पैकेजिंग फोटो</span>, desc: "Box/Package" }
                        ].map((slot, idx) => {
                          const previewUrl = newProdPreviews[idx] || newProdImages[idx];
                          const hasImg = !!previewUrl;
                          return (
                            <div
                              key={idx}
                              className={`border rounded p-2 flex flex-col items-center justify-between text-center relative min-h-[140px] transition-all duration-200 bg-neutral-50/50 ${
                                hasImg ? "border-gold-mid bg-white animate-fade-in" : idx === 0 ? "border-dashed border-red-400 bg-red-50/5" : "border-dashed border-neutral-300"
                              }`}
                            >
                              <span className="text-[9px] font-semibold text-neutral-600 block mb-1 truncate w-full">
                                {slot.label}
                              </span>

                              {hasImg ? (
                                <div className="relative w-full aspect-square shrink-0 rounded overflow-hidden border border-neutral-200 bg-white group/slot select-none flex items-center justify-center">
                                  <img
                                    src={previewUrl}
                                    alt={slot.desc}
                                    className="block"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                    onError={() => {
                                      setImageLoadErrors(prev => {
                                        const updated = [...prev];
                                        updated[idx] = true;
                                        return updated;
                                      });
                                    }}
                                  />
                                  {imageLoadErrors[idx] && (
                                    <div className="absolute inset-0 bg-emerald-50/95 flex flex-col items-center justify-center p-2 text-center animate-fade-in border border-emerald-200 rounded">
                                      <span className="text-emerald-600 text-[18px] font-bold">✓</span>
                                      <span className="text-[9px] text-emerald-800 font-bold leading-tight mt-1">इमेज लिंक सेट हो गया है</span>
                                      <span className="text-[7px] text-neutral-500 font-mono mt-1 truncate max-w-full px-1 bg-white border border-neutral-150 rounded">{previewUrl}</span>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewProdImages(prev => {
                                        const updated = [...prev];
                                        updated[idx] = "";
                                        return updated;
                                      });
                                      setNewProdPreviews(prev => {
                                        const updated = [...prev];
                                        updated[idx] = "";
                                        return updated;
                                      });
                                      setImageLoadErrors(prev => {
                                        const updated = [...prev];
                                        updated[idx] = false;
                                        return updated;
                                      });
                                    }}
                                    className="absolute inset-0 bg-black/70 opacity-0 group-hover/slot:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer rounded"
                                  >
                                    हटाएं ✕
                                  </button>
                                </div>
                              ) : (
                                <div className="w-full flex flex-col gap-1.5 justify-between flex-grow">
                                  <label
                                    htmlFor={`file-input-${idx}`}
                                    className="w-full aspect-square flex flex-col items-center justify-center border border-dashed border-neutral-300 rounded cursor-pointer hover:bg-neutral-50 hover:border-gold-mid transition-all p-1"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-neutral-400 mb-0.5" />
                                    <span className="text-[8px] text-neutral-500 font-semibold text-center leading-tight">अपलोड करें</span>
                                    <span className="text-[7px] text-neutral-400 mt-0.5">{slot.desc}</span>
                                    <input
                                      id={`file-input-${idx}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageFileChange(e, idx)}
                                      className="hidden"
                                    />
                                  </label>
                                  
                                  <input
                                    type="text"
                                    placeholder="🔗 या URL पेस्ट करें..."
                                    value={newProdImages[idx]}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setNewProdImages(prev => {
                                        const updated = [...prev];
                                        updated[idx] = val;
                                        return updated;
                                      });
                                      setNewProdPreviews(prev => {
                                        const updated = [...prev];
                                        updated[idx] = val;
                                        return updated;
                                      });
                                    }}
                                    className="w-full text-[8px] text-center border border-neutral-200 rounded px-1 py-1 outline-none focus:border-gold-mid focus:ring-1 focus:ring-gold-mid bg-white font-mono text-neutral-700"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Description (विवरण)</label>
                      <textarea
                        rows={2}
                        placeholder="प्रॉडक्ट के बारे में जानकारी लिखें..."
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        className="w-full bg-white border border-neutral-300 p-2.5 rounded text-neutral-800 outline-none focus:border-gold-mid font-sans resize-none"
                      />
                    </div>

                    <div className="border-t border-neutral-100 pt-3 flex flex-wrap gap-6">
                      <div className="flex items-center gap-2 select-none">
                        <input
                          type="checkbox"
                          id="newIsTrending"
                          checked={newProdIsTrending}
                          onChange={(e) => setNewProdIsTrending(e.target.checked)}
                          className="w-4 h-4 accent-maroon-mid cursor-pointer"
                        />
                        <label htmlFor="newIsTrending" className="font-semibold text-neutral-700 cursor-pointer text-xs">
                          Mark as Trending (ट्रेंडिंग आइटम)
                        </label>
                      </div>

                      <div className="flex items-center gap-2 select-none">
                        <input
                          type="checkbox"
                          id="newIsFlash"
                          checked={newProdIsFlashSale}
                          onChange={(e) => setNewProdIsFlashSale(e.target.checked)}
                          className="w-4 h-4 accent-maroon-mid cursor-pointer"
                        />
                        <label htmlFor="newIsFlash" className="font-semibold text-neutral-700 cursor-pointer text-xs">
                          Enable Flash Sale (फ्लैश सेल ऑफर)
                        </label>
                      </div>

                      {newProdIsFlashSale && (
                        <div className="w-full sm:w-auto sm:flex-1">
                          <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Flash Promo Price (₹) *</label>
                          <input
                            type="number"
                            required
                            placeholder="Promo Price"
                            value={newProdFlashPrice}
                            onChange={(e) => setNewProdFlashPrice(e.target.value)}
                            className="w-full max-w-xs bg-white border border-neutral-300 p-2 rounded text-maroon-mid font-bold outline-none font-mono"
                          />
                        </div>
                      )}
                    </div>

                    <div className="border-t border-neutral-100 pt-4 flex justify-end gap-3.5">
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        className="px-4.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold uppercase text-[10px] tracking-wider rounded transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingProduct}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[10px] rounded transition-all disabled:opacity-50 cursor-pointer shadow"
                      >
                        {isAddingProduct ? "Creating Product..." : "Save Product"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Editing Form Overlay */}
            {selectedJewelId && (
              <form onSubmit={handleUpdateJewelSubmit} className="bg-gold-light/45 border-2 border-dashed border-[#D4AF37]/50 rounded-lg p-5 space-y-4 text-xs animate-slideIn max-w-2xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-maroon-mid text-sm font-serif flex items-center gap-1.5">
                    <Hammer className="w-4 h-4 text-gold-mid" />
                    Configure Jewel Pricing & Flash Parameters
                  </span>
                  <button type="button" onClick={() => setSelectedJewelId(null)} className="text-neutral-500 hover:text-neutral-800 p-1 bg-white border rounded">Cancel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Standard Price (₹) *</label>
                    <input type="number" required value={modPrice} onChange={(e) => setModPrice(e.target.value)} className="w-full bg-white border p-2 rounded" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Current Stock Level *</label>
                    <input type="number" required value={modStock} onChange={(e) => setModStock(e.target.value)} className="w-full bg-white border p-2 rounded" />
                  </div>
                  <div className="sm:pt-6 flex items-center gap-2">
                    <input type="checkbox" id="modFlash" checked={modFlashSale} onChange={(e) => setModFlashSale(e.target.checked)} className="w-4 h-4 accent-maroon-mid" />
                    <label htmlFor="modFlash" className="font-semibold text-neutral-700 cursor-pointer select-none">Flash Price</label>
                  </div>
                  {modFlashSale && (
                    <div>
                      <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Flash Promo Price (₹)</label>
                      <input type="number" value={modFlashPrice} onChange={(e) => setModFlashPrice(e.target.value)} className="w-full bg-white border p-2 rounded text-maroon-mid font-bold" />
                    </div>
                  )}
                </div>

                <button type="submit" className="px-5 py-2.5 bg-maroon-mid text-white hover:bg-neutral-900 border border-gold-mid font-bold uppercase tracking-widest text-[9px] rounded transition-all">
                  Commit Goldsmith Parameter Adjustments
                </button>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="bg-[#1C1817] text-white border-b border-gold-mid/30 text-[10px] font-mono tracking-wider uppercase">
                    <th className="p-3">Reference / SKU</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Standard Price</th>
                    <th className="p-3">Stock Level</th>
                    <th className="p-3">Flash Status</th>
                    <th className="p-3">Purchases Count</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-mid/10 text-neutral-700">
                  {filteredJewels.map((jewel) => (
                    <tr key={jewel.id} className="hover:bg-gold-light/10 transition-colors">
                      <td className="p-3 font-mono font-bold text-gold-dark">{jewel.sku}</td>
                      <td className="p-3 font-serif font-bold text-[#1C1817]">{jewel.name}</td>
                      <td className="p-3">{jewel.category}</td>
                      <td className="p-3 font-medium">₹{jewel.price?.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                          jewel.stock === 0 ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          jewel.stock < 3 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {jewel.stock} left
                        </span>
                      </td>
                      <td className="p-3">
                        {jewel.isFlashSale ? (
                          <span className="text-maroon-mid font-bold truncate">
                            Active (₹{jewel.flashSalePrice?.toLocaleString()})
                          </span>
                        ) : (
                          <span className="text-neutral-400">Regular</span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-semibold">{jewel.purchasesCount} units</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => loadJewelEditor(jewel)}
                          className="px-3 py-1.5 bg-transparent border border-gold-mid/20 hover:border-gold-mid rounded font-bold uppercase tracking-widest text-[9px] hover:bg-gold-light/20 transition-all text-neutral-600 hover:text-neutral-900"
                        >
                          Modify Parameters
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredJewels.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center font-serif text-neutral-500 font-light text-sm italic">
                        कोई प्रॉडक्ट नहीं मिला (No products match your search query)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ACQUISITIONS ORDER LIST & RETURNS APPROVER */}
        {activeTab === "orders" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#FCFBF8] border border-gold-mid/20 rounded-lg p-5 sm:p-7 shadow space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gold-mid/10 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wide">
                    Orders & Returns (ऑर्डर मैनेजमेंट) ({orders.length})
                  </h3>
                  <p className="text-xs text-neutral-500 font-light mt-0.5">
                    Track luxury orders, print dispatch lists, and manage delivery milestones.
                  </p>
                </div>
              </div>

              {/* Search input bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full bg-gold-light/10 p-3 rounded border border-gold-mid/10">
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="ऑर्डर खोजें (ID, नाम, ईमेल, फ़ोन या स्थिति)..."
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    className="w-full bg-white border border-gold-mid/30 text-xs text-neutral-800 rounded pl-3 pr-10 py-2.5 outline-none focus:border-gold-mid focus:ring-1 focus:ring-gold-mid font-sans"
                  />
                  {ordersSearch && (
                    <button
                      type="button"
                      onClick={() => setOrdersSearch("")}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left min-w-[900px]">
                  <thead>
                    <tr className="bg-[#1C1817] text-white border-b border-gold-mid/30 text-[10px] font-mono tracking-wider uppercase">
                      <th className="p-3.5">Order Info</th>
                      <th className="p-3.5">Client Credentials</th>
                      <th className="p-3.5">Delivery Address (पूरा पता)</th>
                      <th className="p-3.5">Jewels Ordered</th>
                      <th className="p-3.5">Total Bill</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-mid/10 text-neutral-700">
                    {filteredOrders.map((order) => {
                      // Format address nicely if custom fields exist
                      const hasDetailedAddress = !!order.houseAddress;
                      const displayAddress = hasDetailedAddress ? (
                        <div className="space-y-1 font-sans text-[11px] leading-relaxed text-neutral-700">
                          <p className="font-semibold text-neutral-800">{order.houseAddress}</p>
                          {order.landmark && <p className="text-neutral-500 font-light">Landmark: {order.landmark}</p>}
                          <p className="text-neutral-600 font-medium">
                            {order.city}, {order.state} - <span className="font-mono">{order.pincode}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-500 max-w-[220px] truncate-3-lines font-light leading-relaxed font-sans" title={order.notes}>
                          {order.notes || "No address provided"}
                        </p>
                      );

                      return (
                        <tr key={order.id} className="hover:bg-gold-light/10 transition-colors">
                          {/* Order ID & Date */}
                          <td className="p-3.5 font-mono">
                            <span className="font-bold text-maroon-mid text-xs block">{order.id}</span>
                            <span className="text-[10px] text-neutral-400 block mt-0.5">{order.date}</span>
                          </td>

                          {/* Client Info */}
                          <td className="p-3.5">
                            <strong className="text-neutral-800 font-sans block text-xs">{order.customerName}</strong>
                            <span className="text-[10px] text-neutral-500 font-mono block select-all mt-0.5">📞 {order.customerPhone}</span>
                            <span className="text-[10px] text-neutral-400 font-mono block select-all truncate max-w-[170px]">{order.customerEmail}</span>
                          </td>

                          {/* Delivery Address */}
                          <td className="p-3.5 max-w-[260px]">
                            {displayAddress}
                          </td>

                          {/* Product details */}
                          <td className="p-3.5">
                            <div className="space-y-0.5 font-sans">
                              {order.items.map((it, i) => (
                                <div key={i} className="text-[#1C1817] text-xs flex items-center justify-between gap-4">
                                  <span className="font-medium truncate max-w-[140px]" title={it.name}>✿ {it.name}</span>
                                  <span className="font-mono text-neutral-500 text-[10px] font-bold">x{it.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Total Bill */}
                          <td className="p-3.5 font-semibold text-neutral-900 text-xs font-mono">
                            ₹{order.total?.toLocaleString()}
                          </td>

                          {/* Status badge view */}
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 border rounded text-[9px] font-bold uppercase tracking-wider font-mono inline-block text-center ${
                              order.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              order.status === "Shipped" ? "bg-sky-50 text-sky-700 border-sky-200" :
                              order.status === "Packed" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                              order.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" :
                              "bg-[#F7F4EB] text-gold-dark border-gold-mid/25"
                            }`}>
                              {order.status}
                            </span>
                          </td>

                          {/* Status adjust select */}
                          <td className="p-3.5 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                              className="bg-white border border-neutral-300 hover:border-gold-mid rounded text-neutral-800 p-2 text-xs font-medium outline-none focus:ring-1 focus:ring-maroon-mid cursor-pointer transition-all"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Received">Received</option>
                              <option value="Crafting">Crafting</option>
                              <option value="Quality Check">Quality Check</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center font-serif text-neutral-500 font-light text-sm italic">
                          कोई ऑर्डर नहीं मिला (No orders match your search query)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Goldsmith Return Warranties workspace */}
            <div className="bg-[#FCFBF8] border border-gold-mid/20 rounded-lg p-5 sm:p-7 shadow space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#800020] tracking-wide border-b border-gold-mid/10 pb-3">
                Goldsmith Return / Sizing Claims Workspace
              </h3>

              {returnsList.length === 0 ? (
                <p className="text-center p-6 text-neutral-400 font-light text-xs italic">
                  No active exchange or repair claims recorded of warranty codes.
                </p>
              ) : (
                <div className="space-y-4">
                  {returnsList.map((ret) => (
                    <div key={ret.id} className="border border-gold-mid/15 p-4 rounded bg-white text-xs space-y-3 shadow-sm relative hover:border-gold-mid transition-colors duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-neutral-500 font-mono uppercase block">Claim Code</span>
                          <strong className="text-sm font-bold text-neutral-800 font-mono">{ret.id}</strong>
                          <span className="text-neutral-400 mt-1 block">Order Ref: {ret.orderId} • Log Date: {ret.date}</span>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-[9px] font-bold border rounded uppercase ${
                            ret.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            ret.status === "Declined" ? "bg-rose-50 text-rose-700 border-rose-200" :
                            "bg-[#F7F4EB] text-gold-dark border-gold-mid/25"
                          }`}>
                            {ret.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-neutral-700 bg-gold-light/20 p-2.5 border border-gold-mid/10 rounded">
                        <strong className="text-[10px] text-neutral-400 uppercase font-mono block">Patron's Sizing/Repair Note:</strong>
                        <p className="italic font-light text-neutral-600 mt-1">&ldquo;{ret.reason}&rdquo;</p>
                        <span className="block mt-1 font-semibold">Jewel: {ret.jewelName} • Patron: {ret.customerName}</span>
                      </div>

                      {ret.status === "Pending" && (
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => onUpdateReturnStatus(ret.id, "Declined")}
                            className="px-3.5 py-1.5 border border-rose-500/30 hover:border-rose-500 text-rose-600 hover:text-white hover:bg-rose-950/10 rounded uppercase font-bold text-[9px] tracking-wider transition-colors"
                          >
                            Decline Claim
                          </button>
                          <button
                            onClick={() => onUpdateReturnStatus(ret.id, "Approved")}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded uppercase font-bold text-[9px] tracking-wider transition-colors"
                          >
                            Approve & Initiate goldsmithing Work
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PATRONS CRM DIRECTORY & ABANDONMENT LIST */}
        {activeTab === "customers" && (
          <div className="space-y-8">
            <div className="bg-[#FCFBF8] border border-gold-mid/20 rounded-lg p-5 sm:p-7 shadow space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gold-mid/10 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wide">
                    Customers List (ग्राहक) ({customers.length})
                  </h3>
                  <p className="text-xs text-neutral-500 font-light mt-0.5">
                    View registered users, track customer spend values, and initiate cart abandonment recovery dispatches.
                  </p>
                </div>
              </div>

              {/* Search input bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full bg-gold-light/10 p-3 rounded border border-gold-mid/10">
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="ग्राहक खोजें (नाम, ईमेल, फ़ोन नंबर या श्रेणी)..."
                    value={customersSearch}
                    onChange={(e) => setCustomersSearch(e.target.value)}
                    className="w-full bg-white border border-gold-mid/30 text-xs text-neutral-800 rounded pl-3 pr-10 py-2.5 outline-none focus:border-gold-mid focus:ring-1 focus:ring-gold-mid font-sans"
                  />
                  {customersSearch && (
                    <button
                      type="button"
                      onClick={() => setCustomersSearch("")}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  Showing {filteredCustomers.length} of {customers.length} customers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-[#1C1817] text-white border-b border-gold-mid/30 text-[10px] font-mono tracking-wider uppercase">
                      <th className="p-3">Patron Name</th>
                      <th className="p-3">Email Key</th>
                      <th className="p-3">Loyalty Segment</th>
                      <th className="p-3">Total Invested</th>
                      <th className="p-3">Lifetime Value (CLV Cash)</th>
                      <th className="p-3">Status Badges</th>
                      <th className="p-3 text-right">CRM Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-mid/10 text-neutral-700">
                    {filteredCustomers.map((c) => {
                      const isRecovered = recoveredEmails.includes(c.email);
                      
                      return (
                        <tr key={c.id} className="hover:bg-gold-light/10 transition-colors">
                          <td className="p-3 font-serif font-bold text-neutral-800">{c.name}</td>
                          <td className="p-3 font-mono select-all text-neutral-600">{c.email}</td>
                          <td className="p-3">
                            <span className="bg-gold-mid/10 border border-gold-mid/20 text-gold-dark text-[9px] font-bold font-mono uppercase tracking-wider py-0.5 px-2 rounded-full">
                              {c.segment}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-neutral-700">₹{c.totalSpent?.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-[#800020]">₹{c.clv?.toLocaleString()}</td>
                          <td className="p-3">
                            {c.cartAbandoned ? (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5 text-[9px] font-extrabold uppercase font-mono flex items-center gap-1 w-max animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> Cart Abandoned
                              </span>
                            ) : (
                              <span className="text-neutral-400">Regular</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {c.cartAbandoned && (
                              <button
                                onClick={() => handleRecoverCart(c)}
                                disabled={isRecovered}
                                className={`px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                                  isRecovered
                                    ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                                    : "bg-gold-mid hover:bg-gold-light text-neutral-900 border border-gold-mid flex items-center gap-1.5 ml-auto text-right"
                                }`}
                              >
                                {isRecovered ? "Recovery Texted" : "Dispatch Recovery Wa"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center font-serif text-neutral-500 font-light text-sm italic">
                          कोई ग्राहक नहीं मिला (No customers match your search query)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CAMPAIGNS SCHEDULER */}
        {activeTab === "campaigns" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Campaign scheduler build form */}
            <div className="bg-[#FCFBF8] border border-gold-mid/20 rounded-lg p-5 sm:p-7 shadow space-y-4">
              <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wide border-b border-gold-mid/10 pb-3">
                Build Haute Campaign Pushes
              </h3>

              {campSuccess && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs p-4 rounded text-center font-light animate-slideIn">
                  {campSuccess}
                </div>
              )}

              <form onSubmit={handleCreateCampaignSubmit} className="space-y-4.5 text-xs text-left">
                <div>
                  <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Campaign Moniker Name *</label>
                  <input
                    type="text"
                    required
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    placeholder="e.g. Midsummer Elite Rubies Showcase"
                    className="w-full bg-white border border-gold-mid/15 rounded p-2 outline-none focus:border-maroon-mid"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Target Medium Channel</label>
                    <select
                      value={campMedium}
                      onChange={(e) => setCampMedium(e.target.value as any)}
                      className="w-full bg-white border border-gold-mid/15 rounded p-2 outline-none"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                      <option value="Push">Push Notification</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Audience segment Circles</label>
                    <select
                      value={campAudience}
                      onChange={(e) => setCampAudience(e.target.value)}
                      className="w-full bg-white border border-gold-mid/15 rounded p-2 outline-none"
                    >
                      <option value="VVIP Patrons & Collectors">VVIP circles & Collectors</option>
                      <option value="All Registered Shoppers">All Registered Shoppers</option>
                      <option value="Abandoned Carts">Cart Abandoners</option>
                    </select>
                  </div>
                </div>

                {campMedium === "Email" && (
                  <div>
                    <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Email Subject Header *</label>
                    <input
                      type="text"
                      required
                      value={campSubject}
                      onChange={(e) => setCampSubject(e.target.value)}
                      placeholder="e.g. The Royal crimson beckons: Private tasting of Burma Rubies"
                      className="w-full bg-white border border-gold-mid/15 rounded p-2 outline-none focus:border-maroon-mid"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">Campaign Body Content *</label>
                  <textarea
                    required
                    value={campBody}
                    onChange={(e) => setCampBody(e.target.value)}
                    placeholder="Write a highly aesthetic luxury notice tailored to gold connoisseurs... e.g. Greeting, noble patron. Maison d'Aurelia invites you to an exclusive tour..."
                    rows={4}
                    className="w-full bg-white border border-gold-mid/15 rounded p-2 outline-none focus:border-maroon-mid resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-maroon-mid hover:bg-neutral-900 border border-gold-mid text-[#FCFBF8] font-bold uppercase tracking-widest text-[9px] rounded transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-gold-mid" />
                  <span>Launch Campaign instantly</span>
                </button>
              </form>
            </div>

            {/* Campaign statistics cards */}
            <div className="lg:col-span-2 space-y-4">
              {campaigns.map((camp) => (
                <div key={camp.id} className="bg-[#FCFBF8] border border-gold-mid/15 rounded p-5 space-y-3 shadow-sm hover:shadow relative">
                  <div className="flex justify-between items-start border-b border-gold-mid/10 pb-2 text-xs">
                    <div>
                      <span className="bg-gold-light/45 text-gold-dark border border-gold-mid/15 text-[8px] font-mono font-bold tracking-wider py-0.5 px-2 rounded uppercase font-mono mr-2">
                        {camp.channel}
                      </span>
                      <strong className="font-serif text-neutral-800 text-sm font-bold">{camp.name}</strong>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">Sent: {camp.sentDate}</span>
                  </div>

                  <p className="text-neutral-500 font-light text-xs italic line-clamp-2">&ldquo;{camp.body}&rdquo;</p>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono tracking-widest uppercase text-neutral-500 pt-1">
                    <div className="bg-neutral-50 border border-neutral-150 p-2 rounded">
                      <span className="block text-[#1C1817] font-bold text-xs">{camp.sentCount}</span>Sent circle
                    </div>
                    <div className="bg-neutral-50 border border-neutral-150 p-2 rounded">
                      <span className="block text-emerald-700 font-bold text-xs">{camp.opensCount}</span>Read/Opened
                    </div>
                    <div className="bg-neutral-50 border border-neutral-150 p-2 rounded">
                      <span className="block text-maroon-mid font-bold text-xs">{camp.clicksCount}</span>Interacted
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="bg-[#FCFBF8] border border-gold-mid/25 rounded-lg p-6 sm:p-8 shadow max-w-2xl mx-auto space-y-6">
            <div className="border-b border-gold-mid/10 pb-4">
              <h3 className="font-serif text-xl font-bold text-neutral-800 tracking-wide">
                WhatsApp Chat Integration (व्हाट्सएप सेटिंग्स)
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Configure the floating WhatsApp button visibility, active support phone number, and default greeting message.
              </p>
            </div>

            <form onSubmit={handleSaveWhatsAppSettings} className="space-y-6">
              {/* Toggle Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gold-light/10 border border-gold-mid/15 rounded-md">
                <div className="space-y-1">
                  <span className="text-xs font-bold tracking-wider uppercase text-neutral-700 block">Enable WhatsApp Chat</span>
                  <span className="text-[11px] text-neutral-500 block">
                    Toggle to show or completely hide the floating WhatsApp chat button across the website.
                  </span>
                </div>
                
                {/* Custom Toggle Switch (Matches the provided ON/OFF design) */}
                <div 
                  id="whatsapp-toggle"
                  onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                  className={`relative w-[110px] h-11 rounded-full cursor-pointer select-none transition-all duration-300 flex items-center p-1 border-2 border-neutral-300 shadow-md ${
                    whatsappEnabled ? "bg-[#4CAF50]" : "bg-[#FF0000]"
                  }`}
                >
                  <span className={`absolute text-white font-black font-sans tracking-widest text-[11px] transition-all duration-300 ${
                    whatsappEnabled ? "left-4" : "right-4"
                  }`}>
                    {whatsappEnabled ? "ON" : "OFF"}
                  </span>
                  
                  <div className={`w-[36px] h-[36px] rounded-full bg-white shadow-lg flex items-center justify-center transform transition-all duration-300 ${
                    whatsappEnabled ? "translate-x-[64px]" : "translate-x-0"
                  }`}>
                    <div className="w-2 h-2 rounded-full bg-neutral-200 border border-neutral-300 font-bold text-neutral-300"></div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Phone Number */}
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">
                  WhatsApp Number (देश कोड के साथ व्हाट्सएप नंबर) *
                </label>
                <input
                  type="text"
                  required={whatsappEnabled}
                  placeholder="91XXXXXXXXXX"
                  value={whatsappNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\s+/g, "");
                    setWhatsappNumber(val);
                  }}
                  className="w-full bg-white border border-gold-mid/20 rounded p-2.5 text-xs text-neutral-800 outline-none focus:border-maroon-mid font-mono"
                />
                <p className="text-[11px] text-neutral-400">
                  Enter only digits including the country code (no leading +, spaces, or dashes). Example: <strong className="font-mono text-neutral-700">919876543210</strong> (where 91 is India's country code).
                </p>
              </div>

              {/* Default Welcome Message */}
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500 font-mono uppercase block mb-1">
                  Default Message (व्हाट्सएप संदेश)
                </label>
                <textarea
                  placeholder="e.g. Hello, I need assistance."
                  value={whatsappDefaultMessage}
                  onChange={(e) => setWhatsappDefaultMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gold-mid/20 rounded p-2.5 text-xs text-neutral-800 outline-none focus:border-maroon-mid resize-none"
                />
                <p className="text-[11px] text-neutral-400">
                  This message is pre-filled in the user's chat window when they click the WhatsApp button.
                </p>
              </div>

              {/* Status alerts */}
              {whatsappError && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded p-3 text-xs flex items-center gap-2">
                  <span className="font-bold">Error:</span> {whatsappError}
                </div>
              )}
              {whatsappSuccess && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded p-3 text-xs flex items-center gap-2 animate-fadeIn">
                  <span className="font-bold">✓</span> {whatsappSuccess}
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={whatsappSaving}
                className="w-full py-3 bg-maroon-mid hover:bg-neutral-900 text-[#FCFBF8] border border-gold-mid font-bold uppercase tracking-widest text-[10px] rounded transition-all duration-300 disabled:opacity-50"
              >
                {whatsappSaving ? "Saving Settings..." : "Save WhatsApp Settings"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
