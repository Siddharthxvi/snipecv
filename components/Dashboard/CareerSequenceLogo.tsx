"use client";

import { useEffect, useRef, useState } from "react";

interface SkillNode {
  name: string;
  category: "programming" | "backend" | "data" | "devops" | "research";
  baseScore: number;
  optimizedScore: number;
  projectsCount: number;
}

const SKILL_NODES: SkillNode[] = [
  // Programming
  { name: "PYTHON", category: "programming", baseScore: 0.95, optimizedScore: 0.85, projectsCount: 6 },
  { name: "JAVA", category: "programming", baseScore: 0.82, optimizedScore: 0.65, projectsCount: 5 },
  { name: "TYPESCRIPT", category: "programming", baseScore: 0.68, optimizedScore: 0.92, projectsCount: 4 },
  { name: "C++", category: "programming", baseScore: 0.35, optimizedScore: 0.20, projectsCount: 2 },

  // Backend
  { name: "SPRING BOOT", category: "backend", baseScore: 0.90, optimizedScore: 0.70, projectsCount: 5 },
  { name: "FASTAPI", category: "backend", baseScore: 0.78, optimizedScore: 0.95, projectsCount: 4 },
  { name: "REST API", category: "backend", baseScore: 0.65, optimizedScore: 0.80, projectsCount: 6 },
  { name: "GRAPHQL", category: "backend", baseScore: 0.38, optimizedScore: 0.55, projectsCount: 2 },

  // Data
  { name: "SQL", category: "data", baseScore: 0.88, optimizedScore: 0.98, projectsCount: 6 },
  { name: "POSTGRESQL", category: "data", baseScore: 0.72, optimizedScore: 0.85, projectsCount: 4 },
  { name: "REDIS", category: "data", baseScore: 0.58, optimizedScore: 0.60, projectsCount: 3 },
  { name: "KAFKA", category: "data", baseScore: 0.42, optimizedScore: 0.75, projectsCount: 3 },

  // DevOps
  { name: "DOCKER", category: "devops", baseScore: 0.85, optimizedScore: 0.90, projectsCount: 5 },
  { name: "KUBERNETES", category: "devops", baseScore: 0.60, optimizedScore: 0.82, projectsCount: 3 },
  { name: "TERRAFORM", category: "devops", baseScore: 0.45, optimizedScore: 0.65, projectsCount: 2 },
  { name: "CI/CD", category: "devops", baseScore: 0.55, optimizedScore: 0.78, projectsCount: 4 },
];

const CATEGORY_COLORS = {
  programming: "#4A90D9", // blue
  backend: "#E8C547",     // yellow
  data: "#5CAB7D",        // green
  devops: "#9B72CF",      // purple
  research: "#E05B8C",    // pink
};

const FPS = 12;
const FRAME_MS = 1000 / FPS;

