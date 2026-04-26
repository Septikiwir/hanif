"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type CountdownState = {
  days: string;
  hours: string;
  mins: string;
  secs: string;
  done: boolean;
};

export default function Home() {
  const weddingDate = useMemo(() => new Date("2026-05-17T00:00:00+07:00"), []);
  const audioSrc = useMemo(
    () =>
      encodeURI(
        "/KICAU MANIA - NDARBOY GENK x BANDITOZ YAOW 86 (OFFICIAL LYRIC VIDEO) GAS POL NDANGAK.mp3"
      ),
    []
  );

  const [guestName, setGuestName] = useState("Tamu Undangan");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("to") ?? sp.get("tamu") ?? sp.get("guest") ?? sp.get("nama");
    const cleaned = (raw ?? "").replace(/\s+/g, " ").trim();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestName(cleaned ? cleaned.slice(0, 60) : "Tamu Undangan");
  }, []);

  const galleryImages = useMemo(
    () => [
      "https://picsum.photos/seed/hanif-Fizah-01/900/1200",
      "https://picsum.photos/seed/hanif-Fizah-02/900/1200",
      "https://picsum.photos/seed/hanif-Fizah-03/900/1200",
      "https://picsum.photos/seed/hanif-Fizah-04/900/1200",
      "https://picsum.photos/seed/hanif-Fizah-05/900/1200",
      "https://picsum.photos/seed/hanif-Fizah-06/900/1200",
    ],
    []
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
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

  const goPrev = () => {
    setCarouselIndex((idx) =>
      (idx - 1 + galleryImages.length) % galleryImages.length
    );
  };

  const goNext = () => {
    setCarouselIndex((idx) => (idx + 1) % galleryImages.length);
  };

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal")
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
      {!isInvitationOpen && (
        <section className="opening-screen" aria-label="Opening Screen">
          <div className="screen">
            <div className="bg-photo" />

            {/* Decorative ornaments */}
            <svg
              className="ornament ornament-tl"
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 4 L4 28 M4 4 L28 4" stroke="white" strokeWidth="1" />
              <path d="M4 4 L18 18" stroke="white" strokeWidth="0.5" />
              <circle cx="4" cy="4" r="2" fill="white" />
              <circle cx="28" cy="4" r="1.2" fill="white" />
              <circle cx="4" cy="28" r="1.2" fill="white" />
            </svg>
            <svg
              className="ornament ornament-tr"
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 4 L4 28 M4 4 L28 4" stroke="white" strokeWidth="1" />
              <path d="M4 4 L18 18" stroke="white" strokeWidth="0.5" />
              <circle cx="4" cy="4" r="2" fill="white" />
              <circle cx="28" cy="4" r="1.2" fill="white" />
              <circle cx="4" cy="28" r="1.2" fill="white" />
            </svg>

            <div className="overlay" />

            <div className="content">
              <p className="wedding-of">The Wedding Of</p>
              <h1 className="names">
                Fizah <span className="ampersand">&amp;</span> Hanif
              </h1>
              <div className="divider" />
              <p className="kepada">
                Kepada Yth.
                <br />
                Bapak / Ibu / Saudara/i
              </p>
              <p className="tamu">{guestName}</p>
              <p className="note">
                *Mohon maaf jika ada kesalahan dalam penulisan nama / gelar.
              </p>
              <button
                className="btn"
                type="button"
                onClick={() => {
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
        </section>
      )}

      <main>
        {/* ─── HERO ─── */}
        <header className="hero">
          <video
            className="hero-video"
            src="/WhatsApp%20Video%202026-04-26%20at%2011.32.00.mp4"
            ref={heroVideoRef}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="overlay" />

          <div className="content">
            <p className="wedding-of">The Wedding Of</p>
            <h1 className="names">
              Fizah <span className="amp">&amp;</span> Hanif
            </h1>
            <p className="date">Minggu · 17 Mei 2026 · Ketapang</p>
          </div>

          <div className="countdown-bar" aria-label="Hitung mundur">
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
        </header>

        {/* ─── QUOTE ─── */}
        <section className="quote-section">
          <svg
            className="quote-flower"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.6">
              <ellipse cx="32" cy="18" rx="6" ry="14" fill="#B8923A" opacity="0.7" />
              <ellipse
                cx="32"
                cy="18"
                rx="6"
                ry="14"
                fill="#B8923A"
                opacity="0.7"
                transform="rotate(45 32 32)"
              />
              <ellipse
                cx="32"
                cy="18"
                rx="6"
                ry="14"
                fill="#B8923A"
                opacity="0.7"
                transform="rotate(90 32 32)"
              />
              <ellipse
                cx="32"
                cy="18"
                rx="6"
                ry="14"
                fill="#B8923A"
                opacity="0.7"
                transform="rotate(135 32 32)"
              />
              <circle cx="32" cy="32" r="7" fill="#D4AD68" />
              <circle cx="32" cy="32" r="4" fill="#EDD9A3" />
            </g>
          </svg>

          <blockquote className="reveal">
            <span className="quote-mark">&quot;</span>
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
        <section className="intro-section" style={{ padding: 0, background: '#f8f6f2' }}>
          <div style={{ padding: '72px 36px', textAlign: 'center' }}>
            <div className="ornament-center reveal">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5Z"
                  fill="#B8923A"
                  opacity="0.8"
                />
              </svg>
            </div>

            <p className="intro-lead reveal" style={{ marginBottom: 0 }}>
              Dengan memohon Rahmat dan Ridho Allah Subhanahu Wa Ta&apos;ala, kami
              mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan kami
            </p>
          </div>

          <div className="v4-card reveal">
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
              <div className="v4-ig">
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                NUR_HAFIZAH
              </div>
            </div>
          </div>

          <div className="v4-card reveal">
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
              <div className="v4-ig">
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                HANIF_ASSALAM
              </div>
            </div>
          </div>
        </section>

        {/* ─── EVENTS ─── */}
        <section className="event-section">
          <div className="section-heading reveal">
            <span className="section-label">Rangkaian Acara</span>
            <h2 className="section-title">Menuju Hari Bahagia</h2>
          </div>

          <article className="event-card reveal reveal-delay-1">
            <p className="event-type">— I —</p>
            <h3 className="event-name">Akad Nikah</h3>
            <div className="event-details">
              <strong>Minggu, 17 Mei 2026</strong>
              <br />
              Pukul 09.00 WIB — Selesai
              <br />
              <br />
              Gedung Pancasila
              <br />
              Kabupaten Ketapang
            </div>
            <a href="#" className="event-btn">
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

          <div
            style={{ textAlign: "center", padding: "8px 0", opacity: 0.4 }}
          >
            <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
              <circle cx="4" cy="6" r="2" fill="#B8923A" />
              <circle cx="16" cy="6" r="3" fill="#B8923A" />
              <circle cx="28" cy="6" r="2" fill="#B8923A" />
            </svg>
          </div>

          <article className="event-card reveal reveal-delay-2">
            <p className="event-type">— II —</p>
            <h3 className="event-name">Resepsi</h3>
            <div className="event-details">
              <strong>Minggu, 17 Mei 2026</strong>
              <br />
              Pukul 11.00 WIB — Selesai
              <br />
              <br />
              Gedung Pancasila
              <br />
              Kabupaten Ketapang
            </div>
            <a href="#" className="event-btn">
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

        {/* ─── COUNTDOWN ─── */}
        <section className="countdown-section">
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.04,
            }}
            viewBox="0 0 430 300"
            preserveAspectRatio="xMidYMid slice"
          >
            <g fill="none" stroke="#EDD9A3" strokeWidth="0.5">
              <path d="M0,150 Q107,50 215,150 Q322,250 430,150" />
              <path d="M0,180 Q107,80 215,180 Q322,280 430,180" />
              <path d="M0,120 Q107,20 215,120 Q322,220 430,120" />
            </g>
          </svg>

          <p className="countdown-label reveal">Hitung Mundur Menuju Hari Bahagia</p>

          {!countdown.done ? (
            <div className="countdown-grid reveal" id="countdown">
              <div className="countdown-unit">
                <span className="countdown-number">{countdown.days}</span>
                <span className="countdown-name">Hari</span>
              </div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit">
                <span className="countdown-number">{countdown.hours}</span>
                <span className="countdown-name">Jam</span>
              </div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit">
                <span className="countdown-number">{countdown.mins}</span>
                <span className="countdown-name">Menit</span>
              </div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit">
                <span className="countdown-number">{countdown.secs}</span>
                <span className="countdown-name">Detik</span>
              </div>
            </div>
          ) : (
            <p className="countdown-done" id="cd-done">
              Hari yang dinantikan telah tiba ✦
            </p>
          )}
        </section>

        {/* ─── LIVE STREAM ─── */}
        <section className="livestream-section">
          <div className="section-heading reveal">
            <span className="section-label">Saksikan Bersama</span>
            <h2 className="section-title">Live Streaming</h2>
          </div>

          <div className="livestream-card reveal reveal-delay-1">
            <div className="live-badge">
              <span className="live-dot" />
              Live
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-mid)",
                lineHeight: 1.9,
                marginBottom: "1.5rem",
              }}
            >
              Saksikan pernikahan kami secara virtual yang disiarkan langsung
              melalui media sosial kami.
            </p>
            <div
              style={{
                fontFamily: "var(--font-cormorant-sc), serif",
                fontSize: 12,
                letterSpacing: "0.1em",
                color: "var(--text-dark)",
                marginBottom: "1.5rem",
                lineHeight: 2,
              }}
            >
              Minggu, 17 Mei 2026
              <br />
              Pukul 08.45 WIB
            </div>
            <a href="#" className="event-btn" style={{ display: "inline-flex" }}>
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
          <div className="section-heading reveal">
            <span className="section-label">Kenangan</span>
            <h2 className="section-title">Photo Gallery</h2>
          </div>

          <div className="gallery-wrap">
            <div
              className="carousel reveal reveal-delay-1"
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(e) => {
                const startX = touchStartX.current;
                const endX = e.changedTouches[0]?.clientX ?? null;
                touchStartX.current = null;

                if (startX == null || endX == null) return;
                const delta = endX - startX;
                const threshold = 50;
                if (Math.abs(delta) < threshold) return;
                if (delta > 0) goPrev();
                else goNext();
              }}
            >
              <div className="carousel-media">
                <Image
                  src={galleryImages[carouselIndex]}
                  alt={`Carousel photo ${carouselIndex + 1}`}
                  fill
                  sizes="(max-width: 430px) 100vw, 430px"
                  className="carousel-img"
                  priority
                />
              </div>

              <button
                type="button"
                className="carousel-arrow carousel-arrow-left"
                aria-label="Previous photo"
                onClick={goPrev}
              >
                ←
              </button>
              <button
                type="button"
                className="carousel-arrow carousel-arrow-right"
                aria-label="Next photo"
                onClick={goNext}
              >
                →
              </button>
            </div>

            <div className="gallery-grid reveal reveal-delay-2">
              {galleryImages.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  className="gallery-thumb"
                  aria-label={`Open photo ${idx + 1}`}
                  onClick={() => setCarouselIndex(idx)}
                >
                  <Image
                    src={src}
                    alt={`Gallery photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 430px) 33vw, 140px"
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

          <div className="gift-icon-wrap reveal reveal-delay-1">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B8923A"
              strokeWidth="1.2"
            >
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <p className="gift-note reveal reveal-delay-2">
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Jika
            ingin memberikan hadiah, Anda dapat mengirimkan secara cashless.
          </p>

          <button
            className="event-btn reveal reveal-delay-3"
            style={{ borderColor: "var(--burgundy)", color: "var(--burgundy)" }}
            type="button"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="8" width="18" height="13" rx="2" />
              <path d="M1 8h22M8 8V6a4 4 0 118 0v2" />
            </svg>
            Kirim Hadiah
          </button>
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
            <div className="wishes-heading reveal">
              <h2 className="wishes-title">Wishes</h2>
              <p className="wishes-subtitle">
                Berikan ucapan &amp; doa untuk kedua mempelai
              </p>
            </div>

            <div className="rsvp-stats reveal reveal-delay-1">
              <div className="rsvp-stat rsvp-hadir">
                <span className="rsvp-number">9</span>
                <span className="rsvp-label">Hadir</span>
              </div>
              <div className="rsvp-stat rsvp-tidak">
                <span className="rsvp-number">11</span>
                <span className="rsvp-label">Tidak Hadir</span>
              </div>
            </div>

            <form
              className="wishes-form reveal reveal-delay-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="text" placeholder="Nama Anda" />
              <textarea rows={3} placeholder="Tuliskan ucapan & doa Anda…" />
              <select defaultValue="">
                <option value="" disabled>
                  — Konfirmasi Kehadiran —
                </option>
                <option>Hadir</option>
                <option>Tidak Hadir</option>
              </select>
              <button type="button" className="btn-gold">
                Kirim Ucapan
              </button>
            </form>

            <div className="comment-list reveal reveal-delay-3">
              <p
                style={{
                  fontFamily: "var(--font-cormorant-sc), serif",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "rgba(237,217,163,0.5)",
                  marginBottom: "1rem",
                }}
              >
                24 Ucapan
              </p>

              <div className="comment-item">
                <p className="comment-name">Moh Nasir dan keluarga</p>
                <p className="comment-text">
                  Selamat bang Hanif... samawa, cepat dapat momongan 😘
                </p>
                <p className="comment-meta">3 minggu, 6 hari lalu</p>
              </div>

              <div className="comment-item">
                <p className="comment-name">Annisa Dwi MR</p>
                <p className="comment-text">
                  Selamat menempuh perjalanan baru Fizah dan Hanif. Semoga selalu
                  dilancarkan, happily ever after ✨
                </p>
                <p className="comment-meta">4 minggu, 1 hari lalu</p>
              </div>

              <div className="comment-item">
                <p className="comment-name">Keluarga Besar Hermawan</p>
                <p className="comment-text">
                  Barakallahu lakuma wa baraka &apos;alaikuma wa jama&apos;a bainakuma
                  fii khair. Aamiin.
                </p>
                <p className="comment-meta">1 bulan lalu</p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginTop: "2rem",
                fontFamily: "var(--font-cormorant-sc), serif",
                fontSize: 11,
                letterSpacing: "0.15em",
                color: "rgba(237,217,163,0.5)",
              }}
            >
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                ← Prev
              </button>
              <span style={{ color: "var(--gold-pale)" }}>1</span>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                2
              </button>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                3
              </button>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="footer-section">
          <div className="footer-monogram reveal">
            <span className="footer-monogram-text">Ho</span>
          </div>

          <span className="gold-line" />

          <p className="footer-note reveal reveal-delay-1">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
            Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
          </p>

          <p className="footer-byline reveal reveal-delay-2">Kami yang berbahagia,</p>
          <h2 className="footer-names reveal reveal-delay-3">Fizah &amp; Hanif</h2>

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
    </>
  );
}
