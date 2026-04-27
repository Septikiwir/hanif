"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform, useMotionValueEvent, MotionValue } from "framer-motion";

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

// ─── CUSTOM TOAST ─────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Muncul selama 3 detik saja
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
        {type === 'success' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>
      <span className="toast-message">{message}</span>
    </motion.div>
  );
};

// ─── SVG Logos ───────────────────────────────────────────────────────────────
function BCALogo() {
  return (
    <img
      src="/Qris2.jpeg"
      alt="BCA Logo"
      style={{ height: "40px", width: "auto", objectFit: "contain" }}
    />
  );
}

function DANALogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#108de0" />
        <rect x="7" y="8" width="6" height="8" rx="2" fill="#fff" />
        <rect x="10" y="10" width="4" height="4" rx="1" fill="#108de0" />
        <rect x="14" y="10" width="3" height="2" rx="0.5" fill="#fff" />
        <rect x="14" y="14" width="3" height="2" rx="0.5" fill="#fff" />
      </svg>
      <span
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#108de0",
          letterSpacing: 0.5,
          fontFamily: "'Georgia', serif",
        }}
      >
        DANA
      </span>
    </div>
  );
}

function QRISLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <span
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: "#1a1a1a",
          letterSpacing: 1,
          fontFamily: "sans-serif",
        }}
      >
        QRIS
      </span>
    </div>
  );
}

// ─── STORY COMPONENTS ──────────────────────────────────────────────────────────

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

// ─── Chip Component ──────────────────────────────────────────────────────────
function Chip() {
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
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
      }}
    >
      <img
        src="/Qris1.jpeg"
        alt="Chip"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────────────
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

// ─── Download Button ──────────────────────────────────────────────────────────
function DownloadButton({ imageUrl }: { imageUrl: string }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "QRIS-Wedding-Hanif-Fizah.jpeg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginRight: 2 }}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download QRIS
    </button>
  );
}

// ─── Card Component ──────────────────────────────────────────────────────────
interface PaymentCardProps {
  bank: string;
  accountNumber?: string;
  holderName: string;
  hasChip?: boolean;
  logo: React.ReactNode;
  isQris?: boolean;
  image?: string;
  isAddress?: boolean;
  address?: string;
}

function PaymentCard({ bank, accountNumber, holderName, hasChip, logo, isQris, image, isAddress, address }: PaymentCardProps) {
  return (
    <div
      className="reveal reveal-up"
      style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: "20px 22px 16px",
        border: "1px solid #e0e0e0",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          right: -50,
          bottom: -60,
          width: 170,
          height: 170,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.03)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 15,
          bottom: -80,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.02)",
          pointerEvents: "none",
        }}
      />

      <div style={{
        display: "flex",
        justifyContent: isAddress ? "center" : "space-between",
        alignItems: "center",
        marginBottom: 16,
        position: "relative",
        zIndex: 1
      }}>
        {!isAddress && (
          <img
            src="/Qris3.jpeg"
            alt="Logo Left"
            style={{ height: "35px", width: "auto", objectFit: "contain" }}
          />
        )}
        {isAddress && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{bank}</span>
          </div>
        )}
        {logo}
      </div>

      {isQris ? (
        <div style={{ textAlign: "center", marginBottom: 20, position: "relative", zIndex: 1 }}>
          <img
            src={image}
            alt="QRIS Code"
            style={{
              width: "100%",
              maxWidth: "280px",
              aspectRatio: "1 / 1",
              objectFit: "contain",
              borderRadius: 12,
              border: "1px solid #eee",
              display: "block",
              margin: "0 auto",
              background: "#fff"
            }}
          />
        </div>
      ) : isAddress ? (
        <div style={{ marginBottom: 20, position: "relative", zIndex: 1 }}>
          <p style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "#444",
            marginBottom: 0,
            fontFamily: "var(--font-body)",
            textAlign: "center"
          }}>
            {address}
          </p>
        </div>
      ) : (
        <>
          {hasChip && <Chip />}
          {!hasChip && <div style={{ height: 18 }} />}
        </>
      )}

      <div style={{
        display: "flex",
        justifyContent: (isQris || isAddress) ? "center" : "space-between",
        alignItems: "center",
        position: "relative",
        zIndex: 1,
        flexDirection: isAddress ? "column" : "row",
        gap: isAddress ? 12 : 0
      }}>
        <span
          style={{
            fontSize: 12,
            letterSpacing: 1.8,
            color: "#888",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {holderName}
        </span>
        {!isQris && !isAddress && <DownloadButton imageUrl="/Qris.jpeg" />}
        {isAddress && address && <CopyButton value={address} />}
      </div>
    </div>
  );
}

