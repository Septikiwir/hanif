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

// --- ANIMATION VARIANTS ------------------------------------------------------

const fi: any = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }
  }
};

const fs: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }
  }
};

// --- COMPONENTS --------------------------------------------------------------

const Leaf = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 90C50 90 50 60 50 10" stroke="currentColor" strokeWidth="0.5" />
    <path d="M50 30C65 15 85 15 85 35C85 55 65 55 50 40" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
    <path d="M50 30C35 15 15 15 15 35C15 55 35 55 50 40" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
    <path d="M50 55C60 45 75 45 75 60C75 75 60 75 50 65" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
    <path d="M50 55C40 45 25 45 25 60C25 75 40 75 50 65" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);

const SectionEyebrow = ({ children }: { children: React.ReactNode }) => (
  <motion.span variants={fi} className="section-eyebrow">{children}</motion.span>
);

const Divider = () => (
  <motion.div variants={fi} className="divider">
    <div className="divider-gem" />
  </motion.div>
);

// --- MAIN TEMPLATE COMPONENT -------------------------------------------------

export default function TemplateV2({ data, slug }: { data: InvitationData; slug: string }) {
  const weddingDate = useMemo(() => new Date(data.event.date), [data.event.date]);
  const audioSrc = useMemo(() => data.media.music.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29"), [data.media.music]);

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

    // Trigger opening animations
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
    if (guestName !== "Tamu Undangan") { setRsvpName(guestName); setWishName(guestName); }
  }, [fetchWishes, fetchRSVPStats, guestName]);

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
    <div className="v2-theme">
      <audio ref={audioRef} src={audioSrc} loop />

      {/* Opening Screen (Matched to V1) */}
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
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={!isInvitationOpen ? "h-screen overflow-hidden" : ""}>

        {/* Floating Controls */}
        <div className="fixed bottom-6 right-6 z-[99] flex flex-col gap-3">
          <button onClick={() => setIsPlaying(!isPlaying)} className="floating-btn">
            {isPlaying ? (
              <svg viewBox="0 0 24 24"><path d="M11 5L6 9H2V15H6L11 19V5Z" /><path d="M19.07 4.93C20.94 6.8 22 9.3 22 12C22 14.7 20.94 17.2 19.07 19.07" /><path d="M15.54 8.46C16.41 9.33 16.91 10.58 16.91 12C16.91 13.42 16.41 14.67 15.54 15.54" /></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M11 5L6 9H2V15H6L11 19V5Z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            )}
          </button>
          {hasToken && (
            <button onClick={() => setShowQrModal(true)} className="floating-btn">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </button>
          )}
        </div>

        {/* Hero Section */}
        <section
          id="hero"
          className="reveal reveal-fade"
        >
          <Leaf className="leaf-corner hero-leaf-tr" />
          <Leaf className="leaf-corner hero-leaf-bl rotate-180" />

          <div className="hero-top">
            <motion.h1 variants={fi}>
              <span>{data.couple.bride.shortName} &amp;</span>
              <span>{data.couple.groom.shortName}</span>
            </motion.h1>
            <motion.span variants={fi} className="eyebrow">WEDDING DAY</motion.span>
          </div>

          <motion.div variants={fs} className="hero-img-wrap">
            <div className="hero-arch-img arch">
              <img src={data.media.openingPhoto || data.couple.bride.photo} className="w-full h-full object-cover" alt="Hero" />
            </div>
          </motion.div>

          <div className="hero-bottom">
            <motion.h2 variants={fi}>
              <span>{weddingDate.getDate()} {weddingDate.toLocaleString("id-ID", { month: "long" }).toUpperCase()}</span>
              <span>{weddingDate.getFullYear()}</span>
            </motion.h2>
            <motion.span variants={fi} className="loc">{data.event.locationCity}</motion.span>
          </div>

          <div className="hero-scroll">
            <span>Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-[1px] h-8 bg-[#8aaa7d]/40"
            />
          </div>
        </section>

        {/* Quote Banner */}
        <section
          id="quote-banner"
          className="reveal reveal-up"
        >
          <p>
            "{data.media.quote?.text || "Love doesn't consist in gazing at each other, but in looking outward together in the same direction."}"
          </p>
          <motion.span variants={fi} className="source">— {data.media.quote?.ref || "Anonymous"}</motion.span>
        </section>

        {/* Couple Section */}
        <section
          id="couple"
          className="reveal"
        >
          <div className="reveal reveal-up">
            <SectionEyebrow>Introducing</SectionEyebrow>
          </div>
          <h2 className="reveal reveal-up delay-1">The <em>Happy</em> Couple</h2>

          <div className="mt-14 mb-10 reveal reveal-up">
            <div className="couple-arch arch">
              <img src={data.couple.bride.photo} className="w-full h-full object-cover" alt="Bride" />
            </div>
            <motion.h3 variants={fi} className="couple-name">{data.couple.bride.fullName}</motion.h3>
            <motion.p variants={fi} className="couple-parents">
              {data.couple.bride.label || "Putri dari"}<br />
              <strong>{data.couple.bride.parents.father} &amp; {data.couple.bride.parents.mother}</strong>
            </motion.p>
            <motion.a variants={fi} href={data.couple.bride.instagram.url} target="_blank" className="btn btn-outline-sage">
              @{data.couple.bride.instagram.username}
            </motion.a>
          </div>

          <div className="couple-divider">
            <div className="couple-divider-line" />
            <span className="mx-4 text-[#8aaa7d] serif italic text-xl">&amp;</span>
            <div className="couple-divider-line" />
          </div>

          <div className="mt-10 reveal reveal-up">
            <div className="couple-arch arch">
              <img src={data.couple.groom.photo} className="w-full h-full object-cover" alt="Groom" />
            </div>
            <h3 className="couple-name">{data.couple.groom.fullName}</h3>
            <p className="couple-parents">
              {data.couple.groom.label || "Putra dari"}<br />
              <strong>{data.couple.groom.parents.father} &amp; {data.couple.groom.parents.mother}</strong>
            </p>
            <a href={data.couple.groom.instagram.url} target="_blank" className="btn btn-outline-sage">
              @{data.couple.groom.instagram.username}
            </a>
          </div>
        </section>

        {/* Collage Section */}
        <section
          id="collage"
          className="reveal"
        >
          <div className="head reveal reveal-up">
            <SectionEyebrow>The Gallery</SectionEyebrow>
            <h2>Our Captured Moments</h2>
          </div>

          <div className="collage-grid reveal reveal-scale">
            <motion.div variants={fs} className="c1"><img src={data.media.gallery[0]?.src} className="w-full h-full object-cover" alt="G1" /></motion.div>
            <motion.div variants={fs} className="c2"><img src={data.media.gallery[1]?.src} className="w-full h-full object-cover" alt="G2" /></motion.div>
            <motion.div variants={fs} className="c3"><img src={data.media.gallery[2]?.src} className="w-full h-full object-cover" alt="G3" /></motion.div>
          </div>

          <div className="collage-quote">
            <motion.p variants={fi}>"Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day."</motion.p>
            <motion.span variants={fi}>— Forever &amp; Always</motion.span>
          </div>
        </section>

        {/* Events Section */}
        <section
          id="events"
          className="reveal"
        >
          <div className="event-block reveal reveal-up">
            <SectionEyebrow>Save The Date</SectionEyebrow>
            <h2 className="event-title">Akad Nikah</h2>
            <div className="event-date-time">
              {data.event.day}, {data.event.displayDate}<br />
              Pukul {data.event.akad.time} WIB
            </div>
            <motion.div variants={fi} className="event-address">
              <strong>{data.event.locationName}</strong><br />
              {data.event.locationCity}
            </motion.div>
            <motion.a variants={fi} href={data.event.mapsUrl} target="_blank" className="btn btn-outline-light">
              Google Maps
            </motion.a>
          </div>

          <div className="event-sep" />

          <div className="event-block reveal reveal-up">
            <SectionEyebrow>The Reception</SectionEyebrow>
            <h2 className="event-title">Resepsi</h2>
            <div className="event-date-time">
              {data.event.day}, {data.event.displayDate}<br />
              Pukul {data.event.resepsi.time} WIB
            </div>
            <motion.div variants={fi} className="event-address">
              <strong>{data.event.locationName}</strong><br />
              {data.event.locationCity}
            </motion.div>
            <motion.a variants={fi} href={data.event.mapsUrl} target="_blank" className="btn btn-outline-light">
              Google Maps
            </motion.a>
          </div>

          <div className="event-sep" />

          {/* RSVP Form */}
          <div className="rsvp-block reveal reveal-up">
            <h2 className="rsvp-title">R.S.V.P</h2>
            <p className="rsvp-subtitle">Mohon konfirmasi kehadiran Anda melalui form di bawah ini</p>

            <form onSubmit={handleRSVPSubmit} className="rsvp-form">
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
              <button disabled={isSubmittingRSVP} type="submit" className="btn btn-sage w-full py-4">
                {isSubmittingRSVP ? "Mengirim..." : "Kirim Konfirmasi"}
              </button>
            </form>

            <motion.div variants={fi} className="mt-8 flex justify-center gap-10 opacity-50">
              <div className="text-center">
                <span className="block text-white serif text-2xl">{rsvpStats.hadir}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#8aaa7d]">Hadir</span>
              </div>
              <div className="text-center">
                <span className="block text-white serif text-2xl">{rsvpStats.tidakHadir}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#8aaa7d]">Berhalangan</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section
          id="story"
          className="reveal"
        >
          <div className="story-head reveal reveal-up">
            <SectionEyebrow>Our Journey</SectionEyebrow>
            <h2>Story of Us</h2>
          </div>

          <div className="story-main-arch arch reveal reveal-scale">
            <img src={data.media.gallery[3]?.src || data.media.openingPhoto} className="w-full h-full object-cover" alt="Story" />
          </div>

          <div className="timeline mt-16 reveal reveal-up">
            {data.media.story.map((item, idx) => (
              <motion.div key={idx} variants={fi} className="tl-item">
                <div className="tl-content">
                  <span className="tl-year">{item.year || "2024"}</span>
                  <h3 className="tl-heading">{item.title || "The Beginning"}</h3>
                  <p className="tl-body">{item.subtitle}</p>
                </div>
                <div className="tl-dot" />
                <div className="tl-spacer" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Wishes Section */}
        <section
          id="wishes"
          className="reveal reveal-up"
        >
          <h2>Digital Wishes</h2>
          <p className="sub-text">Berikan doa restu Anda untuk kebahagiaan kami</p>

          <div className="wish-box">
            <form onSubmit={handleWishesSubmit} className="wish-form">
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
              <button disabled={isSubmittingWishes} type="submit" className="btn btn-sage w-full">
                {isSubmittingWishes ? "Mengirim..." : "Kirim Ucapan"}
              </button>
            </form>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {wishes.map((w) => (
                <motion.div key={w.id} variants={fi} className="wish-card">
                  <div className="wish-header">
                    <div className="wish-avatar">{w.name.charAt(0)}</div>
                    <div>
                      <h4 className="wish-name">{w.name}</h4>
                      <span className="wish-date">{new Date(w.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}</span>
                    </div>
                  </div>
                  <p className="wish-text">"{w.message}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Love Gift Section */}
        <section
          id="gift"
          className="reveal reveal-up"
        >
          <h2>Love Gift</h2>
          <p className="sub">Tanpa mengurangi rasa hormat, bagi Anda yang ingin memberikan tanda kasih untuk kami, dapat melalui:</p>

          <div className="gift-cards">
            {data.payment.map((p, idx) => {
              const isAddress = p.bank.toLowerCase().includes("alamat") || p.bank.toLowerCase().includes("shipping");

              if (isAddress) {
                return (
                  <motion.div key={idx} variants={fi} className="gift-address-card">
                    <p className="label">Atau kirim hadiah fisik ke:</p>
                    <div className="address-text">
                      {p.accountNumber || p.address}
                    </div>
                    <p className="holder">a.n {p.holderName}</p>
                    <button
                      onClick={() => copyToClipboard(p.accountNumber || p.address || "")}
                      className="btn btn-outline-sage mt-6 py-2 px-6 text-[11px]"
                    >
                      Salin Alamat
                    </button>
                  </motion.div>
                );
              }

              return (
                <motion.div key={idx} variants={fi} className="gift-card">
                  <div className="gift-icon">
                    <svg viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <div className="flex-1">
                    <span className="gift-bank">{p.bank}</span>
                    <div className="gift-num">{p.accountNumber || p.address}</div>
                    <span className="gift-holder">a.n {p.holderName}</span>
                  </div>
                  <button onClick={() => copyToClipboard(p.accountNumber || p.address || "")} className="gift-copy-btn">
                    <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Moment Section */}
        <section
          id="moment"
          className="reveal"
        >
          <div className="reveal reveal-up">
            <h2>Our Moments</h2>
            <p className="moment-tagline">A glimpse of our happiness</p>
          </div>

          <div className="video-wrap reveal reveal-scale">
            <video src={data.media.galleryVideo} className="w-full h-full object-cover" autoPlay muted loop playsInline />
          </div>

          <div className="moment-grid-2 reveal reveal-up">
            <motion.div variants={fs}><img src={data.media.gallery[4]?.src} className="w-full h-full object-cover" alt="M1" /></motion.div>
            <motion.div variants={fs}><img src={data.media.gallery[5]?.src} className="w-full h-full object-cover" alt="M2" /></motion.div>
          </div>

          <div className="moment-grid-4 reveal reveal-up">
            <motion.div variants={fs}><img src={data.media.gallery[0]?.src} className="w-full h-full object-cover" alt="M3" /></motion.div>
            <motion.div variants={fs}><img src={data.media.gallery[1]?.src} className="w-full h-full object-cover" alt="M4" /></motion.div>
            <motion.div variants={fs}><img src={data.media.gallery[2]?.src} className="w-full h-full object-cover" alt="M5" /></motion.div>
            <motion.div variants={fs}><img src={data.media.gallery[3]?.src} className="w-full h-full object-cover" alt="M6" /></motion.div>
          </div>
        </section>

        {/* Countdown Section */}
        <section id="countdown" className="reveal">
          <SectionEyebrow>Counting Down</SectionEyebrow>
          <motion.h2 initial="hidden" whileInView="visible" variants={fi} className="cd-title">Till The Big Day</motion.h2>

          <div className="cd-grid reveal reveal-up">
            <div className="text-center">
              <span className="cd-num">{countdown.days}</span>
              <span className="cd-unit">Days</span>
            </div>
            <span className="cd-sep">:</span>
            <div className="text-center">
              <span className="cd-num">{countdown.hours}</span>
              <span className="cd-unit">Hours</span>
            </div>
            <span className="cd-sep">:</span>
            <div className="text-center">
              <span className="cd-num">{countdown.mins}</span>
              <span className="cd-unit">Mins</span>
            </div>
            <span className="cd-sep">:</span>
            <div className="text-center">
              <span className="cd-num">{countdown.secs}</span>
              <span className="cd-unit">Secs</span>
            </div>
          </div>
        </section>

        {/* Closing Section */}
        <section
          id="closing"
          className="reveal"
        >

          <div className="closing-arch arch reveal reveal-scale my-10">
            <img src={data.couple.groom.photo} className="w-full h-full object-cover" alt="Closing" />
          </div>

          <p className="closing-note reveal reveal-up">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
          </p>

          <Divider />

          <div className="footer-credit reveal reveal-up">
            <p>The Wedding of</p>
            <h4 className="serif italic text-2xl my-2">{data.couple.bride.shortName} &amp; {data.couple.groom.shortName}</h4>
            <div className="nimantra-credit">
              <img src="/Nimantra S - Gold.png" alt="Nimantra Monogram" className="reveal reveal-fade" style={{ height: "32px", width: "auto", margin: "0 auto 16px", display: "block", objectFit: "contain", opacity: 0.8 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
                <p className="credit-title" style={{ marginBottom: 0 }}>Invitation by</p>
                <img src="/Nimantra L - Gold.png" alt="Nimantra Logo" className="reveal reveal-fade" style={{ height: "18px", width: "auto", objectFit: "contain", opacity: 0.8 }} />
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

      {/* QR Modal */}
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

              <div className="h-24 bg-[#3d5c35] relative flex items-center justify-center px-6">
                <div className="text-center text-white">
                  <span className="text-[7px] tracking-[4px] uppercase opacity-60">Digital Invitation</span>
                  <h5 className="serif italic text-xl mt-1">{data.couple.bride.shortName} &amp; {data.couple.groom.shortName}</h5>
                </div>
              </div>

              <div className="p-8 flex items-center gap-8">
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#8aaa7d] block mb-2">Guest Name</span>
                  <h6 className="serif text-xl italic text-[#3d2e22]">{guestName}</h6>
                  <div className="w-10 h-[1px] bg-[#c4b499] my-4" />
                  <p className="text-[10px] text-[#8aaa7d] leading-relaxed">Silakan tunjukkan QR Code ini kepada petugas penerima tamu di lokasi acara.</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 border border-[#ede5d4] bg-[#fcfaf7]">
                    {tokenValue ? <QRCodeSVG value={tokenValue} size={110} /> : <div className="w-[110px] h-[110px] flex items-center justify-center text-[10px]">QR Error</div>}
                  </div>
                  {!isExporting && (
                    <button onClick={downloadQrImage} className="text-[10px] uppercase tracking-tighter text-[#3d5c35] font-bold">Download Card</button>
                  )}
                </div>
              </div>
              <div className="bg-[#fcfaf7] px-8 py-3 flex justify-between items-center border-t border-[#ede5d4]">
                <span className="text-[8px] tracking-widest text-[#c4b499] uppercase">Venue: {data.event.locationCity}</span>
                <span className="text-[8px] tracking-widest text-[#c4b499] uppercase">{data.event.displayDate}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast?.visible && (
          <motion.div
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            className="toast show"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #8aaa7d; border-radius: 10px; }
        
        @media (max-width: 480px) {
          #hero h1 { font-size: 38px; }
          #hero h2 { font-size: 28px; }
        }
      `}</style>
    </div>
  );
}
