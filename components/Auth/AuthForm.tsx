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

  // Height reveal and posterized label state for Confirm Password field
  const [confirmHeight, setConfirmHeight] = useState(0);
  const [confirmLabel, setConfirmLabel] = useState("");
  const confirmTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Auth Mode Toggle
  const toggleAuthMode = () => {
    setAuthMode(prev => {
      const nextMode = prev === "LOGIN" ? "SIGNUP" : "LOGIN";
      // Trigger title transition
      setTriggerTitle(t => !t);
      
      // Reset validation states
      setIsValid(true);
      
      // Handle stepped reveal/collapse
      if (nextMode === "SIGNUP") {
        triggerSteppedReveal();
      } else {
        triggerSteppedCollapse();
      }
      return nextMode;
    });
  };

  // Step-based height reveal + text resolver (12fps)
  const triggerSteppedReveal = () => {
    let frame = 0;
    const steps = 4;
    const finalHeight = 85;
    const intervalTime = 1000 / 12;

    if (confirmTimerRef.current) clearInterval(confirmTimerRef.current as any);

    confirmTimerRef.current = setInterval(() => {
      frame++;
      const currentHeight = (finalHeight / steps) * frame;
      setConfirmHeight(Math.min(finalHeight, currentHeight));

      if (frame >= steps) {
        if (confirmTimerRef.current) clearInterval(confirmTimerRef.current as any);
        triggerLabelInitialization();
      }
    }, intervalTime);
  };

  const triggerSteppedCollapse = () => {
    let frame = 0;
    const steps = 4;
    const startHeight = confirmHeight;
    const intervalTime = 1000 / 12;

    if (confirmTimerRef.current) clearInterval(confirmTimerRef.current as any);
    setConfirmLabel(""); // Clear label instantly

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

  // Character-by-character resolving animation for Confirm Password label
  const triggerLabelInitialization = () => {
    const targetLabel = "CONFIRM ACCESS KEY";
    let index = 0;
    const intervalTime = 1000 / 12;

    if (confirmTimerRef.current) clearInterval(confirmTimerRef.current as any);

    confirmTimerRef.current = setInterval(() => {
      index++;
      if (index >= targetLabel.length) {
        setConfirmLabel(targetLabel);
        if (confirmTimerRef.current) clearInterval(confirmTimerRef.current as any);
      } else {
        // Resolve target characters with noise suffix
        setConfirmLabel(prev => {
          const base = targetLabel.substring(0, index);
          const noise = NOISE[Math.floor(Math.random() * NOISE.length)];
          return base + noise;
        });
      }
    }, intervalTime);
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

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "SIGNUP") {
      const valid = validatePassword(password) && password === confirmPassword;
      setIsValid(valid);
      if (!valid) return;
    }

    // Access granted simulation
    alert(authMode === "LOGIN" ? "ACCESSING CARRIER MEMORY..." : "IDENTITY ARCHIVE CREATED.");
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

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-y-4">
        {/* Username */}
        <div className="flex flex-col gap-y-1">
          <label className="text-[9px] font-sans font-bold tracking-widest text-[#A3485A] uppercase">
            IDENTIFIER KEY
          </label>
          <input 
            type="text" 
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. SIDDHARTHXVI"
            className="w-full border border-[#842A3B] px-3 py-2 bg-transparent text-[#842A3B] font-mono text-xs outline-none placeholder:text-[#A3485A]/35 focus:border-[#6B3F69]"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-y-1">
          <label className="text-[9px] font-sans font-bold tracking-widest text-[#A3485A] uppercase">
            ACCESS PASSKEY
          </label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full border border-[#842A3B] px-3 py-2 bg-transparent text-[#842A3B] font-mono text-xs outline-none placeholder:text-[#A3485A]/35 focus:border-[#6B3F69]"
          />
        </div>

        {/* Confirm Password (Stepped height reveal input) */}
        <div 
          className="overflow-hidden flex flex-col justify-end"
          style={{ height: `${confirmHeight}px` }}
        >
          <div className="flex flex-col gap-y-1 pb-[10px]">
            <label className="text-[9px] font-sans font-bold tracking-widest text-[#A3485A] uppercase h-[12px] overflow-hidden">
              {confirmLabel || "\u00A0"}
            </label>
            <input 
              type="password" 
              required={authMode === "SIGNUP"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full border border-[#842A3B] px-3 py-2 bg-transparent text-[#842A3B] font-mono text-xs outline-none placeholder:text-[#A3485A]/35 focus:border-[#6B3F69]"
            />
          </div>
        </div>

        {/* Validation Errors */}
        {!isValid && authMode === "SIGNUP" && (
          <div className="text-[9px] font-mono font-bold tracking-widest text-[#A3485A] uppercase select-none animate-pulse py-1">
            ACCESS KEY INCOMPLETE
          </div>
        )}

        {/* Action Button */}
        <button 
          type="submit"
          className="group w-full mt-2 text-xs font-sans font-bold tracking-widest text-[#842A3B] transition-[letter-spacing,color] duration-500 ease-in-out hover:text-[#6B3F69] hover:tracking-[0.4em] text-center border-none bg-transparent outline-none cursor-pointer"
        >
          ACCESS SYSTEM
        </button>
      </form>

      {/* Switch auth mode toggle link */}
      <button
        onClick={toggleAuthMode}
        className="mt-6 text-[9px] font-sans font-bold tracking-widest text-[#A3485A] transition-[letter-spacing,color] duration-500 ease-in-out hover:text-[#6B3F69] hover:tracking-[0.3em] bg-transparent border-none outline-none cursor-pointer"
      >
        {authMode === "LOGIN" ? "CREATE A NEW ARCHIVE KEY" : "ACCESS AN EXISTING KEY"}
      </button>
    </div>
  );
}
