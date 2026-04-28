"use client";

import { useEffect } from "react";
import styles from "./page.module.css";

const templateItems = [
  { name: "Emerald Garden", badge: "Best Seller" },
  { name: "Timeless Ivory", badge: "Popular" },
  { name: "Royal Sage", badge: "Best Seller" },
  { name: "Modern Bloom", badge: "Popular" },
  { name: "Classic Luxe", badge: "Best Seller" },
  { name: "Floral Serenity", badge: "Popular" },
];

const valueItems = [
  { title: "Mudah Digunakan", desc: "Form sederhana untuk isi detail acara tanpa proses rumit." },
  { title: "Super Cepat", desc: "Undangan siap dibagikan dalam hitungan menit, bukan hari." },
  { title: "Elegant Design", desc: "Tampilan premium untuk memberi kesan eksklusif di hari istimewa." },
  { title: "Mobile Friendly", desc: "Nyaman dibuka di semua perangkat, dari HP hingga desktop." },
];

const featureItems = [
  "500+ tema undangan",
  "Custom domain",
  "QR code check-in",
  "Background dan musik",
  "Custom warna dan font",
  "Multi event (akad, resepsi, dll)",
];

const pricingItems = [
  {
    name: "Basic",
    price: "Rp129K",
    features: ["1 template premium", "RSVP dasar", "Share WhatsApp", "Masa aktif 6 bulan"],
  },
  {
    name: "Premium",
    price: "Rp249K",
    features: ["Pilihan tema populer", "Dashboard tamu", "Custom warna", "QR code check-in"],
    best: true,
  },
  {
    name: "Exclusive",
    price: "Rp449K",
    features: ["Custom domain", "Custom font + musik", "Multi event", "Prioritas support"],
  },
];

