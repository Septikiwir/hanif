"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NewInvitationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Basic Config
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState("v1");
  const [isActive, setIsActive] = useState(true);

  // Couple Data
  const [bride, setBride] = useState({ shortName: "", fullName: "", label: "", parentsFather: "", parentsMother: "", igUser: "", photo: "" });
  const [groom, setGroom] = useState({ shortName: "", fullName: "", label: "", parentsFather: "", parentsMother: "", igUser: "", photo: "" });

  // Event Data
  const [event, setEvent] = useState({ 
    date: "", displayDate: "", day: "", locationName: "", locationCity: "", mapsUrl: "",
    akadTime: "", resepsiTime: "", livestreamTime: "", livestreamUrl: ""
  });

  // Media
  const [media, setMedia] = useState({
    music: "", heroVideo: "", logo: "", galleryVideo: "", openingPhoto: "",
    qrBannerPhoto: "", quoteText: "", quoteRef: "", quoteBackground: "",
    greetingText: "", introText: ""
  });

  const [gallery, setGallery] = useState<{ src: string; isLandscape: boolean }[]>([]);
  const [stories, setStories] = useState<{ src: string; subtitle: string }[]>([]);
  const [paymentCards, setPaymentCards] = useState<any[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [lightbox, setLightbox] = useState<{ src: string; type: "image" | "video" } | null>(null);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "⚙️" },
    { id: "couple", label: "The Couple", icon: "👩‍❤️‍👨" },
    { id: "event", label: "Event Details", icon: "📅" },
    { id: "media", label: "Media & Assets", icon: "🖼️" },
    { id: "gallery", label: "Gallery & Story", icon: "📸" },
    { id: "payment", label: "Payments", icon: "💳" },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, folder: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!slug) {
      alert("Please enter a URL Slug in the 'Basic Info' tab before uploading media.");
      return;
    }
    setUploading(prev => ({ ...prev, [field]: true }));
    const fileExt = file.name.split('.').pop();
    const fileName = `${field}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${slug}/${folder}/${fileName}`;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', filePath);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed');
      
      const publicUrl = result.publicUrl;
      if (field === "bridePhoto") setBride(p => ({ ...p, photo: publicUrl }));
      else if (field === "groomPhoto") setGroom(p => ({ ...p, photo: publicUrl }));
      else if (field.startsWith("storyPhoto_")) {
        const idx = parseInt(field.split("_")[1]);
        setStories(prev => { const ns = [...prev]; ns[idx] = { ...ns[idx], src: publicUrl }; return ns; });
      }
      else if (field.startsWith("paymentLogo_")) {
        const idx = parseInt(field.split("_")[1]);
        setPaymentCards(prev => { const nc = [...prev]; nc[idx] = { ...nc[idx], images: { ...nc[idx].images, logo: publicUrl } }; return nc; });
      }
      else if (field.startsWith("paymentLogoLeft_")) {
        const idx = parseInt(field.split("_")[1]);
        setPaymentCards(prev => { const nc = [...prev]; nc[idx] = { ...nc[idx], images: { ...nc[idx].images, logoLeft: publicUrl } }; return nc; });
      }
      else if (field.startsWith("paymentQris_")) {
        const idx = parseInt(field.split("_")[1]);
        setPaymentCards(prev => { const nc = [...prev]; nc[idx] = { ...nc[idx], images: { ...nc[idx].images, qrisImage: publicUrl } }; return nc; });
      }
      else if (field.startsWith("paymentChip_")) {
        const idx = parseInt(field.split("_")[1]);
        setPaymentCards(prev => { const nc = [...prev]; nc[idx] = { ...nc[idx], images: { ...nc[idx].images, chipImage: publicUrl } }; return nc; });
      }
      else setMedia(p => ({ ...p, [field]: publicUrl }));
    } catch (err: any) { alert("Upload failed: " + err.message); }
    finally { setUploading(prev => ({ ...prev, [field]: false })); }
  };

  const handleMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (!slug) {
      alert("Please enter a URL Slug in the 'Basic Info' tab before uploading gallery photos.");
      return;
    }
    setUploading(prev => ({ ...prev, gallery: true }));
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery_${Date.now()}_${i}.${fileExt}`;
      const filePath = `${slug}/gallery/${fileName}`;
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', filePath);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Upload failed');
        newUrls.push(result.publicUrl);
      } catch (err) { console.error(err); }
    }
    setGallery(prev => [...prev, ...newUrls.map(src => ({ src, isLandscape: false }))]);
    setUploading(prev => ({ ...prev, gallery: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return alert("Slug is required");
    setLoading(true);
    const content = {
      couple: {
        bride: { shortName: bride.shortName, fullName: bride.fullName, label: bride.label, parents: { father: bride.parentsFather, mother: bride.parentsMother }, instagram: { username: bride.igUser, url: `https://instagram.com/${bride.igUser.replace("@","")}` }, photo: bride.photo },
        groom: { shortName: groom.shortName, fullName: groom.fullName, label: groom.label, parents: { father: groom.parentsFather, mother: groom.parentsMother }, instagram: { username: groom.igUser, url: `https://instagram.com/${groom.igUser.replace("@","")}` }, photo: groom.photo }
      },
      event: {
        date: event.date, displayDate: event.displayDate, day: event.day, locationName: event.locationName, locationCity: event.locationCity, mapsUrl: event.mapsUrl,
        akad: { time: event.akadTime }, resepsi: { time: event.resepsiTime }, livestream: { time: event.livestreamTime, url: event.livestreamUrl }
      },
      media: {
        music: media.music, heroVideo: media.heroVideo, logo: media.logo, openingPhoto: media.openingPhoto, galleryVideo: media.galleryVideo, qrBannerPhoto: media.qrBannerPhoto,
        quote: { 
          text: media.quoteText, 
          ref: media.quoteRef,
          background: media.quoteBackground
        }, 
        greetingText: media.greetingText,
        introText: media.introText,
        story: stories, gallery: gallery
      },
      payment: paymentCards.map(p => ({
        ...p,
        isQris: !!p.isQris,
        isAddress: !!p.isAddress
      }))
    };
    
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, template_version: template, content, is_active: isActive }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create');
      }

      alert("Successfully created via Server API!"); 
      router.push("/admin");
    } catch (err: any) {
      setLoading(false);
      console.error("API Error:", err);
      alert("Error: " + err.message);
    }
  };

  const isVideo = (url: string) => url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".mov");

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><h1 className="admin-h1">Create New Invitation</h1><p className="admin-p">Server-side sync enabled</p></div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/admin" className="admin-btn admin-btn-ghost">Cancel</Link>
          <button onClick={handleSubmit} disabled={loading} className="admin-btn admin-btn-primary" style={{ padding: "0.75rem 2rem" }}>{loading ? "Creating..." : "Save Invitation"}</button>
        </div>
      </header>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", backgroundColor: "white", padding: "0.5rem", borderRadius: "16px", border: "1px solid var(--admin-border)", overflowX: "auto" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: "12px", border: "none", cursor: "pointer", transition: "all 0.2s", backgroundColor: activeTab === tab.id ? "#e6f7ef" : "transparent", color: activeTab === tab.id ? "#059669" : "#64748b", fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", minWidth: "140px" }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: "600px" }}>
        {activeTab === "basic" && (
          <div className="admin-card">
            <h2 className="admin-h2" style={{ marginBottom: "2rem" }}>Configuration</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div style={inputGroupStyle}><label style={labelStyle}>URL Slug (Unique)</label><input type="text" placeholder="e.g. fizah-hanif" className="admin-input" value={slug} onChange={e => setSlug(e.target.value)} /></div>
              <div style={inputGroupStyle}><label style={labelStyle}>Template Version</label><select className="admin-input" value={template} onChange={e => setTemplate(e.target.value)}><option value="v1">Template V1 (Modern Emerald)</option></select></div>
            </div>
            <div style={{ marginTop: "2rem" }}><button onClick={() => setIsActive(!isActive)} className={`admin-badge ${isActive ? "admin-badge-success" : "admin-badge-gray"}`} style={{ border: "none", cursor: "pointer" }}>{isActive ? "Active" : "Inactive"}</button></div>
          </div>
        )}

        {activeTab === "couple" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>The Bride</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div><label style={labelStyle}>Full Name</label><input type="text" className="admin-input" value={bride.fullName} onChange={e => setBride({...bride, fullName: e.target.value})} /></div>
                <div><label style={labelStyle}>Short Name</label><input type="text" className="admin-input" value={bride.shortName} onChange={e => setBride({...bride, shortName: e.target.value})} /></div>
                <div><label style={labelStyle}>Label (e.g. Putri Kedua Dari)</label><input type="text" className="admin-input" value={bride.label} onChange={e => setBride({...bride, label: e.target.value})} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                   <div><label style={labelStyle}>Father</label><input type="text" className="admin-input" value={bride.parentsFather} onChange={e => setBride({...bride, parentsFather: e.target.value})} /></div>
                   <div><label style={labelStyle}>Mother</label><input type="text" className="admin-input" value={bride.parentsMother} onChange={e => setBride({...bride, parentsMother: e.target.value})} /></div>
                </div>
                <div><label style={labelStyle}>Instagram User</label><input type="text" className="admin-input" placeholder="@username" value={bride.igUser} onChange={e => setBride({...bride, igUser: e.target.value})} /></div>
                <div>
                  <label style={labelStyle}>Photo</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "bridePhoto", "couple")} />
                  {bride.photo && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: bride.photo, type: "image" })}><img src={bride.photo} style={previewImgStyle} /><button onClick={(e) => { e.stopPropagation(); setBride({...bride, photo: ""}); }} style={removeBtnStyle}>×</button></div>}
                </div>
              </div>
            </div>
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>The Groom</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div><label style={labelStyle}>Full Name</label><input type="text" className="admin-input" value={groom.fullName} onChange={e => setGroom({...groom, fullName: e.target.value})} /></div>
                <div><label style={labelStyle}>Short Name</label><input type="text" className="admin-input" value={groom.shortName} onChange={e => setGroom({...groom, shortName: e.target.value})} /></div>
                <div><label style={labelStyle}>Label (e.g. Putra Pertama Dari)</label><input type="text" className="admin-input" value={groom.label} onChange={e => setGroom({...groom, label: e.target.value})} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                   <div><label style={labelStyle}>Father</label><input type="text" className="admin-input" value={groom.parentsFather} onChange={e => setGroom({...groom, parentsFather: e.target.value})} /></div>
                   <div><label style={labelStyle}>Mother</label><input type="text" className="admin-input" value={groom.parentsMother} onChange={e => setGroom({...groom, parentsMother: e.target.value})} /></div>
                </div>
                <div><label style={labelStyle}>Instagram User</label><input type="text" className="admin-input" placeholder="@username" value={groom.igUser} onChange={e => setGroom({...groom, igUser: e.target.value})} /></div>
                <div>
                  <label style={labelStyle}>Photo</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "groomPhoto", "couple")} />
                  {groom.photo && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: groom.photo, type: "image" })}><img src={groom.photo} style={previewImgStyle} /><button onClick={(e) => { e.stopPropagation(); setGroom({...groom, photo: ""}); }} style={removeBtnStyle}>×</button></div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "event" && (
          <div className="admin-card">
            <h2 className="admin-h2" style={{ marginBottom: "2rem" }}>Event & Location</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
              <div><label style={labelStyle}>Date</label><input type="date" className="admin-input" value={event.date} onChange={e => setEvent({...event, date: e.target.value})} /></div>
              <div><label style={labelStyle}>Display Date</label><input type="text" className="admin-input" placeholder="e.g. 17 Mei 2026" value={event.displayDate} onChange={e => setEvent({...event, displayDate: e.target.value})} /></div>
              <div><label style={labelStyle}>Day</label><input type="text" className="admin-input" placeholder="e.g. Minggu" value={event.day} onChange={e => setEvent({...event, day: e.target.value})} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "1.5rem", marginBottom: "2rem" }}>
              <div><label style={labelStyle}>Location Name</label><input type="text" className="admin-input" value={event.locationName} onChange={e => setEvent({...event, locationName: e.target.value})} /></div>
              <div><label style={labelStyle}>Location City</label><input type="text" className="admin-input" value={event.locationCity} onChange={e => setEvent({...event, locationCity: e.target.value})} /></div>
              <div><label style={labelStyle}>Google Maps URL</label><input type="text" className="admin-input" value={event.mapsUrl} onChange={e => setEvent({...event, mapsUrl: e.target.value})} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
              <div><label style={labelStyle}>Akad Time</label><input type="text" className="admin-input" value={event.akadTime} onChange={e => setEvent({...event, akadTime: e.target.value})} /></div>
              <div><label style={labelStyle}>Resepsi Time</label><input type="text" className="admin-input" value={event.resepsiTime} onChange={e => setEvent({...event, resepsiTime: e.target.value})} /></div>
              <div><label style={labelStyle}>Live Stream Time</label><input type="text" className="admin-input" value={event.livestreamTime} onChange={e => setEvent({...event, livestreamTime: e.target.value})} /></div>
              <div><label style={labelStyle}>Live Stream URL</label><input type="text" className="admin-input" value={event.livestreamUrl} onChange={e => setEvent({...event, livestreamUrl: e.target.value})} /></div>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Aset File</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>Background Music</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "music", "media")} />
                  {media.music && <div style={{ marginTop: 10 }}><audio src={media.music} controls style={{ width: "100%", height: 32 }} /></div>}
                </div>
                <div>
                  <label style={labelStyle}>Hero Asset (Vid/Img)</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "heroVideo", "media")} />
                  {media.heroVideo && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: media.heroVideo, type: isVideo(media.heroVideo) ? "video" : "image" })}>{isVideo(media.heroVideo) ? <video src={media.heroVideo} style={previewImgStyle} muted loop /> : <img src={media.heroVideo} style={previewImgStyle} />}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Main Logo</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "logo", "media")} />
                  {media.logo && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: media.logo, type: "image" })}><img src={media.logo} style={previewImgStyle} /></div>}
                </div>
                <div>
                  <label style={labelStyle}>Opening Photo</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "openingPhoto", "media")} />
                  {media.openingPhoto && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: media.openingPhoto, type: "image" })}><img src={media.openingPhoto} style={previewImgStyle} /></div>}
                </div>
                <div>
                  <label style={labelStyle}>Gallery Video</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "galleryVideo", "media")} />
                  {media.galleryVideo && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: media.galleryVideo, type: "video" })}><video src={media.galleryVideo} style={previewImgStyle} muted loop /></div>}
                </div>
                <div>
                  <label style={labelStyle}>QR Banner Photo</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "qrBannerPhoto", "media")} />
                  {media.qrBannerPhoto && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: media.qrBannerPhoto, type: "image" })}><img src={media.qrBannerPhoto} style={previewImgStyle} /></div>}
                </div>
              </div>
            </div>
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Quotes & Other</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                <div>
                  <label style={labelStyle}>Greeting Text</label>
                  <input type="text" className="admin-input" placeholder="e.g. Assalamu'alaikum Wr. Wb." value={media.greetingText} onChange={e => setMedia({...media, greetingText: e.target.value})} />
                  
                  <label style={{ ...labelStyle, marginTop: "1rem" }}>Intro / Invitation Text</label>
                  <textarea className="admin-input" style={{ minHeight: "80px" }} placeholder="e.g. Dengan memohon Rahmat..." value={media.introText} onChange={e => setMedia({...media, introText: e.target.value})} />

                  <label style={{ ...labelStyle, marginTop: "1rem" }}>Quote Text</label>
                  <textarea className="admin-input" style={{ minHeight: "100px" }} value={media.quoteText} onChange={e => setMedia({...media, quoteText: e.target.value})} />
                  <label style={{ ...labelStyle, marginTop: "1rem" }}>Quote Ref</label>
                  <input type="text" className="admin-input" value={media.quoteRef} onChange={e => setMedia({...media, quoteRef: e.target.value})} />
                  
                  <label style={{ ...labelStyle, marginTop: "1rem" }}>Quote Background Image</label>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, "quoteBackground", "quote")} />
                    {uploading.quoteBackground && <span style={{ fontSize: "12px", color: "var(--primary)" }}>Uploading...</span>}
                    {media.quoteBackground && <span style={{ fontSize: "12px", color: "green" }}>✓ Uploaded</span>}
                  </div>
                  {media.quoteBackground && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <img src={media.quoteBackground} alt="Quote Bg" style={{ width: "100px", height: "auto", borderRadius: "8px", border: "1px solid #ddd" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Photo Gallery</h2>
              <input type="file" multiple className="admin-input" onChange={handleMultipleUpload} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
                {gallery.map((item, idx) => (
                  <div key={idx} style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", backgroundColor: "white", padding: "8px" }}>
                    <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "6px", color: "var(--admin-primary)" }}>Photo #{idx + 1}</div>
                    <div style={{ position: "relative", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                      <img src={item.src} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} onClick={() => setLightbox({ src: item.src, type: "image" })} />
                      <button onClick={() => setGallery(prev => prev.filter((_, i) => i !== idx))} style={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", borderRadius: "50%", cursor: "pointer", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", zIndex: 5 }}>×</button>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer", color: "#64748b" }}>
                      <input 
                        type="checkbox" 
                        checked={item.isLandscape} 
                        onChange={e => {
                          const ng = [...gallery];
                          ng[idx] = { ...ng[idx], isLandscape: e.target.checked };
                          setGallery(ng);
                        }} 
                      />
                      Landscape?
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Love Story</h2>
              <button className="admin-btn admin-btn-ghost" onClick={() => setStories([...stories, { src: "", subtitle: "" }])}>+ Add Story Item</button>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
                {stories.map((s, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "140px 1fr 40px", gap: "1.5rem", alignItems: "start", border: "1px solid #eee", padding: "1.25rem", borderRadius: "16px", backgroundColor: "#f9fafb" }}>
                    <div>
                      <label style={labelStyle}>Photo</label>
                      <input type="file" onChange={e => handleFileUpload(e, `storyPhoto_${idx}`, "story")} style={{ fontSize: "11px", marginBottom: 8 }} />
                      {s.src && <div style={{ ...previewWrapperStyle, width: "100%", height: 100, cursor: "zoom-in" }} onClick={() => setLightbox({ src: s.src, type: "image" })}><img src={s.src} style={previewImgStyle} /></div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Description</label>
                      <textarea placeholder="Subtitle (e.g. Pertama kali bertemu)" className="admin-input" style={{ minHeight: "80px" }} value={s.subtitle} onChange={e => { const ns = [...stories]; ns[idx].subtitle = e.target.value; setStories(ns); }} />
                    </div>
                    <div style={{ paddingTop: "2rem" }}>
                      <button onClick={() => setStories(stories.filter((_, i) => i !== idx))} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.25rem" }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="admin-card">
            <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Payments</h2>
            {paymentCards.map((p, i) => (
              <div key={i} style={{ border: "1px solid #eee", padding: 15, marginBottom: 15, borderRadius: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div><label style={labelStyle}>Bank / Title</label><input type="text" placeholder="e.g. BCA" className="admin-input" value={p.bank || ""} onChange={e => { setPaymentCards(prev => { const nc = [...prev]; nc[i] = { ...nc[i], bank: e.target.value }; return nc; }); }} /></div>
                  <div><label style={labelStyle}>Holder Name</label><input type="text" className="admin-input" value={p.holderName || ""} onChange={e => { setPaymentCards(prev => { const nc = [...prev]; nc[i] = { ...nc[i], holderName: e.target.value }; return nc; }); }} /></div>
                  {!p.isAddress && <div><label style={labelStyle}>Account Number</label><input type="text" className="admin-input" value={p.accountNumber || ""} onChange={e => { setPaymentCards(prev => { const nc = [...prev]; nc[i] = { ...nc[i], accountNumber: e.target.value }; return nc; }); }} /></div>}
                </div>
                {p.isAddress && (
                   <div style={{ marginTop: 10 }}>
                     <label style={labelStyle}>Shipping Address</label>
                     <textarea className="admin-input" style={{ minHeight: "60px" }} value={p.address || ""} onChange={e => { setPaymentCards(prev => { const nc = [...prev]; nc[i] = { ...nc[i], address: e.target.value }; return nc; }); }} />
                   </div>
                )}
                <div style={{ display: "flex", gap: 20, marginTop: 15 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><input type="checkbox" checked={!!p.isQris} onChange={e => { setPaymentCards(prev => { const nc = [...prev]; nc[i] = { ...nc[i], isQris: e.target.checked, isAddress: e.target.checked ? false : nc[i].isAddress }; return nc; }); }} /> Is QRIS</label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><input type="checkbox" checked={!!p.isAddress} onChange={e => { setPaymentCards(prev => { const nc = [...prev]; nc[i] = { ...nc[i], isAddress: e.target.checked, isQris: e.target.checked ? false : nc[i].isQris }; return nc; }); }} /> Is Address (Gift)</label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 15, marginTop: 15 }}>
                  {!p.isAddress && (
                    <div>
                      <label style={labelStyle}>Logo Right (Bank)</label>
                      <input type="file" onChange={e => handleFileUpload(e, `paymentLogo_${i}`, "payment")} />
                      {p.images?.logo && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: p.images.logo, type: "image" })}><img src={p.images.logo} style={previewImgStyle} /></div>}
                    </div>
                  )}
                  {p.isQris && (
                    <>
                      <div>
                        <label style={labelStyle}>Logo Left (QRIS Branding)</label>
                        <input type="file" onChange={e => handleFileUpload(e, `paymentLogoLeft_${i}`, "payment")} />
                        {p.images?.logoLeft && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: p.images.logoLeft, type: "image" })}><img src={p.images.logoLeft} style={previewImgStyle} /></div>}
                      </div>
                      <div>
                        <label style={labelStyle}>QR Code Image</label>
                        <input type="file" onChange={e => handleFileUpload(e, `paymentQris_${i}`, "payment")} />
                        {p.images?.qrisImage && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: p.images.qrisImage, type: "image" })}><img src={p.images.qrisImage} style={previewImgStyle} /></div>}
                      </div>
                    </>
                  )}
                  {!p.isAddress && (
                    <div>
                      <label style={labelStyle}>Card Chip Image</label>
                      <input type="file" onChange={e => handleFileUpload(e, `paymentChip_${i}`, "payment")} />
                      {p.images?.chipImage && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: p.images.chipImage, type: "image" })}><img src={p.images.chipImage} style={previewImgStyle} /></div>}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 15, display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => setPaymentCards(paymentCards.filter((_, idx) => idx !== i))} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}>Delete Method</button>
                </div>
              </div>
            ))}
            <button className="admin-btn admin-btn-ghost" onClick={() => setPaymentCards([...paymentCards, { bank: "", holderName: "", accountNumber: "", isQris: false, isAddress: false, address: "", images: { logo: "", logoLeft: "", qrisImage: "", chipImage: "" } }])}>+ Add Payment Method</button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem", paddingBottom: "3rem" }}>
         <button type="button" onClick={() => { const i = tabs.findIndex(t => t.id === activeTab); if (i > 0) setActiveTab(tabs[i - 1].id); }} disabled={activeTab === "basic"} className="admin-btn admin-btn-ghost">Previous Step</button>
         <button type="button" onClick={() => { const i = tabs.findIndex(t => t.id === activeTab); if (i < tabs.length - 1) setActiveTab(tabs[i + 1].id); else handleSubmit({ preventDefault: () => {} } as any); }} className="admin-btn admin-btn-primary" style={{ padding: "0.75rem 2.5rem" }}>
           {activeTab === "payment" ? "Create Invitation" : "Next Step"}
         </button>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div style={lightboxOverlayStyle} onClick={() => setLightbox(null)}>
          <button style={lightboxCloseStyle} onClick={() => setLightbox(null)}>×</button>
          <div style={lightboxContentStyle} onClick={e => e.stopPropagation()}>
            {lightbox.type === "image" ? (
              <img src={lightbox.src} style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 12 }} />
            ) : (
              <video src={lightbox.src} controls autoPlay style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 12 }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.5rem" };
const inputGroupStyle: React.CSSProperties = { display: "flex", flexDirection: "column" };
const previewWrapperStyle: React.CSSProperties = { position: "relative", width: 80, height: 80, borderRadius: 12, overflow: "hidden", marginTop: 10, border: "1px solid #eee", backgroundColor: "#f3f4f6", cursor: "zoom-in" };
const previewImgStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const removeBtnStyle: React.CSSProperties = { position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, zIndex: 10 };

const lightboxOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" };
const lightboxContentStyle: React.CSSProperties = { position: "relative", maxWidth: "90vw", maxHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" };
const lightboxCloseStyle: React.CSSProperties = { position: "absolute", top: 20, right: 30, fontSize: 40, color: "white", border: "none", background: "none", cursor: "pointer", zIndex: 10000 };
