import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, ShieldCheck, Check, CornerDownLeft, Sparkles, ArrowRight, RefreshCw, X } from "lucide-react";

interface SignInRegisterProps {
  loggedInUser: { name: string; email: string } | null;
  onLogin: (name: string, email: string) => void;
  onLogout: () => void;
  setView: (view: "shop" | "portal" | "admin" | "blog" | "checkout" | "login") => void;
}

export default function SignInRegister({
  loggedInUser,
  onLogin,
  onLogout,
  setView
}: SignInRegisterProps) {
  // Mobile verification states
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer run effect
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleGetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    resetMessages();

    // Simulating secure OTP transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setOtpSent(true);
      setResendTimer(30);
      setSuccessMsg(`Secure 6-digit OTP passcode transmitted successfully to +91 ${mobileNumber.replace(/(\d{5})(\d{5})/, "$1-$2")}.`);
    }, 1200);
  };

  const handleVerifyOtpAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg("Please fill in the received OTP verification pin.");
      return;
    }

    setIsSubmitting(true);
    resetMessages();

    // Verify OTP pin
    setTimeout(() => {
      // Simulate Indian Patron identity
      const designatedName = "Yogesh Shakya";
      const generatedMockEmail = "yogesh.shakya007@gmail.com";

      onLogin(designatedName, generatedMockEmail);
      setSuccessMsg("Verifying cryptographic signature... Access authorized!");
      setIsSubmitting(false);

      setTimeout(() => {
        setView("portal"); // redirect smoothly to tracking / wishlist dashboard
      }, 1500);
    }, 1200);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    resetMessages();
    setResendTimer(30);
    setSuccessMsg(`A fresh security token has been generated and sent to +91 ${mobileNumber}.`);
  };

  // Google social login simulation
  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    resetMessages();

    setTimeout(() => {
      const googlePatronName = "Yogesh Shakya";
      const googleEmail = "yogesh.shakya007@gmail.com";
      onLogin(googlePatronName, googleEmail);
      setSuccessMsg("Google authorization successful. Securing key credentials...");
      setIsSubmitting(false);

      setTimeout(() => {
        setView("portal");
      }, 1500);
    }, 1100);
  };

  return (
    <div id="signin-register-page" className="min-h-screen bg-[#FCFBF8] flex flex-col items-center justify-center py-16 px-4">
      {/* Brand Back-Link anchor */}
      <div className="mb-8 select-none">
        <button
          onClick={() => setView("shop")}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-maroon-mid transition-all duration-200 tracking-widest font-mono uppercase cursor-pointer"
        >
          <CornerDownLeft className="w-3.5 h-3.5 text-gold-dark" />
          <span>Back to Boutique</span>
        </button>
      </div>

      <div className="max-w-md w-full">
        {/* Already Logged In State Screen */}
        {loggedInUser ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-[#D4AF37] p-8 rounded-lg shadow-[0_12px_45px_rgba(128,0,32,0.06)] text-center space-y-6 relative"
          >
            {/* Close Button ("X") */}
            <button
              onClick={() => setView("shop")}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-maroon-mid transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none z-10"
              title="Close and return to boutique"
              id="close-logged-in-card"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="h-16 w-16 mx-auto rounded-full bg-gold-light border border-[#D4AF37] flex items-center justify-center text-maroon-mid">
              <Check className="w-8 h-8 text-maroon-mid animate-scale-up" />
            </div>
            
            <span className="text-[10px] text-gold-dark font-mono uppercase tracking-[0.22em] block font-bold">Logged In Successfully</span>
            
            <div className="bg-neutral-50 border border-gold-mid/20 rounded-lg p-4 space-y-2 text-center">
              <p className="text-[9px] text-neutral-450 uppercase tracking-widest font-mono">Member Profile</p>
              <h3 className="font-serif text-xl font-bold text-maroon-dark">Yogesh Shakya</h3>
              <p className="text-xs text-neutral-600 font-mono tracking-wider">+91 98765 43210</p>
              <p className="text-[11px] text-neutral-400 font-sans">{loggedInUser.email}</p>
            </div>
            
            <p className="text-xs text-neutral-500 font-sans leading-relaxed px-2">
              Welcome back to Aurelia. You can now track your orders, manage your wishlist, and enjoy premium member boutique benefits.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => setView("portal")}
                className="w-full py-3.5 bg-[#800020] hover:bg-[#600018] text-white font-sans font-bold text-xs uppercase tracking-widest rounded transition-all duration-300 shadow-md cursor-pointer"
                id="portal-redirect-btn"
              >
                My Orders
              </button>
              <button
                onClick={() => onLogout()}
                className="w-full py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-sans font-semibold text-xs uppercase tracking-widest rounded transition-all duration-300 cursor-pointer"
                id="logout-btn"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        ) : (
          /* Authentication Card Container */
          <motion.div
            layout
            className="bg-white border-2 border-[#D4AF37]/75 p-8 sm:p-10 rounded-lg shadow-[0_20px_50px_rgba(212,175,55,0.08)] relative"
          >
            {/* Top gold line indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#800020] via-[#D4AF37] to-[#800020] rounded-t-lg" />

            {/* Close Button ("X") */}
            <button
              onClick={() => setView("shop")}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-[#800020] transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none z-10"
              title="Close and return to boutique"
              id="close-signin-card"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-serif text-2xl font-extrabold text-maroon-dark tracking-wide uppercase">Sign In</h2>
                <p className="text-xs sm:text-sm text-neutral-700 font-sans tracking-wide font-medium">
                  Access your orders & exclusive member wishlists via instant OTP verification.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 text-red-750 text-xs rounded border border-red-100 text-center font-mono">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-100 text-center font-sans tracking-wide leading-relaxed">
                  <div className="flex items-center justify-center gap-1.5 font-semibold text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Notification</span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-600">{successMsg}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {!otpSent ? (
                  <motion.form
                    key="phone-input-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleGetOtp}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-neutral-800 font-sans tracking-wider uppercase block font-semibold">
                        Mobile Number *
                      </label>
                      <div className="relative flex rounded border border-gold-mid/45 focus-within:border-maroon-mid overflow-hidden transition-colors">
                        {/* Indian flag country key code selector */}
                        <div className="bg-neutral-50 border-r border-gold-mid/30 px-3 flex items-center gap-1 text-xs text-neutral-600 font-mono select-none">
                          <span className="text-neutral-500">🇮🇳</span>
                          <span className="font-semibold">+91</span>
                        </div>
                        <div className="relative flex-1">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-mid/55" />
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            pattern="[0-9]{10}"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                            placeholder="98765 43210"
                            className="w-full py-3.5 pl-10 pr-4 outline-none text-xs transition-colors tracking-widest font-mono text-neutral-800"
                            id="mobile-number-input"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-maroon-mid hover:bg-maroon-dark text-[#FCFBF8] border border-maroon-mid font-bold uppercase tracking-widest text-xs rounded transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 shadow-sm"
                      id="get-otp-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Secure Token...</span>
                        </>
                      ) : (
                        <>
                          <span>Get OTP</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gold-mid" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="otp-verification-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleVerifyOtpAndLogin}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] text-neutral-800 font-sans tracking-wider uppercase block font-semibold">
                          OTP Passcode *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            resetMessages();
                          }}
                          className="text-[9px] text-[#800020] hover:underline font-mono uppercase tracking-wider"
                        >
                          Change Number
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter 6-digit OTP passcode"
                          className="w-full border border-gold-mid/45 rounded py-3.5 px-4 outline-none focus:border-maroon-mid text-center text-sm font-mono tracking-[0.6em] transition-colors placeholder:tracking-normal placeholder:text-xs"
                          id="otp-code-input"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-neutral-600 font-sans pt-1 font-medium">
                        <span>Demo Code: Any digit passcode</span>
                        {resendTimer > 0 ? (
                          <span className="text-neutral-500 font-medium">Resend in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-[#800020] hover:underline font-bold"
                          >
                            Resend OTP PIN
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-maroon-mid hover:bg-maroon-dark text-[#FCFBF8] border border-maroon-mid font-bold uppercase tracking-widest text-xs rounded transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 shadow-sm"
                      id="verify-otp-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In via OTP</span>
                          <Check className="w-3.5 h-3.5 text-gold-mid" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Minimalist Social login divider */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-x-0 h-[1px] bg-neutral-100" />
                <span className="relative z-10 px-4 bg-white text-[10px] text-neutral-700 font-sans font-semibold tracking-widest uppercase">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* Minimalist Continue with Google social login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-3 border border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs rounded transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                id="google-login-btn"
              >
                {/* Colorful exact Google custom G vector icon */}
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.12A6.9 6.9 0 0 1 5.5 12c0-.74.13-1.46.34-2.12V7.04H2.18A11.96 11.96 0 0 0 0 12c0 1.84.42 3.59 1.18 5.15l3.6-2.83-1.12-.2z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Authenticity footer watermark */}
            <div className="mt-8 pt-4 border-t border-gold-mid/15 flex items-center justify-center gap-1.5 text-neutral-600 select-none">
              <ShieldCheck className="w-4 h-4 text-gold-mid/60" />
              <span className="text-[9px] font-mono tracking-widest uppercase">
                Maison d'Aurelia Indian Commerce Gateway
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
