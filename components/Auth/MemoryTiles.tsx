"use client";

import { useEffect, useState, useRef } from "react";

const GRID_COLS = 2;
const GRID_ROWS = 3;
const TILE_WIDTH = 160;  // Width in px
const TILE_HEIGHT = 160; // Height in px
const GAP = 12;

const MESSAGES = [
  "YOUR WORK\nHAS\nMEMORY",         // Cell 0
  "ONE SELF\nMANY\nVERSIONS",       // Cell 1
  "BUILT ONCE\nADAPTED\nFOREVER",   // Cell 2
  "YOUR WORK\nHAS\nMEMORY",         // Cell 3
  "ONE SELF\nMANY\nVERSIONS",       // Cell 4
  "BUILT ONCE\nADAPTED\nFOREVER"    // Cell 5
];

// Helper to get coordinates from grid index
function getCoords(index: number) {
  const row = Math.floor(index / GRID_COLS);
  const col = index % GRID_COLS;
  return {
    x: col * (TILE_WIDTH + GAP),
    y: row * (TILE_HEIGHT + GAP)
  };
}

// Noise characters for message resolution
const NOISE = "@#%&*+==:.";

interface TileState {
  id: number;
  gridIndex: number;
  // Rendering positions
  x: number;
  y: number;
  smearX: number;
  smearY: number;
  isMoving: boolean;
}