export default function Home() {
  const weddingDate = useMemo(() => new Date("2026-05-17T00:00:00+07:00"), []);
  const audioSrc = useMemo(
    () =>
      encodeURI(
        "/Nadhif Basalamah - Kota Ini Tak Sama Tanpamu (Official Music Video Lyric).mp3"
      ),
    []
  );

  const [guestName, setGuestName] = useState("Tamu Undangan");
  // ─── SUPABASE INTEGRATION ───
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [rsvpStats, setRsvpStats] = useState({ hadir: 0, tidakHadir: 0 });
  const [isSubmittingWishes, setIsSubmittingWishes] = useState(false);
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("");
  const [wishName, setWishName] = useState("");
  const [wishText, setWishText] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(wishes.length / ITEMS_PER_PAGE);
  const currentWishes = wishes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const fetchWishes = async () => {
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setWishes(data);
  };

  const fetchRSVPStats = async () => {
    const { data, error } = await supabase.from("rsvp").select("attendance");
    if (!error && data) {
      const hadir = data.filter((r) => r.attendance === "Hadir").length;
      const tidakHadir = data.filter((r) => r.attendance === "Tidak Hadir").length;
      setRsvpStats({ hadir, tidakHadir });
    }
  };

  useEffect(() => {
    const initData = async () => {
      await fetchWishes();
      await fetchRSVPStats();
    };
    void initData();
  }, []);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName || !rsvpStatus) return showToast("Mohon isi nama dan status kehadiran.", "error");
    setIsSubmittingRSVP(true);
    const { error } = await supabase.from("rsvp").insert([{ name: rsvpName, attendance: rsvpStatus }]);
    setIsSubmittingRSVP(false);
    if (error) {
      showToast("Gagal mengirim RSVP.", "error");
    } else {
      setRsvpName("");
      setRsvpStatus("");
      fetchRSVPStats();
      showToast("Terima kasih atas konfirmasinya!");
    }
  };

  const handleWishesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName || !wishText) return showToast("Mohon isi nama dan ucapan.", "error");
    setIsSubmittingWishes(true);
    const { error } = await supabase.from("wishes").insert([{ name: wishName, message: wishText }]);
    setIsSubmittingWishes(false);
    if (error) {
      showToast("Gagal mengirim ucapan.", "error");
    } else {
      setWishName("");
      setWishText("");
      fetchWishes();
      showToast("Ucapan berhasil dikirim!");
      setCurrentPage(1); // Kembali ke halaman pertama untuk melihat ucapan baru
    }
  };

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("to") ?? sp.get("tamu") ?? sp.get("guest") ?? sp.get("nama");
    const cleaned = (raw ?? "").replace(/\s+/g, " ").trim();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestName(cleaned ? cleaned.slice(0, 60) : "Tamu Undangan");
  }, []);

  const galleryImages = useMemo(
    () => [
      { src: "/gallery/1.jpg", isLandscape: true },
      { src: "/gallery/2.jpg", isLandscape: false },
      { src: "/gallery/3.jpg", isLandscape: false },
      { src: "/gallery/4.jpg", isLandscape: true },
      { src: "/gallery/5.JPG", isLandscape: false },
      { src: "/gallery/6.jpg", isLandscape: false },
      { src: "/gallery/7.jpg", isLandscape: false },
      { src: "/gallery/8.JPG", isLandscape: true },
      { src: "/gallery/9.JPG", isLandscape: false },
      { src: "/gallery/10.png", isLandscape: false },
      { src: "/gallery/11.JPG", isLandscape: true },
      { src: "/gallery/12.JPG", isLandscape: false },
      { src: "/gallery/13.JPG", isLandscape: false },
      { src: "/gallery/14.JPG", isLandscape: false },
    ],
    []
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isOpeningReady, setIsOpeningReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGifts, setShowGifts] = useState(false);

  const CARDS = [
    {
      id: "bca",
      bank: "BCA",
      accountNumber: "8120677519",
      holderName: "HANIF ASSALAM",
      hasChip: true,
      logo: <BCALogo />,
    },
    {
      id: "address",
      bank: "Alamat Pengiriman",
      isAddress: true,
      address: "Jalan Merak, Gg Dedek, Kelurahan Sampit, Kecamatan Delta Pawan, Kabupaten Ketapang, Kalimantan Barat, 78813 (Rumah Cat Kuning, Belakang Kantor PAN)\n(HP : +62 895-6158-01699)",
      holderName: "Nur Hafizah",
      logo: (
        <div style={{ opacity: 0.2 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsOpeningReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [countdown, setCountdown] = useState<CountdownState>({
    days: "00",
    hours: "00",
    mins: "00",
    secs: "00",
    done: false,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;

    const shouldPlay = isInvitationOpen && isPlaying;

    const sync = async () => {
      if (!audio) return;

      if (shouldPlay) {
        try {
          await audio.play();
        } catch {
          if (!cancelled) setIsPlaying(false);
        }
      } else {
        audio.pause();
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [isInvitationOpen, isPlaying]);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    if (isInvitationOpen) {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          /* Ignore autoplay restrictions; user can tap to play if needed */
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isInvitationOpen]);

  useEffect(() => {
    const stopAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") stopAudio();
    };

    window.addEventListener("pagehide", stopAudio);
    window.addEventListener("beforeunload", stopAudio);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", stopAudio);
      window.removeEventListener("beforeunload", stopAudio);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopAudio();
    };
  }, []);

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
    // Force reset scroll to top on refresh
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    // Only start observing when invitation is open to ensure clean animations
    if (!isInvitationOpen) return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal")
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("visible");

            if (target.classList.contains("event-date-number") && !target.dataset.counted) {
              const targetVal = parseInt(target.innerText) || 17;
              let current = 1;
              const duration = 1200;
              const frameRate = 1000 / 60;
              const totalFrames = duration / frameRate;
              const increment = (targetVal - 1) / totalFrames;

              target.dataset.counted = "true";
              const timer = setInterval(() => {
                current += increment;
                if (current >= targetVal) {
                  target.innerText = targetVal.toString();
                  clearInterval(timer);
                } else {
                  target.innerText = Math.floor(current).toString();
                }
              }, frameRate);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20% 0px"
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isInvitationOpen, showGifts]);

  useEffect(() => {
    const timeouts: number[] = [];
    const heroReveals = Array.from(
      document.querySelectorAll<HTMLElement>(".hero .reveal")
    );

    heroReveals.forEach((el, i) => {
      const t = window.setTimeout(() => el.classList.add("visible"), 300 + i * 150);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown((prev) => ({ ...prev, done: true }));
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setCountdown({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        mins: String(m).padStart(2, "0"),
        secs: String(s).padStart(2, "0"),
        done: false,
      });
    };

    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [weddingDate]);

  return (
    <>

      {/* ─── OPENING SCREEN ─── */}
      <section className={`opening-screen ${isInvitationOpen ? "closed" : ""}`}>
        <div className="screen">
          <div className="bg-photo" />
          <div className="overlay" />

          {/* Decorative ornaments */}
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
              transitionDelay: "0.2s"
            }}
          >
            <img
              src="/Logo Hanif.png"
              alt="Logo Hanif"
              style={{ height: "64px", width: "auto", objectFit: "contain" }}
            />
          </div>

          <div className="content">
            <p className={`wedding-of reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "0.4s" }}>
              The Wedding Of
            </p>
            <h1 className={`names reveal reveal-up ${isOpeningReady ? "visible" : ""}`} style={{ transitionDelay: "0.6s" }}>
              Fizah <span className="ampersand">&amp;</span> Hanif
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8l1.5-3h15L21 8M3 8v11a1 1 0 001 1h16a1 1 0 001-1V8M3 8h18M9 12h6" />
                  <path d="M12 12v5" />
                </svg>
                Buka Undangan
              </button>
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* ─── FIXED BACKGROUND VIDEO ─── */}
        <div className="fixed-bg-video">
          <video
            className="hero-video"
            src="/Undangan%20Digital%20Video.mp4"
            ref={heroVideoRef}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="fixed-overlay" />
        </div>

        {/* ─── HERO ─── */}
        <header className="hero">

          <div className="content">
            <div className="reveal reveal-fade delay-1">
              <img
                src="/Logo Hanif.png"
                alt="Logo Hanif"
                style={{ height: "64px", width: "auto", marginBottom: "1.5rem", objectFit: "contain" }}
              />
            </div>
            <p className="wedding-of reveal reveal-up delay-2">The Wedding Of</p>
            <h1 className="names reveal reveal-up delay-3">
              Fizah <span className="amp">&amp;</span> Hanif
            </h1>
            <p className="date reveal reveal-up delay-4">Minggu · 17 Mei 2026</p>
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

        {/* ─── QUOTE ─── */}
        <section className="quote-section">
          <img
            src="/Logo Hanif.png"
            alt="Logo Hanif"
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

        {/* ─── INTRO ─── */}
        <section className="intro-section" style={{ padding: 0 }}>
          <div style={{
            padding: 'var(--space-lg) var(--space-md)',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            margin: 'var(--space-lg) var(--section-padding-x) var(--space-xl) var(--section-padding-x)'
          }}>
            <p className="reveal reveal-up" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(18px, 5.5vw, 24px)',
              color: 'var(--gold)',
              marginBottom: '1rem',
              whiteSpace: 'nowrap'
            }}>
              Assalamu&apos;alaikum Wr. Wb.
            </p>
            <div className="ornament-center reveal reveal-fade">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5Z"
                  fill="#B8923A"
                  opacity="0.8"
                />
              </svg>
            </div>


            <p className="intro-lead reveal reveal-up delay-1" style={{ marginBottom: 0 }}>
              Dengan memohon Rahmat dan Ridho Allah Subhanahu Wa Ta&apos;ala, kami
              mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan kami
            </p>
          </div>

          <div className="v4-card reveal reveal-scale">
            <div className="v4-photo" style={{ height: '100%', backgroundImage: 'url(/Fizah.JPG)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="v4-photo-fade" style={{ height: '40%' }}></div>
            </div>
            <div className="v4-content">
              <p className="v4-role">The Bride</p>
              <h2 className="v4-name">Nur Hafizah, S.Pd.</h2>
              <div className="v4-sub-row">
                <div className="v4-sub-bar"></div>
                <div className="v4-sub-text">
                  <p className="v4-sub-label">Putri Pertama Dari</p>
                  <p className="v4-sub-parents">Bapak H. Muhammad Salmani, S.Ag. (Alm)<br />&amp; Ibu Hj. Yumita, S.H.</p>
                </div>
              </div>
              <a
                href="https://www.instagram.com/nrhfzh22?igsh=eXp6N2dja25ua294"
                target="_blank"
                rel="noopener noreferrer"
                className="v4-ig"
                style={{ textDecoration: 'none' }}
              >
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                NRHFZH22
              </a>
            </div>
          </div>

          <div className="v4-card reveal reveal-scale delay-1">
            <div className="v4-photo" style={{ height: '100%', backgroundImage: 'url(/Hanif.JPG)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="v4-photo-fade" style={{ height: '40%' }}></div>
            </div>
            <div className="v4-content">
              <p className="v4-role">The Groom</p>
              <h2 className="v4-name">Hanif Assalam, M.Pd.</h2>
              <div className="v4-sub-row">
                <div className="v4-sub-bar"></div>
                <div className="v4-sub-text">
                  <p className="v4-sub-label">Putra Pertama Dari</p>
                  <p className="v4-sub-parents">Bapak H. Pandaya, S.Pd.<br />&amp; Ibu Hj. Rusmiyati, S.Pd.SD.</p>
                </div>
              </div>
              <a
                href="https://www.instagram.com/hanifassalamm?igsh=Z3psZGN3YzcwOXd1&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="v4-ig"
                style={{ textDecoration: 'none' }}
              >
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                HANIFASSALAMM
              </a>
            </div>
          </div>
        </section>

        {/* ─── OUR STORY ─── */}
        <section className="story-section">
          <div className="section-heading reveal reveal-up">
            <span className="section-label">Perjalanan Cinta</span>
            <h2 className="section-title">Our Love Story</h2>
          </div>

          <div className="simple-story-container">
            <StoryItem
              src="/1.JPG"
              alt="Story 1"
              subtitle="Yogyakarta, 8 Mei 2018, kota tempat pertama kali bertemu. Pertemanan sederhana yang berkembang menjadi sesuatu yang lebih dalam."
            />

            <StoryItem
              src="/2.JPG"
              alt="Story 2"
              subtitle="Waktu membawa kami ke ketinggian Gunung Prau—pendakian pertama kami bersama. Di sanalah, hati kami mulai saling mengenal."
            />

            <StoryItem
              src="/3.jpg"
              alt="Story 3"
              subtitle="Seiring berjalannya waktu, —hingga cinta dengan lembut menemukan jalannya dalam hidup kami. 13 September 2025, kami mengikat janji, dan pada 17 Mei 2026, kami memulai selamanya."
            />

            <StoryItem
              src="/4.jpg"
              alt="Story 4"
              subtitle="Pertemuan yang menjadi perjalanan seumur hidup—ini adalah kisah kami, cerita kami, cinta kami."
            />
          </div>
        </section>

        {/* ─── EVENTS ─── */}
        <section className="event-section">
          <div className="section-heading reveal reveal-up">
            <span className="section-label">Waktu & Tempat</span>
            <h2 className="section-title">Time & Place</h2>
          </div>

          <article className="event-card reveal reveal-up delay-1">
            <h3 className="event-name">Akad Nikah</h3>
            <div className="event-details">
              <p className="event-day">Minggu</p>
              <p className="event-date-number reveal">17</p>
              <p className="event-month">Mei 2026</p>
              <p className="event-time">09.00 WIB — Selesai</p>
              <p className="event-location-name">Gedung Pancasila</p>
              <p className="event-location-city">Kabupaten Ketapang</p>
            </div>
            <a
              href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x2e05185c3dff60d5:0x224a938d719caf80?entry=s&sa=X&ved=2ahUKEwiFseeC4_qPAxVy3jgGHXElL1QQ4kB6BAgUEAA"
              target="_blank"
              rel="noopener noreferrer"
              className="event-btn"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
              Lihat Lokasi
            </a>
          </article>

          <article className="event-card reveal reveal-up delay-2">
            <h3 className="event-name">Resepsi</h3>
            <div className="event-details">
              <p className="event-day">Minggu</p>
              <p className="event-date-number reveal">17</p>
              <p className="event-month">Mei 2026</p>
              <p className="event-time">16.00 WIB — Selesai</p>
              <p className="event-location-name">Gedung Pancasila</p>
              <p className="event-location-city">Kabupaten Ketapang</p>
            </div>
            <a
              href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x2e05185c3dff60d5:0x224a938d719caf80?entry=s&sa=X&ved=2ahUKEwiFseeC4_qPAxVy3jgGHXElL1QQ4kB6BAgUEAA"
              target="_blank"
              rel="noopener noreferrer"
              className="event-btn"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
              Lihat Lokasi
            </a>
          </article>
        </section>



        {/* ─── LIVE STREAM ─── */}
        <section className="livestream-section">
          <div className="section-heading reveal reveal-up">
            <span className="section-label">Saksikan Bersama</span>
            <h2 className="section-title">Live Streaming</h2>
          </div>

          <div className="livestream-card reveal reveal-up delay-1">
            <div className="live-badge">
              <span className="live-dot" />
              Live
            </div>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255, 255, 255, 0.85)",
                lineHeight: 1.9,
                marginBottom: "1.5rem",
              }}
            >
              Saksikan pernikahan kami secara virtual yang disiarkan langsung
              melalui media sosial kami.
            </p>
            <div
              style={{
                fontFamily: "var(--font-sub)",
                fontSize: 12,
                letterSpacing: "0.1em",
                color: "var(--gold-pale)",
                marginBottom: "1.5rem",
                lineHeight: 2,
              }}
            >
              Minggu, 17 Mei 2026
              <br />
              Pukul 08.45 WIB
            </div>
            <a
              href="https://www.instagram.com/hanifassalamm?upcoming_event_id=17882896233394607"
              target="_blank"
              rel="noopener noreferrer"
              className="event-btn"
              style={{ display: "inline-flex" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Tonton di Sini
            </a>
          </div>
        </section>

        {/* ─── PHOTO GALLERY ─── */}
        <section className="gallery-section">
          <div className="section-heading reveal reveal-up">
            <span className="section-label">Kenangan</span>
            <h2 className="section-title">Photo Gallery</h2>
          </div>

          <div className="gallery-wrap">
            <div className="gallery-video-wrap reveal reveal-scale">
              <video
                src="/Video%20Landscape%20Galery.mp4"
                className="gallery-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>

            <div className="gallery-grid">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.src}
                  type="button"
                  className={`gallery-thumb reveal reveal-fade ${img.isLandscape ? "landscape" : ""}`}
                  style={{ transitionDelay: `${(idx % 6) * 100}ms` }}
                  aria-label={`Open photo ${idx + 1}`}
                  onClick={() => setLightboxImage(img.src)}
                >
                  <Image
                    src={img.src}
                    alt={`Gallery photo ${idx + 1}`}
                    fill
                    sizes={img.isLandscape ? "(max-width: 430px) 66vw, 300px" : "(max-width: 430px) 33vw, 140px"}
                    className="gallery-img"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── GIFT ─── */}
        <section className="gift-section">
          <div className="section-heading reveal">
            <span className="section-label">Hadiah Pernikahan</span>
            <h2 className="section-title">Wedding Gift</h2>
          </div>

          <p className="gift-note reveal reveal-delay-2">
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Jika
            ingin memberikan hadiah, Anda dapat mengirimkan secara cashless.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: "100%",
              maxWidth: 400,
              margin: "2rem auto 0",
            }}
          >
            {CARDS.map((card) => (
              <PaymentCard key={card.id} {...card} />
            ))}
          </div>
        </section>

        {/* ─── RSVP ─── */}
        <section className="rsvp-section">
          <div className="wishes-bg">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 430 600"
              preserveAspectRatio="xMidYMid slice"
            >
              <g fill="none" stroke="#EDD9A3" strokeWidth="0.5">
                <path
                  d="M0,300 Q215,100 430,300 Q215,500 0,300Z"
                  opacity="0.3"
                />
                <circle cx="215" cy="300" r="180" opacity="0.2" />
                <circle cx="215" cy="300" r="220" opacity="0.1" />
              </g>
            </svg>
          </div>

          <div className="wishes-inner">
            <div className="wishes-heading reveal reveal-up">
              <h2 className="wishes-title">RSVP</h2>
              <p className="wishes-subtitle">Konfirmasi Kehadiran</p>
            </div>

            <div className="rsvp-stats reveal reveal-up delay-1">
              <div className="rsvp-stat rsvp-hadir">
                <span className="rsvp-number">{rsvpStats.hadir}</span>
                <span className="rsvp-label">Hadir</span>
              </div>
              <div className="rsvp-stat rsvp-tidak">
                <span className="rsvp-number">{rsvpStats.tidakHadir}</span>
                <span className="rsvp-label">Tidak Hadir</span>
              </div>
            </div>

            <form
              className="wishes-form reveal reveal-up delay-2"
              onSubmit={handleRSVPSubmit}
            >
              <input 
                type="text" 
                placeholder="Nama Anda" 
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
              />
              <select 
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value)}
              >
                <option value="" disabled>
                  — Konfirmasi Kehadiran —
                </option>
                <option value="Hadir">Hadir</option>
                <option value="Tidak Hadir">Tidak Hadir</option>
              </select>
              <button type="submit" className="btn-gold" disabled={isSubmittingRSVP}>
                {isSubmittingRSVP ? "Mengirim..." : "Konfirmasi"}
              </button>
            </form>
          </div>
        </section>

        {/* ─── WISHES ─── */}
        <section className="wishes-section">
          <div className="wishes-bg">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 430 600"
              preserveAspectRatio="xMidYMid slice"
            >
              <g fill="none" stroke="#EDD9A3" strokeWidth="0.5">
                <path
                  d="M0,300 Q215,100 430,300 Q215,500 0,300Z"
                  opacity="0.3"
                />
                <circle cx="215" cy="300" r="180" opacity="0.2" />
                <circle cx="215" cy="300" r="220" opacity="0.1" />
              </g>
            </svg>
          </div>

          <div className="wishes-inner">
            <div className="wishes-heading reveal reveal-up">
              <h2 className="wishes-title">Wishes</h2>
              <p className="wishes-subtitle">
                Berikan ucapan &amp; doa untuk kedua mempelai
              </p>
            </div>

            <form
              className="wishes-form reveal reveal-up delay-1"
              onSubmit={handleWishesSubmit}
            >
              <input 
                type="text" 
                placeholder="Nama Anda" 
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
              />
              <textarea 
                rows={3} 
                placeholder="Tuliskan ucapan & doa Anda…" 
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
              />
              <button type="submit" className="btn-gold" disabled={isSubmittingWishes}>
                {isSubmittingWishes ? "Mengirim..." : "Kirim Ucapan"}
              </button>
            </form>

            <div className="comment-list reveal reveal-up delay-2">
              <p
                style={{
                  fontFamily: "var(--font-sub)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "rgba(0,0,0,0.4)",
                  marginBottom: "1rem",
                }}
              >
                {wishes.length} Ucapan
              </p>

              {currentWishes.map((item, idx) => (
                <div key={item.id || idx} className="comment-item">
                  <p className="comment-name">{item.name}</p>
                  <p className="comment-text">{item.message}</p>
                  <p className="comment-meta">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }) : "Baru saja"}
                  </p>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div
                className="comment-pagination"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                  marginTop: "2rem",
                  fontFamily: "var(--font-sub)",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  color: "rgba(0,0,0,0.4)",
                }}
              >
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(v => Math.max(1, v - 1))}
                  style={{
                    background: "none",
                    border: "none",
                    color: currentPage === 1 ? "#ddd" : "inherit",
                    cursor: currentPage === 1 ? "default" : "pointer",
                  }}
                >
                  ← Prev
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Logika sederhana: tampilkan semua angka jika sedikit, atau limit jika banyak
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        background: "none",
                        border: "none",
                        color: currentPage === pageNum ? "var(--burgundy)" : "inherit",
                        fontWeight: currentPage === pageNum ? "bold" : "normal",
                        cursor: "pointer",
                        minWidth: "24px"
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(v => Math.min(totalPages, v + 1))}
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
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="footer-section">
          <div>
            <img
              src="/Logo Hanif.png"
              alt="Logo Hanif"
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
            <h2 className="footer-names reveal reveal-up delay-3" style={{ marginBottom: 0 }}>Fizah &amp; Hanif</h2>
          </div>

          <div className="footer-credit">Made with ♥ by inviyu.vercel.app</div>
        </footer>
      </main>

      <audio ref={audioRef} src={audioSrc} autoPlay playsInline preload="auto" />

      {/* ─── MUSIC FAB ─── */}
      {isInvitationOpen && (
        <button
          className={`music-fab${isPlaying ? " playing" : ""}`}
          title="Music"
          type="button"
          onClick={() => setIsPlaying((v) => !v)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EDD9A3"
            strokeWidth="1.5"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </button>
      )}

      {/* ─── LIGHTBOX MODAL ─── */}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <button
            className="lightbox-close"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
          >
            ✕
          </button>
          <div className="lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Full size view"
              fill
              className="lightbox-img"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>
    </>
  );
}
