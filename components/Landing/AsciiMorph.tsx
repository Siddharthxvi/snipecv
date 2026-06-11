"use client";

import { useEffect, useState, useRef } from "react";

const CATEGORIES = ["logo", "terminal", "rocket", "person"] as const;
type Category = typeof CATEGORIES[number];

const FILE_PREFIXES: Record<Category, { folder: string; prefix: string }> = {
  logo: { folder: "logo", prefix: "logo" },
  terminal: { folder: "terminal", prefix: "comp" },
  rocket: { folder: "rocket", prefix: "rock" },
  person: { folder: "briefcase", prefix: "bc" }, // map to briefcase folder
};

const TOTAL_FRAMES = 16;
const FPS = 5;
const FRAME_TIME = 1000 / FPS; // 200ms per frame

// Helper to fetch and cache all frames in memory
async function loadAllFrames(): Promise<Record<Category, string[]>> {
  const cache: Record<Category, string[]> = {
    logo: [],
    terminal: [],
    rocket: [],
    person: [],
  };

  await Promise.all(
    CATEGORIES.map(async (cat) => {
      const { folder, prefix } = FILE_PREFIXES[cat];
      const fetches = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
        const frameNum = String(i + 1).padStart(2, "0");
        return fetch(`/ascii/${folder}/${prefix}_${frameNum}.txt`)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to load ${cat} frame ${frameNum}`);
            return res.text();
          })
          .catch((err) => {
            console.error(err);
            return "";
          });
      });
      cache[cat] = await Promise.all(fetches);
    })
  );

  return cache;
}

// Noise characters for transition data corruption
const NOISE_CHARS = "@#%&*+==:.";

// Controlled data corruption transition builder
function getTransitionFrame(
  source: string,
  target: string,
  progress: number,
  corruptedIndices: Set<number>
): string {
  const sourceChars = source.split("");
  const targetChars = target.split("");
  const maxLen = Math.max(sourceChars.length, targetChars.length);
  const result: string[] = [];

  for (let i = 0; i < maxLen; i++) {
    const src = sourceChars[i] || " ";
    const tgt = targetChars[i] || " ";

    if (corruptedIndices.has(i)) {
      // 20-30% of characters undergo corruption
      if (progress < 0.3) {
        // Early phase: show source or noise
        result.push(Math.random() < progress ? NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)] : src);
      } else if (progress < 0.7) {
        // Middle phase: intense noise flicker
        result.push(NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)]);
      } else {
        // Late phase: show noise resolving to target
        result.push(Math.random() < (1.0 - progress) * 3 ? NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)] : tgt);
      }
    } else {
      // 70-80% of characters transition cleanly based on progress
      result.push(progress < 0.5 ? src : tgt);
    }
  }

  return result.join("");
}

// Apply 0.1% micro-imperfection changes to active frames
function applyMicroImperfections(text: string): string {
  const chars = text.split("");
  for (let i = 0; i < chars.length; i++) {
    if (Math.random() < 0.001) {
      if (chars[i] === " ") chars[i] = ".";
      else if (chars[i] === ".") chars[i] = "+";
      else if (chars[i] === "+") chars[i] = ".";
    }
  }
  return chars.join("");
}

export default function AsciiMorph() {
  const [framesCache, setFramesCache] = useState<Record<Category, string[]> | null>(null);
  const [loading, setLoading] = useState(true);

  // Frame History States (CRT Persistence layers)
  const [currentFrameText, setCurrentFrameText] = useState("");
  const [prevFrameText, setPrevFrameText] = useState("");
  const [olderFrameText, setOlderFrameText] = useState("");

  // Animation timeline tracking refs
  const stateRef = useRef({
    currentCategoryIndex: 0,
    currentFrameIndex: 0,
    phase: "boot" as "boot" | "scan" | "transition",
    phaseElapsed: 0, // ms elapsed in active phase
    corruptedIndices: new Set<number>(),
  });

  // Fetch all frames on mount
  useEffect(() => {
    loadAllFrames().then((cache) => {
      setFramesCache(cache);
      setLoading(false);
    });
  }, []);

  // Main 5 FPS Posterize Time RAF loop
  useEffect(() => {
    if (!framesCache) return;

    let lastUpdateTime = performance.now();
    let animationFrameId: number;

    const tick = (now: number) => {
      animationFrameId = requestAnimationFrame(tick);

      const delta = now - lastUpdateTime;
      if (delta >= FRAME_TIME) {
        lastUpdateTime = now - (delta % FRAME_TIME);

        const currentCat = CATEGORIES[stateRef.current.currentCategoryIndex];
        const nextCat = CATEGORIES[(stateRef.current.currentCategoryIndex + 1) % CATEGORIES.length];
        
        let nextFrameText = "";

        if (stateRef.current.phase === "boot") {
          // 1. Initial Page Load boot sequence (1.5s)
          stateRef.current.phaseElapsed += FRAME_TIME;
          const progress = Math.min(1.0, stateRef.current.phaseElapsed / 1500);

          const targetFirstFrame = framesCache[currentCat][0];
          const emptyNoise = Array(targetFirstFrame.length).fill(" ").map(() => 
            Math.random() < 0.2 ? NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)] : " "
          ).join("");

          if (stateRef.current.corruptedIndices.size === 0) {
            // Pick indices for boot corruption
            const count = Math.floor(targetFirstFrame.length * 0.3);
            const indices = new Set<number>();
            while (indices.size < count) {
              indices.add(Math.floor(Math.random() * targetFirstFrame.length));
            }
            stateRef.current.corruptedIndices = indices;
          }

          nextFrameText = getTransitionFrame(
            emptyNoise,
            targetFirstFrame,
            progress,
            stateRef.current.corruptedIndices
          );

          if (progress >= 1.0) {
            stateRef.current.phase = "scan";
            stateRef.current.phaseElapsed = 0;
            stateRef.current.currentFrameIndex = 0;
            stateRef.current.corruptedIndices.clear();
          }
        } else if (stateRef.current.phase === "scan") {
          // 2. Artifact turntable scanning rotation (10s)
          stateRef.current.phaseElapsed += FRAME_TIME;
          const frames = framesCache[currentCat];
          
          nextFrameText = frames[stateRef.current.currentFrameIndex];
          nextFrameText = applyMicroImperfections(nextFrameText);

          // Update rotation index (loops every 16 frames at 5 FPS)
          stateRef.current.currentFrameIndex = (stateRef.current.currentFrameIndex + 1) % TOTAL_FRAMES;

          if (stateRef.current.phaseElapsed >= 10000) {
            stateRef.current.phase = "transition";
            stateRef.current.phaseElapsed = 0;
            stateRef.current.corruptedIndices.clear();
          }
        } else if (stateRef.current.phase === "transition") {
          // 3. Object-to-object data corruption transition (1.5s)
          stateRef.current.phaseElapsed += FRAME_TIME;
          const progress = Math.min(1.0, stateRef.current.phaseElapsed / 1500);

          const sourceFrames = framesCache[currentCat];
          // use current frame index (already incremented) or last visible frame
          const sourceText = sourceFrames[stateRef.current.currentFrameIndex] || sourceFrames[0];
          const targetText = framesCache[nextCat][0];

          if (stateRef.current.corruptedIndices.size === 0) {
            // Initialize 25% random indices for transition corruption
            const totalLength = Math.max(sourceText.length, targetText.length);
            const count = Math.floor(totalLength * 0.25);
            const indices = new Set<number>();
            while (indices.size < count) {
              indices.add(Math.floor(Math.random() * totalLength));
            }
            stateRef.current.corruptedIndices = indices;
          }

          nextFrameText = getTransitionFrame(
            sourceText,
            targetText,
            progress,
            stateRef.current.corruptedIndices
          );

          if (progress >= 1.0) {
            stateRef.current.phase = "scan";
            stateRef.current.phaseElapsed = 0;
            stateRef.current.currentFrameIndex = 0;
            stateRef.current.currentCategoryIndex = (stateRef.current.currentCategoryIndex + 1) % CATEGORIES.length;
            stateRef.current.corruptedIndices.clear();
          }
        }

        // Shift history buffers for rotational smear/trail rendering
        setOlderFrameText(prevFrameText);
        setPrevFrameText(currentFrameText);
        setCurrentFrameText(nextFrameText);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [framesCache, currentFrameText, prevFrameText]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] font-mono text-[10px] tracking-widest text-accent-main animate-pulse select-none uppercase">
        [INITIALIZING SCANNER...]
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center select-none w-full h-[400px] sm:h-[450px] md:h-[500px]">
      
      {/* LAYER 3: OLDER FRAME (Trailing trail, 10% opacity, 2 frames delayed, purple offset shadow, blurred) */}
      {olderFrameText && (
        <pre 
          className="absolute font-mono leading-none text-[3.2px] xs:text-[4px] sm:text-[4.5px] md:text-[5px] lg:text-[5.5px] xl:text-[6.2px] text-accent-secondary opacity-10 pointer-events-none select-none filter blur-[2px]"
          style={{ 
            whiteSpace: "pre",
            fontFamily: "monospace",
            lineHeight: 1,
          }}
        >
          {olderFrameText}
        </pre>
      )}

      {/* LAYER 2: PREVIOUS FRAME (Ghost trail, 22% opacity, 1 frame delayed, reddish tone, offset 2px right) */}
      {prevFrameText && (
        <pre 
          className="absolute font-mono leading-none text-[3.2px] xs:text-[4px] sm:text-[4.5px] md:text-[5px] lg:text-[5.5px] xl:text-[6.2px] text-[#A3485A] opacity-22 pointer-events-none select-none translate-x-[2px]"
          style={{ 
            whiteSpace: "pre",
            fontFamily: "monospace",
            lineHeight: 1,
          }}
        >
          {prevFrameText}
        </pre>
      )}

      {/* LAYER 1: CURRENT FRAME (Active sharp frame, 100% opacity, main red accent) */}
      {currentFrameText && (
        <pre 
          className="absolute font-mono leading-none text-[3.2px] xs:text-[4px] sm:text-[4.5px] md:text-[5px] lg:text-[5.5px] xl:text-[6.2px] text-accent-main opacity-100 pointer-events-none select-none"
          style={{ 
            whiteSpace: "pre",
            fontFamily: "monospace",
            lineHeight: 1,
          }}
        >
          {currentFrameText}
        </pre>
      )}
      
    </div>
  );
}
