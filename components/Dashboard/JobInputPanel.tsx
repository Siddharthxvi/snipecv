"use client";

import { motion } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";

const NOISE_CHARS = "@#%&*+==:.";
const FRAME_MS = 1000 / 12; // 12 FPS
const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".docx"];

const IDLE_LINES = [
  "DROP YOUR RESUME HERE //",
  "TYPE THE JOB DESCRIPTION",
  "AND GET YOUR",
  "RESUME OPTIMISED",
];

function randomNoiseChar(): string {
  return NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)];
}

/** Posterized noise reconstruction: resolves from noise to final text over N frames */
function useNoiseResolve(
  targetText: string,
  active: boolean,
  totalFrames: number = 6,
  onComplete?: () => void
) {
  const [display, setDisplay] = useState(targetText);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplay(targetText);
      return;
    }

    let frame = 0;

    intervalRef.current = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      const resolved = targetText
        .split("")
        .map((ch, i) => {
          if (ch === " ") return " ";
          // Characters resolve left-to-right based on progress
          const threshold = i / targetText.length;
          return progress > threshold ? ch : randomNoiseChar();
        })
        .join("");

      setDisplay(resolved);

      if (frame >= totalFrames) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(targetText);
        onComplete?.();
      }
    }, FRAME_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, targetText, totalFrames, onComplete]);

  return display;
}

type Mode = "idle" | "transitioning" | "input";

