"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./page.module.css";

/* ─ Theme data ─ */
const themes = [
  { id: 1, name: "Spesial 01", type: "Spesial Foto", cat: "foto", bg: styles.bgTc1, badge: "Terlaris", old: "Rp 210.000", price: "Rp 132.000" },
  { id: 2, name: "Spesial 02", type: "Spesial Foto", cat: "foto", bg: styles.bgTc2, badge: "", old: "Rp 210.000", price: "Rp 132.000" },
  { id: 3, name: "Spesial 03", type: "Spesial Foto", cat: "foto", bg: styles.bgTc3, badge: "", old: "Rp 210.000", price: "Rp 132.000" },
  { id: 4, name: "Spesial 04", type: "Spesial Foto", cat: "foto", bg: styles.bgTc4, badge: "", old: "Rp 210.000", price: "Rp 132.000" },
  { id: 5, name: "Spesial 05", type: "Spesial Foto", cat: "foto", bg: styles.bgTc5, badge: "", old: "Rp 210.000", price: "Rp 132.000" },
  { id: 6, name: "Spesial 06", type: "Spesial Foto", cat: "foto", bg: styles.bgTc6, badge: "", old: "Rp 210.000", price: "Rp 132.000" },
  { id: 7, name: "Minimalis Luxury 01", type: "Minimalis Luxury Foto", cat: "luxury", bg: styles.bgTc7, badge: "Baru", old: "Rp 210.000", price: "Rp 132.000" },
  { id: 8, name: "Minimalis Luxury 02", type: "Minimalis Luxury Foto", cat: "luxury", bg: styles.bgTc8, badge: "", old: "Rp 210.000", price: "Rp 132.000" },
  { id: 9, name: "Premium Vintage 01", type: "Premium Vintage Foto", cat: "vintage", bg: styles.bgTc2, badge: "", old: "Rp 210.000", price: "Rp 132.000" },
  { id: 10, name: "Adat Jawa 01", type: "Adat Foto", cat: "adat", bg: styles.bgTc1, badge: "", old: "Rp 210.000", price: "Rp 132.000" },
];

