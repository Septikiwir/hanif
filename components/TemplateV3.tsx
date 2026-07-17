"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { toJpeg } from "html-to-image";

// --- TYPES (reuse from V2) ---
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
    story: { src: string; subtitle: string; title?: string; year?: string }[];
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

// --- ANIMATION VARIANTS ---
const fadeUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 0.77, 0.47, 0.97] }
  }
};

const fadeScale: any = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.1, ease: [0.16, 0.77, 0.47, 0.97] }
  }
};

const stagger: any = {
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

// --- DECORATIVE COMPONENTS ---

const isVideo = (url: string) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)($|\?)/i) !== null;
};

// SafeImg: only renders Next/Image when src is valid
const SafeImg = (props: React.ComponentProps<typeof Image>) => {
  if (!props.src || props.src === "") return null;
  return <Image {...props} />;
};


const GoldLine = ({ className }: { className?: string }) => (
  <div className={`v3-gold-line ${className || ""}`} />
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <motion.span variants={fadeUp} className="v3-section-label">{children}</motion.span>
);

const OrnamentDivider = () => (
  <motion.div variants={fadeUp} className="v3-ornament-divider">
    <div className="v3-ornament-line" />
    <div className="v3-ornament-diamond" />
    <div className="v3-ornament-line" />
  </motion.div>
);

// --- MAIN TEMPLATE COMPONENT ---

