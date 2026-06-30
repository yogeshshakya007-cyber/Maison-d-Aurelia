import React from "react";

export default function AnnouncementBar() {
  return (
    <div className="premium-announcement-bar" id="premium-announcement-bar">
      <div className="announcement-ticker" id="announcement-ticker">
        {/* Ticker items */}
        <div className="ticker-item">✨ PREMIUM ANTI-TARNISH JEWELLERY (कभी काली नहीं पड़ेगी) ✨</div>
        <div className="ticker-item">🚚 FREE SHIPPING ON ORDERS ABOVE ₹499 🚚</div>
        <div className="ticker-item">🎉 USE CODE: <span className="highlight-code">WELCOME10</span> FOR FLAT 10% OFF 🎉</div>
        <div className="ticker-item">🔄 EASY 7-DAY REPLACEMENT GUARANTEE 🔄</div>
        
        {/* Duplicated items to make the infinite marquee seamless and gapless */}
        <div className="ticker-item">✨ PREMIUM ANTI-TARNISH JEWELLERY (कभी काली नहीं पड़ेगी) ✨</div>
        <div className="ticker-item">🚚 FREE SHIPPING ON ORDERS ABOVE ₹499 🚚</div>
        <div className="ticker-item">🎉 USE CODE: <span className="highlight-code">WELCOME10</span> FOR FLAT 10% OFF 🎉</div>
        <div className="ticker-item">🔄 EASY 7-DAY REPLACEMENT GUARANTEE 🔄</div>
      </div>
    </div>
  );
}

