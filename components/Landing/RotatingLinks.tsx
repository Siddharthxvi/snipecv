"use client";

import { useEffect, useState, useRef } from "react";

const LINKS = [
  "made with luv @siddharthxvi",
  "linkedin/ @siddharthxvi",
  "instagram/ @siddharthxvi",
];

const MAX_LEN = Math.max(...LINKS.map(l => l.length));

// Helper to pad strings on the left for right-alignment
function padLeft(str: string, length: number): string {
  return str.padStart(length, " ");
}

const PADDED_LINKS = LINKS.map(l => padLeft(l, MAX_LEN));

interface CharSlotProps {
  charIndex: number;
  targetChar: string;
  triggerTransition: boolean;
}

function CharSlot({ charIndex, targetChar, triggerTransition }: CharSlotProps) {
  const [currentChar, setCurrentChar] = useState(targetChar);
  const [angle, setAngle] = useState(0);
  const [prevAngle, setPrevAngle] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Triggered when targetChar or transition event fires
  useEffect(() => {
    // Calculate mechanical stagger delay: 35ms per index + random offset [-50ms, +50ms]
    const baseDelay = charIndex * 35;
    const randomOffset = Math.floor(Math.random() * 101) - 50;
    const delay = Math.max(0, baseDelay + randomOffset);

    const startTransition = () => {
      let frame = 0;
      const totalFrames = 10; // 5 frames out, 5 frames in
      const fps = 12;
      const frameInterval = 1000 / fps; // ~83.33ms

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        frame++;
        
        if (frame <= 5) {
          // Outgoing rotation: 0 -> -90
          const progress = frame / 5;
          const nextAngle = -90 * progress;
          setAngle(prev => {
            setPrevAngle(prev);
            return nextAngle;
          });
        } else if (frame === 6) {
          // Swap character and flip angle to positive 90 while edge-on (invisible)
          setCurrentChar(targetChar);
          setAngle(90);
          setPrevAngle(-90);
        } else if (frame <= 11) {
          // Incoming rotation: 90 -> 0
          const progress = (frame - 6) / 5;
          const nextAngle = 90 - (90 * progress);
          setAngle(prev => {
            setPrevAngle(prev);
            return nextAngle;
          });
        } else {
          // Finished transition
          setAngle(0);
          setPrevAngle(0);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, frameInterval);
    };

    const delayTimeout = setTimeout(startTransition, delay);
    return () => {
      clearTimeout(delayTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [targetChar, triggerTransition, charIndex]);

  const displayChar = currentChar === " " ? "\u00A0" : currentChar;
  const isRotating = angle !== 0;

  return (
    <div 
      className="relative inline-block w-[0.6em] select-none text-center"
      style={{ 
        perspective: "1000px", 
        transformStyle: "preserve-3d",
        height: "1.2em"
      }}
    >
      {/* 1. INK OFFSET LAYER (Print misalignment) */}
      <span
        className="absolute inline-block left-[1px] top-[1px] text-[#6B3F69] opacity-10 font-mono"
        style={{
          transform: `rotateX(${angle}deg)`,
          backfaceVisibility: "hidden",
        }}
      >
        {displayChar}
      </span>

      {/* 2. MOTION SMEAR LAYER */}
      {isRotating && (
        <span
          className="absolute inline-block left-0 top-0 text-[#842A3B] opacity-12 blur-[1.5px] font-mono"
          style={{
            transform: `rotateX(${angle}deg)`,
            backfaceVisibility: "hidden",
          }}
        >
          {displayChar}
        </span>
      )}

      {/* 3. GHOST LAYER (Delayed previous frame) */}
      {isRotating && (
        <span
          className="absolute inline-block left-0 top-[2px] text-[#A3485A] opacity-25 font-mono"
          style={{
            transform: `rotateX(${prevAngle}deg)`,
            backfaceVisibility: "hidden",
          }}
        >
          {displayChar}
        </span>
      )}

      {/* 4. MAIN LAYER */}
      <span
        className="absolute inline-block left-0 top-0 text-[#842A3B] font-mono"
        style={{
          transform: `rotateX(${angle}deg)`,
          backfaceVisibility: "hidden",
        }}
      >
        {displayChar}
      </span>
    </div>
  );
}

export default function RotatingLinks() {
  const [index, setIndex] = useState(0);
  const [triggerTransition, setTriggerTransition] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      // Revert back to index 0 statically when mouse leaves
      if (index !== 0) {
        setIndex(0);
        setTriggerTransition(prev => !prev);
      }
      return;
    }

    // Play/cycle animation only while hovered
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % PADDED_LINKS.length);
      setTriggerTransition(prev => !prev);
    }, 3800); // 3 seconds readable + ~800ms transition time
    return () => clearInterval(timer);
  }, [isHovered, index]);

  const currentText = PADDED_LINKS[index];

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex justify-end select-none font-sans font-medium tracking-widest uppercase text-right w-full cursor-pointer"
    >
      <div className="flex gap-x-[0.05em] justify-end">
        {currentText.split("").map((char, idx) => (
          <CharSlot
            key={idx}
            charIndex={idx}
            targetChar={char}
            triggerTransition={triggerTransition}
          />
        ))}
      </div>
    </div>
  );
}
