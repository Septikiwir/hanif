"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { toJpeg } from "html-to-image";

// --- TYPES -------------------------------------------------------------------

export interface InvitationData {
  couple: {
    bride: {
      shortName: string;
      fullName: string;
      label?: string;
      parents: { father: string; mother: string };
      instagram: { username: string; url: string };
      photo: string;
    };
    groom: {
      shortName: string;
      fullName: string;
      label?: string;
      parents: { father: string; mother: string };
      instagram: { username: string; url: string };
      photo: string;
    };
  };
  event: {
    date: string;
    displayDate: string;
    day: string;
    locationName: string;
    locationCity: string;
    mapsUrl: string;
    akad: { time: string };
    resepsi: { time: string };
    livestream: { time: string; url: string };
  };
  media: {
    music: string;
    heroVideo: string;
    logo: string;
    openingPhoto?: string;
    galleryVideo: string;
    paymentLogoLeft?: string;
    qrBannerPhoto?: string;
    quote?: { text: string; ref: string; background?: string };
    greetingText?: string;
    introText?: string;
    ogImage?: string;
    story: { src: string; subtitle: string }[];
    gallery: { src: string; isLandscape: boolean }[];
  };
  payment: {
    id: string;
    bank: string;
    holderName: string;
    accountNumber?: string;
    isQris?: boolean;
    isAddress?: boolean;
    address?: string;
    images?: {
      qrisImage?: string;
      chipImage?: string;
      logo?: string;
      logoLeft?: string;
    };
  }[];
}

type CountdownState = {
  days: string;
  hours: string;
  mins: string;
  secs: string;
  done: boolean;
};

type Wish = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

// --- CUSTOM TOAST ------------------------------------------------------------
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
      animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
      exit={{ opacity: 0, y: -10, x: "-50%", scale: 0.95 }}
      className={`custom-toast ${type}`}
    >
      <div className="toast-icon">
        {type === "success" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>
      <span className="toast-message">{message}</span>
    </motion.div>
  );
};

// --- STORY COMPONENTS --------------------------------------------------------
const StoryItem = ({ src, alt, subtitle }: { src: string; alt: string; subtitle: string }) => {
  return (
    <div className="simple-story-item reveal reveal-up">
      <div className="story-image-wrap">
        <img src={src} alt={alt} className="story-img" />
      </div>
      <div className="story-content-wrap">
        <p className="story-text">{subtitle}</p>
      </div>
    </div>
  );
};

// --- Chip Component ----------------------------------------------------------
function Chip({ src }: { src?: string }) {
  return (
    <div
      style={{
        width: 100,
        height: 100,
        borderRadius: 12,
        position: "relative",
        marginBottom: 20,
        overflow: "hidden",
        border: "1px solid #eee",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      }}
    >
      {src && (
        <img
          src={src}
          alt="Chip"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}

// --- Copy Button -------------------------------------------------------------
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: copied ? "rgba(25,135,84,0.1)" : "rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.05)",
        borderRadius: 9,
        padding: "7px 13px",
        fontSize: 12,
        fontWeight: 600,
        color: copied ? "#198754" : "#444",
        cursor: "pointer",
        transition: "all 0.2s ease",
        letterSpacing: 0.3,
      }}
    >
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}

// --- Download Button ---------------------------------------------------------
function DownloadButton({ imageUrl }: { imageUrl: string }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "QRIS-Wedding-Payment.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to direct link if fetch fails (e.g. CORS)
      window.open(imageUrl, "_blank");
    }
  };
  return (
    <button
      onClick={handleDownload}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.05)",
        borderRadius: 9,
        padding: "7px 13px",
        fontSize: 12,
        fontWeight: 600,
        color: "#444",
        cursor: "pointer",
        transition: "all 0.2s ease",
        letterSpacing: 0.3,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2 }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download QRIS
    </button>
  );
}

// --- Card Component ----------------------------------------------------------
interface PaymentCardProps {
  bank: string;
  holderName: string;
  logoUrl?: string;
  isQris?: boolean;
  qrisImage?: string;
  chipImage?: string;
  isAddress?: boolean;
  address?: string;
  accountNumber?: string;
}