export default function JobInputPanel() {
  const [mode, setMode] = useState<Mode>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loadedFile, setLoadedFile] = useState<string | null>(null);
  const [corruptedLines, setCorruptedLines] = useState<string[]>(IDLE_LINES);
  const [flickerOpacity, setFlickerOpacity] = useState(1);
  const [noiseResolveActive, setNoiseResolveActive] = useState(false);
  const [noiseResolveText, setNoiseResolveText] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const flickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Flicker effect for drag-over (12FPS, 4 cycles) ---
  useEffect(() => {
    if (isDragging) {
      let tick = 0;
      const totalTicks = 8; // 4 cycles × 2 states
      flickerRef.current = setInterval(() => {
        tick++;
        setFlickerOpacity(tick % 2 === 0 ? 1 : 0.85);
        if (tick >= totalTicks) {
          if (flickerRef.current) clearInterval(flickerRef.current);
          setFlickerOpacity(1);
        }
      }, FRAME_MS);
    } else {
      if (flickerRef.current) clearInterval(flickerRef.current);
      setFlickerOpacity(1);
    }

    return () => {
      if (flickerRef.current) clearInterval(flickerRef.current);
    };
  }, [isDragging]);

  // --- Noise resolve display text ---
  const resolvedNoiseText = useNoiseResolve(
    noiseResolveText,
    noiseResolveActive,
    6,
    useCallback(() => {
      setNoiseResolveActive(false);
    }, [])
  );

  // --- Posterized text wipe: corrupt idle text then clear ---
  const startTransition = useCallback(
    (fileLoaded?: string) => {
      setMode("transitioning");

      const fullText = IDLE_LINES.join("\n");
      const chars = fullText.split("");
      const totalChars = chars.length;
      const totalFrames = Math.ceil(400 / FRAME_MS); // ~400ms
      let frame = 0;

      // Clone current lines for corruption
      const working = [...IDLE_LINES];
      setCorruptedLines(working);

      transitionRef.current = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;

        // Corrupt characters left-to-right
        const corruptedFull = chars
          .map((ch, i) => {
            if (ch === "\n") return "\n";
            if (ch === " ") return " ";
            const threshold = i / totalChars;
            if (progress > threshold + 0.3) return " "; // cleared
            if (progress > threshold) return randomNoiseChar(); // corrupting
            return ch; // not yet reached
          })
          .join("");

        setCorruptedLines(corruptedFull.split("\n"));

        if (frame >= totalFrames) {
          if (transitionRef.current) clearInterval(transitionRef.current);
          setCorruptedLines(IDLE_LINES);
          setMode("input");

          if (fileLoaded) {
            setLoadedFile(fileLoaded);
            setInputText(`[FILE: ${fileLoaded}]\n\n`);
          }

          // Focus textarea after transition
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 50);
        }
      }, FRAME_MS);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionRef.current) clearInterval(transitionRef.current);
    };
  }, []);

  // --- Click handler ---
  const handleClick = useCallback(() => {
    if (mode === "idle") {
      startTransition();
    }
  }, [mode, startTransition]);

  // --- Close / return to idle ---
  const handleClose = useCallback(() => {
    setMode("idle");
    setInputText("");
    setLoadedFile(null);
    setCorruptedLines(IDLE_LINES);
    setNoiseResolveActive(false);
  }, []);

  // --- Drag & Drop handlers ---
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setNoiseResolveActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) return;

      // Show "FILE LOADED" and transition to input
      setNoiseResolveText(`FILE LOADED: ${file.name.toUpperCase()}`);
      setNoiseResolveActive(true);

      // After noise resolve completes (~6 frames), transition to input
      setTimeout(() => {
        startTransition(file.name);
      }, 6 * FRAME_MS + 100);
    },
    [startTransition]
  );

  // --- Drag overlay text with noise resolve ---
  const dragText = isDragging ? "READING FILE..." : "";
  const dragDisplayText = useNoiseResolve(dragText, isDragging, 6);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.6, ease: "linear" }}
      className="w-full h-full relative select-none"
      style={{
        backgroundColor: "#A3485A",
        borderRadius: 0,
        boxShadow: "none",
        opacity: flickerOpacity,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay border */}
      {isDragging && (
        <div
          className="absolute inset-0 border-2 border-dashed pointer-events-none"
          style={{ borderColor: "#662222" }}
        />
      )}

      {/* === IDLE MODE === */}
      {mode === "idle" && !isDragging && (
        <div
          className="w-full h-full p-6 cursor-pointer"
          onClick={handleClick}
        >
          <div
            className="font-bold text-sm uppercase tracking-wider"
            style={{
              color: "#1a1a1a",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              lineHeight: 1.6,
            }}
          >
            {IDLE_LINES.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* === TRANSITIONING MODE === */}
      {mode === "transitioning" && !isDragging && (
        <div className="w-full h-full p-6">
          <div
            className="font-bold text-sm uppercase tracking-wider font-mono"
            style={{
              color: "#1a1a1a",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              lineHeight: 1.6,
            }}
          >
            {corruptedLines.map((line, i) => (
              <div key={i}>{line || "\u00A0"}</div>
            ))}
          </div>
        </div>
      )}

      {/* === DRAG OVERLAY TEXT === */}
      {isDragging && (
        <div className="w-full h-full p-6 flex items-center justify-center">
          <div
            className="font-bold text-sm uppercase tracking-wider font-mono"
            style={{
              color: "#1a1a1a",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            {dragDisplayText || "\u00A0"}
          </div>
        </div>
      )}

      {/* === NOISE RESOLVE OVERLAY (file loaded feedback) === */}
      {noiseResolveActive && !isDragging && mode !== "input" && (
        <div className="absolute inset-0 p-6 flex items-center justify-center">
          <div
            className="font-bold text-sm uppercase tracking-wider font-mono"
            style={{
              color: "#1a1a1a",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            {resolvedNoiseText}
          </div>
        </div>
      )}

      {/* === INPUT MODE === */}
      {mode === "input" && !isDragging && (
        <div className="w-full h-full relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 text-xs font-bold uppercase tracking-wider cursor-pointer"
            style={{
              color: "#FFF0DD",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              background: "none",
              border: "none",
              padding: "4px 8px",
              lineHeight: 1,
            }}
          >
            X
          </button>

          {/* File loaded indicator */}
          {loadedFile && (
            <div
              className="absolute top-3 left-6 text-xs uppercase tracking-wider font-mono"
              style={{
                color: "#FFF0DD",
                opacity: 0.6,
                fontFamily: "monospace",
              }}
            >
              FILE: {loadedFile.toUpperCase()}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="PASTE JOB DESCRIPTION HERE..."
            className="w-full h-full resize-none outline-none border-none p-6 caret-[#662222]"
            style={{
              backgroundColor: "transparent",
              color: "#FFF0DD",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              paddingTop: loadedFile ? "2rem" : undefined,
            }}
            spellCheck={false}
          />

          {/* Custom placeholder opacity via style tag */}
          <style>{`
            .caret-\\[\\#662222\\]::placeholder {
              color: #FFF0DD;
              opacity: 0.4;
            }
          `}</style>
        </div>
      )}
    </motion.div>
  );
}
