"use client";

import { useState, useEffect, useRef } from "react";

const TITLE_LOGIN = " LOGIN";
const TITLE_SIGNUP = "SIGNUP";
const NOISE = "@#%&*+==:.";

interface SplitFlapCharProps {
  charIndex: number;
  targetChar: string;
  trigger: boolean;
}

function SplitFlapChar({ charIndex, targetChar, trigger }: SplitFlapCharProps) {
  const [currentChar, setCurrentChar] = useState(targetChar);
  const [angle, setAngle] = useState(0);
  const [prevAngle, setPrevAngle] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const baseDelay = charIndex * 40;
    const randomOffset = Math.floor(Math.random() * 81) - 40;
    const delay = Math.max(0, baseDelay + randomOffset);

    const startTransition = () => {
      let frame = 0;
      const totalFrames = 8; // 4 out, 4 in
      const frameTime = 1000 / 12; // 12 FPS

      if (timerRef.current) clearInterval(timerRef.current as any);

      timerRef.current = setInterval(() => {
        frame++;
        if (frame <= 4) {
          // Flip out: 0 -> -90
          const ratio = frame / 4;
          const nextAngle = -90 * ratio;
          setAngle(prev => {
            setPrevAngle(prev);
            return nextAngle;
          });
        } else if (frame === 5) {
          // Swap char and reset angle
          setCurrentChar(targetChar);
          setAngle(90);
          setPrevAngle(-90);
        } else if (frame <= 9) {
          // Flip in: 90 -> 0
          const ratio = (frame - 5) / 4;
          const nextAngle = 90 - 90 * ratio;
          setAngle(prev => {
            setPrevAngle(prev);
            return nextAngle;
          });
        } else {
          setAngle(0);
          setPrevAngle(0);
          if (timerRef.current) clearInterval(timerRef.current as any);
        }
      }, frameTime);
    };

    const timeout = setTimeout(startTransition, delay);
    return () => {
      clearTimeout(timeout);
      if (timerRef.current) clearInterval(timerRef.current as any);
    };
  }, [targetChar, trigger, charIndex]);

  const displayChar = currentChar === " " ? "\u00A0" : currentChar;
  const isMoving = angle !== 0;

  return (
    <div 
      className="relative inline-block w-[0.65em] h-[1.2em] text-center select-none"
      style={{ perspective: "800px", transformStyle: "preserve-3d" }}
    >
      {/* Ghost smear layer */}
      {isMoving && (
        <span 
          className="absolute left-0 top-[2px] text-[#A3485A] opacity-25 blur-[1px] font-mono select-none"
          style={{ transform: `rotateX(${prevAngle}deg)`, backfaceVisibility: "hidden" }}
        >
          {displayChar}
        </span>
      )}
      {/* Main character layer */}
      <span 
        className="absolute left-0 top-0 text-[#842A3B] font-mono"
        style={{ transform: `rotateX(${angle}deg)`, backfaceVisibility: "hidden" }}
      >
        {displayChar}
      </span>
    </div>
  );
}

