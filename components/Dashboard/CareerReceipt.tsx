"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MOCK_DATA, DEFAULT_DATA, OPTIMIZED_DATA } from "./mockData";

const DASHED_LINE = "- - - - - - - - - - - - - - - -";
const DOUBLE_LINE = "=====================";
const FPS = 12;
const FRAME_MS = 1000 / FPS;
const TOTAL_STEPS = 8;
const DELAY_MS = 300;

function pad(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + " ".repeat(len - str.length);
}

function padStart(str: string, len: number): string {
  return str.length >= len ? str : " ".repeat(len - str.length) + str;
}

function centerText(str: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - str.length) / 2));
  return " ".repeat(padding) + str;
}

export default function CareerReceipt() {
  const [receiptData, setReceiptData] = useState<any>(null);

  // Load initial receipt state
  useEffect(() => {
    const saved = localStorage.getItem("snipecv_receipt_data");
    if (saved) {
      try {
        setReceiptData(JSON.parse(saved));
      } catch (e) {
        setReceiptData(DEFAULT_DATA);
      }
    } else {
      setReceiptData(DEFAULT_DATA);
    }
  }, []);

  // Listen to tweak events to update receipt data
  useEffect(() => {
    const handleTweak = () => {
      localStorage.setItem("snipecv_receipt_data", JSON.stringify(OPTIMIZED_DATA));
      setReceiptData(OPTIMIZED_DATA);
    };

    const handleReset = () => {
      localStorage.removeItem("snipecv_receipt_data");
      setReceiptData(DEFAULT_DATA);
    };

    window.addEventListener("snipecv-tweak", handleTweak);
    window.addEventListener("snipecv-reset-receipt", handleReset);
    return () => {
      window.removeEventListener("snipecv-tweak", handleTweak);
      window.removeEventListener("snipecv-reset-receipt", handleReset);
    };
  }, []);

  if (!receiptData) return null;

  const LINE_WIDTH = 34;
  const isVacant = receiptData.isVacant;

  const activeSkills = receiptData.currentSkills || [];
  const activeHighlighted = receiptData.highlightedSkills || [];
  const activeRecommended = receiptData.recommendedSkills || [];

  const secondarySkills = activeSkills.filter(
    (s: string) => !activeHighlighted.includes(s)
  );

  // Group secondary skills into lines of ~30 chars
  const secondaryLines: string[][] = [];
  let currentLine: string[] = [];
  let currentLen = 0;
  for (const skill of secondarySkills) {
    const addLen = currentLine.length > 0 ? skill.length + 3 : skill.length;
    if (currentLen + addLen > 28 && currentLine.length > 0) {
      secondaryLines.push(currentLine);
      currentLine = [skill];
      currentLen = skill.length;
    } else {
      currentLine.push(skill);
      currentLen += addLen;
    }
  }
  if (currentLine.length > 0) secondaryLines.push(currentLine);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        maxHeight: "75vh",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "280px",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Jagged top edge */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "10px",
            backgroundColor: "#F5ECD7",
            clipPath:
              "polygon(0% 100%, 5% 55%, 10% 80%, 15% 45%, 20% 90%, 25% 50%, 30% 75%, 35% 40%, 40% 85%, 45% 55%, 50% 95%, 55% 50%, 60% 80%, 65% 45%, 70% 90%, 75% 55%, 80% 75%, 85% 45%, 90% 85%, 95% 50%, 100% 100%)",
            marginBottom: "-1px",
            flexShrink: 0,
          }}
        />

        {/* Main receipt body */}
        <div
          style={{
            position: "relative",
            backgroundColor: "#F5ECD7",
            padding: "12px 16px",
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "10px",
            lineHeight: "1.5",
            color: "#1a1a1a",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            whiteSpace: "pre",
            overflowY: "auto",
            flex: 1,
          }}
          className="scrollbar-none"
        >
          {/* Noise texture overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
              opacity: 0.06,
              mixBlendMode: "multiply" as const,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Receipt content */}
          <div style={{ position: "relative", zIndex: 0 }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.12em" }}>
                SNIPECV
              </div>
              <div style={{ fontSize: "10px", letterSpacing: "0.06em", marginTop: "2px" }}>
                CAREER REPORT
              </div>
              <div style={{ marginTop: "4px", letterSpacing: "0.04em" }}>
                {DOUBLE_LINE}
              </div>
            </div>

            {/* Meta info */}
            <div style={{ marginTop: "8px", marginBottom: "4px" }}>
              <div>{centerText("USER CAREER RECEIPT", LINE_WIDTH)}</div>
              <div>{centerText("DATE: 15/06/2026", LINE_WIDTH)}</div>
              <div>{centerText(`REF: #SCV-${isVacant ? "00000" : "00847"}`, LINE_WIDTH)}</div>
            </div>

            {/* Separator */}
            <div style={{ margin: "8px 0", textAlign: "center" }}>{DASHED_LINE}</div>

            {isVacant ? (
              /* VACANT DEFAULT STATE FOR NEW USERS */
              <div style={{ padding: "12px 0", textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "#842A3B", marginBottom: "8px" }}>
                  [ ARCHIVE VACANT ]
                </div>
                <div style={{ fontSize: "9px", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                  NO CAREER PROFILE LOADED.{"\n"}
                  PLEASE DROP YOUR RESUME OR{"\n"}
                  INPUT A TARGET JOB ROLE IN{"\n"}
                  THE CONSOLE TO OPTIMISE.
                </div>
              </div>
            ) : (
              /* POPULATED TWEAKED STATE */
              <>
                {/* Projects */}
                <div style={{ marginBottom: "4px" }}>
                  <div style={{ textAlign: "center", marginBottom: "6px" }}>
                    TOP MATCHING PROJECTS
                  </div>
                  {receiptData.projects.map((project: any, i: number) => {
                    const num = padStart(String(i + 1), 2);
                    const words = project.name.toUpperCase().split(" ");
                    const matchStr = `${project.match}%`;

                    const maxFirstLine = 26 - matchStr.length - 1;
                    let firstLineWords: string[] = [];
                    let secondLineWords: string[] = [];
                    let firstLen = num.length + 2;

                    for (const word of words) {
                      if (firstLen + word.length <= maxFirstLine || firstLineWords.length === 0) {
                        firstLineWords.push(word);
                        firstLen += word.length + 1;
                      } else {
                        secondLineWords.push(word);
                      }
                    }

                    const firstText = `${num}. ${firstLineWords.join(" ")}`;
                    const gap = Math.max(1, 30 - firstText.length - matchStr.length);

                    return (
                      <div key={i} style={{ marginBottom: "2px" }}>
                        <div>
                          {"   "}{firstText}{" ".repeat(gap)}{matchStr}
                        </div>
                        {secondLineWords.length > 0 && (
                          <div>{"       "}{secondLineWords.join(" ")}</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Separator */}
                <div style={{ margin: "8px 0", textAlign: "center" }}>{DASHED_LINE}</div>

                {/* Skills */}
                <div style={{ marginBottom: "4px" }}>
                  <div style={{ textAlign: "center", marginBottom: "6px" }}>
                    YOUR STRONGEST SKILLS
                  </div>

                  {/* Highlighted skills with yellow marker */}
                  <div style={{ marginBottom: "8px" }}>
                    {activeHighlighted.map((skill: string, i: number) => (
                      <div key={i} style={{ textAlign: "center", marginBottom: "2px" }}>
                        <span
                          style={{
                            backgroundColor: "#E8C547",
                            color: "#1a1a1a",
                            padding: "1px 4px",
                            fontWeight: 700,
                          }}
                        >
                          {"████ "}{skill}{" ████"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Secondary skills */}
                  <div style={{ textAlign: "center" }}>
                    {secondaryLines.map((line, i) => (
                      <div key={i}>{line.join(" · ")}</div>
                    ))}
                  </div>
                </div>

                {/* Separator */}
                {activeRecommended.length > 0 && (
                  <>
                    <div style={{ margin: "8px 0", textAlign: "center" }}>{DASHED_LINE}</div>
                    <div style={{ marginBottom: "4px" }}>
                      <div style={{ textAlign: "center", marginBottom: "6px" }}>
                        SKILLS TO UNLOCK
                      </div>
                      {activeRecommended.map((skill: string, i: number) => (
                        <div key={i} style={{ textAlign: "center" }}>
                          + {skill}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Separator */}
            <div style={{ margin: "8px 0", textAlign: "center" }}>{DASHED_LINE}</div>

            {/* Footer */}
            <div style={{ textAlign: "center" }}>
              <div>GENERATED BY SNIPECV</div>
              <div style={{ marginTop: "4px" }}>{DOUBLE_LINE}</div>
            </div>
          </div>
        </div>

        {/* Jagated bottom edge */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "10px",
            backgroundColor: "#F5ECD7",
            clipPath:
              "polygon(0% 0%, 5% 45%, 10% 20%, 15% 55%, 20% 10%, 25% 50%, 30% 25%, 35% 60%, 40% 15%, 45% 45%, 50% 5%, 55% 50%, 60% 20%, 65% 55%, 70% 10%, 75% 45%, 80% 25%, 85% 55%, 90% 15%, 95% 50%, 100% 0%)",
            marginTop: "-1px",
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}