const testimonials = [
  {
    name: "Nanda & Rafi",
    text: "Design sangat elegan. Banyak tamu bilang undangan kami paling berkelas.",
  },
  {
    name: "Mira & Rangga",
    text: "Prosesnya cepat sekali, dari isi data sampai share ke tamu hanya beberapa menit.",
  },
  {
    name: "Salsa & Dimas",
    text: "Fitur RSVP sangat membantu, jadi kami mudah hitung estimasi kehadiran tamu.",
  },
  {
    name: "Alya & Bagas",
    text: "Tim support responsif dan tampilannya premium banget. Sangat direkomendasikan.",
  },
];

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className={`${styles.sectionHead} ${styles.revealUp}`}>
      <p className={styles.sectionEyebrow}>{eyebrow}</p>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionDesc}>{desc}</p>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    document.body.classList.add("landing-body");

    const elements = Array.from(document.querySelectorAll(`.${styles.revealUp}`));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealUpVisible);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      document.body.classList.remove("landing-body");
    };
  }, []);

  return (
    <div className={styles.landingRoot}>
      <main>
        <section className={styles.hero}>
          <div className={styles.revealUp}>
            <p className={styles.heroTag}>Wedding Invitation Platform</p>
            <h1 className={styles.heroTitle}>Buat Undangan Online Digital Website Untuk Pernikahan</h1>
            <p className={styles.heroSub}>
              Solusi undangan modern yang elegan, praktis, dan siap dibagikan ke semua tamu hanya dalam beberapa menit.
              Hemat waktu, tampil premium, dan memudahkan pengelolaan acara dari satu dashboard.
            </p>
            <div className={styles.heroActions}>
              <a href="#pricing" className={styles.ctaPrimary}>Buat Undangan Sekarang</a>
              <a href="#templates" className={styles.ctaSecondary}>Lihat Demo</a>
            </div>
          </div>

          <div className={`${styles.heroVisual} ${styles.revealUp}`}>
            <div className={styles.previewCard}>
              <div className={styles.previewThumb} />
              <h5>Preview Undangan</h5>
              <p>Theme: Emerald Signature</p>
            </div>

            <div className={styles.phoneMockup}>
              <div className={styles.phoneTop} />
              <div className={styles.phoneBody}>
                <div className={styles.phoneHero}>
                  <h4>Hanif & Fizah</h4>
                  <p>Minggu, 17 Mei 2026</p>
                </div>
                <div className={styles.miniCardRow}>
                  <div className={styles.miniCard}>
                    <strong>RSVP</strong>
                    <span>128 tamu konfirmasi</span>
                  </div>
                  <div className={styles.miniCard}>
                    <strong>Gallery</strong>
                    <span>12 foto pasangan</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.qrBadge}>
              <div className={styles.qrGrid}>
                {Array.from({ length: 49 }).map((_, idx) => (
                  <span className={styles.qrDot} key={idx} style={{ opacity: idx % 4 === 0 ? 0.3 : 1 }} />
                ))}
              </div>
              <p>QR Check-in</p>
            </div>
          </div>
        </section>

        <section id="templates">
          <SectionHead
            eyebrow="Template Showcase"
            title="Pilihan Template Elegan Siap Pakai"
            desc="Pilih desain undangan sesuai konsep pernikahanmu, lalu langsung preview sebelum dipublikasikan."
          />
          <div className={styles.templateGrid}>
            {templateItems.map((item) => (
              <article className={`${styles.templateCard} ${styles.revealUp}`} key={item.name}>
                <div className={styles.templateImage}>
                  <span className={styles.badge}>{item.badge}</span>
                </div>
                <div className={styles.templateBody}>
                  <h4>{item.name}</h4>
                  <p>Nuansa premium dengan tata letak bersih dan modern.</p>
                  <a href="#" className={styles.ctaGhost}>Preview</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionHead
            eyebrow="Value"
            title="Semua yang kamu butuhkan dalam satu undangan"
            desc="Dirancang untuk calon pengantin yang ingin cepat, praktis, dan tetap terlihat mewah."
          />
          <div className={styles.valueGrid}>
            {valueItems.map((item) => (
              <article className={`${styles.valueCard} ${styles.revealUp}`} key={item.title}>
                <div className={styles.iconRound}>*</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionHead
            eyebrow="How It Works"
            title="Buat Undangan Online Hanya 3 Langkah"
            desc="Alur super sederhana agar kamu bisa fokus ke persiapan momen bahagia."
          />
          <div className={styles.stepsWrap}>
            <article className={`${styles.stepCard} ${styles.revealUp}`}>
              <span className={styles.stepNumber}>Langkah 1</span>
              <h4>Pilih Template</h4>
              <p>Tentukan desain favorit dari koleksi tema modern dan premium.</p>
            </article>
            <article className={`${styles.stepCard} ${styles.revealUp}`}>
              <span className={styles.stepNumber}>Langkah 2</span>
              <h4>Isi Data Acara</h4>
              <p>Masukkan nama mempelai, jadwal, lokasi, gallery, dan detail acara.</p>
            </article>
            <article className={`${styles.stepCard} ${styles.revealUp}`}>
              <span className={styles.stepNumber}>Langkah 3</span>
              <h4>Bagikan ke Tamu</h4>
              <p>Sebarkan undangan via WhatsApp dan pantau RSVP secara real-time.</p>
            </article>
          </div>
        </section>

        <section>
          <div className={styles.shareWrap}>
            <div className={styles.revealUp}>
              <p className={styles.sectionEyebrow}>Share to WhatsApp</p>
              <h2 className={styles.sectionTitle}>Kirim undangan ke semua tamu dalam sekali klik</h2>
              <p className={styles.sectionDesc}>
                Integrasi share yang cepat memudahkan penyebaran undangan personal tanpa repot kirim satu per satu.
              </p>
              <a href="#pricing" className={styles.ctaPrimary}>Coba Sekarang</a>
            </div>
            <div className={`${styles.shareVisual} ${styles.revealUp}`}>
              <div className={styles.chatCard}>
                <small>Undangan Digital</small>
                <p>Halo, kami mengundang Anda ke acara pernikahan kami.</p>
              </div>
              <div className={`${styles.chatCard} ${styles.chatRight}`}>
                <small>Tamu</small>
                <p>Terima kasih, link undangannya sangat cantik.</p>
              </div>
              <div className={styles.chatCard}>
                <small>Undangan Digital</small>
                <p>Konfirmasi kehadiran bisa langsung lewat tombol RSVP ya.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.rsvpWrap}>
            <div className={styles.revealUp}>
              <p className={styles.sectionEyebrow}>RSVP & Guest Management</p>
              <h2 className={styles.sectionTitle}>Kelola data tamu lebih mudah dan rapi</h2>
              <p className={styles.sectionDesc}>
                Input nama tamu otomatis, sistem RSVP, dan ringkasan kehadiran dalam satu dashboard yang mudah dibaca.
              </p>
            </div>

            <div className={`${styles.rsvpPanel} ${styles.revealUp}`}>
              <div className={styles.rsvpTop}>
                <div className={styles.rsvpStat}>
                  <strong>324</strong>
                  <span>Total Tamu</span>
                </div>
                <div className={styles.rsvpStat}>
                  <strong>218</strong>
                  <span>Hadir</span>
                </div>
                <div className={styles.rsvpStat}>
                  <strong>106</strong>
                  <span>Belum Respon</span>
                </div>
              </div>
              <div className={styles.rsvpList}>
                <div className={styles.rsvpListRow}><strong>Nama Tamu</strong><strong>Status</strong><strong>Jumlah</strong></div>
                <div className={styles.rsvpListRow}><span>Nina Putri</span><span>Hadir</span><span>2</span></div>
                <div className={styles.rsvpListRow}><span>Arif Pratama</span><span>Hadir</span><span>1</span></div>
                <div className={styles.rsvpListRow}><span>Rani Amelia</span><span>Belum</span><span>-</span></div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionHead
            eyebrow="Features"
            title="Fitur lengkap untuk undangan digital modern"
            desc="Semua kebutuhan undangan online dalam satu platform, dari tema hingga check-in tamu."
          />
          <div className={styles.featureGrid}>
            {featureItems.map((item) => (
              <article className={`${styles.featureCard} ${styles.revealUp}`} key={item}>
                <div className={styles.iconRound}>+</div>
                <h4>{item}</h4>
                <p>Disiapkan agar undangan terlihat profesional, modern, dan mudah diakses.</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className={styles.domainWrap}>
            <div className={styles.revealUp}>
              <p className={styles.sectionEyebrow}>Custom Domain</p>
              <h2 className={styles.sectionTitle}>Gunakan domain sendiri seperti namakamu.com</h2>
              <p className={styles.sectionDesc}>
                Bangun kesan eksklusif dengan URL personal untuk hari istimewa kamu dan pasangan.
              </p>
            </div>
            <div className={`${styles.domainCard} ${styles.revealUp}`}>
              <h4 style={{ margin: 0, fontSize: 24, fontFamily: "Cormorant Garamond, serif" }}>Contoh URL Elegan</h4>
              <div className={styles.domainUrl}>www.hanifdanfizah.com</div>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.musicWrap}>
            <div className={styles.revealUp}>
              <p className={styles.sectionEyebrow}>Music & Interaction</p>
              <h2 className={styles.sectionTitle}>Pilih musik untuk memperkuat suasana undangan</h2>
              <p className={styles.sectionDesc}>
                Tambahkan audio pilihan agar pengalaman membuka undangan terasa lebih emosional dan berkesan.
              </p>
            </div>
            <div className={`${styles.musicPlayer} ${styles.revealUp}`}>
              <div className={styles.trackArt} />
              <h4 style={{ margin: "0 0 6px", fontFamily: "Cormorant Garamond, serif", fontSize: 24 }}>Kota Ini Tak Sama Tanpamu</h4>
              <p style={{ margin: "0 0 14px", color: "#55756c" }}>Nadhif Basalamah</p>
              <div className={styles.playerRow}>
                <button type="button" className={styles.playerButton}>Play</button>
                <div className={styles.playerBar}><span /></div>
                <small>02:41</small>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing">
          <SectionHead
            eyebrow="Pricing"
            title="Pilih paket sesuai kebutuhan acara"
            desc="Mulai dari paket basic hingga exclusive, semuanya dirancang untuk hasil premium dan conversion tinggi."
          />
          <div className={styles.pricingGrid}>
            {pricingItems.map((item) => (
              <article
                className={`${styles.priceCard} ${item.best ? styles.priceHighlight : ""} ${styles.revealUp}`}
                key={item.name}
              >
                {item.best ? <span className={styles.priceTag}>Paket Terbaik</span> : null}
                <h4>{item.name}</h4>
                <p className={styles.priceValue}>{item.price}</p>
                <ul className={styles.priceList}>
                  {item.features.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
                <a href="#" className={styles.ctaPrimary}>Pilih Paket</a>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionHead
            eyebrow="Testimonial"
            title="Dipercaya ribuan pasangan di Indonesia"
            desc="Review nyata dari pasangan yang sudah menggunakan platform kami untuk momen pernikahan mereka."
          />
          <div className={styles.testimonialGrid}>
            {testimonials.map((item) => (
              <article className={`${styles.testimonialCard} ${styles.revealUp}`} key={item.name}>
                <div className={styles.avatar}>{item.name.slice(0, 1)}</div>
                <h4>{item.name}</h4>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <section className={`${styles.finalCta} ${styles.revealUp}`}>
        <h2>Kini kamu bisa buat undangan digital hanya dalam 5 menit</h2>
        <p>
          Saatnya hadirkan undangan yang cantik, praktis, dan siap meningkatkan antusiasme tamu sebelum hari acara.
        </p>
        <a href="#pricing" className={styles.ctaPrimary}>Mulai Sekarang</a>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <h3 className={styles.logo}>Nimantra</h3>
            <p className={styles.copy}>Digital invitation platform with modern premium experience.</p>
          </div>
          <div className={styles.footerNav}>
            <a href="#templates">Template</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Fitur</a>
            <a href="#">Kontak</a>
          </div>
          <div className={styles.footerSocial}>
            <a href="#">Instagram</a>
            <a href="#">WhatsApp</a>
            <a href="#">TikTok</a>
          </div>
        </div>
        <div className={styles.paymentList}>
          <span className={styles.chip}>BCA</span>
          <span className={styles.chip}>Mandiri</span>
          <span className={styles.chip}>BRI</span>
          <span className={styles.chip}>DANA</span>
          <span className={styles.chip}>OVO</span>
          <span className={styles.chip}>GoPay</span>
        </div>
        <p className={styles.copy}>Copyright 2026 Nimantra. All rights reserved.</p>
      </footer>
    </div>
  );
}