function PaymentCard({ bank, holderName, logoUrl, isQris, qrisImage, chipImage, isAddress, address, accountNumber, paymentLogoLeft }: PaymentCardProps & { paymentLogoLeft?: string }) {
  return (
    <div className="reveal reveal-up" style={{ background: "#ffffff", borderRadius: 20, padding: "20px 22px 16px", border: "1px solid #e0e0e0", position: "relative", overflow: "hidden", width: "100%", boxSizing: "border-box", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
      <div style={{ position: "absolute", right: -50, bottom: -60, width: 170, height: 170, borderRadius: "50%", background: "rgba(0,0,0,0.03)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 15, bottom: -80, width: 130, height: 130, borderRadius: "50%", background: "rgba(0,0,0,0.02)", pointerEvents: "none" }} />

      {/* Top Header: Logos */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, position: "relative", zIndex: 1 }}>
        {/* Logo Left: Only for QRIS */}
        {isQris && paymentLogoLeft ? (
          <img src={paymentLogoLeft} alt="Logo Left" style={{ height: "30px", width: "auto", objectFit: "contain" }} />
        ) : <div />}

        {/* Logo Right: Always for Bank/QRIS (not address) */}
        {!isAddress && logoUrl && (
          <img src={logoUrl} alt={bank} style={{ height: "35px", width: "auto", objectFit: "contain" }} />
        )}

        {/* Address Label */}
        {isAddress && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{bank}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {isQris ? (
          <>
            <Chip src={chipImage} />
            {/* QRIS Image is hidden from UI but kept in props for download button */}
          </>
        ) : isAddress ? (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#444", marginBottom: 0, fontFamily: "var(--font-body)", textAlign: "center" }}>{address}</p>
          </div>
        ) : (
          <>
            <Chip src={chipImage} />
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "#1a1a1a", letterSpacing: "0.15em", marginBottom: 4 }}>{accountNumber}</p>
            </div>
          </>
        )}
      </div>

      {/* Footer: Holder & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 10, letterSpacing: 1.2, color: "#aaa", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Card Holder</span>
          <span style={{ fontSize: 13, letterSpacing: 1, color: "#444", fontWeight: 700, textTransform: "uppercase" }}>{holderName}</span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {isQris && qrisImage && <DownloadButton imageUrl={qrisImage} />}
          {!isQris && !isAddress && accountNumber && <CopyButton value={accountNumber} />}
          {isAddress && address && <CopyButton value={address} />}
        </div>
      </div>
    </div>
  );
}


// --- MAIN TEMPLATE COMPONENT -------------------------------------------------

export default function TemplateV2({ data, slug }: { data: InvitationData; slug: string }) {
  const weddingDate = useMemo(() => new Date(data.event.date), [data.event.date]);
  const audioSrc = useMemo(() => {
    // Encode spaces and special characters like parentheses
    return data.media.music.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
  }, [data.media.music]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [hasToken, setHasToken] = useState(false);
  const [tokenValue, setTokenValue] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("to") ?? sp.get("tamu") ?? sp.get("guest") ?? sp.get("nama");
    const cleaned = (raw ?? "").replace(/\s+/g, " ").trim();
    const token = sp.get("token");

    if (cleaned) setGuestName(cleaned.slice(0, 60));
    if (token !== null) {
      setHasToken(true);
      setTokenValue(token);
    }
  }, []);
  const qrCardRef = useRef<HTMLDivElement | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [rsvpStats, setRsvpStats] = useState({ hadir: 0, tidakHadir: 0 });
  const [isSubmittingWishes, setIsSubmittingWishes] = useState(false);
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("");
  const [wishName, setWishName] = useState("");
  const [wishText, setWishText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isOpeningReady, setIsOpeningReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<CountdownState>({ days: "00", hours: "00", mins: "00", secs: "00", done: false });

  const showToast = (message: string, type: "success" | "error" = "success") => setToast({ message, type });
  const hideToast = useCallback(() => setToast(null), []);

  const fetchWishes = useCallback(async () => {
    const { data: list, error } = await supabase.from("wishes").select("*").eq("invitation_slug", slug).order("created_at", { ascending: false });
    if (!error && list) setWishes(list);
  }, []);
  const fetchRSVPStats = useCallback(async () => {
    const { data: list, error } = await supabase.from("rsvp").select("attendance").eq("invitation_slug", slug);
    if (!error && list) {
      const hadir = list.filter((r) => r.attendance === "Hadir").length;
      const tidakHadir = list.filter((r) => r.attendance === "Tidak Hadir").length;
      setRsvpStats({ hadir, tidakHadir });
    }
  }, []);

  useEffect(() => {
    const initData = async () => { await fetchWishes(); await fetchRSVPStats(); };
    void initData();
    if (guestName !== "Tamu Undangan") { setRsvpName(guestName); setWishName(guestName); }
    const timer = setTimeout(() => setIsOpeningReady(true), 100);
    return () => clearTimeout(timer);
  }, [fetchWishes, fetchRSVPStats, guestName]);

  useEffect(() => {
    const audio = audioRef.current; if (!audio) return;
    audio.load(); // Force reload when src changes
  }, [audioSrc]);

  useEffect(() => {
    const audio = audioRef.current; if (!audio) return;
    let cancelled = false;
    const shouldPlay = isInvitationOpen && isPlaying;

    const sync = async () => {
      if (!audio) return;
      if (shouldPlay) {
        try {
          await audio.play();
        } catch (err) {
          console.error("Audio play failed:", err);
          if (!cancelled) setIsPlaying(false);
        }
      }
      else { audio.pause(); }
    };
    void sync(); return () => { cancelled = true; };
  }, [isInvitationOpen, isPlaying]);

  useEffect(() => {
    const video = heroVideoRef.current; if (!video) return;
    if (isInvitationOpen) { video.play().catch(() => { }); }
    else { video.pause(); video.currentTime = 0; }
  }, [isInvitationOpen]);

  useEffect(() => {
    if (isInvitationOpen) {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("visible");
            if (target.classList.contains("event-date-number") && !target.dataset.counted) {
              const targetVal = parseInt(target.innerText) || 17;
              let current = 1; const duration = 1200; const frameRate = 1000 / 60; const totalFrames = duration / frameRate; const increment = (targetVal - 1) / totalFrames;
              target.dataset.counted = "true";
              const timer = setInterval(() => {
                current += increment;
                if (current >= targetVal) { target.innerText = targetVal.toString(); clearInterval(timer); }
                else { target.innerText = Math.floor(current).toString(); }
              }, frameRate);
            }
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -20% 0px" });
      elements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [isInvitationOpen]);

  useEffect(() => {
    if (isInvitationOpen) {
      document.body.style.overflow = "";
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isInvitationOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date(); const diff = weddingDate.getTime() - now.getTime();
      if (diff <= 0) { setCountdown({ days: "00", hours: "00", mins: "00", secs: "00", done: true }); return; }
      const d = Math.floor(diff / 86400000); const h = Math.floor((diff % 86400000) / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ days: String(d).padStart(2, "0"), hours: String(h).padStart(2, "0"), mins: String(m).padStart(2, "0"), secs: String(s).padStart(2, "0"), done: false });
    };
    update(); const id = window.setInterval(update, 1000); return () => window.clearInterval(id);
  }, [weddingDate]);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!rsvpName || !rsvpStatus) return showToast("Mohon isi nama dan status kehadiran.", "error");
    setIsSubmittingRSVP(true); const { error } = await supabase.from("rsvp").insert([{ name: rsvpName, attendance: rsvpStatus, invitation_slug: slug }]);
    setIsSubmittingRSVP(false); if (error) { showToast("Gagal mengirim RSVP.", "error"); }
    else { setRsvpName(""); setRsvpStatus(""); fetchRSVPStats(); showToast("Terima kasih atas konfirmasinya!"); }
  };

  const handleWishesSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!wishName || !wishText) return showToast("Mohon isi nama dan ucapan.", "error");
    setIsSubmittingWishes(true); const { error } = await supabase.from("wishes").insert([{ name: wishName, message: wishText, invitation_slug: slug }]);
    setIsSubmittingWishes(false); if (error) { showToast("Gagal mengirim ucapan.", "error"); }
    else { setWishName(""); setWishText(""); fetchWishes(); showToast("Ucapan berhasil dikirim!"); setCurrentPage(1); }
  };

  const downloadQrImage = async () => {
    if (!tokenValue) { showToast("Token tidak tersedia", "error"); return; }
    setIsExporting(true);
    try {
      const card = qrCardRef.current; if (!card) { showToast("Kartu belum siap", "error"); return; }
      const baseWidth = card.offsetWidth || 420; const baseHeight = card.offsetHeight || Math.round(baseWidth * 0.72);
      const dataUrl = await toJpeg(card, { quality: 0.95, backgroundColor: "#ffffff", cacheBust: true, width: baseWidth, height: baseHeight, pixelRatio: 2, style: { transform: "none", transformOrigin: "top left", width: `${baseWidth}px`, height: `${baseHeight}px` } });
      const a = document.createElement("a"); a.download = `QR-Card-${(guestName || "guest").replace(/\s+/g, "_")}.jpg`; a.href = dataUrl; document.body.appendChild(a); a.click(); a.remove();
      showToast("Kartu berhasil diunduh", "success");
    } catch { showToast("Gagal mengunduh kartu", "error"); } finally { setIsExporting(false); }
  };

  const totalPages = Math.ceil(wishes.length / ITEMS_PER_PAGE);
  const currentWishes = wishes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      {showQrModal && (
        <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", padding: 20 }} onClick={() => setShowQrModal(false)}>
          <div className="qr-modal-root" onClick={(e) => e.stopPropagation()} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className={`card ${isExporting ? "is-exporting" : ""}`} ref={qrCardRef}>
              <style>{`
                .qr-modal-root { --modal-scale: min(1, calc((100vw - 40px) / 420)); }
                .qr-modal-root * { box-sizing: border-box; }
                .qr-modal-root .card { width: 420px; max-width: 430px; background: #fff; box-shadow: 0 2px 24px rgba(0,0,0,0.13); overflow: hidden; position: relative; font-family: Georgia, serif; border-radius: 0; transform: scale(var(--modal-scale)); transform-origin: top center; }
                .qr-modal-root .banner { width: 100%; height: 120px; background: #2a1e0a; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
                .qr-modal-root .banner-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(26,16,5,0.5) 0%, rgba(61,43,13,0.5) 40%, rgba(90,62,20,0.5) 70%, rgba(42,30,10,0.5) 100%); z-index: 1; }
                .qr-modal-root .banner-content { position: relative; z-index: 2; text-align: center; width: 100%; padding: 0 20px; color: #f0e8d4; }
                .qr-modal-root .banner-pretitle { font-family: -apple-system, sans-serif; font-size: 7.5px; letter-spacing: 0.3em; color: #eecd94; text-transform: uppercase; margin-bottom: 8px; }
                .qr-modal-root .banner-name { font-size: 28px; font-weight: 400; color: #f0e8d4; letter-spacing: 0.1em; text-transform: uppercase; font-family: Georgia, serif; line-height: 1; }
                .qr-modal-root .banner-amp { font-size: 26px; color: #c9a96e; font-style: italic; font-family: Georgia, serif; }
                .qr-modal-root .banner-meta { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 10px; }
                .qr-modal-root .banner-meta-item { font-family: -apple-system, sans-serif; font-size: 8px; letter-spacing: 0.18em; color: #eecd94; text-transform: uppercase; }
                .qr-modal-root .body { display: flex; align-items: stretch; }
                .qr-modal-root .info { flex: 1; padding: 18px 20px; border-right: 0.5px solid #e8e4de; }
                .qr-modal-root .info-guest { font-size: 13.5px; color: #1a1408; font-family: Georgia, serif; font-weight: 700; margin-top: 6px; }
                .qr-modal-root .qr-side { width: 148px; flex-shrink: 0; padding: 14px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
                .qr-modal-root .qr-box { width: 112px; height: 112px; background: #fff; border: 1px solid #ddd; padding: 6px; display: flex; align-items: center; justify-content: center; }
                .qr-modal-root .btn-close { position: absolute; top: 10px; right: 10px; z-index: 10; width: 26px; height: 26px; background: rgba(0,0,0,0.35); border: 0.5px solid rgba(201,169,110,0.4); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
                .qr-modal-root .btn-close svg { width: 10px; height: 10px; display: block; }
                .qr-modal-root .card.is-exporting .btn-close, .qr-modal-root .card.is-exporting .download-btn { display: none !important; }
              `}</style>
              <button className="btn-close" onClick={() => setShowQrModal(false)} title="Tutup">
                <svg viewBox="0 0 10 10" fill="none"><line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" /><line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
              <div className="banner" style={data.media.qrBannerPhoto ? { backgroundImage: `url(${data.media.qrBannerPhoto})` } : {}}>
                <div className="banner-overlay" />
                <div className="banner-content">
                  <div className="banner-pretitle">The Wedding Of</div>
                  <div className="banner-name">{data.couple.bride.shortName} <span className="banner-amp">&amp;</span> {data.couple.groom.shortName}</div>
                  <div className="banner-meta">
                    <span className="banner-meta-item">{data.event.displayDate}</span>
                    <div style={{ width: 2, height: 2, background: "#eecd94", borderRadius: "50%" }} />
                    <span className="banner-meta-item">{data.event.day}</span>
                    <div style={{ width: 2, height: 2, background: "#eecd94", borderRadius: "50%" }} />
                    <span className="banner-meta-item">{data.event.locationName}</span>
                  </div>
                </div>
              </div>
              <div className="body">
                <div className="info">
                  <div style={{ fontSize: 9, color: "#aaa", marginBottom: 2 }}>The Wedding of</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1408", fontFamily: "Georgia, serif", lineHeight: 1.2, marginBottom: 8 }}>{data.couple.bride.shortName} &amp; {data.couple.groom.shortName}</div>
                  <div style={{ fontSize: 10.5, color: "#555", marginBottom: 14 }}>{data.event.day}, {data.event.displayDate}</div>
                  <div style={{ width: 32, height: 0.5, background: "#c9a96e", marginBottom: 12 }} />
                  <div style={{ fontSize: 9.5, color: "#999", marginBottom: 2 }}>Kepada Yth.</div>
                  <div style={{ fontSize: 9.5, color: "#999", marginBottom: 2 }}>Bapak/Ibu/Saudara/i:</div>
                  <div className="info-guest">{guestName}</div>
                  <div style={{ fontSize: 10, color: "#bbb", marginTop: 4 }}>—</div>
                </div>
                <div className="qr-side"><div style={{ fontSize: 8, color: "#bbb", alignSelf: "flex-end" }}>by nimantra.id</div><div className="qr-box">{tokenValue ? <QRCodeSVG value={tokenValue} size={100} /> : <div style={{ fontSize: 8 }}>QR Gagal</div>}</div><button className="download-btn" onClick={downloadQrImage} style={{ padding: "6px 10px", fontSize: 11, background: "#fff", border: "1px solid #eee", cursor: "pointer", borderRadius: 8 }}>Download</button></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className={`opening-screen ${isInvitationOpen ? "closed" : ""}`}>
        <div className="screen">
          <div className="bg-photo" style={{ backgroundImage: `url(${data.media.openingPhoto || data.couple.bride.photo})` }} />
          <div className="overlay" />
          <svg className="ornament ornament-tl" width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M4 4 L4 28 M4 4 L28 4" stroke="white" strokeWidth="1" /><path d="M4 4 L18 18" stroke="white" strokeWidth="0.5" /><circle cx="4" cy="4" r="2" fill="white" /></svg>
          <svg className="ornament ornament-tr" width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M60 4 L60 28 M60 4 L36 4" stroke="white" strokeWidth="1" /><path d="M60 4 L46 18" stroke="white" strokeWidth="0.5" /><circle cx="60" cy="4" r="2" fill="white" /></svg>
          <svg className="ornament ornament-bl" width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M4 60 L4 36 M4 60 L28 60" stroke="white" strokeWidth="1" /><path d="M4 60 L18 46" stroke="white" strokeWidth="0.5" /><circle cx="4" cy="60" r="2" fill="white" /></svg>
          <svg className="ornament ornament-br" width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M60 60 L60 36 M60 60 L36 60" stroke="white" strokeWidth="1" /><path d="M60 60 L46 46" stroke="white" strokeWidth="0.5" /><circle cx="60" cy="60" r="2" fill="white" /></svg>

          <div className={`reveal reveal-fade ${isOpeningReady ? "visible" : ""}`} style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "60px 20px", display: "flex", justifyContent: "center", zIndex: 10, transitionDelay: "0.2s" }}>
            <img src={data.media.logo} alt="Logo" style={{ height: "64px", width: "auto", objectFit: "contain" }} />
          </div>

          <div className="content">
            <p className={`wedding-of reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "0.4s" }}>The Wedding Of</p>
            <h1 className={`names reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "0.6s" }}>{data.couple.bride.shortName} <span className="ampersand">&amp;</span> {data.couple.groom.shortName}</h1>
            <div className={`divider reveal reveal-fade ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "0.8s" }} />
            <p className={`kepada reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "1s" }}>Kepada Yth.<br />Bapak / Ibu / Saudara/i</p>
            <p className={`tamu reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "1.2s" }}>{guestName}</p>
            <p className={`note reveal reveal-fade ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "1.4s" }}>*Mohon maaf jika ada kesalahan dalam penulisan nama / gelar.</p>
            <div className={`reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "1.6s" }}>
              <button className="btn" type="button" onClick={() => { window.scrollTo(0, 0); setIsInvitationOpen(true); setIsPlaying(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18, marginRight: 8 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Buka Undangan
              </button>
            </div>
            {hasToken && (
              <div className={`reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "1.8s", marginTop: 12 }}>
                <button className="btn btn-qr" onClick={() => setShowQrModal(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 8 }}>
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    <path d="M7 7h.01M17 7h.01M7 17h.01" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  QR Check-in
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <main>
        <div className="fixed-bg-video">
          <video className="hero-video" src={data.media.heroVideo} ref={heroVideoRef} muted loop playsInline preload="auto" />
          <div className="fixed-overlay" />
        </div>

        <header className="hero">
          <div className="content">
            <div className="reveal reveal-fade delay-1">
              <img src={data.media.logo} alt="Logo" style={{ height: "64px", width: "auto", marginBottom: "1.5rem", objectFit: "contain" }} />
            </div>
            <p className="wedding-of reveal reveal-up delay-2">The Wedding Of</p>
            <h1 className="names reveal reveal-up delay-3">{data.couple.bride.shortName} <span className="amp">&amp;</span> {data.couple.groom.shortName}</h1>
            <p className="date reveal reveal-up delay-4">{data.event.day} · {data.event.displayDate}</p>
          </div>

          <div className="countdown-bar reveal reveal-up delay-5">
            <div className="count-group"><span className="count-number">{countdown.days}</span><span className="count-label">Hari</span></div>
            <span className="count-sep">·</span>
            <div className="count-group"><span className="count-number">{countdown.hours}</span><span className="count-label">Jam</span></div>
            <span className="count-sep">·</span>
            <div className="count-group"><span className="count-number">{countdown.mins}</span><span className="count-label">Menit</span></div>
            <span className="count-sep">·</span>
            <div className="count-group"><span className="count-number">{countdown.secs}</span><span className="count-label">Detik</span></div>
          </div>

          <div className={`reveal reveal-up delay-5 ${isInvitationOpen ? "visible" : ""}`} style={{ position: "absolute", bottom: "86px", left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 30 }}>
            <a href={`https://www.google.com/calendar/render?action=TEMPLATE&text=The+Wedding+of+${data.couple.bride.shortName}+%26+${data.couple.groom.shortName}&dates=${data.event.date.replace(/[-:]/g, "").split(".")[0]}Z/${data.event.date.replace(/[-:]/g, "").split(".")[0]}Z`} target="_blank" rel="noopener noreferrer" className="save-date-btn" style={{ textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>Save the Date
            </a>
          </div>

          <div className={`swipe-up-indicator reveal reveal-fade ${isInvitationOpen ? "visible" : ""}`} style={{ transitionDelay: "1.2s" }}><span className="swipe-up-text">Swipe Up</span><svg className="swipe-up-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 15l-6-6-6 6" /></svg></div>
        </header>

        <section className="quote-section" style={data.media.quote?.background ? { backgroundImage: `url(${data.media.quote.background})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" } : {}}>
          {data.media.quote?.background && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1 }} />}
          <img src={data.media.logo} alt="Logo" className="quote-flower reveal reveal-fade" style={{ objectFit: "contain", height: "auto", position: "relative", zIndex: 2 }} />
          <blockquote className="reveal reveal-up delay-1" style={{ position: "relative", zIndex: 2 }}>
            <p className="quote-text">{data.media.quote?.text || "Dan diantara tanda-tanda kekuasaanNya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri..."}</p>
            <footer className="quote-ref">{data.media.quote?.ref || "QS. Ar-Rum : 21"}</footer>
          </blockquote>
        </section>

        <section className="intro-section" style={{ padding: 0 }}>
          <article className="event-card reveal reveal-up delay-2" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", margin: "40px 24px", textAlign: "center" }}>
            <p className="reveal reveal-up" style={{ color: "var(--gold)", fontSize: 22, fontFamily: "var(--font-heading)" }}>{data.media.greetingText || "Assalamu'alaikum Wr. Wb."}</p>
            <div className="ornament-center reveal reveal-fade" style={{ margin: "10px 0" }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5Z" fill="#B8923A" opacity="0.8" /></svg></div>
            <p className="intro-lead reveal reveal-up delay-1" style={{ marginBottom: 0 }}>{data.media.introText || "Dengan memohon Rahmat dan Ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan kami"}</p>
          </article>

          <div className="v4-card reveal reveal-scale">
            <div className="v4-photo" style={{ backgroundImage: `url(${data.couple.bride.photo})`, backgroundSize: "cover", backgroundPosition: "center", height: "100%" }}><div className="v4-photo-fade" style={{ height: "100%", background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%)" }} /></div>
            <div className="v4-content">
              <p className="v4-role">The Bride</p>
              <h2 className="v4-name">{data.couple.bride.fullName}</h2>
              <div className="v4-sub-row"><div className="v4-sub-bar" /><div className="v4-sub-text"><p className="v4-sub-label">{data.couple.bride.label || "Putri Pertama Dari"}</p><p className="v4-sub-parents">{data.couple.bride.parents.father}<br />&amp; {data.couple.bride.parents.mother}</p></div></div>
              <a href={data.couple.bride.instagram.url} target="_blank" className="v4-ig"><svg viewBox="0 0 24 24" style={{ width: 14, height: 14, marginRight: 6, fill: "currentColor" }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>{data.couple.bride.instagram.username}</a>
            </div>
          </div>

          <div className="v4-card reveal reveal-scale delay-1">
            <div className="v4-photo" style={{ backgroundImage: `url(${data.couple.groom.photo})`, backgroundSize: "cover", backgroundPosition: "center", height: "100%" }}><div className="v4-photo-fade" style={{ height: "100%", background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%)" }} /></div>
            <div className="v4-content">
              <p className="v4-role">The Groom</p>
              <h2 className="v4-name">{data.couple.groom.fullName}</h2>
              <div className="v4-sub-row"><div className="v4-sub-bar" /><div className="v4-sub-text"><p className="v4-sub-label">{data.couple.groom.label || "Putra Pertama Dari"}</p><p className="v4-sub-parents">{data.couple.groom.parents.father}<br />&amp; {data.couple.groom.parents.mother}</p></div></div>
              <a href={data.couple.groom.instagram.url} target="_blank" className="v4-ig"><svg viewBox="0 0 24 24" style={{ width: 14, height: 14, marginRight: 6, fill: "currentColor" }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>{data.couple.groom.instagram.username}</a>
            </div>
          </div>
        </section>

        <section className="story-section">
          <div className="section-heading reveal reveal-up"><span className="section-label">Perjalanan Cinta</span><h2 className="section-title">Our Love Story</h2></div>
          <div className="simple-story-container">
            {data.media.story.map((item, idx) => (<StoryItem key={idx} src={item.src} alt="Story" subtitle={item.subtitle} />))}
          </div>
        </section>

        <section className="event-section">
          <div className="section-heading reveal reveal-up"><span className="section-label">Waktu & Tempat</span><h2 className="section-title">Time & Place</h2></div>
          <article className="event-card reveal reveal-up delay-1">
            <h3 className="event-name">Akad Nikah</h3>
            <div className="event-details"><p className="event-day">{data.event.day}</p><p className="event-date-number reveal">{data.event.displayDate.split(" ")[0]}</p><p className="event-month">{data.event.displayDate.split(" ").slice(1).join(" ")}</p><p className="event-time">{data.event.akad.time}</p><p className="event-location-name">{data.event.locationName}</p><p className="event-location-city">{data.event.locationCity}</p></div>
            <a href={data.event.mapsUrl} target="_blank" className="event-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 6 }}><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" /></svg>Lihat Lokasi</a>
          </article>
          <article className="event-card reveal reveal-up delay-2">
            <h3 className="event-name">Resepsi</h3>
            <div className="event-details"><p className="event-day">{data.event.day}</p><p className="event-date-number reveal">{data.event.displayDate.split(" ")[0]}</p><p className="event-month">{data.event.displayDate.split(" ").slice(1).join(" ")}</p><p className="event-time">{data.event.resepsi.time}</p><p className="event-location-name">{data.event.locationName}</p><p className="event-location-city">{data.event.locationCity}</p></div>
            <a href={data.event.mapsUrl} target="_blank" className="event-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 6 }}><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" /></svg>Lihat Lokasi</a>
          </article>
        </section>

        <section className="livestream-section">
          <div className="section-heading reveal reveal-up"><span className="section-label">Saksikan Bersama</span><h2 className="section-title">Live Streaming</h2></div>
          <article className="event-card reveal reveal-up delay-2">
            <div className="live-badge"><span className="live-dot" />Live</div>
            <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.9, marginBottom: "1.5rem" }}>Saksikan pernikahan kami secara virtual yang disiarkan langsung melalui media sosial kami.</p>
            <div style={{ fontFamily: "var(--font-sub)", fontSize: 12, letterSpacing: "0.1em", color: "var(--gold-pale)", marginBottom: "1.5rem", lineHeight: 2 }}>{data.event.day}, {data.event.displayDate}<br />Pukul {data.event.livestream.time}</div>
            <a href={data.event.livestream.url} target="_blank" className="event-btn" style={{ display: "inline-flex" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 6 }}><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Tonton di Sini</a>
          </article>
        </section>

        <section className="gallery-section">
          <div className="section-heading reveal reveal-up"><span className="section-label">Kenangan</span><h2 className="section-title">Photo Gallery</h2></div>
          <div className="gallery-wrap">
            <div className="gallery-video-wrap reveal reveal-scale"><video src={data.media.galleryVideo} className="gallery-video" autoPlay muted loop playsInline preload="metadata" /></div>
            <div className="gallery-grid">
              {data.media.gallery.map((img, idx) => (
                <button key={idx} className={`gallery-thumb reveal reveal-fade ${img.isLandscape ? "landscape" : ""}`} onClick={() => setLightboxImage(img.src)}>
                  <Image
                    src={img.src}
                    alt="Gallery"
                    fill
                    unoptimized
                    sizes={img.isLandscape ? "(max-width: 430px) 66vw, 300px" : "(max-width: 430px) 33vw, 140px"}
                    className="gallery-img"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="gift-section">
          <div className="section-heading reveal"><span className="section-label">Hadiah Pernikahan</span><h2 className="section-title">Wedding Gift</h2></div>
          <p className="gift-note reveal">Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Jika ingin memberikan hadiah, Anda dapat mengirimkan secara cashless.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 400, margin: "2rem auto 0" }}>
            {data.payment.map((p, idx) => (
              <PaymentCard
                key={idx}
                bank={p.bank}
                holderName={p.holderName}
                logoUrl={p.images?.logo}
                isQris={p.isQris}
                qrisImage={p.images?.qrisImage}
                chipImage={p.images?.chipImage}
                isAddress={p.isAddress}
                address={p.address}
                accountNumber={p.accountNumber}
                paymentLogoLeft={p.images?.logoLeft}
              />
            ))}
          </div>
        </section>

        <section className="rsvp-section">
          <div className="wishes-bg"><svg width="100%" height="100%" viewBox="0 0 430 600" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#EDD9A3" strokeWidth="0.5"><path d="M0,300 Q215,100 430,300 Q215,500 0,300Z" opacity="0.3" /><circle cx="215" cy="300" r="180" opacity="0.2" /><circle cx="215" cy="300" r="220" opacity="0.1" /></g></svg></div>
          <div className="wishes-inner">
            <div className="wishes-heading reveal reveal-up"><h2 className="wishes-title">RSVP</h2><p className="wishes-subtitle">Konfirmasi Kehadiran</p></div>
            <div className="rsvp-stats reveal reveal-up delay-1"><div className="rsvp-stat rsvp-hadir"><span className="rsvp-number">{rsvpStats.hadir}</span><span className="rsvp-label">Hadir</span></div><div className="rsvp-stat rsvp-tidak"><span className="rsvp-number">{rsvpStats.tidakHadir}</span><span className="rsvp-label">Tidak Hadir</span></div></div>
            <form className="wishes-form reveal reveal-up delay-2" onSubmit={handleRSVPSubmit}>
              <input type="text" placeholder="Nama Anda" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} />
              <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value)}><option value="" disabled>— Konfirmasi Kehadiran —</option><option value="Hadir">Hadir</option><option value="Tidak Hadir">Tidak Hadir</option></select>
              <button type="submit" className="btn-gold" disabled={isSubmittingRSVP}>{isSubmittingRSVP ? "Mengirim..." : "Konfirmasi"}</button>
            </form>
          </div>
        </section>

        <section className="wishes-section">
          <div className="wishes-inner">
            <div className="wishes-heading reveal reveal-up"><h2 className="wishes-title">Wishes</h2><p className="wishes-subtitle">Berikan ucapan & doa untuk kedua mempelai</p></div>
            <form className="wishes-form reveal reveal-up delay-1" onSubmit={handleWishesSubmit}>
              <input type="text" placeholder="Nama Anda" value={wishName} onChange={(e) => setWishName(e.target.value)} />
              <textarea rows={3} placeholder="Tuliskan ucapan & doa Anda…" value={wishText} onChange={(e) => setWishText(e.target.value)} />
              <button type="submit" className="btn-gold" disabled={isSubmittingWishes}>{isSubmittingWishes ? "Mengirim..." : "Kirim Ucapan"}</button>
            </form>
            <div className="comment-list reveal reveal-up delay-2">
              <p style={{ fontFamily: "var(--font-sub)", fontSize: 10, letterSpacing: "0.2em", color: "rgba(0,0,0,0.4)", marginBottom: "1rem" }}>{wishes.length} Ucapan</p>
              {currentWishes.map((item, idx) => (
                <div key={idx} className="comment-item"><p className="comment-name">{item.name}</p><p className="comment-text">{item.message}</p></div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="comment-pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: "2rem", fontFamily: "var(--font-sub)", fontSize: 11, letterSpacing: "0.15em", color: "rgba(0,0,0,0.4)" }}>
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(v => Math.max(1, v - 1))} style={{ background: "none", border: "none", color: currentPage === 1 ? "#ddd" : "inherit", cursor: currentPage === 1 ? "default" : "pointer" }}>← Prev</button>
                {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => setCurrentPage(i + 1)} style={{ background: "none", border: "none", color: currentPage === i + 1 ? "var(--burgundy)" : "inherit", fontWeight: currentPage === i + 1 ? "bold" : "normal", cursor: "pointer", minWidth: 24 }}>{i + 1}</button>))}
                <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(v => Math.min(totalPages, v + 1))} style={{ background: "none", border: "none", color: currentPage === totalPages ? "#ddd" : "inherit", cursor: currentPage === totalPages ? "default" : "pointer" }}>Next →</button>
              </div>
            )}
          </div>
        </section>

        <footer className="footer-section">
          <div><img src={data.media.logo} alt="Logo" className="reveal reveal-fade" style={{ height: "80px", width: "auto", margin: "0 auto", display: "block", objectFit: "contain" }} /><span className="gold-line" style={{ margin: "2rem auto" }} /><p className="footer-note reveal reveal-up delay-1">Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p></div>
          <div><p className="footer-byline reveal reveal-up delay-2">Kami yang berbahagia,</p><h2 className="footer-names reveal reveal-up delay-3" style={{ marginBottom: 0 }}>{data.couple.bride.shortName} &amp; {data.couple.groom.shortName}</h2></div>
          <div className="nimantra-credit">
            <img src="/Nimantra S - White.png" alt="Nimantra Monogram" className="reveal reveal-fade" style={{ height: "32px", width: "auto", margin: "0 auto 16px", display: "block", objectFit: "contain", opacity: 0.8 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
              <p className="credit-title" style={{ marginBottom: 0 }}>Invitation by</p>
              <img src="/Nimantra L - White.png" alt="Nimantra Logo" className="reveal reveal-fade" style={{ height: "18px", width: "auto", objectFit: "contain", opacity: 0.8 }} />
            </div>
            <div className="credit-socials">
              <a href="https://wa.me/6285169770397" target="_blank" rel="noopener noreferrer" className="social-item" style={{ textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.129 1.417 4.77 1.418 5.397 0 9.786-4.39 9.788-9.789 0-2.612-1.017-5.068-2.863-6.914-1.846-1.846-4.302-2.862-6.913-2.862-5.397 0-9.786 4.39-9.788 9.789 0 1.834.512 3.532 1.482 5.034l-.986 3.601 3.69-.968zm12.338-7.399c-.3-.15-1.772-.874-2.046-.974-.274-.1-.474-.15-.674.15-.2.3-.774.974-.949 1.174-.175.2-.35.225-.65.075-.3-.15-1.266-.467-2.411-1.489-.892-.796-1.492-1.779-1.667-2.079-.175-.3-.019-.462.13-.611.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.674-1.624-.924-2.224-.244-.584-.491-.505-.674-.514-.175-.008-.375-.01-.575-.01s-.525.075-.8.375c-.275.3-1.05 1.024-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.532.716.31 1.275.495 1.71.635.719.227 1.373.195 1.89.117.577-.087 1.772-.724 2.022-1.424.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
                </svg>
                <span>+62 851-6977-0397</span>
              </a>
              <a href="https://instagram.com/nimantra.id" target="_blank" rel="noopener noreferrer" className="social-item" style={{ textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>nimantra.id</span>
              </a>
            </div>
            <p className="credit-copy">© 2026 Nimantra, All rights reserved.</p>
          </div>
        </footer>
      </main>

      <audio ref={audioRef} src={audioSrc} autoPlay playsInline preload="auto" />
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}</AnimatePresence>
      {isInvitationOpen && (
        <button className={`music-fab${isPlaying ? " playing" : ""}`} onClick={() => setIsPlaying(!isPlaying)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EDD9A3" strokeWidth="1.5"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
        </button>
      )}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-img-wrap" onClick={e => e.stopPropagation()}><Image src={lightboxImage} alt="Full" fill className="lightbox-img" sizes="100vw" priority /></div>
        </div>
      )}
    </>
  );
}