export default function AuthForm() {
  const [authMode, setAuthMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [triggerTitle, setTriggerTitle] = useState(false);

  // Form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Height reveal state for Confirm Password field
  const [confirmHeight, setConfirmHeight] = useState(0);
  const confirmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isConfirmRevealed = useRef(false);

  // Step-based height reveal (12fps)
  const triggerSteppedReveal = () => {
    isConfirmRevealed.current = true;
    let frame = 0;
    const steps = 6;
    const finalHeight = 47;
    const intervalTime = 1000 / 12;

    if (confirmTimerRef.current) clearInterval(confirmTimerRef.current as any);

    confirmTimerRef.current = setInterval(() => {
      frame++;
      const currentHeight = (finalHeight / steps) * frame;
      setConfirmHeight(Math.min(finalHeight, currentHeight));

      if (frame >= steps) {
        if (confirmTimerRef.current) clearInterval(confirmTimerRef.current as any);
      }
    }, intervalTime);
  };

  const triggerSteppedCollapse = () => {
    isConfirmRevealed.current = false;
    let frame = 0;
    const steps = 6;
    const startHeight = confirmHeight;
    const intervalTime = 1000 / 12;

    if (confirmTimerRef.current) clearInterval(confirmTimerRef.current as any);

    confirmTimerRef.current = setInterval(() => {
      frame++;
      const currentHeight = startHeight - (startHeight / steps) * frame;
      setConfirmHeight(Math.max(0, currentHeight));

      if (frame >= steps) {
        setConfirmHeight(0);
        if (confirmTimerRef.current) clearInterval(confirmTimerRef.current as any);
      }
    }, intervalTime);
  };

  // Handle Auth Mode Toggle
  const toggleAuthMode = () => {
    setAuthMode(prev => {
      const nextMode = prev === "LOGIN" ? "SIGNUP" : "LOGIN";
      setTriggerTitle(t => !t);
      setIsValid(true);
      setValidationError("");
      return nextMode;
    });
  };

  // Password strength check: min 8 chars, uppercase, lowercase, digit, special symbol
  const validatePassword = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  };

  // Watch password value and reveal confirm password field only when criteria is met
  useEffect(() => {
    if (authMode === "SIGNUP") {
      const isValidPassword = validatePassword(password);
      if (isValidPassword && !isConfirmRevealed.current) {
        triggerSteppedReveal();
      } else if (!isValidPassword && isConfirmRevealed.current) {
        triggerSteppedCollapse();
      }
    } else {
      if (isConfirmRevealed.current) {
        triggerSteppedCollapse();
      }
    }
  }, [password, authMode]);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setIsValid(true);

    if (authMode === "LOGIN") {
      // Mock validation: assume the correct password is "admin123"
      if (password !== "admin123") {
        setValidationError("incorrect password");
        setIsValid(false);
        return;
      }
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } else {
      // SIGNUP
      if (!validatePassword(password)) {
        setValidationError("Password must be at least 8 characters, include an uppercase letter, lowercase letter, number, and special character");
        setIsValid(false);
        return;
      }
      if (password !== confirmPassword) {
        setValidationError("confirm your password to continue");
        setIsValid(false);
        return;
      }
      // Clear receipt for new signup
      localStorage.removeItem("snipecv_receipt_data");
      // Redirect to dashboard
      window.location.href = "/dashboard";
    }
  };

  const titleString = authMode === "LOGIN" ? TITLE_LOGIN : TITLE_SIGNUP;

  return (
    <div className="w-full max-w-[340px] flex flex-col items-center justify-center py-8">
      {/* Split-flap mode title */}
      <div className="flex gap-x-[1px] mb-8 text-[32px] font-sans font-black tracking-widest uppercase">
        {titleString.split("").map((char, idx) => (
          <SplitFlapChar 
            key={idx} 
            charIndex={idx} 
            targetChar={char} 
            trigger={triggerTitle} 
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-y-6">
        {/* Username */}
        <div className="flex flex-col gap-y-1">
          <input 
            type="text" 
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. SIDDHARTHXVI"
            className="w-full border-t-0 border-l-0 border-r-0 border-b border-[#842A3B] px-3 py-2 bg-transparent text-[#842A3B] font-mono text-xs outline-none placeholder:text-[#A3485A]/35 focus:border-b-[#6B3F69] focus:ring-0 rounded-none transition-colors"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-y-1 relative w-full h-[37px] border-b border-[#842A3B] focus-within:border-b-[#6B3F69] transition-colors">
          <input 
            type="text" 
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setValidationError("");
            }}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-[#842A3B] px-3 py-2 font-mono text-xs outline-none border-none focus:ring-0 rounded-none z-10"
          />
          {/* Overlay masked/plain value */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#842A3B] font-mono text-xs tracking-wide select-none">
            {password ? (
              showPassword ? password : "#".repeat(password.length)
            ) : (
              <span className="opacity-35 font-mono text-xs select-none">••••••••••••</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#842A3B] hover:text-[#6B3F69] focus:outline-none transition-colors z-20"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Confirm Password (Stepped height reveal input) */}
        <div 
          className="overflow-hidden flex flex-col justify-end"
          style={{ height: `${confirmHeight}px` }}
        >
          <div className="flex flex-col gap-y-1 pb-[10px] relative">
            <div className="relative w-full h-[37px] border-b border-[#842A3B] focus-within:border-b-[#6B3F69] transition-colors">
              <input 
                type="text" 
                required={authMode === "SIGNUP"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setValidationError("");
                }}
                className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-[#842A3B] px-3 py-2 font-mono text-xs outline-none border-none focus:ring-0 rounded-none z-10"
              />
              {/* Overlay masked/plain value */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#842A3B] font-mono text-xs tracking-wide select-none">
                {confirmPassword ? (
                  showPassword ? confirmPassword : "#".repeat(confirmPassword.length)
                ) : (
                  <span className="opacity-35 font-mono text-xs select-none">••••••••••••</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {validationError && (
          <div className="text-[10px] font-mono font-bold tracking-widest text-[#A3485A] uppercase select-none py-1 leading-normal">
            {validationError}
          </div>
        )}

        {/* Action Button: Solid box in primary accent color, no text */}
        <button 
          type="submit"
          aria-label="Submit Authentication"
          className="w-full mt-2 h-10 bg-[#842A3B] hover:bg-[#6B3F69] transition-colors duration-300 border-none outline-none cursor-pointer"
        />
      </form>

      {/* Switch auth mode toggle link */}
      <button
        onClick={toggleAuthMode}
        className="mt-6 text-[9px] font-sans font-bold tracking-widest text-[#A3485A] transition-[letter-spacing,color] duration-500 ease-in-out hover:text-[#6B3F69] hover:tracking-[0.3em] bg-transparent border-none outline-none cursor-pointer uppercase"
      >
        {authMode === "LOGIN" ? "SIGN UP" : "LOG IN"}
      </button>
    </div>
  );
}
