"use client";

import Image from "next/image";
import React from "react";

// --- 1. CORNER FLORAL ACCENTS (WATERCOLOR SVGs) ---
export interface FloralCornerProps {
  size?: number | string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const FloralCornerAccents: React.FC<FloralCornerProps> = ({
  size = 90,
  opacity = 0.9,
  className = "",
  style = {},
}) => {
  const widthStr = typeof size === "number" ? `${size}px` : size;

  return (
    <>
      {/* Top Left */}
      <img
        src="/Purple and White Watercolor Wedding Invitation (4).svg"
        alt="Floral Accent Top Left"
        className={`v3-floral-corner v3-floral-tl ${className}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: widthStr,
          height: widthStr,
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 3,
          opacity,
          ...style,
        }}
      />
      {/* Top Right */}
      <img
        src="/Purple and White Watercolor Wedding Invitation (5).svg"
        alt="Floral Accent Top Right"
        className={`v3-floral-corner v3-floral-tr ${className}`}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: widthStr,
          height: widthStr,
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 3,
          opacity,
          ...style,
        }}
      />
      {/* Bottom Left */}
      <img
        src="/Purple and White Watercolor Wedding Invitation (6).svg"
        alt="Floral Accent Bottom Left"
        className={`v3-floral-corner v3-floral-bl ${className}`}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: widthStr,
          height: widthStr,
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 3,
          opacity,
          ...style,
        }}
      />
      {/* Bottom Right */}
      <img
        src="/Purple and White Watercolor Wedding Invitation (7).svg"
        alt="Floral Accent Bottom Right"
        className={`v3-floral-corner v3-floral-br ${className}`}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: widthStr,
          height: widthStr,
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 3,
          opacity,
          ...style,
        }}
      />
    </>
  );
};

// --- 2. FLORAL PHOTO FRAME ACCENT (TOP-LEFT / BOTTOM-RIGHT CREST) ---
export const FloralPhotoSprayLeft: React.FC<{ size?: number; className?: string }> = ({
  size = 70,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`v3-floral-spray ${className}`}
    style={{ pointerEvents: "none" }}
  >
    {/* Delicate gold/rose floral spray */}
    <g opacity="0.85">
      {/* Curved main stem */}
      <path d="M10 90 Q30 50 85 15" stroke="var(--v3-gold, #C9A96E)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 75 Q40 40 70 25" stroke="var(--v3-rose, #C4889A)" strokeWidth="1" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M25 65 C15 55 10 40 25 35 C35 45 30 60 25 65 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.4" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.8" />
      <path d="M45 45 C38 32 30 22 45 18 C55 25 52 38 45 45 Z" fill="var(--v3-gold-pale, #E6D2B5)" fillOpacity="0.5" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.8" />
      <path d="M62 30 C60 18 68 8 78 12 C80 24 70 30 62 30 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.4" stroke="var(--v3-rose, #C4889A)" strokeWidth="0.8" />
      {/* Small buds/dots */}
      <circle cx="85" cy="15" r="3.5" fill="var(--v3-gold-light, #E2C99B)" />
      <circle cx="70" cy="25" r="2.5" fill="var(--v3-rose, #C4889A)" />
      <circle cx="35" cy="52" r="2" fill="var(--v3-gold, #C9A96E)" />
    </g>
  </svg>
);

export const FloralPhotoSprayRight: React.FC<{ size?: number; className?: string }> = ({
  size = 70,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`v3-floral-spray ${className}`}
    style={{ pointerEvents: "none", transform: "scaleX(-1)" }}
  >
    <g opacity="0.85">
      <path d="M10 90 Q30 50 85 15" stroke="var(--v3-gold, #C9A96E)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 75 Q40 40 70 25" stroke="var(--v3-rose, #C4889A)" strokeWidth="1" strokeLinecap="round" />
      <path d="M25 65 C15 55 10 40 25 35 C35 45 30 60 25 65 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.4" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.8" />
      <path d="M45 45 C38 32 30 22 45 18 C55 25 52 38 45 45 Z" fill="var(--v3-gold-pale, #E6D2B5)" fillOpacity="0.5" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.8" />
      <path d="M62 30 C60 18 68 8 78 12 C80 24 70 30 62 30 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.4" stroke="var(--v3-rose, #C4889A)" strokeWidth="0.8" />
      <circle cx="85" cy="15" r="3.5" fill="var(--v3-gold-light, #E2C99B)" />
      <circle cx="70" cy="25" r="2.5" fill="var(--v3-rose, #C4889A)" />
      <circle cx="35" cy="52" r="2" fill="var(--v3-gold, #C9A96E)" />
    </g>
  </svg>
);

// --- 3. FLORAL SEPARATOR / DIVIDER (BRANCH ACCENTS WITH AMPERSAND) ---
export const FloralDivider: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`v3-floral-divider-wrap ${className}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", margin: "24px 0" }}>
    {/* Left Leaf Branch */}
    <svg width="60" height="20" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.75 }}>
      <path d="M80 12 Q50 12 0 12" stroke="var(--v3-gold, #C9A96E)" strokeWidth="1" />
      <path d="M60 12 C52 5 40 5 36 12 C44 19 56 19 60 12 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.5" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.75" />
      <path d="M35 12 C28 4 18 4 14 12 C22 20 31 20 35 12 Z" fill="var(--v3-gold-pale, #E6D2B5)" fillOpacity="0.5" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.75" />
      <circle cx="5" cy="12" r="2.5" fill="var(--v3-gold-light, #E2C99B)" />
    </svg>

    <span className="v3-couple-sep-icon" style={{ fontStyle: "italic", fontSize: "26px", color: "var(--v3-gold, #C9A96E)", fontFamily: "var(--v3-font-serif)" }}>&amp;</span>

    {/* Right Leaf Branch */}
    <svg width="60" height="20" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.75, transform: "scaleX(-1)" }}>
      <path d="M80 12 Q50 12 0 12" stroke="var(--v3-gold, #C9A96E)" strokeWidth="1" />
      <path d="M60 12 C52 5 40 5 36 12 C44 19 56 19 60 12 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.5" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.75" />
      <path d="M35 12 C28 4 18 4 14 12 C22 20 31 20 35 12 Z" fill="var(--v3-gold-pale, #E6D2B5)" fillOpacity="0.5" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.75" />
      <circle cx="5" cy="12" r="2.5" fill="var(--v3-gold-light, #E2C99B)" />
    </svg>
  </div>
);

