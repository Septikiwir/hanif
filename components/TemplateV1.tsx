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
      name: string;
      fullName: string;
      parents: { father: string; mother: string };
    };
    groom: {
      name: string;
      fullName: string;
      parents: { father: string; mother: string };
    };
  };
  event: {
    date: string; // ISO string for countdown
    displayDate: string;
    day: string;
    time: string;
    locationName: string;
    locationCity: string;
    address: string;
    googleMapsEmbedUrl: string;
    calendarUrl: string;
  };
  media: {
    logo: string;
    audio: string;
    heroVideo: string;
    galleryVideo: string;
    openingPoster: string;
    heroPoster: string;
    galleryPoster: string;
    gallery: { src: string; isLandscape: boolean }[];
    story: { src: string; subtitle: string }[];
    payment: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      qrisImage: string;
      chipImage: string;
      bankLogo: string;
      sideLogo: string;
    }[];
  };
  branding: {
    nimantraLogo?: string;
  };
  config?: {
    supabaseWishesTable?: string;
    supabaseRsvpTable?: string;
  };
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

// --- SUB-COMPONENTS ----------------------------------------------------------

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

function PaymentCard({
  bankName,
  accountNumber,
  accountHolder,
  isQris = false,
  isAddress = false,
  address = "",
  images
}: {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isQris?: boolean;
  isAddress?: boolean;
  address?: string;
  images: {
    qrisImage: string;
    chipImage: string;
    bankLogo: string;
    sideLogo: string;
  }
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = isAddress ? address : accountNumber;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CopyButton = ({ value }: { value: string }) => (
    <button
      onClick={handleCopy}
      style={{
        background: "rgba(255,255,255,0.2)",
        border: "1px solid rgba(255,255,255,0.3)",
        color: "#fff",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "10px",
        cursor: "pointer",
        marginLeft: "auto",
        backdropFilter: "blur(4px)",
      }}
    >
      {copied ? "Berhasil!" : "Salin Alamat"}
    </button>
  );

  const DownloadButton = ({ imageUrl }: { imageUrl: string }) => {
    const handleDownload = () => {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "QRIS-Fizah-Hanif.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <button
        onClick={handleDownload}
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "10px",
          cursor: "pointer",
          marginLeft: "auto",
          backdropFilter: "blur(4px)",
        }}
      >
        Download QRIS
      </button>
    );
  };

  return (
    <div
      className="v4-card reveal reveal-scale"
      style={{
        background: isAddress ? "linear-gradient(135deg, #55756c 0%, #3d5a52 100%)" : "linear-gradient(135deg, #1a1a1a 0%, #333 100%)",
        color: "#fff",
        padding: "24px",
        borderRadius: "20px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        maxWidth: "340px",
        margin: "0 auto 20px",
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {!isAddress && (
            <img
              src={images.sideLogo}
              alt="Logo Left"
              style={{ height: "35px", width: "auto", objectFit: "contain" }}
            />
          )}
          {isAddress && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "1px" }}>KIRIM KADO</span>
            </div>
          )}
        </div>
        {!isAddress && (
          <img
            src={images.bankLogo}
            alt="Bank Logo"
            style={{ height: "40px", width: "auto", objectFit: "contain" }}
          />
        )}
      </div>

      <div style={{ zIndex: 2, margin: "20px 0" }}>
        {isAddress ? (
          <p
            style={{
              fontSize: "12px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.8)",
              margin: 0,
              fontFamily: "var(--font-body)",
            }}
          >
            {address}
          </p>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                position: "relative",
                overflow: "hidden",
                border: "1px solid #eee",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              <img
                src={images.chipImage}
                alt="Chip"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "4px",
                }}
              >
                Nomor Rekening
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    fontFamily: "monospace",
                  }}
                >
                  {accountNumber}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Salin No. Rekening"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                  </svg>
                </button>
              </div>
              {copied && <span style={{ fontSize: "10px", color: "#4ade80", marginTop: "2px" }}>Berhasil disalin!</span>}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {accountHolder}
        </span>
        {!isQris && !isAddress && <DownloadButton imageUrl={images.qrisImage} />}
        {isAddress && address && <CopyButton value={address} />}
      </div>
    </div>
  );
}