export default function CareerSequenceLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });
  const [isTweakActive, setIsTweakActive] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState<SkillNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Animation progress states
  const [revealStep, setRevealStep] = useState(0);
  const [tweakProgress, setTweakProgress] = useState(1);

  // ResizeObserver for dynamic container fitting
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: width || 600, height: height || 260 });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Boot sequence animation on load (12 FPS)
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setRevealStep(step);
      if (step >= 12) {
        clearInterval(interval);
      }
    }, FRAME_MS);
    return () => clearInterval(interval);
  }, []);

  // Listen for tweak updates
  useEffect(() => {
    const handleTweak = () => {
      setIsTweakActive(true);
      let step = 0;
      const steps = 8;
      const interval = setInterval(() => {
        step++;
        setTweakProgress(step / steps);
        if (step >= steps) {
          clearInterval(interval);
        }
      }, FRAME_MS);
    };

    const handleReset = () => {
      setIsTweakActive(false);
      let step = 0;
      const steps = 8;
      const interval = setInterval(() => {
        step++;
        setTweakProgress(step / steps);
        if (step >= steps) {
          clearInterval(interval);
        }
      }, FRAME_MS);
    };

    window.addEventListener("snipecv-tweak", handleTweak);
    window.addEventListener("snipecv-reset-receipt", handleReset);
    return () => {
      window.removeEventListener("snipecv-tweak", handleTweak);
      window.removeEventListener("snipecv-reset-receipt", handleReset);
    };
  }, []);

  // Columns definition
  const columns = [
    {
      category: "programming",
      skills: SKILL_NODES.filter((s) => s.category === "programming"),
    },
    {
      category: "backend",
      skills: SKILL_NODES.filter((s) => s.category === "backend"),
    },
    {
      category: "data",
      skills: SKILL_NODES.filter((s) => s.category === "data"),
    },
    {
      category: "devops",
      skills: SKILL_NODES.filter((s) => s.category === "devops"),
    },
  ];

  // Helper to get font size based on current score and word length to prevent overflow
  const getFontSize = (name: string, score: number, scaleFactor: number): number => {
    let baseSize = 10;
    if (score >= 0.9) {
      baseSize = 28;
    } else if (score >= 0.7) {
      baseSize = 22;
    } else if (score >= 0.4) {
      baseSize = 15;
    } else {
      baseSize = 11;
    }
    
    // Scale down font sizes dynamically for longer words so they fit the column boundary
    const lengthFactor = Math.min(1.0, 7.5 / name.length);
    return Math.max(9, Math.round(baseSize * scaleFactor * lengthFactor));
  };

  const heightScale = Math.min(1.0, dimensions.height / 280);
  const widthScale = Math.min(1.0, dimensions.width / 700);
  const baseScaleFactor = Math.min(heightScale, widthScale);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-[85%] h-[85%] mx-auto mt-10 mb-auto relative overflow-hidden flex select-none p-5 box-border"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Bioinformatic Fake Y-Axis (Scientific bits layout) */}
      <div 
        className="flex flex-col justify-between items-end pr-3 mr-2 border-r-2 border-[#662222] font-mono text-[8px] text-[#662222] select-none h-[calc(100%-25px)]"
        style={{ flexShrink: 0 }}
      >
        <div className="flex items-center gap-1">2.0 BITS <span>—</span></div>
        <div className="flex items-center gap-1">1.5 <span>—</span></div>
        <div className="flex items-center gap-1">1.0 <span>—</span></div>
        <div className="flex items-center gap-1">0.5 <span>—</span></div>
        <div className="flex items-center gap-1">0.0 BITS <span>—</span></div>
      </div>

      {/* Main Plot Area */}
      <div className="flex-1 h-full flex flex-col justify-between overflow-hidden">
        {/* Columns Wrapper */}
        <div className="flex-1 flex w-full h-[calc(100%-25px)] items-end">
          {columns.map((col, colIdx) => {
            // Calculate scores
            const skillsWithScores = col.skills.map((s) => {
              const score = isTweakActive
                ? s.baseScore + (s.optimizedScore - s.baseScore) * tweakProgress
                : s.optimizedScore + (s.baseScore - s.optimizedScore) * tweakProgress;
              return { ...s, currentScore: score };
            });

            // Group skills into rows to balance width representation
            // Pair very short items together or stretch individual ones
            let rows: { items: typeof skillsWithScores }[] = [];
            
            // Sort ascending (smallest on top, largest at the bottom)
            const sorted = [...skillsWithScores].sort((a, b) => a.currentScore - b.currentScore);
            
            // Layout rows: pair small items if possible, otherwise render solo stretched row
            for (let i = 0; i < sorted.length; i++) {
              const item = sorted[i];
              if (item.name.length <= 5 && i + 1 < sorted.length && sorted[i+1].name.length <= 5) {
                // Pair them!
                rows.push({ items: [item, sorted[i+1]] });
                i++; // Skip next
              } else {
                rows.push({ items: [item] });
              }
            }

            const colVisible = revealStep > colIdx * 2;

            return (
              <div
                key={col.category}
                className="flex-1 flex flex-col justify-end items-center h-full border-r border-[#662222]/10 last:border-r-0 px-2 overflow-hidden"
                style={{
                  opacity: colVisible ? 1 : 0,
                  transition: "opacity 80ms step-end",
                }}
              >
                <div className="w-full flex flex-col justify-end items-stretch overflow-hidden">
                  {rows.map((row, rowIdx) => {
                    const isPair = row.items.length > 1;
                    const itemVisible = revealStep > colIdx * 2 + (rows.length - rowIdx);
                    if (!itemVisible) return null;

                    return (
                      <div 
                        key={rowIdx} 
                        className="w-full flex items-end justify-between gap-1 overflow-visible"
                        style={{ margin: "4px 0" }}
                      >
                        {row.items.map((skill) => {
                          const fontSize = getFontSize(skill.name, skill.currentScore, baseScaleFactor);
                          const color = CATEGORY_COLORS[skill.category];
                          
                          // More conservative stretch calculation to ensure it fits column boundaries
                          const scaleX = isPair 
                            ? 0.95 
                            : Math.min(1.6, Math.max(1.0, 8.5 / skill.name.length));

                          return (
                            <div
                              key={skill.name}
                              className="flex-1 flex items-center justify-center cursor-crosshair overflow-visible"
                              style={{
                                transform: `scaleY(1.35) scaleX(${scaleX})`,
                                transformOrigin: "center bottom",
                                lineHeight: 0.8,
                                height: `${Math.round(fontSize * 1.4)}px`, // Increase height multiplier to avoid overlap
                              }}
                              onMouseEnter={() => setHoveredSkill(skill)}
                              onMouseLeave={() => setHoveredSkill(null)}
                            >
                              <span
                                style={{
                                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                                  fontWeight: 900,
                                  fontSize: `${fontSize}px`,
                                  color,
                                  letterSpacing: "-0.05em",
                                  textAlign: "center",
                                  display: "block",
                                  width: "100%",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {skill.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bioinformatic Fake X-Axis (Solid line + Labels) */}
        <div className="w-full h-[25px] flex flex-col justify-start" style={{ flexShrink: 0 }}>
          <div className="w-full h-[2px] bg-[#662222]" />
          <div className="w-full flex justify-around pt-1">
            {columns.map((col) => (
              <div
                key={col.category}
                className="text-[8px] font-mono tracking-widest text-[#662222]/50 uppercase"
              >
                {col.category}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scientific Tooltip Panel */}
      {hoveredSkill && (
        <div
          className="absolute z-30 bg-[#1a1a1a] border border-[#FFF0DD]/30 p-2 font-mono text-[9px] leading-tight text-[#FFF0DD] shadow-none pointer-events-none"
          style={{
            left: `${Math.min(tooltipPos.x, dimensions.width - 150)}px`,
            top: `${Math.min(tooltipPos.y, dimensions.height - 70)}px`,
            borderRadius: 0,
            fontFamily: "monospace",
          }}
        >
          <div className="font-bold text-[#E8C547] border-b border-[#FFF0DD]/20 pb-1 mb-1">
            NODE: {hoveredSkill.name}
          </div>
          <div>
            GENOME: {hoveredSkill.category.toUpperCase()}
          </div>
          <div>
            CONFIDENCE: {Math.round(
              (isTweakActive
                ? hoveredSkill.baseScore + (hoveredSkill.optimizedScore - hoveredSkill.baseScore) * tweakProgress
                : hoveredSkill.optimizedScore + (hoveredSkill.baseScore - hoveredSkill.optimizedScore) * tweakProgress) * 100
            )}%
          </div>
          <div>
            ARCHIVE: {hoveredSkill.projectsCount} PROJECTS
          </div>
        </div>
      )}
    </div>
  );
}
