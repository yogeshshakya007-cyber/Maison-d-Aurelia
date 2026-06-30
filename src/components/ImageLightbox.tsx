import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export default function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  productName
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Smooth fade-in & fade-out transition states
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  // Touch & gesture refs
  const isPinching = useRef(false);
  const isDragging = useRef(false);
  const initialPinchDistance = useRef(0);
  const initialScale = useRef(1);
  const dragStart = useRef({ x: 0, y: 0 });
  const swipeStart = useRef({ x: 0, y: 0 });

  // Reset zoom on index change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Sync initialIndex on open and coordinate smooth animation cycles
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsRendered(true);
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      document.body.style.overflow = "hidden";
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isRendered) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDoubleTap = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setScale((s) => {
      const next = Math.max(s - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Pinch started
      isPinching.current = true;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistance.current = dist;
      initialScale.current = scale;
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        // Panning when zoomed
        isDragging.current = true;
        dragStart.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        };
      } else {
        // Swipe detection start
        swipeStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && isPinching.current) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialPinchDistance.current;
      const nextScale = Math.min(Math.max(initialScale.current * factor, 0.8), 4);
      setScale(nextScale);
    } else if (e.touches.length === 1) {
      if (scale > 1 && isDragging.current) {
        e.preventDefault();
        const nextX = e.touches[0].clientX - dragStart.current.x;
        const nextY = e.touches[0].clientY - dragStart.current.y;
        
        // Bounds limit based on scale
        const maxOffset = (scale - 1) * 200;
        setPosition({
          x: Math.min(Math.max(nextX, -maxOffset), maxOffset),
          y: Math.min(Math.max(nextY, -maxOffset), maxOffset)
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isPinching.current) {
      isPinching.current = false;
      if (scale < 1.05) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    } else if (isDragging.current) {
      isDragging.current = false;
    } else {
      // Check swipe gesture
      const diffX = e.changedTouches[0].clientX - swipeStart.current.x;
      const diffY = e.changedTouches[0].clientY - swipeStart.current.y;

      if (Math.abs(diffX) > 60 && Math.abs(diffY) < 60) {
        if (diffX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
  };

  // Mouse drag panning for desktops
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      isDragging.current = true;
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (scale > 1 && isDragging.current) {
      e.preventDefault();
      const nextX = e.clientX - dragStart.current.x;
      const nextY = e.clientX - dragStart.current.y;
      
      const maxOffset = (scale - 1) * 250;
      setPosition({
        x: Math.min(Math.max(nextX, -maxOffset), maxOffset),
        y: Math.min(Math.max(nextY, -maxOffset), maxOffset)
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className={`fixed inset-0 z-[150] flex flex-col justify-between bg-[#FFFFFF] select-none overflow-hidden touch-none transition-all duration-300 ease-in-out ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      {/* Minimal Zoom controls (No Title/ProductName) */}
      <div className="px-5 py-4 flex items-center justify-end text-neutral-800 w-full z-10">
        <div className="flex items-center gap-2">
          {/* Zoom Actions */}
          <div className="hidden sm:flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-neutral-600">
            <button onClick={handleZoomOut} className="p-1 hover:text-black transition-colors cursor-pointer" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono select-none px-1 text-neutral-700 font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button onClick={handleZoomIn} className="p-1 hover:text-black transition-colors cursor-pointer" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            {scale > 1 && (
              <button onClick={handleResetZoom} className="p-1 hover:text-black border-l border-neutral-200 pl-1.5 transition-colors cursor-pointer" title="Reset Zoom">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono bg-neutral-50 border border-neutral-200 text-neutral-500 rounded px-2 py-1 hidden xs:inline-block">
            Double Click to Zoom
          </span>
        </div>
      </div>

      {/* Main Image Stage Container */}
      <div 
        className="flex-1 w-full flex items-center justify-center relative cursor-grab active:cursor-grabbing overflow-hidden p-4 bg-[#FFFFFF]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleTap}
      >
        {/* Dynamic Image Wrapper with Strict 1:1 Aspect Ratio */}
        <div 
          className="transition-transform duration-100 ease-out flex items-center justify-center w-full max-w-[1080px] aspect-square overflow-hidden bg-[#FFFFFF]"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`
          }}
        >
          <img
            referrerPolicy="no-referrer"
            src={images[currentIndex]}
            alt={`${productName} view ${currentIndex + 1}`}
            style={{
              width: "100%",
              height: "auto",
              maxWidth: "1080px",
              aspectRatio: "1 / 1",
              objectFit: "contain"
            }}
            className="pointer-events-none select-none transition-all duration-300"
          />
        </div>
      </div>

      {/* Footer bar containing Pagination Dots & Minimal Outlined Navigation Buttons */}
      <div className="w-full flex flex-col items-center gap-4 pb-8 pt-4 bg-[#FFFFFF] z-[160] relative shrink-0">
        
        {/* Pagination indicator dots */}
        <div className="flex items-center justify-center gap-2" id="lightbox-pagination-dots">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? "w-6 bg-[#800020]" : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
              }`}
              title={`View slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Clean, Minimal Bottom Outlined Row */}
        <div 
          className="flex items-center justify-center gap-6 py-2 z-[170] relative pointer-events-auto"
          id="prao-control-bar"
        >
          {/* Previous view - Minimal Circular Outline */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="w-12 h-12 rounded-full border border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50 text-neutral-600 hover:text-black flex items-center justify-center transition-all cursor-pointer pointer-events-auto select-none active:scale-90"
            title="Previous Image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Minimal Centered Close Button 'X' Circular Outline */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-12 h-12 rounded-full border border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50 text-neutral-600 hover:text-black flex items-center justify-center transition-all cursor-pointer pointer-events-auto select-none active:scale-95"
            title="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Next view - Minimal Circular Outline */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="w-12 h-12 rounded-full border border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50 text-neutral-600 hover:text-black flex items-center justify-center transition-all cursor-pointer pointer-events-auto select-none active:scale-90"
            title="Next Image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Swipe Help Indicator */}
        <div className="text-[10px] text-neutral-400 font-mono text-center tracking-widest uppercase opacity-80 mt-1 select-none">
          Swipe Left/Right to browse / Pinch to Zoom
        </div>
      </div>
    </div>
  );
}