export default function MemoryTiles() {
  const [tiles, setTiles] = useState<TileState[]>([
    { id: 0, gridIndex: 1, x: 0, y: 0, smearX: 0, smearY: 0, isMoving: false },
    { id: 1, gridIndex: 2, x: 0, y: 0, smearX: 0, smearY: 0, isMoving: false },
    { id: 2, gridIndex: 3, x: 0, y: 0, smearX: 0, smearY: 0, isMoving: false },
    { id: 3, gridIndex: 4, x: 0, y: 0, smearX: 0, smearY: 0, isMoving: false },
    { id: 4, gridIndex: 5, x: 0, y: 0, smearX: 0, smearY: 0, isMoving: false },
  ]);

  const [emptyIndex, setEmptyIndex] = useState(0); // Starts empty at index 0
  
  // Message resolution state per slot (stores current string representation)
  const [resolvedTexts, setResolvedTexts] = useState<string[]>(MESSAGES);
  
  const isAutoModeRef = useRef(true);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoMoveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize tile positions based on gridIndex
  useEffect(() => {
    setTiles(prev => prev.map(t => {
      const coords = getCoords(t.gridIndex);
      return { ...t, x: coords.x, y: coords.y };
    }));
  }, []);

  // Helper: check adjacency
  const getAdjacentIndices = (index: number) => {
    const row = Math.floor(index / GRID_COLS);
    const col = index % GRID_COLS;
    const adj = [];
    if (row > 0) adj.push(index - GRID_COLS); // UP
    if (row < GRID_ROWS - 1) adj.push(index + GRID_COLS); // DOWN
    if (col > 0) adj.push(index - 1); // LEFT
    if (col < GRID_COLS - 1) adj.push(index + 1); // RIGHT
    return adj;
  };

  // Trigger noise-reconstruction effect for a resolved slot
  const triggerResolution = (slotIndex: number) => {
    const targetText = MESSAGES[slotIndex];
    let frame = 0;
    const totalFrames = 6; // ~500ms at 12fps
    const interval = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setResolvedTexts(prev => {
          const next = [...prev];
          next[slotIndex] = targetText;
          return next;
        });
        clearInterval(interval);
      } else {
        // Corrupt chars based on noise
        setResolvedTexts(prev => {
          const next = [...prev];
          const words = targetText.split("\n");
          const corruptedWords = words.map(w => 
            w.split("").map(char => {
              if (char === " ") return " ";
              return Math.random() < 0.35 ? NOISE[Math.floor(Math.random() * NOISE.length)] : char;
            }).join("")
          );
          next[slotIndex] = corruptedWords.join("\n");
          return next;
        });
      }
    }, 1000 / 12);
  };

  // Move Tile logic with posterized frames (12 FPS)
  const performMove = (tileId: number, targetCellIndex: number) => {
    const startCoords = getCoords(tiles.find(t => t.id === tileId)!.gridIndex);
    const endCoords = getCoords(targetCellIndex);
    
    // Swap empty slot
    const prevEmpty = emptyIndex;
    setEmptyIndex(tiles.find(t => t.id === tileId)!.gridIndex);

    // Uncover event -> resolve target text reconstruction
    triggerResolution(targetCellIndex);

    let frame = 0;
    const totalFrames = 3; // 250ms movement
    const fps = 12;
    const intervalTime = 1000 / fps; // 83.33ms

    const moveTimer = setInterval(() => {
      frame++;
      setTiles(prev => prev.map(t => {
        if (t.id === tileId) {
          if (frame >= totalFrames) {
            clearInterval(moveTimer);
            return {
              ...t,
              gridIndex: targetCellIndex,
              x: endCoords.x,
              y: endCoords.y,
              smearX: 0,
              smearY: 0,
              isMoving: false
            };
          }
          
          // Stepped coordinates calculation (posterize)
          const ratio = frame / totalFrames;
          const currentX = startCoords.x + (endCoords.x - startCoords.x) * ratio;
          const currentY = startCoords.y + (endCoords.y - startCoords.y) * ratio;
          
          // Smear trail offset opposite to movement
          const dx = endCoords.x - startCoords.x;
          const dy = endCoords.y - startCoords.y;
          const smearX = -dx * 0.15;
          const smearY = -dy * 0.15;

          return {
            ...t,
            x: currentX,
            y: currentY,
            smearX,
            smearY,
            isMoving: true
          };
        }
        return t;
      }));
    }, intervalTime);
  };

  // User manual trigger
  const handleTileClick = (gridIndex: number) => {
    // Disable auto-mode permanently
    if (isAutoModeRef.current) {
      isAutoModeRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (autoMoveTimerRef.current) clearInterval(autoMoveTimerRef.current);
    }

    const adj = getAdjacentIndices(gridIndex);
    if (adj.includes(emptyIndex)) {
      const clickedTile = tiles.find(t => t.gridIndex === gridIndex);
      if (clickedTile) {
        performMove(clickedTile.id, emptyIndex);
      }
    }
  };

  // Auto/Idle movement cycle
  const triggerAutoMove = () => {
    if (!isAutoModeRef.current) return;
    
    // Choose random valid adjacent slot to emptyIndex
    const adj = getAdjacentIndices(emptyIndex);
    const randomTargetCell = adj[Math.floor(Math.random() * adj.length)];
    const tileToMove = tiles.find(t => t.gridIndex === randomTargetCell);

    if (tileToMove) {
      performMove(tileToMove.id, emptyIndex);
    }
  };

  // Reset idle timers
  useEffect(() => {
    if (!isAutoModeRef.current) return;

    const resetIdleTimers = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (autoMoveTimerRef.current) clearInterval(autoMoveTimerRef.current);

      idleTimerRef.current = setTimeout(() => {
        // Start moving tiles automatically every 4 seconds after 7s of idleness
        autoMoveTimerRef.current = setInterval(triggerAutoMove, 4000);
      }, 7000);
    };

    resetIdleTimers();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (autoMoveTimerRef.current) clearInterval(autoMoveTimerRef.current);
    };
  }, [emptyIndex]);

  return (
    <div 
      className="relative select-none"
      style={{ 
        width: `${GRID_COLS * (TILE_WIDTH + GAP) - GAP}px`, 
        height: `${GRID_ROWS * (TILE_HEIGHT + GAP) - GAP}px` 
      }}
    >
      {/* Background Hidden Messages Grid */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-[12px] pointer-events-none select-none">
        {resolvedTexts.map((text, idx) => (
          <div 
            key={idx} 
            className="flex flex-col items-center justify-center text-center font-sans text-xs sm:text-sm font-bold tracking-widest text-[#A3485A] leading-relaxed uppercase border border-accent-main/5 p-4 bg-accent-main/[0.005]"
            style={{ width: `${TILE_WIDTH}px`, height: `${TILE_HEIGHT}px` }}
          >
            {text.split("\n").map((line, lIdx) => (
              <span key={lIdx}>{line}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Foreground Sliding Tiles */}
      {tiles.map((tile) => (
        <div
          key={tile.id}
          onClick={() => handleTileClick(tile.gridIndex)}
          className="absolute left-0 top-0 cursor-pointer select-none bg-accent-main transition-none z-10"
          style={{
            width: `${TILE_WIDTH}px`,
            height: `${TILE_HEIGHT}px`,
            transform: `translate3d(${tile.x}px, ${tile.y}px, 0)`,
          }}
        >
          {/* Tile smear smear trail */}
          {tile.isMoving && (
            <div 
              className="absolute inset-0 bg-[#A3485A] opacity-25 filter blur-[3px] pointer-events-none"
              style={{
                transform: `translate3d(${tile.smearX}px, ${tile.smearY}px, 0)`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