// --- MAIN TEMPLATE COMPONENT -------------------------------------------------

export default function TemplateV1({ data }: { data: InvitationData }) {
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isOpeningReady, setIsOpeningReady] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>({
    days: "00",
    hours: "00",
    mins: "00",
    secs: "00",
    done: false,
  });

  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [tokenValue, setTokenValue] = useState("");

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [rsvpStats, setRsvpStats] = useState({ hadir: 0, tidakHadir: 0 });
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("");

  const [isSubmittingWish, setIsSubmittingWish] = useState(false);
  const [wishName, setWishName] = useState("");
  const [wishMessage, setWishMessage] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const qrCardRef = useRef<HTMLDivElement>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);

  const audioSrc = useMemo(() => encodeURI(data.media.audio), [data.media.audio]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const fetchWishes = async () => {
    const table = data.config?.supabaseWishesTable || "wishes";
    const { data: list, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && list) setWishes(list);
  };

  const fetchRSVPStats = async () => {
    const table = data.config?.supabaseRsvpTable || "rsvp";
    const { data: list, error } = await supabase.from(table).select("attendance");
    if (!error && list) {
      const hadir = list.filter((r) => r.attendance === "Hadir").length;
      const tidakHadir = list.filter((r) => r.attendance === "Tidak Hadir").length;
      setRsvpStats({ hadir, tidakHadir });
    }
  };

  useEffect(() => {
    const initData = async () => {
      await Promise.all([fetchWishes(), fetchRSVPStats()]);
    };
    void initData();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const to = searchParams.get("to");
    const token = searchParams.get("token");
    if (to) {
      setGuestName(to);
      if (!rsvpName) setRsvpName(to);
      if (!wishName) setWishName(to);
    }
    if (token) setTokenValue(token);
  }, [rsvpName, wishName]);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpeningReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const targetDate = new Date(data.event.date).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setCountdown({ days: "00", hours: "00", mins: "00", secs: "00", done: true });
        clearInterval(interval);
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({
        days: d.toString().padStart(2, "0"),
        hours: h.toString().padStart(2, "0"),
        mins: m.toString().padStart(2, "0"),
        secs: s.toString().padStart(2, "0"),
        done: false,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data.event.date]);

  useEffect(() => {
    if (isInvitationOpen) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.1 }
      );
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [isInvitationOpen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch((err) => console.log("Audio play error:", err));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (video && isInvitationOpen) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => console.log("Auto-play was prevented:", error));
      }
    }
  }, [isInvitationOpen]);

  const downloadQrImage = useCallback(async () => {
    if (!qrCardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toJpeg(qrCardRef.current, { quality: 0.95, backgroundColor: "#fff" });
      const link = document.createElement("a");
      link.download = `QR-Checkin-${data.couple.bride.name}-${data.couple.groom.name}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export QR card:", err);
    } finally {
      setIsExporting(false);
    }
  }, [data.couple.bride.name, data.couple.groom.name]);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName || !rsvpStatus) return showToast("Mohon isi nama dan status kehadiran.", "error");
    setIsSubmittingRSVP(true);
    const table = data.config?.supabaseRsvpTable || "rsvp";
    const { error } = await supabase.from(table).insert([{ name: rsvpName, attendance: rsvpStatus }]);
    setIsSubmittingRSVP(false);
    if (error) {
      showToast("Gagal mengirim RSVP.", "error");
    } else {
      setRsvpName("");
      setRsvpStatus("");
      fetchRSVPStats();
      showToast("RSVP berhasil dikirim!", "success");
    }
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName || !wishMessage) return showToast("Mohon isi nama dan pesan.", "error");
    setIsSubmittingWish(true);
    const table = data.config?.supabaseWishesTable || "wishes";
    const { error } = await supabase.from(table).insert([{ name: wishName, message: wishMessage }]);
    setIsSubmittingWish(false);
    if (error) {
      showToast("Gagal mengirim ucapan.", "error");
    } else {
      setWishName("");
      setWishMessage("");
      fetchWishes();
      showToast("Ucapan berhasil dikirim!", "success");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const wishesPerPage = 5;
  const totalPages = Math.ceil(wishes.length / wishesPerPage);
  const currentWishes = wishes.slice((currentPage - 1) * wishesPerPage, currentPage * wishesPerPage);

  return (
    <div className="invitation-root">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <section className={`opening-screen ${isInvitationOpen ? "closed" : ""}`}>
        <div className="screen">
          <div className="bg-photo" style={{ backgroundImage: `url("${data.media.openingPoster}?v=2")` }} />
          <div className="overlay" />

          <svg className="ornament ornament-tl" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path d="M4 4 L4 28 M4 4 L28 4" stroke="white" strokeWidth="1" />
            <path d="M4 4 L18 18" stroke="white" strokeWidth="0.5" />
            <circle cx="4" cy="4" r="2" fill="white" />
            <circle cx="28" cy="4" r="1.2" fill="white" />
            <circle cx="4" cy="28" r="1.2" fill="white" />
          </svg>
          <svg className="ornament ornament-tr" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path d="M60 4 L60 28 M60 4 L36 4" stroke="white" strokeWidth="1" />
            <path d="M60 4 L46 18" stroke="white" strokeWidth="0.5" />
            <circle cx="60" cy="4" r="2" fill="white" />
            <circle cx="36" cy="4" r="1.2" fill="white" />
            <circle cx="60" cy="28" r="1.2" fill="white" />
          </svg>
          <svg className="ornament ornament-bl" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path d="M4 60 L4 36 M4 60 L28 60" stroke="white" strokeWidth="1" />
            <path d="M4 60 L18 46" stroke="white" strokeWidth="0.5" />
            <circle cx="4" cy="60" r="2" fill="white" />
            <circle cx="28" cy="60" r="1.2" fill="white" />
            <circle cx="4" cy="36" r="1.2" fill="white" />
          </svg>
          <svg className="ornament ornament-br" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path d="M60 60 L60 36 M60 60 L36 60" stroke="white" strokeWidth="1" />
            <path d="M60 60 L46 46" stroke="white" strokeWidth="0.5" />
            <circle cx="60" cy="60" r="2" fill="white" />
            <circle cx="36" cy="60" r="1.2" fill="white" />
            <circle cx="60" cy="36" r="1.2" fill="white" />
          </svg>

          <div
            className={`reveal reveal-fade ${isOpeningReady ? "visible" : ""}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "60px 20px",
              display: "flex",
              justifyContent: "center",
              zIndex: 10,
              transitionDelay: "0.2s",
            }}
          >
            <img
              src={`${data.media.logo}?v=2`}
              alt="Logo"
              style={{ height: "64px", width: "auto", objectFit: "contain" }}
            />
          </div>

          <div className="content">
            <p className={`wedding-of reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "0.4s" }}>
              The Wedding Of
            </p>
            <h1 className={`names reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "0.6s" }}>
              {data.couple.bride.name} <span className="ampersand">&amp;</span> {data.couple.groom.name}
            </h1>
            <div className={`divider reveal reveal-fade ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "0.8s" }} />
            <p className={`kepada reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "1s" }}>
              Kepada Yth.
              <br />
              Bapak / Ibu / Saudara/i
            </p>
            <p className={`tamu reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "1.2s" }}>
              {guestName}
            </p>
            <p className={`note reveal reveal-fade ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "1.4s" }}>
              *Mohon maaf jika ada kesalahan dalam penulisan nama / gelar.
            </p>
            <div className={`reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "1.6s" }}>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  window.scrollTo(0, 0);
                  setIsInvitationOpen(true);
                  setIsPlaying(true);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                  <path d="M21.2 8.4l-8.1 5.1c-.6.4-1.5.4-2.1 0L3 8.4" />
                  <path d="M21 15V6a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2z" />
                </svg>
                Buka Undangan
              </button>
            </div>
          </div>
        </div>
      </section>

      <main>
        <div className="fixed-bg-video">
          <video
            className="hero-video"
            src={data.media.heroVideo}
            ref={heroVideoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster={data.media.heroPoster}
            aria-hidden="true"
          />
          <div className="fixed-overlay" />
        </div>

        <header className="hero">
          <div className="content">
            <div className="reveal reveal-fade delay-1">
              <img
                src={`${data.media.logo}?v=2`}
                alt="Logo"
                style={{ height: "64px", width: "auto", marginBottom: "1.5rem", objectFit: "contain" }}
              />
            </div>
            <p className="wedding-of reveal reveal-up delay-2">The Wedding Of</p>
            <h1 className="names reveal reveal-up delay-3">
              {data.couple.bride.name} <span className="amp">&amp;</span> {data.couple.groom.name}
            </h1>
            <h2 className="date reveal reveal-up delay-4">{data.event.day} · {data.event.displayDate}</h2>
          </div>

          <div className="countdown-bar reveal reveal-up delay-5" aria-label="Hitung mundur">
            <div className="count-group">
              <span className="count-number">{countdown.days}</span>
              <span className="count-label">Hari</span>
            </div>
            <span className="count-sep">·</span>
            <div className="count-group">
              <span className="count-number">{countdown.hours}</span>
              <span className="count-label">Jam</span>
            </div>
            <span className="count-sep">·</span>
            <div className="count-group">
              <span className="count-number">{countdown.mins}</span>
              <span className="count-label">Menit</span>
            </div>
            <span className="count-sep">·</span>
            <div className="count-group">
              <span className="count-number">{countdown.secs}</span>
              <span className="count-label">Detik</span>
            </div>
          </div>

          <div className="reveal reveal-up delay-5" style={{ position: "absolute", bottom: "86px", left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 30 }}>
            <a
              href={data.event.calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="save-date-btn"
              style={{ textDecoration: "none" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Save the Date
            </a>
          </div>

          <div className="swipe-up-indicator reveal reveal-fade" style={{ transitionDelay: "1.2s" }}>
            <span className="swipe-up-text">Swipe Up</span>
            <svg
              className="swipe-up-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </div>
        </header>

        <section className="quote-section" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${data.media.openingPoster}?v=2')` }}>
          <img
            src={`${data.media.logo}?v=2`}
            alt="Logo"
            className="quote-flower reveal reveal-fade"
            style={{ objectFit: "contain", height: "auto" }}
          />

          <blockquote className="reveal reveal-up delay-1">
            <p className="quote-text">
              Dan diantara tanda-tanda kekuasaanNya ialah Dia menciptakan
              untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu
              cenderung dan merasa tenteram kepadanya, dan dijadikanNya
              diantaramu rasa kasih dan sayang.
            </p>
            <footer className="quote-ref">QS. Ar-Rum : 21</footer>
          </blockquote>
        </section>

        <section className="couple-section">
          <header className="section-header reveal reveal-up">
            <h2 className="section-title">Mempelai</h2>
            <p className="section-subtitle">The Happy Couple</p>
          </header>

          <article className="couple-card reveal reveal-up">
            <div className="v4-card reveal reveal-scale">
              <div className="v4-photo" style={{ height: "100%", backgroundImage: `url(${data.media.gallery[0]?.src})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="v4-photo-fade" style={{ height: "40%" }}></div>
              </div>
              <div className="v4-content">
                <h3 className="v4-name">{data.couple.bride.fullName}</h3>
                <p className="v4-desc">
                  Putri dari Pasangan <br />
                  {data.couple.bride.parents.father} &amp; {data.couple.bride.parents.mother}
                </p>
                <div className="v4-social">
                  <a href="#" className="v4-social-link">Instagram</a>
                </div>
              </div>
            </div>
          </article>

          <div className="names-divider reveal reveal-fade">&amp;</div>

          <article className="couple-card reveal reveal-up">
            <div className="v4-card reveal reveal-scale">
              <div className="v4-photo" style={{ height: "100%", backgroundImage: `url(${data.media.gallery[1]?.src})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="v4-photo-fade" style={{ height: "40%" }}></div>
              </div>
              <div className="v4-content">
                <h3 className="v4-name">{data.couple.groom.fullName}</h3>
                <p className="v4-desc">
                  Putra dari Pasangan <br />
                  {data.couple.groom.parents.father} &amp; {data.couple.groom.parents.mother}
                </p>
                <div className="v4-social">
                  <a href="#" className="v4-social-link">Instagram</a>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="story-section">
          <header className="section-header reveal reveal-up">
            <h2 className="section-title">Cerita Kami</h2>
            <p className="section-subtitle">Our Love Journey</p>
          </header>

          <div className="simple-story-container">
            {data.media.story.map((item, idx) => (
              <StoryItem key={idx} src={item.src} alt={`Story ${idx + 1}`} subtitle={item.subtitle} />
            ))}
          </div>
        </section>

        <section className="event-section">
          <div className="event-background" />
          <header className="section-header reveal reveal-up">
            <h2 className="section-title">Waktu &amp; Tempat</h2>
            <p className="section-subtitle">Save The Date</p>
          </header>

          <div className="event-cards-container">
            <article className="event-card reveal reveal-scale">
              <div className="event-tag">Resepsi &amp; Akad</div>
              <h3 className="event-day">{data.event.day}</h3>
              <p className="event-date">{data.event.displayDate}</p>
              <div className="event-divider" />
              <div className="event-detail">
                <span className="event-time">Pukul {data.event.time}</span>
                <p className="event-location-name">{data.event.locationName}</p>
                <p className="event-location-city">{data.event.locationCity}</p>
              </div>
              <div className="event-address">{data.event.address}</div>
              <a
                href={data.event.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="event-btn"
              >
                Simpan Tanggal
              </a>
            </article>
          </div>

          <div className="map-container reveal reveal-up">
            <iframe
              src={data.event.googleMapsEmbedUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            />
          </div>
        </section>

        <section className="gallery-section">
          <header className="section-header reveal reveal-up">
            <h2 className="section-title">Galeri Foto</h2>
            <p className="section-subtitle">Captured Moments</p>
          </header>

          <div className="gallery-wrap">
            <div className="gallery-video-wrap reveal reveal-scale">
              <video
                src={data.media.galleryVideo}
                className="gallery-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={data.media.galleryPoster}
              />
            </div>

            <div className="gallery-grid">
              {data.media.gallery.map((img, idx) => (
                <div
                  key={idx}
                  className={`gallery-item reveal reveal-scale ${img.isLandscape ? "landscape" : ""}`}
                >
                  <Image
                    src={img.src}
                    alt={`Gallery photo ${idx + 1}`}
                    fill
                    sizes={img.isLandscape ? "(max-width: 430px) 66vw, 300px" : "(max-width: 430px) 33vw, 140px"}
                    className="gallery-img"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rsvp-section">
          <header className="section-header reveal reveal-up">
            <h2 className="section-title">Konfirmasi Kehadiran</h2>
            <p className="section-subtitle">RSVP</p>
          </header>

          <div className="rsvp-content">
            <div className="rsvp-stats reveal reveal-fade">
              <div className="stat-item">
                <span className="stat-num">{rsvpStats.hadir}</span>
                <span className="stat-label">Hadir</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{rsvpStats.tidakHadir}</span>
                <span className="stat-label">Berhalangan</span>
              </div>
            </div>

            <form className="rsvp-form reveal reveal-up" onSubmit={handleRSVPSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  className="form-input"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <select
                  className="form-input"
                  value={rsvpStatus}
                  onChange={(e) => setRsvpStatus(e.target.value)}
                >
                  <option value="">Konfirmasi Kehadiran</option>
                  <option value="Hadir">Saya Akan Hadir</option>
                  <option value="Tidak Hadir">Mohon Maaf, Saya Berhalangan</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-rsvp"
                disabled={isSubmittingRSVP}
              >
                {isSubmittingRSVP ? "Mengirim..." : "Kirim Konfirmasi"}
              </button>
            </form>
          </div>
        </section>

        <section className="gift-section">
          <header className="section-header reveal reveal-up">
            <h2 className="section-title">Kado Digital</h2>
            <p className="section-subtitle">Wedding Gift</p>
          </header>

          <div className="gift-content">
            <p className="gift-note reveal reveal-fade">
              Doa restu Anda merupakan karunia terindah bagi kami. Namun jika ingin memberikan tanda kasih, Anda dapat mengirimkannya melalui:
            </p>

            <div className="payment-cards">
              {data.media.payment.map((p, idx) => (
                <PaymentCard
                  key={idx}
                  bankName={p.bankName}
                  accountNumber={p.accountNumber}
                  accountHolder={p.accountHolder}
                  images={{
                    qrisImage: p.qrisImage,
                    chipImage: p.chipImage,
                    bankLogo: p.bankLogo,
                    sideLogo: p.sideLogo,
                  }}
                />
              ))}
              <PaymentCard
                bankName="Alamat Pengiriman"
                accountNumber="Jl. Jend. Sudirman No. 1, Tengah, Kec. Delta Pawan, Kabupaten Ketapang"
                accountHolder={data.couple.bride.name}
                isAddress={true}
                address={data.event.address}
                images={{
                  qrisImage: "",
                  chipImage: "",
                  bankLogo: "",
                  sideLogo: "",
                }}
              />
            </div>
          </div>
        </section>

        <section className="wishes-section">
          <header className="section-header reveal reveal-up">
            <h2 className="section-title">Doa &amp; Ucapan</h2>
            <p className="section-subtitle">Best Wishes</p>
          </header>

          <div className="wishes-content">
            <form className="wishes-form reveal reveal-up" onSubmit={handleWishSubmit}>
              <input
                type="text"
                placeholder="Nama Anda"
                className="form-input"
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
              />
              <textarea
                placeholder="Tuliskan ucapan & doa..."
                className="form-input"
                rows={4}
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
              ></textarea>
              <button
                type="submit"
                className="btn btn-wish"
                disabled={isSubmittingWish}
              >
                {isSubmittingWish ? "Mengirim..." : "Kirim Ucapan"}
              </button>
            </form>

            <div className="wishes-list">
              {currentWishes.map((wish) => (
                <div key={wish.id} className="wish-item reveal reveal-fade">
                  <h4 className="wish-author">{wish.name}</h4>
                  <p className="wish-text">{wish.message}</p>
                  <span className="wish-date">{new Date(wish.created_at).toLocaleDateString("id-ID")}</span>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((v) => Math.max(1, v - 1))}
                    style={{
                      background: "none",
                      border: "none",
                      color: currentPage === 1 ? "#ddd" : "inherit",
                      cursor: currentPage === 1 ? "default" : "pointer",
                    }}
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          background: "none",
                          border: "none",
                          color: currentPage === pageNum ? "var(--burgundy)" : "inherit",
                          fontWeight: currentPage === pageNum ? "bold" : "normal",
                          cursor: "pointer",
                          minWidth: "24px",
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((v) => Math.min(totalPages, v + 1))}
                    style={{
                      background: "none",
                      border: "none",
                      color: currentPage === totalPages ? "#ddd" : "inherit",
                      cursor: currentPage === totalPages ? "default" : "pointer",
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="footer-section">
          <div>
            <img
              src={`${data.media.logo}?v=2`}
              alt="Logo"
              className="reveal reveal-fade"
              style={{ height: "80px", width: "auto", margin: "0 auto", display: "block", objectFit: "contain" }}
            />
            <span className="gold-line" style={{ margin: "2rem auto" }} />
            <p className="footer-note reveal reveal-up delay-1">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
              Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
            </p>
          </div>

          <div>
            <p className="footer-byline reveal reveal-up delay-2">Kami yang berbahagia,</p>
            <h2 className="footer-names reveal reveal-up delay-3" style={{ marginBottom: 0 }}>
              {data.couple.bride.name} &amp; {data.couple.groom.name}
            </h2>
          </div>

          <div className="nimantra-credit">
            <p className="credit-title">Invitation by Nimantra</p>

            <div className="credit-socials">
              <div className="social-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.129 1.417 4.77 1.418 5.397 0 9.786-4.39 9.788-9.789 0-2.612-1.017-5.068-2.863-6.914-1.846-1.846-4.302-2.862-6.913-2.862-5.397 0-9.786 4.39-9.788 9.789 0 1.834.512 3.532 1.482 5.034l-.986 3.601 3.69-.968zm12.338-7.399c-.3-.15-1.772-.874-2.046-.974-.274-.1-.474-.15-.674.15-.2.3-.774.974-.949 1.174-.175.2-.35.225-.65.075-.3-.15-1.266-.467-2.411-1.489-.892-.796-1.492-1.779-1.667-2.079-.175-.3-.019-.462.13-.611.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.674-1.624-.924-2.224-.244-.584-.491-.505-.674-.514-.175-.008-.375-.01-.575-.01s-.525.075-.8.375c-.275.3-1.05 1.024-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.532.716.31 1.275.495 1.71.635.719.227 1.373.195 1.89.117.577-.087 1.772-.724 2.022-1.424.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
                </svg>
                <span>+62 813-1888-1635</span>
              </div>
              <div className="social-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>{data.branding.nimantraLogo || "nimantra.id"}</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <audio ref={audioRef} src={audioSrc} autoPlay playsInline preload="metadata" />

      {isInvitationOpen && (
        <button
          className="audio-toggle"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause Music" : "Play Music"}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.17l5.07 5.07L21 19.73 4.27 3zM14 7h4V3h-6v5.17l2 2V7z" />
            </svg>
          )}
        </button>
      )}

      {isInvitationOpen && (
        <button
          className="qr-toggle"
          onClick={() => setShowQrModal(true)}
          aria-label="Tampilkan QR Check-in"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <line x1="7" y1="7" x2="7" y2="7" />
            <line x1="17" y1="7" x2="17" y2="7" />
            <line x1="17" y1="17" x2="17" y2="17" />
            <line x1="7" y1="17" x2="7" y2="17" />
          </svg>
        </button>
      )}

      {showQrModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            padding: 20,
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div className="qr-modal-root" onClick={(e) => e.stopPropagation()} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className={`card ${isExporting ? "is-exporting" : ""}`} ref={qrCardRef}>
              <style>{`
                .qr-modal-root { --modal-scale: min(1, calc((100vw - 40px) / 420)); }
                .qr-modal-root * { box-sizing: border-box; }
                .qr-modal-root .card { width: 420px; max-width: 430px; background: #fff; box-shadow: 0 2px 24px rgba(0,0,0,0.13); overflow: hidden; position: relative; font-family: Georgia, 'Palatino Linotype', serif; border-radius: 0; transform: scale(var(--modal-scale)); transform-origin: top center; }
                .qr-modal-root .banner { width: 100%; height: 120px; background: #2a1e0a url('/fizah-hanif/3.jpg?v=2') center/cover no-repeat; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                .qr-modal-root .banner-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4); }
                .qr-modal-root .banner-content { position: relative; z-index: 2; text-align: center; width: 100%; padding: 0 20px; color: #ffffff; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }
                .qr-modal-root .banner-pretitle { font-family: -apple-system, 'Helvetica Neue', sans-serif; font-size: 7.5px; letter-spacing: 0.3em; color: #ffffff; text-transform: uppercase; margin-bottom: 8px; }
                .qr-modal-root .banner-names { display: flex; align-items: center; justify-content: center; gap: 10px; }
                .qr-modal-root .banner-name { font-size: 28px; font-weight: 400; color: #ffffff; letter-spacing: 0.1em; text-transform: uppercase; font-family: Georgia, serif; line-height: 1; }
                .qr-modal-root .banner-amp { font-size: 26px; color: #ffffff; font-style: italic; font-family: Georgia, serif; }
                .qr-modal-root .banner-meta { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 10px; }
                .qr-modal-root .banner-meta-item { font-family: -apple-system, sans-serif; font-size: 8px; letter-spacing: 0.18em; color: #ffffff; text-transform: uppercase; opacity: 0.9; }
                .qr-modal-root .banner-meta-dot { width: 2px; height: 2px; background: #ffffff; border-radius: 50%; opacity: 0.6; }
                .qr-modal-root .body { display: flex; align-items: stretch; }
                .qr-modal-root .info { flex: 1; padding: 18px 20px; border-right: 0.5px solid #e8e4de; }
                .qr-modal-root .info-pretitle { font-family: -apple-system, sans-serif; font-size: 9px; color: #aaa; letter-spacing: 0.05em; margin-bottom: 2px; }
                .qr-modal-root .info-couple { font-size: 17px; font-weight: 700; color: #1a1408; font-family: Georgia, serif; line-height: 1.2; margin-bottom: 8px; }
                .qr-modal-root .info-date { font-family: -apple-system, sans-serif; font-size: 10.5px; color: #555; margin-bottom: 14px; }
                .qr-modal-root .info-divider { width: 32px; height: 0.5px; background: #e8e4de; margin-bottom: 12px; }
                .qr-modal-root .info-to { font-family: -apple-system, sans-serif; font-size: 9.5px; color: #999; margin-bottom: 2px; }
                .qr-modal-root .info-guest { font-size: 13.5px; color: #1a1408; font-family: Georgia, serif; font-weight: 700; margin-bottom: 2px; margin-top: 6px; }
                .qr-modal-root .info-sub { font-family: -apple-system, sans-serif; font-size: 10px; color: #bbb; }
                .qr-modal-root .qr-side { width: 148px; flex-shrink: 0; padding: 14px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
                .qr-modal-root .qr-brand-label { font-family: -apple-system, sans-serif; font-size: 8px; color: #bbb; letter-spacing: 0.08em; align-self: flex-end; }
                .qr-modal-root .qr-box { width: 112px; height: 112px; background: #fff; border: 1px solid #ddd; padding: 6px; display: flex; align-items: center; justify-content: center; }
                .qr-modal-root .qr-box svg { width: 100%; height: 100%; display: block; }
                .qr-modal-root .btn-close { position: absolute; top: 10px; right: 10px; z-index: 10; width: 26px; height: 26px; background: rgba(0,0,0,0.35); border: 0.5px solid rgba(201,169,110,0.4); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
                .qr-modal-root .btn-close svg { width: 10px; height: 10px; display: block; }
                .qr-modal-root .card.is-exporting .btn-close,
                .qr-modal-root .card.is-exporting .download-btn { display: none !important; }
              `}</style>

              <button className="btn-close" onClick={() => setShowQrModal(false)} title="Tutup">
                <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              <div className="banner">
                <div className="banner-overlay" />
                <div className="banner-content">
                  <div className="banner-pretitle">The Wedding Of</div>
                  <div className="banner-names">
                    <span className="banner-name">{data.couple.bride.name}</span>
                    <span className="banner-amp">&amp;</span>
                    <span className="banner-name">{data.couple.groom.name}</span>
                  </div>
                  <div className="banner-meta">
                    <span className="banner-meta-item">{data.event.displayDate}</span>
                    <div className="banner-meta-dot" />
                    <span className="banner-meta-item">{data.event.day}</span>
                    <div className="banner-meta-dot" />
                    <span className="banner-meta-item">{data.event.locationName}</span>
                  </div>
                </div>
              </div>

              <div className="body">
                <div className="info">
                  <div className="info-pretitle">The Wedding of</div>
                  <div className="info-couple">{data.couple.bride.name} &amp; {data.couple.groom.name}</div>
                  <div className="info-date">{data.event.day}, {data.event.displayDate}</div>
                  <div className="info-divider" />
                  <div className="info-to">Kepada Yth.</div>
                  <div className="info-to">Bapak/Ibu/Saudara/i:</div>
                  <div className="info-guest">{guestName}</div>
                  <div className="info-sub">—</div>
                </div>

                <div className="qr-side">
                  <div className="qr-brand-label">by nimantra.id</div>
                  <div className="qr-box" ref={qrBoxRef}>
                    {tokenValue ? (
                      <QRCodeSVG value={tokenValue} size={100} level="M" />
                    ) : (
                      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="white" />
                        <g fill="#111">
                          <rect x="6" y="6" width="32" height="32" rx="2" fill="none" stroke="#111" strokeWidth="3" />
                          <rect x="12" y="12" width="20" height="20" />
                          <rect x="16" y="16" width="12" height="12" fill="white" />
                          <rect x="19" y="19" width="6" height="6" />
                          <rect x="62" y="6" width="32" height="32" rx="2" fill="none" stroke="#111" strokeWidth="3" />
                          <rect x="12" y="62" width="32" height="32" rx="2" fill="none" stroke="#111" strokeWidth="3" />
                        </g>
                      </svg>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="download-btn" onClick={downloadQrImage} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ece7df', background: '#fff', cursor: 'pointer', fontSize: 11 }}>Download</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