// --- 4. FLORAL HEADER CREST ---
export const FloralHeaderAccent: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`v3-floral-header-accent ${className}`} style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
    <svg width="120" height="24" viewBox="0 0 140 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
      <path d="M10 14 H60 M80 14 H130" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.8" strokeDasharray="2 2" />
      <path d="M45 14 Q55 6 65 14 Q55 22 45 14 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.4" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.8" />
      <path d="M95 14 Q85 6 75 14 Q85 22 95 14 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.4" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.8" />
      <circle cx="70" cy="14" r="4" fill="var(--v3-gold, #C9A96E)" />
      <circle cx="70" cy="14" r="2" fill="#FFF" />
      <circle cx="20" cy="14" r="2" fill="var(--v3-gold-light, #E2C99B)" />
      <circle cx="120" cy="14" r="2" fill="var(--v3-gold-light, #E2C99B)" />
    </svg>
  </div>
);

// --- 5. FLORAL QUOTE FRAME ACCENTS (DISTINCTIVE ARCH & WREATH FOR QUOTE SECTION) ---
export const FloralQuoteAccents: React.FC<{ className?: string }> = ({ className = "" }) => (
  <>
    {/* Top Floral Arch Crest */}
    <div
      className={`v3-quote-floral-top ${className}`}
      style={{
        position: "absolute",
        top: "-15px",
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        zIndex: 2,
        width: "220px",
        height: "50px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <svg width="220" height="50" viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.9">
          <path d="M10 40 Q110 5 210 40" stroke="var(--v3-gold, #C9A96E)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M25 32 Q110 12 195 32" stroke="var(--v3-rose, #C4889A)" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M60 21 C50 12 40 15 45 25 C55 28 62 25 60 21 Z" fill="var(--v3-gold-pale, #E6D2B5)" fillOpacity="0.6" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.75" />
          <path d="M85 14 C80 4 70 7 75 17 C85 20 90 16 85 14 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.5" stroke="var(--v3-rose, #C4889A)" strokeWidth="0.75" />
          <path d="M135 14 C140 4 150 7 145 17 C135 20 130 16 135 14 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.5" stroke="var(--v3-rose, #C4889A)" strokeWidth="0.75" />
          <path d="M160 21 C170 12 180 15 175 25 C165 28 158 25 160 21 Z" fill="var(--v3-gold-pale, #E6D2B5)" fillOpacity="0.6" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.75" />
          <circle cx="110" cy="10" r="5" fill="var(--v3-gold, #C9A96E)" />
          <circle cx="110" cy="10" r="2.5" fill="#FFF" />
          <circle cx="100" cy="13" r="3" fill="var(--v3-rose, #C4889A)" fillOpacity="0.8" />
          <circle cx="120" cy="13" r="3" fill="var(--v3-rose, #C4889A)" fillOpacity="0.8" />
        </g>
      </svg>
    </div>

    {/* Bottom Floral Arch Crest */}
    <div
      className={`v3-quote-floral-bottom ${className}`}
      style={{
        position: "absolute",
        bottom: "-15px",
        left: "50%",
        transform: "translateX(-50%) scaleY(-1)",
        pointerEvents: "none",
        zIndex: 2,
        width: "220px",
        height: "50px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <svg width="220" height="50" viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.9">
          <path d="M10 40 Q110 5 210 40" stroke="var(--v3-gold, #C9A96E)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M25 32 Q110 12 195 32" stroke="var(--v3-rose, #C4889A)" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M60 21 C50 12 40 15 45 25 C55 28 62 25 60 21 Z" fill="var(--v3-gold-pale, #E6D2B5)" fillOpacity="0.6" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.75" />
          <path d="M85 14 C80 4 70 7 75 17 C85 20 90 16 85 14 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.5" stroke="var(--v3-rose, #C4889A)" strokeWidth="0.75" />
          <path d="M135 14 C140 4 150 7 145 17 C135 20 130 16 135 14 Z" fill="var(--v3-rose-pale, #E8C5D0)" fillOpacity="0.5" stroke="var(--v3-rose, #C4889A)" strokeWidth="0.75" />
          <path d="M160 21 C170 12 180 15 175 25 C165 28 158 25 160 21 Z" fill="var(--v3-gold-pale, #E6D2B5)" fillOpacity="0.6" stroke="var(--v3-gold, #C9A96E)" strokeWidth="0.75" />
          <circle cx="110" cy="10" r="5" fill="var(--v3-gold, #C9A96E)" />
          <circle cx="110" cy="10" r="2.5" fill="#FFF" />
          <circle cx="100" cy="13" r="3" fill="var(--v3-rose, #C4889A)" fillOpacity="0.8" />
          <circle cx="120" cy="13" r="3" fill="var(--v3-rose, #C4889A)" fillOpacity="0.8" />
        </g>
      </svg>
    </div>
  </>
);

export const FloralQuoteWreath: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`v3-quote-wreath ${className}`}
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.18,
    }}
  >
    <circle cx="100" cy="100" r="85" stroke="var(--v3-gold, #C9A96E)" strokeWidth="1" strokeDasharray="4 4" />
    <circle cx="100" cy="100" r="75" stroke="var(--v3-rose, #C4889A)" strokeWidth="0.5" />
    <path d="M100 15 Q140 20 170 50 Q180 90 170 130" stroke="var(--v3-gold, #C9A96E)" strokeWidth="1.2" />
    <path d="M100 185 Q60 180 30 150 Q20 110 30 70" stroke="var(--v3-gold, #C9A96E)" strokeWidth="1.2" />
  </svg>
);
