"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewInvitationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState("v1");

  // Couple Data
  const [bride, setBride] = useState({ shortName: "", fullName: "", parentsFather: "", parentsMother: "", igUser: "", igUrl: "", photo: "" });
  const [groom, setGroom] = useState({ shortName: "", fullName: "", parentsFather: "", parentsMother: "", igUser: "", igUrl: "", photo: "" });

  // Event Data
  const [event, setEvent] = useState({ 
    date: "", 
    displayDate: "", 
    day: "", 
    locationName: "", 
    locationCity: "", 
    mapsUrl: "",
    akadTime: "09.00 WIB — Selesai",
    resepsiTime: "16.00 WIB — Selesai",
    livestreamTime: "09.00 WIB — Selesai",
    livestreamUrl: ""
  });

  // Media
  const [media, setMedia] = useState({
    music: "",
    heroVideo: "",
    logo: "",
    galleryVideo: "",
    openingPhoto: "",
    qrBannerPhoto: "",
    paymentLogoLeft: "",
    quoteText: "Dan diantara tanda-tanda kekuasaanNya...",
    quoteRef: "QS. Ar-Rum : 21"
  });

  const [paymentCards, setPaymentCards] = useState<any[]>([]);

  // Media (Files)
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, folder: string) => {
    const file = e.target.files?.[0];
    if (!file || !slug) return alert("Please enter a slug first to organize files.");

    setUploading(prev => ({ ...prev, [field]: true }));
    
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${field}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${slug}/${folder}/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from("invitations")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("invitations")
        .getPublicUrl(filePath);

      if (field === "bridePhoto") setBride(prev => ({ ...prev, photo: publicUrl }));
      else if (field === "groomPhoto") setGroom(prev => ({ ...prev, photo: publicUrl }));
      else if (field === "music") setMedia(prev => ({ ...prev, music: publicUrl }));
      else if (field === "heroVideo") setMedia(prev => ({ ...prev, heroVideo: publicUrl }));
      else if (field === "galleryVideo") setMedia(prev => ({ ...prev, galleryVideo: publicUrl }));
      else if (field === "logo") setMedia(prev => ({ ...prev, logo: publicUrl }));
      else if (field === "openingPhoto") setMedia(prev => ({ ...prev, openingPhoto: publicUrl }));
      else if (field === "qrBannerPhoto") setMedia(prev => ({ ...prev, qrBannerPhoto: publicUrl }));
      else if (field === "paymentLogoLeft") setMedia(prev => ({ ...prev, paymentLogoLeft: publicUrl }));

      alert(`File ${field} uploaded successfully!`);
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const content = {
      couple: {
        bride: {
          shortName: bride.shortName,
          fullName: bride.fullName,
          parents: { father: bride.parentsFather, mother: bride.parentsMother },
          instagram: { username: bride.igUser, url: bride.igUrl },
          photo: bride.photo
        },
        groom: {
          shortName: groom.shortName,
          fullName: groom.fullName,
          parents: { father: groom.parentsFather, mother: groom.parentsMother },
          instagram: { username: groom.igUser, url: groom.igUrl },
          photo: groom.photo
        }
      },
      event: {
        date: event.date,
        displayDate: event.displayDate,
        day: event.day,
        locationName: event.locationName,
        locationCity: event.locationCity,
        mapsUrl: event.mapsUrl,
        akad: { time: event.akadTime },
        resepsi: { time: event.resepsiTime },
        livestream: { time: event.livestreamTime, url: event.livestreamUrl }
      },
      media: {
        music: media.music,
        heroVideo: media.heroVideo,
        logo: media.logo,
        openingPhoto: media.openingPhoto,
        galleryVideo: media.galleryVideo,
        qrBannerPhoto: media.qrBannerPhoto,
        paymentLogoLeft: media.paymentLogoLeft,
        quote: { text: media.quoteText, ref: media.quoteRef },
        story: [], // For simplicity, handle story/gallery later or as arrays
        gallery: []
      },
      payment: paymentCards
    };

    const { error } = await supabase.from("invitations").insert([{
      slug,
      template_version: template,
      content,
      is_active: true
    }]);

    setLoading(false);
    if (error) {
      alert("Error creating invitation: " + error.message);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a" }}>New Invitation</h1>
        <p style={{ color: "#64748b" }}>Fill in the details to create a new wedding invitation.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Basic Config */}
        <div className="admin-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}>Basic Configuration</h3>
          <div style={gridStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>URL Slug (Unique)</label>
              <input 
                type="text" 
                placeholder="e.g. budi-ani" 
                style={inputStyle} 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                required 
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Template Version</label>
              <select style={inputStyle} value={template} onChange={(e) => setTemplate(e.target.value)}>
                <option value="v1">Template V1 (Classic)</option>
                <option value="v2">Template V2 (Modern) - Soon</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bride Data */}
        <div className="admin-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}>The Bride</h3>
          <div style={gridStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Short Name</label>
              <input type="text" style={inputStyle} value={bride.shortName} onChange={e => setBride({...bride, shortName: e.target.value})} required />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name & Degree</label>
              <input type="text" style={inputStyle} value={bride.fullName} onChange={e => setBride({...bride, fullName: e.target.value})} required />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Father''s Name</label>
              <input type="text" style={inputStyle} value={bride.parentsFather} onChange={e => setBride({...bride, parentsFather: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Mother''s Name</label>
              <input type="text" style={inputStyle} value={bride.parentsMother} onChange={e => setBride({...bride, parentsMother: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Photo</label>
              <input type="file" onChange={e => handleFileUpload(e, "bridePhoto", "couple")} disabled={uploading.bridePhoto} />
              {bride.photo && <p style={{ fontSize: "11px", color: "green" }}>✓ Uploaded</p>}
            </div>
          </div>
        </div>

        {/* Groom Data */}
        <div className="admin-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}>The Groom</h3>
          <div style={gridStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Short Name</label>
              <input type="text" style={inputStyle} value={groom.shortName} onChange={e => setGroom({...groom, shortName: e.target.value})} required />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name & Degree</label>
              <input type="text" style={inputStyle} value={groom.fullName} onChange={e => setGroom({...groom, fullName: e.target.value})} required />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Father''s Name</label>
              <input type="text" style={inputStyle} value={groom.parentsFather} onChange={e => setGroom({...groom, parentsFather: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Mother''s Name</label>
              <input type="text" style={inputStyle} value={groom.parentsMother} onChange={e => setGroom({...groom, parentsMother: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Photo</label>
              <input type="file" onChange={e => handleFileUpload(e, "groomPhoto", "couple")} disabled={uploading.groomPhoto} />
              {groom.photo && <p style={{ fontSize: "11px", color: "green" }}>✓ Uploaded</p>}
            </div>
          </div>
        </div>

        {/* Event Data */}
        <div className="admin-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}>Event Details</h3>
          <div style={gridStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Date (ISO)</label>
              <input type="date" style={inputStyle} value={event.date} onChange={e => setEvent({...event, date: e.target.value})} required />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Display Date</label>
              <input type="text" placeholder="e.g. 17 Mei 2026" style={inputStyle} value={event.displayDate} onChange={e => setEvent({...event, displayDate: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Day</label>
              <input type="text" placeholder="e.g. Minggu" style={inputStyle} value={event.day} onChange={e => setEvent({...event, day: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Akad Time</label>
              <input type="text" style={inputStyle} value={event.akadTime} onChange={e => setEvent({...event, akadTime: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Resepsi Time</label>
              <input type="text" style={inputStyle} value={event.resepsiTime} onChange={e => setEvent({...event, resepsiTime: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Livestream Time</label>
              <input type="text" style={inputStyle} value={event.livestreamTime} onChange={e => setEvent({...event, livestreamTime: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Livestream URL</label>
              <input type="text" style={inputStyle} value={event.livestreamUrl} onChange={e => setEvent({...event, livestreamUrl: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Location Name</label>
              <input type="text" style={inputStyle} value={event.locationName} onChange={e => setEvent({...event, locationName: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Google Maps URL</label>
              <input type="text" style={inputStyle} value={event.mapsUrl} onChange={e => setEvent({...event, mapsUrl: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Media Assets */}
        <div className="admin-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}>Media & Assets</h3>
          <div style={gridStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Logo</label>
              <input type="file" onChange={e => handleFileUpload(e, "logo", "media")} disabled={uploading.logo} />
              {media.logo && <p style={{ fontSize: "11px", color: "green" }}>✓ Uploaded</p>}
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Opening Photo</label>
              <input type="file" onChange={e => handleFileUpload(e, "openingPhoto", "media")} disabled={uploading.openingPhoto} />
              {media.openingPhoto && <p style={{ fontSize: "11px", color: "green" }}>✓ Uploaded</p>}
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Music (MP3)</label>
              <input type="file" onChange={e => handleFileUpload(e, "music", "media")} disabled={uploading.music} />
              {media.music && <p style={{ fontSize: "11px", color: "green" }}>✓ Uploaded</p>}
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Hero Video (Background)</label>
              <input type="file" onChange={e => handleFileUpload(e, "heroVideo", "media")} disabled={uploading.heroVideo} />
              {media.heroVideo && <p style={{ fontSize: "11px", color: "green" }}>✓ Uploaded</p>}
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Gallery Video</label>
              <input type="file" onChange={e => handleFileUpload(e, "galleryVideo", "media")} disabled={uploading.galleryVideo} />
              {media.galleryVideo && <p style={{ fontSize: "11px", color: "green" }}>✓ Uploaded</p>}
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>QR Modal Banner Photo</label>
              <input type="file" onChange={e => handleFileUpload(e, "qrBannerPhoto", "media")} disabled={uploading.qrBannerPhoto} />
              {media.qrBannerPhoto && <p style={{ fontSize: "11px", color: "green" }}>✓ Uploaded</p>}
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Payment Card Left Logo</label>
              <input type="file" onChange={e => handleFileUpload(e, "paymentLogoLeft", "media")} disabled={uploading.paymentLogoLeft} />
              {media.paymentLogoLeft && <p style={{ fontSize: "11px", color: "green" }}>✓ Uploaded</p>}
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="admin-card" style={cardStyle}>
          <h3 style={sectionTitleStyle}>Quotes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Quote Text</label>
              <textarea style={{...inputStyle, minHeight: "80px"}} value={media.quoteText} onChange={e => setMedia({...media, quoteText: e.target.value})} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Reference (e.g. QS. Ar-Rum : 21)</label>
              <input type="text" style={inputStyle} value={media.quoteRef} onChange={e => setMedia({...media, quoteRef: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="admin-card" style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{...sectionTitleStyle, marginBottom: 0}}>Payment Methods</h3>
            <button 
              type="button" 
              onClick={() => setPaymentCards([...paymentCards, { id: Date.now().toString(), bank: "", holderName: "", accountNumber: "", isQris: false, isAddress: false, address: "", images: { logo: "", qrisImage: "", chipImage: "" } }])}
              style={{ padding: "8px 16px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
            >
              + Add Card
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {paymentCards.map((p, idx) => (
              <div key={p.id} style={{ padding: "16px", border: "1px solid #f1f5f9", borderRadius: "8px", background: "#f8fafc" }}>
                <div style={gridStyle}>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Bank / Label Name</label>
                    <input type="text" style={inputStyle} value={p.bank} onChange={e => {
                      const newCards = [...paymentCards];
                      newCards[idx].bank = e.target.value;
                      setPaymentCards(newCards);
                    }} />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Holder Name</label>
                    <input type="text" style={inputStyle} value={p.holderName} onChange={e => {
                      const newCards = [...paymentCards];
                      newCards[idx].holderName = e.target.value;
                      setPaymentCards(newCards);
                    }} />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Account Number</label>
                    <input type="text" style={inputStyle} value={p.accountNumber} onChange={e => {
                      const newCards = [...paymentCards];
                      newCards[idx].accountNumber = e.target.value;
                      setPaymentCards(newCards);
                    }} />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Is QRIS?</label>
                    <input type="checkbox" checked={p.isQris} onChange={e => {
                      const newCards = [...paymentCards];
                      newCards[idx].isQris = e.target.checked;
                      setPaymentCards(newCards);
                    }} />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Is Address? (Gift Shipping)</label>
                    <input type="checkbox" checked={p.isAddress} onChange={e => {
                      const newCards = [...paymentCards];
                      newCards[idx].isAddress = e.target.checked;
                      setPaymentCards(newCards);
                    }} />
                  </div>
                  {p.isAddress && (
                    <div style={{...inputGroupStyle, gridColumn: "span 2"}}>
                      <label style={labelStyle}>Full Address</label>
                      <textarea style={inputStyle} value={p.address} onChange={e => {
                        const newCards = [...paymentCards];
                        newCards[idx].address = e.target.value;
                        setPaymentCards(newCards);
                      }} />
                    </div>
                  )}
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Bank Logo</label>
                    <input type="file" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !slug) return;
                      const fileName = `bank_${idx}_${Date.now()}.${file.name.split('.').pop()}`;
                      const filePath = `${slug}/payment/${fileName}`;
                      const { data } = await supabase.storage.from("invitations").upload(filePath, file);
                      const { data: { publicUrl } } = supabase.storage.from("invitations").getPublicUrl(filePath);
                      const newCards = [...paymentCards];
                      newCards[idx].images.logo = publicUrl;
                      setPaymentCards(newCards);
                    }} />
                  </div>
                  {p.isQris && (
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>QRIS Image</label>
                      <input type="file" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !slug) return;
                        const fileName = `qris_${idx}_${Date.now()}.${file.name.split('.').pop()}`;
                        const filePath = `${slug}/payment/${fileName}`;
                        const { data } = await supabase.storage.from("invitations").upload(filePath, file);
                        const { data: { publicUrl } } = supabase.storage.from("invitations").getPublicUrl(filePath);
                        const newCards = [...paymentCards];
                        newCards[idx].images.qrisImage = publicUrl;
                        setPaymentCards(newCards);
                      }} />
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => setPaymentCards(paymentCards.filter((_, i) => i !== idx))}
                  style={{ marginTop: "12px", color: "#ef4444", border: "none", background: "none", fontSize: "12px", cursor: "pointer" }}
                >
                  Remove Card
                </button>
              </div>
            ))}
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{
            backgroundColor: "#0f172a",
            color: "white",
            padding: "16px",
            borderRadius: "12px",
            border: "none",
            fontSize: "16px",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginTop: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}
        >
          {loading ? "Creating..." : "Save Invitation"}
        </button>
      </form>
    </div>
  );
}

// Styles
const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#0f172a",
  marginBottom: "20px",
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "12px"
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px"
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#475569"
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s"
};