export default function TemplateV3({ data, slug }: { data: InvitationData; slug: string }) {
  const weddingDate = useMemo(() => new Date(data.event.date), [data.event.date]);
  const audioSrc = useMemo(() => data.media.music.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29"), [data.media.music]);

  const hasOpeningPhoto = useMemo(() => !!data.media.openingPhoto, [data.media.openingPhoto]);
  const hasOpeningMedia = useMemo(() => !!(data.media.openingPhoto || data.media.heroVideo), [data.media.openingPhoto, data.media.heroVideo]);
  const hasBridePhoto = useMemo(() => !!data.couple.bride.photo, [data.couple.bride.photo]);
  const hasGroomPhoto = useMemo(() => !!data.couple.groom.photo, [data.couple.groom.photo]);
  const hasGallery = useMemo(() => !!(data.media.gallery && data.media.gallery.length > 0 && data.media.gallery[0]?.src), [data.media.gallery]);
  const hasStoryPhoto = useMemo(() => !!(data.media.gallery?.[3]?.src || data.media.openingPhoto), [data.media.gallery, data.media.openingPhoto]);
  const hasMoments = useMemo(() => hasGallery && !!data.media.gallery?.[4]?.src, [hasGallery, data.media.gallery]);
  const hasVideo = useMemo(() => !!data.media.galleryVideo, [data.media.galleryVideo]);
  const hasStory = useMemo(() => !!(data.media.story && data.media.story.length > 0), [data.media.story]);


  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpeningReady, setIsOpeningReady] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [hasToken, setHasToken] = useState(false);
  const [tokenValue, setTokenValue] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<CountdownState>({ days: "00", hours: "00", mins: "00", secs: "00", done: false });
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [rsvpStats, setRsvpStats] = useState({ hadir: 0, tidakHadir: 0 });
  const [isSubmittingWishes, setIsSubmittingWishes] = useState(false);
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("");
  const [wishName, setWishName] = useState("");
  const [wishText, setWishText] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isVideoFinished, setIsVideoFinished] = useState(!data.media.heroVideo || !isVideo(data.media.heroVideo));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const qrCardRef = useRef<HTMLDivElement | null>(null);

  // Initialize data
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

    const timer = setTimeout(() => setIsOpeningReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const fetchWishes = useCallback(async () => {
    const { data: list, error } = await supabase.from("wishes").select("*").eq("invitation_slug", slug).order("created_at", { ascending: false });
    if (!error && list) setWishes(list);
  }, [slug]);

  const fetchRSVPStats = useCallback(async () => {
    const { data: list, error } = await supabase.from("rsvp").select("attendance").eq("invitation_slug", slug);
    if (!error && list) {
      const hadir = list.filter((r) => r.attendance === "Hadir").length;
      const tidakHadir = list.filter((r) => r.attendance === "Tidak Hadir").length;
      setRsvpStats({ hadir, tidakHadir });
    }
  }, [slug]);

  useEffect(() => {
    fetchWishes();
    fetchRSVPStats();
  }, [fetchWishes, fetchRSVPStats]);

  useEffect(() => {
    if (guestName !== "Tamu Undangan") { setRsvpName(guestName); setWishName(guestName); }
  }, [guestName]);

  // Audio Logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isInvitationOpen && isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isInvitationOpen, isPlaying]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        audio.pause();
      } else if (isInvitationOpen && isPlaying) {
        audio.play().catch(() => { });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isInvitationOpen, isPlaying]);

  // Countdown Logic
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: "00", hours: "00", mins: "00", secs: "00", done: true });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ days: String(d).padStart(2, "0"), hours: String(h).padStart(2, "0"), mins: String(m).padStart(2, "0"), secs: String(s).padStart(2, "0"), done: false });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [weddingDate]);

  useEffect(() => {
    if (isInvitationOpen) {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("visible");
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -20% 0px" });
      elements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [isInvitationOpen]);

  // Toast Logic
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => prev ? { ...prev, visible: false } : null), 3000);
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName || !rsvpStatus) return showToast("Mohon isi nama dan kehadiran.");
    setIsSubmittingRSVP(true);
    const { error } = await supabase.from("rsvp").insert([{ name: rsvpName, attendance: rsvpStatus, invitation_slug: slug }]);
    setIsSubmittingRSVP(false);
    if (error) showToast("Gagal mengirim RSVP.");
    else {
      setRsvpStatus("");
      fetchRSVPStats();
      showToast("RSVP berhasil dikirim!");
    }
  };

  const handleWishesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName || !wishText) return showToast("Mohon isi nama dan ucapan.");
    setIsSubmittingWishes(true);
    const { error } = await supabase.from("wishes").insert([{ name: wishName, message: wishText, invitation_slug: slug }]);
    setIsSubmittingWishes(false);
    if (error) showToast("Gagal mengirim ucapan.");
    else {
      setWishText("");
      fetchWishes();
      showToast("Ucapan terkirim!");
    }
  };

  const downloadQrImage = async () => {
    if (!tokenValue) return showToast("Token tidak tersedia.");
    setIsExporting(true);
    try {
      const card = qrCardRef.current;
      if (!card) return;
      const dataUrl = await toJpeg(card, { quality: 0.95, backgroundColor: "#ffffff" });
      const a = document.createElement("a");
      a.download = `QR-${guestName.replace(/\s+/g, "_")}.jpg`;
      a.href = dataUrl;
      a.click();
      showToast("Kartu berhasil diunduh.");
    } catch {
      showToast("Gagal mengunduh kartu.");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Berhasil disalin!");
  };

  return (
    <div className="v3-theme">
      <audio ref={audioRef} src={audioSrc} loop />

      {/* ═══ OPENING SCREEN ═══ */}
      <section className={`opening-screen ${isInvitationOpen ? "closed" : ""}`}>
        <div className="screen">
          {hasOpeningMedia && (
            <div className="bg-photo">
              {isVideo(data.media.openingPhoto || data.media.heroVideo || "") ? (
                <video
                  src={(data.media.openingPhoto || data.media.heroVideo || "") + "#t=5"}
                  muted
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => {
                    e.currentTarget.currentTime = 5;
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${data.media.openingPhoto || data.media.heroVideo || ""})` }} />
              )}
            </div>
          )}
          <div className="overlay" />
          <svg className="ornament ornament-tl" width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M4 4 L4 28 M4 4 L28 4" stroke="white" strokeWidth="1" /><path d="M4 4 L18 18" stroke="white" strokeWidth="0.5" /><circle cx="4" cy="4" r="2" fill="white" /></svg>
          <svg className="ornament ornament-tr" width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M60 4 L60 28 M60 4 L36 4" stroke="white" strokeWidth="1" /><path d="M60 4 L46 18" stroke="white" strokeWidth="0.5" /><circle cx="60" cy="4" r="2" fill="white" /></svg>
          <svg className="ornament ornament-bl" width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M4 60 L4 36 M4 60 L28 60" stroke="white" strokeWidth="1" /><path d="M4 60 L18 46" stroke="white" strokeWidth="0.5" /><circle cx="4" cy="60" r="2" fill="white" /></svg>
          <svg className="ornament ornament-br" width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M60 60 L60 36 M60 60 L36 60" stroke="white" strokeWidth="1" /><path d="M60 60 L46 46" stroke="white" strokeWidth="0.5" /><circle cx="60" cy="60" r="2" fill="white" /></svg>

          <div className={`reveal reveal-fade ${isOpeningReady ? "visible" : ""}`} style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "60px 20px", display: "flex", justifyContent: "center", zIndex: 10, transitionDelay: "0.2s" }}>
            <SafeImg src={data.media.logo} alt="Logo" width={0} height={0} sizes="100vw" style={{ height: "64px", width: "auto", objectFit: "contain" }} />
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
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className={(!isInvitationOpen || !isVideoFinished) ? "h-screen overflow-hidden" : ""}>

        {/* Floating Controls */}
        <div className="v3-floating-controls">
          <button onClick={() => setIsPlaying(!isPlaying)} className="v3-floating-btn">
            {isPlaying ? (
              <svg viewBox="0 0 24 24"><path d="M11 5L6 9H2V15H6L11 19V5Z" /><path d="M19.07 4.93C20.94 6.8 22 9.3 22 12C22 14.7 20.94 17.2 19.07 19.07" /><path d="M15.54 8.46C16.41 9.33 16.91 10.58 16.91 12C16.91 13.42 16.41 14.67 15.54 15.54" /></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M11 5L6 9H2V15H6L11 19V5Z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            )}
          </button>
          {hasToken && (
            <button onClick={() => setShowQrModal(true)} className="v3-floating-btn">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </button>
          )}
        </div>

        {/* ─── HERO SECTION ─── */}
        <section id="v3-hero" className="reveal reveal-fade" style={{ position: "relative" }}>
          {isInvitationOpen && data.media.heroVideo && (
            <div className="v3-hero-bg-media" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
              {isVideo(data.media.heroVideo) ? (
                <video
                  src={data.media.heroVideo}
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => setIsVideoFinished(true)}
                  onError={() => setIsVideoFinished(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }}
                />
              ) : (
                <img src={data.media.heroVideo} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} alt="Hero Background" />
              )}
            </div>
          )}

          {/* Floating particles */}
          <div className="v3-hero-particles" style={{ zIndex: 1 }}>
            <div className="v3-particle v3-particle-1" />
            <div className="v3-particle v3-particle-2" />
            <div className="v3-particle v3-particle-3" />
          </div>

          {isVideoFinished && (
            <>
              <div className="v3-hero-content" style={{ zIndex: 2 }}>
                {/* THE WEDDING OF text */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="v3-hero-eyebrow">
                  <GoldLine />
                  <span>THE WEDDING OF</span>
                  <GoldLine />
                </motion.div>

                {/* Direct text overlay (card border frame removed as requested) */}
                <div className="v3-hero-card-content">
                  <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2 }} className="v3-hero-names">
                    <span className="v3-hero-name-line">{data.couple.bride.shortName}</span>
                    <span className="v3-hero-ampersand">&amp;</span>
                    <span className="v3-hero-name-line">{data.couple.groom.shortName}</span>
                  </motion.h1>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.4 }} className="v3-hero-date-row">
                    <span className="v3-hero-date">{data.event.displayDate}</span>
                    <div className="v3-hero-date-dot" />
                    <span className="v3-hero-loc">{data.event.locationCity}</span>
                  </motion.div>
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} className="v3-hero-scroll-indicator">
                <span>SCROLL</span>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="v3-hero-scroll-line"
                />
              </motion.div>
            </>
          )}
        </section>

        {/* ─── QUOTE SECTION ─── */}
        <section id="v3-quote" className="reveal reveal-up">
          <div className="v3-quote-deco-top">✦</div>
          <p className="v3-quote-text">
            &ldquo;{data.media.quote?.text || "And of His signs is that He created for you from yourselves mates that you may find tranquility in them."}&rdquo;
          </p>
          <motion.span variants={fadeUp} className="v3-quote-source">— {data.media.quote?.ref || "QS. Ar-Rum: 21"}</motion.span>
          <div className="v3-quote-deco-bottom">✦</div>
        </section>

        {/* ─── COUPLE SECTION ─── */}
        <section id="v3-couple" className="reveal">
          <div className="v3-couple-header reveal reveal-up">
            <SectionLabel>INTRODUCING</SectionLabel>
            <h2 className="v3-couple-title">The Happy <em>Couple</em></h2>
          </div>

          {/* Bride */}
          <div className="v3-couple-card reveal reveal-up">
            {hasBridePhoto && (
              <div className="v3-couple-photo-wrap">
                <div className="v3-couple-photo-hexagon">
                  <SafeImg src={data.couple.bride.photo} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="Bride" />
                </div>
              </div>
            )}
            <motion.h3 variants={fadeUp} className="v3-couple-name">{data.couple.bride.fullName}</motion.h3>
            <motion.p variants={fadeUp} className="v3-couple-parents">
              {data.couple.bride.label || "Putri dari"}<br />
              <strong>{data.couple.bride.parents.father} &amp; {data.couple.bride.parents.mother}</strong>
            </motion.p>
            <motion.a variants={fadeUp} href={data.couple.bride.instagram.url} target="_blank" className="v3-couple-ig">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              @{data.couple.bride.instagram.username}
            </motion.a>
          </div>

          <div className="v3-couple-separator">
            <div className="v3-couple-sep-line" />
            <span className="v3-couple-sep-icon">&amp;</span>
            <div className="v3-couple-sep-line" />
          </div>

          {/* Groom */}
          <div className="v3-couple-card reveal reveal-up">
            {hasGroomPhoto && (
              <div className="v3-couple-photo-wrap">
                <div className="v3-couple-photo-hexagon">
                  <SafeImg src={data.couple.groom.photo} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="Groom" />
                </div>
              </div>
            )}
            <h3 className="v3-couple-name">{data.couple.groom.fullName}</h3>
            <p className="v3-couple-parents">
              {data.couple.groom.label || "Putra dari"}<br />
              <strong>{data.couple.groom.parents.father} &amp; {data.couple.groom.parents.mother}</strong>
            </p>
            <a href={data.couple.groom.instagram.url} target="_blank" className="v3-couple-ig">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              @{data.couple.groom.instagram.username}
            </a>
          </div>
        </section>

        {/* ─── GALLERY SECTION ─── */}
        {hasGallery && (
          <section id="v3-gallery" className="reveal">
            <div className="v3-gallery-header reveal reveal-up">
              <SectionLabel>THE GALLERY</SectionLabel>
              <h2>Our Captured <em>Moments</em></h2>
            </div>

            <div className="v3-gallery-mosaic reveal reveal-scale">
              <motion.div variants={fadeScale} className="v3-mosaic-tall">
                <SafeImg src={data.media.gallery[0]?.src || ""} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="G1" />
              </motion.div>
              <div className="v3-mosaic-stack">
                <motion.div variants={fadeScale} className="v3-mosaic-item">
                  <SafeImg src={data.media.gallery[1]?.src || ""} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="G2" />
                </motion.div>
                <motion.div variants={fadeScale} className="v3-mosaic-item">
                  <SafeImg src={data.media.gallery[2]?.src || ""} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="G3" />
                </motion.div>
              </div>
            </div>

            <div className="v3-gallery-quote">
              <motion.p variants={fadeUp}>&ldquo;Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.&rdquo;</motion.p>
              <motion.span variants={fadeUp}>— Forever &amp; Always</motion.span>
            </div>
          </section>
        )}

        {/* ─── EVENTS SECTION ─── */}
        <section id="v3-events" className="reveal">
          <div className="v3-events-bg-pattern" />

          <div className="v3-event-card reveal reveal-up">
            <SectionLabel>SAVE THE DATE</SectionLabel>
            <h2 className="v3-event-title">Akad Nikah</h2>
            <OrnamentDivider />
            <div className="v3-event-details">
              <div className="v3-event-detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <span>{data.event.day}, {data.event.displayDate}</span>
              </div>
              <div className="v3-event-detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span>Pukul {data.event.akad.time} WIB</span>
              </div>
              <div className="v3-event-detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>{data.event.locationName}, {data.event.locationCity}</span>
              </div>
            </div>
            <motion.a variants={fadeUp} href={data.event.mapsUrl} target="_blank" className="v3-btn v3-btn-outline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Google Maps
            </motion.a>
          </div>

          <div className="v3-event-separator">
            <div className="v3-event-sep-dot" />
            <div className="v3-event-sep-line" />
            <div className="v3-event-sep-dot" />
          </div>

          <div className="v3-event-card reveal reveal-up">
            <SectionLabel>THE RECEPTION</SectionLabel>
            <h2 className="v3-event-title">Resepsi</h2>
            <OrnamentDivider />
            <div className="v3-event-details">
              <div className="v3-event-detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <span>{data.event.day}, {data.event.displayDate}</span>
              </div>
              <div className="v3-event-detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span>Pukul {data.event.resepsi.time} WIB</span>
              </div>
              <div className="v3-event-detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>{data.event.locationName}, {data.event.locationCity}</span>
              </div>
            </div>
            <motion.a variants={fadeUp} href={data.event.mapsUrl} target="_blank" className="v3-btn v3-btn-outline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Google Maps
            </motion.a>
          </div>

          {/* RSVP Form */}
          <div className="v3-rsvp-block reveal reveal-up">
            <div className="v3-rsvp-header">
              <h2 className="v3-rsvp-title">R.S.V.P</h2>
              <p className="v3-rsvp-subtitle">Mohon konfirmasi kehadiran Anda melalui form di bawah ini</p>
            </div>

            <form onSubmit={handleRSVPSubmit} className="v3-rsvp-form">
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
              />
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value)}
              >
                <option value="">Konfirmasi Kehadiran</option>
                <option value="Hadir">Hadir</option>
                <option value="Tidak Hadir">Tidak Hadir</option>
              </select>
              <button disabled={isSubmittingRSVP} type="submit" className="v3-btn v3-btn-primary">
                {isSubmittingRSVP ? "Mengirim..." : "Kirim Konfirmasi"}
              </button>
            </form>

            <motion.div variants={fadeUp} className="v3-rsvp-stats">
              <div className="v3-rsvp-stat">
                <span className="v3-rsvp-stat-num">{rsvpStats.hadir}</span>
                <span className="v3-rsvp-stat-label">Hadir</span>
              </div>
              <div className="v3-rsvp-stat-divider" />
              <div className="v3-rsvp-stat">
                <span className="v3-rsvp-stat-num">{rsvpStats.tidakHadir}</span>
                <span className="v3-rsvp-stat-label">Berhalangan</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── STORY SECTION ─── */}
        {hasStory && (
          <section id="v3-story" className="reveal">
            <div className="v3-story-header reveal reveal-up">
              <SectionLabel>OUR JOURNEY</SectionLabel>
              <h2>Story of <em>Us</em></h2>
            </div>

            {hasStoryPhoto && (
              <div className="v3-story-photo reveal reveal-scale">
                <SafeImg src={data.media.gallery[3]?.src || data.media.openingPhoto || ""} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="Story" />
              </div>
            )}

            <div className="v3-timeline reveal reveal-up">
              {data.media.story.map((item, idx) => (
                <motion.div key={idx} variants={fadeUp} className="v3-tl-item">
                  <div className="v3-tl-marker">
                    <div className="v3-tl-dot" />
                    {idx < data.media.story.length - 1 && <div className="v3-tl-line" />}
                  </div>
                  <div className="v3-tl-content">
                    <span className="v3-tl-year">{item.year || "2024"}</span>
                    <h3 className="v3-tl-heading">{item.title || "The Beginning"}</h3>
                    <p className="v3-tl-body">{item.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ─── COUNTDOWN SECTION ─── */}
        <section id="v3-countdown" className="reveal">
          <SectionLabel>COUNTING DOWN</SectionLabel>
          <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} className="v3-cd-title">Till The Big Day</motion.h2>

          <div className="v3-cd-grid reveal reveal-up">
            {[
              { num: countdown.days, unit: "Days" },
              { num: countdown.hours, unit: "Hours" },
              { num: countdown.mins, unit: "Mins" },
              { num: countdown.secs, unit: "Secs" },
            ].map((item, idx) => (
              <div key={idx} className="v3-cd-item">
                <div className="v3-cd-num-wrap">
                  <span className="v3-cd-num">{item.num}</span>
                </div>
                <span className="v3-cd-unit">{item.unit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── WISHES SECTION ─── */}
        <section id="v3-wishes" className="reveal reveal-up">
          <h2>Digital <em>Wishes</em></h2>
          <p className="v3-wishes-sub">Berikan doa restu Anda untuk kebahagiaan kami</p>

          <div className="v3-wish-box">
            <form onSubmit={handleWishesSubmit} className="v3-wish-form">
              <input
                type="text"
                placeholder="Nama Anda"
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
              />
              <textarea
                placeholder="Tulis ucapan & doa..."
                rows={4}
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
              />
              <button disabled={isSubmittingWishes} type="submit" className="v3-btn v3-btn-primary">
                {isSubmittingWishes ? "Mengirim..." : "Kirim Ucapan"}
              </button>
            </form>

            <div className="v3-wish-list custom-scrollbar">
              {wishes.map((w) => (
                <motion.div key={w.id} variants={fadeUp} className="v3-wish-card">
                  <div className="v3-wish-header">
                    <div className="v3-wish-avatar">{w.name.charAt(0)}</div>
                    <div>
                      <h4 className="v3-wish-name">{w.name}</h4>
                      <span className="v3-wish-date">{new Date(w.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}</span>
                    </div>
                  </div>
                  <p className="v3-wish-text">&ldquo;{w.message}&rdquo;</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── LOVE GIFT SECTION ─── */}
        <section id="v3-gift" className="reveal reveal-up">
          <h2>Love <em>Gift</em></h2>
          <p className="v3-gift-sub">Tanpa mengurangi rasa hormat, bagi Anda yang ingin memberikan tanda kasih untuk kami, dapat melalui:</p>

          <div className="v3-gift-cards">
            {data.payment.map((p, idx) => {
              const isAddress = p.bank.toLowerCase().includes("alamat") || p.bank.toLowerCase().includes("shipping");

              if (isAddress) {
                return (
                  <motion.div key={idx} variants={fadeUp} className="v3-gift-address-card">
                    <p className="v3-gift-addr-label">Atau kirim hadiah fisik ke:</p>
                    <div className="v3-gift-addr-text">
                      {p.accountNumber || p.address}
                    </div>
                    <p className="v3-gift-addr-holder">a.n {p.holderName}</p>
                    <button
                      onClick={() => copyToClipboard(p.accountNumber || p.address || "")}
                      className="v3-btn v3-btn-outline v3-btn-sm"
                    >
                      Salin Alamat
                    </button>
                  </motion.div>
                );
              }

              return (
                <motion.div key={idx} variants={fadeUp} className="v3-gift-card">
                  <div className="v3-gift-card-icon">
                    <svg viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <div className="v3-gift-card-info">
                    <span className="v3-gift-bank">{p.bank}</span>
                    <div className="v3-gift-num">{p.accountNumber || p.address}</div>
                    <span className="v3-gift-holder">a.n {p.holderName}</span>
                  </div>
                  <button onClick={() => copyToClipboard(p.accountNumber || p.address || "")} className="v3-gift-copy">
                    <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ─── MOMENTS SECTION ─── */}
        {(hasVideo || hasMoments) && (
          <section id="v3-moments" className="reveal">
            <div className="reveal reveal-up">
              <h2>Our <em>Moments</em></h2>
              <p className="v3-moments-tagline">A glimpse of our happiness</p>
            </div>

            {hasVideo && (
              <div className="v3-video-wrap reveal reveal-scale">
                <video src={data.media.galleryVideo} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              </div>
            )}

            {hasMoments && (
              <div className="v3-moments-grid reveal reveal-up">
                <motion.div variants={fadeScale} className="v3-moment-item">
                  <SafeImg src={data.media.gallery[4]?.src || ""} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="M1" />
                </motion.div>
                <motion.div variants={fadeScale} className="v3-moment-item">
                  <SafeImg src={data.media.gallery[5]?.src || ""} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="M2" />
                </motion.div>
                <motion.div variants={fadeScale} className="v3-moment-item">
                  <SafeImg src={data.media.gallery[0]?.src || ""} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="M3" />
                </motion.div>
                <motion.div variants={fadeScale} className="v3-moment-item">
                  <SafeImg src={data.media.gallery[1]?.src || ""} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="M4" />
                </motion.div>
              </div>
            )}
          </section>
        )}

        {/* ─── CLOSING SECTION ─── */}
        <section id="v3-closing" className="reveal">
          {hasGroomPhoto && (
            <div className="v3-closing-photo reveal reveal-scale">
              <SafeImg src={data.couple.groom.photo} width={0} height={0} sizes="100vw" className="w-full h-full object-cover" alt="Closing" />
            </div>
          )}

          <p className="v3-closing-note reveal reveal-up">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
          </p>

          <OrnamentDivider />

          <div className="v3-footer reveal reveal-up">
            <p>The Wedding of</p>
            <h4>{data.couple.bride.shortName} &amp; {data.couple.groom.shortName}</h4>
            <div className="nimantra-credit">
              <Image src="/Nimantra S - Gold.png" alt="Nimantra Monogram" width={0} height={0} sizes="100vw" className="reveal reveal-fade" style={{ height: "32px", width: "auto", margin: "0 auto 16px", display: "block", objectFit: "contain", opacity: 0.8 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
                <p className="credit-title" style={{ marginBottom: 0 }}>Invitation by</p>
                <Image src="/Nimantra L - Gold.png" alt="Nimantra Logo" width={0} height={0} sizes="100vw" className="reveal reveal-fade" style={{ height: "18px", width: "auto", objectFit: "contain", opacity: 0.8 }} />
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
            </div>
          </div>
        </section>

      </main>

      {/* ═══ QR MODAL ═══ */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white max-w-[420px] w-full relative overflow-hidden shadow-2xl ${isExporting ? "exporting" : ""}`}
              onClick={e => e.stopPropagation()}
              ref={qrCardRef}
            >
              <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/10 rounded-full text-white">✕</button>

              <div className="h-24 relative flex items-center justify-center px-6" style={{ background: "linear-gradient(135deg, #1a1520 0%, #2d1f3d 100%)" }}>
                <div className="text-center text-white">
                  <span className="text-[7px] tracking-[4px] uppercase opacity-60">Digital Invitation</span>
                  <h5 className="serif italic text-xl mt-1" style={{ fontFamily: "var(--v3-font-serif)" }}>{data.couple.bride.shortName} &amp; {data.couple.groom.shortName}</h5>
                </div>
              </div>

              <div className="p-8 flex items-center gap-8">
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--v3-rose)" }}>Guest Name</span>
                  <h6 className="text-xl italic text-[#1a1520]" style={{ fontFamily: "var(--v3-font-serif)" }}>{guestName}</h6>
                  <div className="w-10 h-[1px] my-4" style={{ background: "var(--v3-gold)" }} />
                  <p className="text-[10px] leading-relaxed" style={{ color: "var(--v3-rose)" }}>Silakan tunjukkan QR Code ini kepada petugas penerima tamu di lokasi acara.</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 border bg-[#fcfaf7]" style={{ borderColor: "var(--v3-gold-pale)" }}>
                    {tokenValue ? <QRCodeSVG value={tokenValue} size={110} /> : <div className="w-[110px] h-[110px] flex items-center justify-center text-[10px]">QR Error</div>}
                  </div>
                  {!isExporting && (
                    <button onClick={downloadQrImage} className="text-[10px] uppercase tracking-tighter font-bold" style={{ color: "var(--v3-accent)" }}>Download Card</button>
                  )}
                </div>
              </div>
              <div className="px-8 py-3 flex justify-between items-center border-t" style={{ background: "#faf8f5", borderColor: "var(--v3-gold-pale)" }}>
                <span className="text-[8px] tracking-widest uppercase" style={{ color: "var(--v3-gold)" }}>Venue: {data.event.locationCity}</span>
                <span className="text-[8px] tracking-widest uppercase" style={{ color: "var(--v3-gold)" }}>{data.event.displayDate}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TOAST ═══ */}
      <AnimatePresence>
        {toast?.visible && (
          <motion.div
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            className="v3-toast"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--v3-rose); border-radius: 10px; }
        
        @media (max-width: 480px) {
          #v3-hero .v3-hero-names { font-size: 38px; }
        }
      `}</style>
    </div>
  );
}