const couples = ["Laila & Rama", "Nisa & Fauzi", "Wulan & Arif", "Sari & Bagas"];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredThemes, setFilteredThemes] = useState(themes);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealVisible);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(`.${styles.reveal}`).forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? "hidden" : "";
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "";
  };

  const handleFilter = (cat: string) => {
    setActiveFilter(cat);
    if (cat === "all") {
      setFilteredThemes(themes);
    } else {
      setFilteredThemes(themes.filter((t) => t.cat === cat));
    }
  };

  const orderTheme = (name: string) => {
    const msg = `Halo! Saya tertarik dengan tema *${name}*. Boleh minta info lebih lanjut?`;
    window.open(`https://wa.me/628123456789?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className={styles.landingRoot}>
      {/* ─── NAV ─────────────────────────────────────── */}
      <nav className={`${styles.nav} ${isScrolled ? styles.navScrolled : ""}`}>
        <div className={styles.navInner}>
          <a href="#" className={styles.navLogo}>
            <div className={styles.navLogoIcon}>✦</div>
            Nimara<span>.id</span>
          </a>
          <ul className={styles.navLinks}>
            <li><a href="#fitur">Fitur</a></li>
            <li><a href="#katalog">Katalog</a></li>
            <li><a href="#cara-pesan">Cara Pesan</a></li>
            <li><a href="#testimoni">Testimoni</a></li>
            <li><a href="#kontak">Kontak</a></li>
          </ul>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a href="https://wa.me/628123456789" className={styles.navCta}>💬 Pesan Sekarang</a>
            <button
              className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ""}`}
              onClick={toggleMenu}
              aria-label="Menu"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ""}`}>
        <a href="#fitur" onClick={closeMenu}>Fitur</a>
        <a href="#katalog" onClick={closeMenu}>Katalog Tema</a>
        <a href="#cara-pesan" onClick={closeMenu}>Cara Pesan</a>
        <a href="#testimoni" onClick={closeMenu}>Testimoni</a>
        <a href="#kontak" onClick={closeMenu}>Kontak</a>
        <a href="https://wa.me/628123456789" className={styles.mobileMenuCta}>💬 Pesan Sekarang via WhatsApp</a>
      </div>

      {/* ─── HERO ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}></div>
        <div className={`${styles.heroBlob} ${styles.heroBlob1}`}></div>
        <div className={`${styles.heroBlob} ${styles.heroBlob2}`}></div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <div className={styles.badgeDot}></div>
            Dipercaya 4.000+ Pasangan di Seluruh Indonesia
          </div>
          <h1 className={styles.heroTitle}>Undangan<br />Pernikahan <em>Digital</em><br />Premium</h1>
          <p className={styles.heroSub}>
            Abadikan momen terindah dengan undangan digital elegan. Desain premium, pengerjaan cepat, dan revisi tanpa batas hingga hari H.
          </p>
          <div className={styles.heroActions}>
            <a href="#katalog" className={styles.btnPrimary}>Lihat Katalog →</a>
            <a href="#cara-pesan" className={styles.btnGhost}>
              Cara Pesan
              <span className={styles.ghostCircle}>↓</span>
            </a>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <div className={styles.statNum}>4K<sup>+</sup></div>
              <div className={styles.statLabel}>Pasangan Puas</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.statNum}>&lt;24<sup>j</sup></div>
              <div className={styles.statLabel}>Waktu Pengerjaan</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.statNum}>10<sup>+</sup></div>
              <div className={styles.statLabel}>Pilihan Tema</div>
            </div>
          </div>
        </div>

        {/* Phone preview — desktop only */}
        <div className={styles.heroPhoneWrap}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "flex-end" }}>
            <div className={styles.floatBadge}>
              <div className={styles.fbIcon}>✓</div>
              <div>
                <div>Selesai dalam 24 jam</div>
                <div className={styles.fbSub}>Garansi tepat waktu</div>
              </div>
            </div>
            <div className={styles.floatBadge}>
              <div className={styles.fbIcon}>⭐</div>
              <div>
                <div>Rating 5.0</div>
                <div className={styles.fbSub}>320+ ulasan Google</div>
              </div>
            </div>
            <div className={`${styles.phoneCard} ${styles.phoneCard2}`}>
              <div className={`${styles.phoneScreen} ${styles.ps2}`}>
                <div className={styles.phoneFlower}>🌸</div>
                <div className={styles.phoneNames}>Hana<span className={styles.phoneAmp}>&amp;</span>Raka</div>
                <div className={styles.phoneDate}>12 · 04 · 2025</div>
              </div>
            </div>
          </div>
          <div className={styles.phoneCard}>
            <div className={`${styles.phoneScreen} ${styles.ps1}`}>
              <div className={styles.phoneFlower}>🌺</div>
              <div className={styles.phoneNames}>Aisha<span className={styles.phoneAmp}>&amp;</span>Bagas</div>
              <div className={styles.phoneDate}>08 · 06 · 2025</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionWhite}`} id="fitur">
        <div className={styles.reveal}>
          <div className={styles.eyebrow}>Kenapa Kami?</div>
          <h2 className={styles.sectionTitle}>Fitur <em>Terlengkap</em><br />untuk Momen Spesialmu</h2>
          <p className={styles.sectionDesc}>Kami menyediakan layanan terbaik agar undangan pernikahanmu berkesan dan mudah dikelola.</p>
        </div>

        <div className={`${styles.featuresGrid} ${styles.reveal}`}>
          <div className={styles.featureItem}>
            <div className={styles.featIcon}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </div>
            <div className={styles.featTitle}>Pengerjaan &lt; 24 Jam</div>
            <div className={styles.featDesc}>Undanganmu siap dikirimkan dalam waktu kurang dari 24 jam setelah order dikonfirmasi.</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featIcon}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </div>
            <div className={styles.featTitle}>Revisi Sampai Hari H</div>
            <div className={styles.featDesc}>Tidak perlu khawatir, kami melayani revisi tanpa batas hingga hari pernikahanmu tiba.</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featIcon}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            </div>
            <div className={styles.featTitle}>Tamu Tak Terbatas</div>
            <div className={styles.featDesc}>Tambahkan nama tamu sebanyak yang kamu mau tanpa biaya tambahan apapun.</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featIcon}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
            </div>
            <div className={styles.featTitle}>Request Musik Bebas</div>
            <div className={styles.featDesc}>Pilih musik latar favoritmu untuk menemani tamu membuka undangan digitalmu.</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featIcon}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </div>
            <div className={styles.featTitle}>Desain Premium</div>
            <div className={styles.featDesc}>Setiap template dirancang oleh desainer profesional dengan estetika modern dan elegan.</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featIcon}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div className={styles.featTitle}>Kualitas Terjamin</div>
            <div className={styles.featDesc}>Lebih dari 4.000 pasangan telah mempercayakan undangan spesial mereka kepada kami.</div>
          </div>
        </div>
      </section>

      {/* ─── CATALOG ───────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionCream}`} id="katalog">
        <div className={styles.catalogHeader}>
          <div className={styles.reveal}>
            <div className={styles.eyebrow}>Koleksi Tema</div>
            <h2 className={styles.sectionTitle}>Pilihan <em>Tema</em><br />Eksklusif</h2>
            <p className={styles.sectionDesc}>Temukan tema yang paling mencerminkan kepribadian dan gaya pernikahanmu.</p>
          </div>
        </div>

        <div className={`${styles.themeTabs} ${styles.reveal}`}>
          {["all", "foto", "tanpa-foto", "luxury", "vintage", "adat"].map((cat) => (
            <button
              key={cat}
              className={`${styles.tabBtn} ${activeFilter === cat ? styles.tabBtnActive : ""}`}
              onClick={() => handleFilter(cat)}
            >
              {cat === "all" ? "Semua" : cat.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")}
            </button>
          ))}
        </div>

        <div className={styles.themesGrid} id="themesGrid">
          {filteredThemes.map((t, i) => (
            <div className={styles.themeCard} key={t.id}>
              <div className={`${styles.tcVisual} ${t.bg}`}>
                {t.badge ? (
                  <div className={`${styles.tcBadge} ${t.badge === "Baru" ? styles.tcBadgeNew : ""}`}>
                    {t.badge}
                  </div>
                ) : null}
                <div className={styles.tcPhone}>
                  <div className={`${styles.tcPhoneScreen} ${t.bg}`}>
                    <div style={{ fontSize: "13px", marginBottom: "4px" }}>✦</div>
                    <div>{couples[i % 4]}</div>
                    <div style={{ opacity: ".65", fontSize: "7px", marginTop: "4px" }}>2025</div>
                  </div>
                </div>
              </div>
              <div className={styles.tcBody}>
                <div className={styles.tcName}>{t.name}</div>
                <div className={styles.tcType}>{t.type}</div>
                <div className={styles.tcPricing}>
                  <span className={styles.tcOld}>{t.old}</span>
                  <span className={styles.tcNew}>{t.price}</span>
                  <span className={styles.tcDisc}>Hemat 37%</span>
                </div>
                <button className={styles.tcBtn} onClick={() => orderTheme(t.name)}>Lihat & Pesan</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHY US ────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.reveal}>
          <div className={styles.eyebrow} style={{ color: "var(--gold)" }}>Keunggulan Kami</div>
          <h2 className={styles.sectionTitle} style={{ color: "white" }}>Dibuat dengan <em style={{ color: "var(--gold)" }}>Cinta</em>,<br />Dikirim dengan Cepat</h2>
          <p className={styles.sectionDesc} style={{ color: "rgba(255,255,255,0.52)" }}>Kami bukan sekadar penyedia layanan — kami mitra terpercaya untuk hari paling bersejarah dalam hidupmu.</p>
        </div>

        <div className={styles.whyusGrid}>
          <ul className={`${styles.whyList} ${styles.reveal}`}>
            <li className={styles.whyItem}>
              <div className={styles.whyIcon}>⚡</div>
              <div>
                <div className={styles.whyTitle}>Respon Cepat & Ramah</div>
                <div className={styles.whyDesc}>Tim kami siap melayani konsultasi dan pertanyaan setiap hari, bahkan di akhir pekan.</div>
              </div>
            </li>
            <li className={styles.whyItem}>
              <div className={styles.whyIcon}>🎨</div>
              <div>
                <div className={styles.whyTitle}>Desainer Profesional</div>
                <div className={styles.whyDesc}>Setiap undangan dikerjakan oleh desainer berpengalaman dengan mata estetika tinggi.</div>
              </div>
            </li>
            <li className={styles.whyItem}>
              <div className={styles.whyIcon}>🔒</div>
              <div>
                <div className={styles.whyTitle}>Privasi Data Terjaga</div>
                <div className={styles.whyDesc}>Data pribadi dan foto kamu aman bersama kami. Kerahasiaan adalah prioritas utama.</div>
              </div>
            </li>
            <li className={styles.whyItem}>
              <div className={styles.whyIcon}>💬</div>
              <div>
                <div className={styles.whyTitle}>Fitur RSVP & Ucapan</div>
                <div className={styles.whyDesc}>Tamu dapat konfirmasi kehadiran dan memberikan ucapan langsung dari undangan digital.</div>
              </div>
            </li>
          </ul>

          <div className={`${styles.statsGrid} ${styles.reveal} ${styles.revealD2}`}>
            <div className={styles.statCard}>
              <div className={styles.scNum}>4K+</div>
              <div className={styles.scLabel}>Pasangan Bahagia</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.scNum}>5.0</div>
              <div className={styles.scLabel}>Rating Google</div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardAccent}`}>
              <div className={styles.scNum}>Rp 132K</div>
              <div className={styles.scLabel}>Harga terjangkau, kualitas premium — hemat Rp 78.000!</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionWhite}`} id="cara-pesan">
        <div style={{ textAlign: "center" }} className={styles.reveal}>
          <div className={styles.eyebrow} style={{ justifyContent: "center" }}>Cara Pesan</div>
          <h2 className={styles.sectionTitle}>Mudah, Cepat,<br />& <em>Memuaskan</em></h2>
          <p className={styles.sectionDesc} style={{ margin: "14px auto 0", maxWidth: "380px" }}>Hanya 4 langkah sederhana untuk mendapatkan undangan digital impianmu.</p>
        </div>

        <div className={styles.stepsGrid}>
          <div className={`${styles.step} ${styles.reveal} ${styles.revealD1}`}>
            <div className={styles.stepNum}>1</div>
            <div className={styles.stepTitle}>Pilih Tema</div>
            <div className={styles.stepDesc}>Jelajahi katalog tema kami dan pilih desain yang paling sesuai dengan konsep pernikahanmu.</div>
          </div>
          <div className={`${styles.step} ${styles.reveal} ${styles.revealD2}`}>
            <div className={styles.stepNum}>2</div>
            <div className={styles.stepTitle}>Kirim Data</div>
            <div className={styles.stepDesc}>Isi formulir dengan data lengkap: nama, tanggal, lokasi, dan foto (jika ada) via WhatsApp.</div>
          </div>
          <div className={`${styles.step} ${styles.reveal} ${styles.revealD3}`}>
            <div className={styles.stepNum}>3</div>
            <div className={styles.stepTitle}>Proses & Revisi</div>
            <div className={styles.stepDesc}>Undangan kami kerjakan dalam &lt;24 jam. Kamu bisa minta revisi sampai sempurna.</div>
          </div>
          <div className={`${styles.step} ${styles.reveal} ${styles.revealD4}`}>
            <div className={styles.stepNum}>4</div>
            <div className={styles.stepTitle}>Terima & Bagikan</div>
            <div className={styles.stepDesc}>Undangan siap dibagikan ke semua tamu via WhatsApp, Instagram, atau media sosial lainnya.</div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionCream2}`} id="testimoni">
        <div style={{ textAlign: "center" }} className={styles.reveal}>
          <div className={styles.eyebrow} style={{ justifyContent: "center" }}>Testimoni</div>
          <h2 className={styles.sectionTitle}>Kata Mereka yang<br />Telah <em>Mempercayai</em> Kami</h2>
        </div>

        <div className={styles.testiGrid}>
          {[
            { name: "Ayu & Budi Santoso", loc: "Jakarta Selatan", text: "Undangannya bagus banget! Desainnya elegan dan modern, tamu-tamu pada takjub. Pengerjaannya juga super cepat, besoknya sudah jadi. Sangat rekomendasikan!", delay: styles.revealD1 },
            { name: "Rina & Dodi Pratama", loc: "Yogyakarta", text: "Pelayanannya ramah dan responsif banget! Revisi dilayani sampai benar-benar puas. Undangan digital terbaik yang pernah kami temukan di harga segini.", delay: styles.revealD2 },
            { name: "Siti & Fajar Nugraha", loc: "Bandung", text: "Fitur RSVP-nya keren banget! Bisa langsung tahu siapa yang hadir. Undangannya juga bisa diputar musik, tamu-tamu suka. Harga terjangkau, kualitas premium!", delay: styles.revealD3 },
            { name: "Maya & Rizky Hakim", loc: "Surabaya", text: "Senang banget pilih Nimara.id. Tema vintage-nya persis seperti konsep yang aku mau. CS-nya sabar banget nemenin proses revisi dari awal sampai akhir.", delay: styles.revealD1 },
            { name: "Dewi & Andi Kusuma", loc: "Semarang", text: "Pesan malam, besok pagi sudah jadi! Beneran under 24 jam. Kualitas desainnya tidak kalah sama undangan mahal. Teman-teman pada nanya pesan di mana.", delay: styles.revealD2 },
            { name: "Fatimah & Hendra Wijaya", loc: "Makassar", text: "Paket lengkap dengan harga bersahabat. Bisa custom musik, nama tamu unlimited, dan ada fitur countdown menuju hari H. Pokoknya worth it banget!", delay: styles.revealD3 },
          ].map((item, idx) => (
            <div className={`${styles.testiCard} ${styles.reveal} ${item.delay}`} key={idx}>
              <div className={styles.testiStars}>★★★★★</div>
              <p className={styles.testiText}>"{item.text}"</p>
              <div className={styles.testiAuthor}>
                <div className={styles.testiAvatar}>{item.name.charAt(0)}</div>
                <div>
                  <div className={styles.testiName}>{item.name}</div>
                  <div className={styles.testiLoc}>📍 {item.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <h2>Wujudkan Undangan Impianmu <em>Sekarang</em></h2>
        <p>Bergabung dengan 4.000+ pasangan yang sudah mempercayai Nimara.id</p>
        <a href="https://wa.me/628123456789" className={styles.btnWhite}>💬 Chat WhatsApp Sekarang</a>
      </section>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <footer className={styles.footer} id="kontak">
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerLogo}>
              <div className={styles.footerLogoIcon}>✦</div>
              Nimara.id
            </div>
            <p className={styles.footerDesc}>Layanan undangan pernikahan digital premium yang membantu kamu berbagi momen spesial dengan elegan dan mudah.</p>
            <div className={styles.footerSocials}>
              <a href="#" className={styles.footerSocial} title="Instagram">📷</a>
              <a href="#" className={styles.footerSocial} title="TikTok">🎵</a>
              <a href="#" className={styles.footerSocial} title="WhatsApp">💬</a>
              <a href="#" className={styles.footerSocial} title="Tokopedia">🛒</a>
            </div>
          </div>

          <div>
            <div className={styles.footerColTitle}>Navigasi</div>
            <ul className={styles.footerLinks}>
              <li><a href="#fitur">Fitur</a></li>
              <li><a href="#katalog">Katalog Tema</a></li>
              <li><a href="#cara-pesan">Cara Pesan</a></li>
              <li><a href="#testimoni">Testimoni</a></li>
            </ul>
          </div>

          <div>
            <div className={styles.footerColTitle}>Tema</div>
            <ul className={styles.footerLinks}>
              <li><a href="#">Spesial Foto</a></li>
              <li><a href="#">Minimalis Luxury</a></li>
              <li><a href="#">Premium Vintage</a></li>
              <li><a href="#">Tema Adat</a></li>
            </ul>
          </div>

          <div>
            <div className={styles.footerColTitle}>Kontak</div>
            <div className={styles.footerContact}>
              <div className={styles.fcItem}>
                <div className={styles.fcIcon}>📍</div>
                <div>
                  <div className={styles.fcLabel}>Alamat</div>
                  <div className={styles.fcVal}>Jl. Sugeng Jeroni No.48A, Gedongkiwo, Mantrijeron, Yogyakarta 55142</div>
                </div>
              </div>
              <div className={styles.fcItem}>
                <div className={styles.fcIcon}>🕐</div>
                <div>
                  <div className={styles.fcLabel}>Jam Operasional</div>
                  <div className={styles.fcVal}>Sen–Jum: 09.00–21.00<br />Sabtu: 09.00–20.00<br />Minggu: Slow Respon</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div>© 2026 Nimara.id. All rights reserved.</div>
          <div>Dibuat dengan ♥ di Yogyakarta</div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/628123456789" className={styles.waFloat} title="Chat WhatsApp">
        <svg viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>
    </div>
  );
}
