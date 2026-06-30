import React from "react";

export default function FeaturesBar() {
  return (
    <div className="custom-premium-footer-features" id="premium-features-bar-container">
      {/* Option 1: ALL INDIA FREE DELIVERY */}
      <div className="premium-feature-item" id="feat-free-delivery">
        <div className="premium-feature-inner">
          <div className="premium-feature-icon">
            {/* Elegant luxury minimalist thin-line Delivery Truck */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8" />
              <path d="M14 12V6h4l4 4v6a2 2 0 0 1-2 2h-2" />
              <circle cx="7.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className="premium-feature-content">
            <h4 className="premium-main-text">ALL INDIA FREE DELIVERY</h4>
            <p className="premium-sub-text">Orders above ₹699</p>
          </div>
        </div>
      </div>

      <div className="premium-divider"></div>

      {/* Option 2: CASH ON DELIVERY */}
      <div className="premium-feature-item" id="feat-cod">
        <div className="premium-feature-inner">
          <div className="premium-feature-icon">
            {/* Elegant high-end paper banknote / money bill outline */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>
          <div className="premium-feature-content">
            <h4 className="premium-main-text">CASH ON DELIVERY</h4>
            <p className="premium-sub-text">On all orders</p>
          </div>
        </div>
      </div>

      <div className="premium-divider"></div>

      {/* Option 3: FREE RETURN */}
      <div className="premium-feature-item" id="feat-free-return">
        <div className="premium-feature-inner">
          <div className="premium-feature-icon">
            {/* Sleek reciprocal loop thin arrows for luxury exchange */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
          </div>
          <div className="premium-feature-content">
            <h4 className="premium-main-text">FREE RETURN</h4>
            <p className="premium-sub-text">Within 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
