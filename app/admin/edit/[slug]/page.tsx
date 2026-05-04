"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EditInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const targetSlug = params.slug as string;

  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    greetingText: "", introText: "", ogImage: ""
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

  useEffect(() => { if (targetSlug) fetchInvitation(); }, [targetSlug]);

  async function fetchInvitation() {
    setLoading(true);
    const decodedSlug = decodeURIComponent(targetSlug);
    const { data, error } = await supabase.from("invitations").select("*").eq("slug", decodedSlug).single();
    
    if (error) { 
      alert("Error fetching invitation: " + error.message); 
      router.push("/admin"); 
      return; 
    }
    
    if (data) {
      setInvitationId(data.id);
      setSlug(data.slug || "");
      setTemplate(data.template_version || "v1");
      setIsActive(data.is_active ?? true);
      const c = data.content || {};
      
      const b = c.couple?.bride || {};
      setBride({ 
        shortName: b.shortName || "", 
        fullName: b.fullName || "", 
        label: b.label || "", 
        parentsFather: b.parents?.father || "", 
        parentsMother: b.parents?.mother || "", 
        igUser: b.instagram?.username || "", 
        photo: b.photo || "" 
      });

      const g = c.couple?.groom || {};
      setGroom({ 
        shortName: g.shortName || "", 
        fullName: g.fullName || "", 
        label: g.label || "", 
        parentsFather: g.parents?.father || "", 
        parentsMother: g.parents?.mother || "", 
        igUser: g.instagram?.username || "", 
        photo: g.photo || "" 
      });

      const ev = c.event || {};
      setEvent({ 
        date: ev.date || "", 
        displayDate: ev.displayDate || "", 
        day: ev.day || "", 
        locationName: ev.locationName || "", 
        locationCity: ev.locationCity || "", 
        mapsUrl: ev.mapsUrl || "", 
        akadTime: ev.akad?.time || "", 
        resepsiTime: ev.resepsi?.time || "", 
        livestreamTime: ev.livestream?.time || "", 
        livestreamUrl: ev.livestream?.url || "" 
      });

      const m = c.media || {};
      setMedia({ 
        music: m.music || "", 
        heroVideo: m.heroVideo || "", 
        logo: m.logo || "", 
        galleryVideo: m.galleryVideo || "", 
        openingPhoto: m.openingPhoto || "", 
        qrBannerPhoto: m.qrBannerPhoto || "", 
        quoteText: m.quote?.text || "", 
        quoteRef: m.quote?.ref || "",
        quoteBackground: m.quote?.background || "",
        greetingText: m.greetingText || "",
        introText: m.introText || "",
        ogImage: m.ogImage || ""
      });

      setGallery((m.gallery || []).map((img: any) => typeof img === 'string' ? { src: img, isLandscape: false } : img));
      setStories(m.story || []);
      
      const pCards = (c.payment || []).map((p: any) => ({
        bank: p.bank || "",
        holderName: p.holderName || "",
        accountNumber: p.accountNumber || "",
        isQris: !!p.isQris,
        isAddress: !!p.isAddress,
        address: p.address || "",
        images: {
          logo: p.images?.logo || "",
          logoLeft: p.images?.logoLeft || "",
          qrisImage: p.images?.qrisImage || "",
          chipImage: p.images?.chipImage || ""
        }
      }));
      setPaymentCards(pCards);
    }
    setLoading(false);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, folder: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!slug) {
       alert("Slug is missing. Please ensure the invitation data is loaded correctly.");
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
       alert("Slug is missing. Cannot upload gallery photos.");
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
    console.log("Submit triggered. invitationId:", invitationId);
    
    if (!invitationId || invitationId === "undefined" || invitationId === "null") { 
      alert(`Cannot save: Invitation ID is invalid (Received: ${invitationId}). Please refresh the page.`); 
      return; 
    }
    
    setSaving(true);
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
        ogImage: media.ogImage,
        story: stories, gallery: gallery
      },
      payment: paymentCards.map(p => ({
        ...p,
        isQris: !!p.isQris,
        isAddress: !!p.isAddress
      }))
    };
    
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, template_version: template, content, is_active: isActive }),
      });

      const result = await response.json();
      setSaving(false);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update');
      }

      alert("Successfully updated via Server API!"); 
      router.push("/admin");
    } catch (err: any) {
      setSaving(false);
      console.error("API Error:", err);
      alert("Error: " + err.message);
    }
  };

  const isVideo = (url: string) => url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".mov");
  const currentTabIdx = tabs.findIndex(t => t.id === activeTab);

  if (loading) return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in">
      <div className="admin-skeleton h-8 w-48 mb-2"/>
      <div className="admin-skeleton h-4 w-64 mb-6"/>
      <div className="admin-skeleton h-16 w-full rounded-2xl mb-6"/>
      <div className="admin-card"><div className="admin-skeleton h-6 w-32 mb-4"/><div className="grid grid-cols-2 gap-6"><div className="admin-skeleton h-10 w-full rounded-lg"/><div className="admin-skeleton h-10 w-full rounded-lg"/></div></div>
    </div>
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in">
      <header className="mb-4 md:mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-admin-text">Edit Invitation</h1>
            <p className="admin-p text-xs md:text-sm">Editing <strong className="text-admin-text">/{slug}</strong></p>
          </div>
          <div className="hidden md:flex gap-3">
            <Link href="/admin" className="admin-btn admin-btn-ghost">Cancel</Link>
            <button onClick={handleSubmit} disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? (<><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{animation:"spin .6s linear infinite"}}/> Saving...</>) : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Update Changes</>)}
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Content - Single Page Scroll */}
      <div className="flex flex-col gap-6 md:gap-8 pb-24">
        {/* Configuration Section */}
        <div className="admin-card">
            <div className="admin-section-header"><h2 className="admin-h2">Configuration</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="admin-form-group">
                <label className="admin-label">URL Slug</label>
                <input type="text" className="admin-input" value={slug || ""} onChange={e => setSlug(e.target.value)} />
                <span className="admin-helper">nimantra.id/<strong>{slug || '...'}</strong></span>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Template</label>
                <select className="admin-input" value={template || "v1"} onChange={e => setTemplate(e.target.value)}><option value="v1">Template V1 (Modern Emerald)</option></select>
              </div>
            </div>
            <div className="mt-6 pt-5" style={{borderTop:"1px solid #f1f5f9"}}>
              <label className="admin-toggle">
                <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} />
                <div className="admin-toggle-track"/>
                <span className="admin-toggle-label">{isActive ? "Active — invitation is live" : "Inactive — invitation is hidden"}</span>
              </label>
            </div>
          </div>

        {/* The Couple Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>The Bride</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div><label style={labelStyle}>Full Name</label><input type="text" className="admin-input" value={bride.fullName || ""} onChange={e => setBride({...bride, fullName: e.target.value})} /></div>
                <div><label style={labelStyle}>Short Name</label><input type="text" className="admin-input" value={bride.shortName || ""} onChange={e => setBride({...bride, shortName: e.target.value})} /></div>
                <div><label style={labelStyle}>Label</label><input type="text" className="admin-input" value={bride.label || ""} onChange={e => setBride({...bride, label: e.target.value})} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div><label style={labelStyle}>Father</label><input type="text" className="admin-input" value={bride.parentsFather || ""} onChange={e => setBride({...bride, parentsFather: e.target.value})} /></div>
                  <div><label style={labelStyle}>Mother</label><input type="text" className="admin-input" value={bride.parentsMother || ""} onChange={e => setBride({...bride, parentsMother: e.target.value})} /></div>
                </div>
                <div><label style={labelStyle}>Instagram</label><input type="text" className="admin-input" value={bride.igUser || ""} onChange={e => setBride({...bride, igUser: e.target.value})} /></div>
                <div>
                  <label style={labelStyle}>Photo</label>
                  <input type="file" onChange={e => handleFileUpload(e, "bridePhoto", "couple")} />
                  {bride.photo && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: bride.photo, type: "image" })}><img src={bride.photo} style={previewImgStyle} /></div>}
                </div>
              </div>
            </div>
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>The Groom</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div><label style={labelStyle}>Full Name</label><input type="text" className="admin-input" value={groom.fullName || ""} onChange={e => setGroom({...groom, fullName: e.target.value})} /></div>
                <div><label style={labelStyle}>Short Name</label><input type="text" className="admin-input" value={groom.shortName || ""} onChange={e => setGroom({...groom, shortName: e.target.value})} /></div>
                <div><label style={labelStyle}>Label</label><input type="text" className="admin-input" value={groom.label || ""} onChange={e => setGroom({...groom, label: e.target.value})} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div><label style={labelStyle}>Father</label><input type="text" className="admin-input" value={groom.parentsFather || ""} onChange={e => setGroom({...groom, parentsFather: e.target.value})} /></div>
                  <div><label style={labelStyle}>Mother</label><input type="text" className="admin-input" value={groom.parentsMother || ""} onChange={e => setGroom({...groom, parentsMother: e.target.value})} /></div>
                </div>
                <div><label style={labelStyle}>Instagram</label><input type="text" className="admin-input" value={groom.igUser || ""} onChange={e => setGroom({...groom, igUser: e.target.value})} /></div>
                <div>
                  <label style={labelStyle}>Photo</label>
                  <input type="file" onChange={e => handleFileUpload(e, "groomPhoto", "couple")} />
                  {groom.photo && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: groom.photo, type: "image" })}><img src={groom.photo} style={previewImgStyle} /></div>}
                </div>
              </div>
            </div>
          </div>

        {/* Event Section */}
        <div className="admin-card">
            <h2 className="admin-h2" style={{ marginBottom: "2rem" }}>Event Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
              <div><label style={labelStyle}>Date</label><input type="date" className="admin-input" value={event.date || ""} onChange={e => setEvent({...event, date: e.target.value})} /></div>
              <div><label style={labelStyle}>Display Date</label><input type="text" className="admin-input" value={event.displayDate || ""} onChange={e => setEvent({...event, displayDate: e.target.value})} /></div>
              <div><label style={labelStyle}>Day</label><input type="text" className="admin-input" value={event.day || ""} onChange={e => setEvent({...event, day: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
              <div><label style={labelStyle}>Location Name</label><input type="text" className="admin-input" value={event.locationName || ""} onChange={e => setEvent({...event, locationName: e.target.value})} /></div>
              <div><label style={labelStyle}>Location City</label><input type="text" className="admin-input" value={event.locationCity || ""} onChange={e => setEvent({...event, locationCity: e.target.value})} /></div>
              <div><label style={labelStyle}>Google Maps URL</label><input type="text" className="admin-input" value={event.mapsUrl || ""} onChange={e => setEvent({...event, mapsUrl: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div><label style={labelStyle}>Akad</label><input type="text" className="admin-input" value={event.akadTime || ""} onChange={e => setEvent({...event, akadTime: e.target.value})} /></div>
              <div><label style={labelStyle}>Resepsi</label><input type="text" className="admin-input" value={event.resepsiTime || ""} onChange={e => setEvent({...event, resepsiTime: e.target.value})} /></div>
              <div><label style={labelStyle}>Live Stream Time</label><input type="text" className="admin-input" value={event.livestreamTime || ""} onChange={e => setEvent({...event, livestreamTime: e.target.value})} /></div>
              <div><label style={labelStyle}>Live Stream URL</label><input type="text" className="admin-input" value={event.livestreamUrl || ""} onChange={e => setEvent({...event, livestreamUrl: e.target.value})} /></div>
            </div>
          </div>

        {/* Media & Assets Section */}
        <div className="flex flex-col gap-6 md:gap-8">
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Aset File</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label style={labelStyle}>Background Music</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "music", "media")} />
                  {media.music && <div style={{ marginTop: 10 }}><audio src={media.music} controls style={{ width: "100%", height: 32 }} /></div>}
                </div>
                <div>
                  <label style={labelStyle}>Hero Asset</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "heroVideo", "media")} />
                  {media.heroVideo && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: media.heroVideo, type: isVideo(media.heroVideo) ? "video" : "image" })}>{isVideo(media.heroVideo) ? <video src={media.heroVideo} style={previewImgStyle} muted loop /> : <img src={media.heroVideo} style={previewImgStyle} />}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Logo</label>
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
                  <label style={labelStyle}>QR Banner</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "qrBannerPhoto", "media")} />
                  {media.qrBannerPhoto && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: media.qrBannerPhoto, type: "image" })}><img src={media.qrBannerPhoto} style={previewImgStyle} /></div>}
                </div>
                <div>
                  <label style={labelStyle}>Link Preview (Social Media)</label>
                  <input type="file" className="admin-input" onChange={e => handleFileUpload(e, "ogImage", "media")} />
                  {media.ogImage && <div style={previewWrapperStyle} onClick={() => setLightbox({ src: media.ogImage, type: "image" })}><img src={media.ogImage} style={previewImgStyle} /></div>}
                  <span className="admin-helper">This image will appear when the link is shared on WhatsApp/IG.</span>
                </div>
              </div>
            </div>
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Quotes & Other</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div>
                  <label style={labelStyle}>Greeting Text</label>
                  <input type="text" className="admin-input" placeholder="e.g. Assalamu'alaikum Wr. Wb." value={media.greetingText} onChange={e => setMedia({...media, greetingText: e.target.value})} />
                  
                  <label style={{ ...labelStyle, marginTop: "1rem" }}>Intro / Invitation Text</label>
                  <textarea className="admin-input" style={{ minHeight: "80px" }} placeholder="e.g. Dengan memohon Rahmat..." value={media.introText} onChange={e => setMedia({...media, introText: e.target.value})} />

                  <label style={labelStyle}>Quote Text</label>
                  <textarea className="admin-input" style={{ minHeight: "100px" }} value={media.quoteText || ""} onChange={e => setMedia({...media, quoteText: e.target.value})} />
                  <label style={{ ...labelStyle, marginTop: "1rem" }}>Quote Ref</label>
                  <input type="text" className="admin-input" value={media.quoteRef || ""} onChange={e => setMedia({...media, quoteRef: e.target.value})} />
                  
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

        {/* Gallery & Stories Section */}
        <div className="flex flex-col gap-6 md:gap-8">
            <div className="admin-card">
              <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Gallery</h2>
              <input type="file" multiple className="admin-input" onChange={handleMultipleUpload} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
                {gallery.map((item, idx) => (
                  <div key={idx} style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", backgroundColor: "white", padding: "8px" }}>
                    <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "6px", color: "var(--admin-primary)" }}>Photo #{idx + 1}</div>
                    <div style={{ position: "relative", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                      <img src={item.src} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} onClick={() => setLightbox({ src: item.src, type: "image" })} />
                      <button onClick={() => setGallery(prev => prev.filter((_, i) => i !== idx))} style={removeBtnStyle}>×</button>
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
              <h2 className="admin-h2" style={{ marginTop: "1rem", marginBottom: "1rem" }}>Love Story</h2>
              <button className="admin-btn admin-btn-ghost" onClick={() => setStories([...stories, { src: "", subtitle: "" }])}>+ Add Story Item</button>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
                {stories.map((s, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[140px_1fr_40px] gap-4 md:gap-6" style={{ border: "1px solid #eee", padding: "1rem", borderRadius: "16px", backgroundColor: "#f9fafb" }}>
                    <div>
                      <label style={labelStyle}>Photo</label>
                      <input type="file" onChange={e => handleFileUpload(e, `storyPhoto_${i}`, "story")} style={{ fontSize: "11px", marginBottom: 8 }} />
                      {s.src && <div style={{ ...previewWrapperStyle, width: "100%", height: 100, cursor: "zoom-in" }} onClick={() => setLightbox({ src: s.src, type: "image" })}><img src={s.src} style={previewImgStyle} /></div>}
                    </div>
                    <div>
                      <label style={labelStyle}>Description</label>
                      <textarea placeholder="Subtitle" className="admin-input" style={{ minHeight: "80px" }} value={s.subtitle || ""} onChange={e => { const ns = [...stories]; ns[i].subtitle = e.target.value; setStories(ns); }} />
                    </div>
                    <button onClick={() => setStories(stories.filter((_, idx) => idx !== i))} style={{ border: "none", background: "none", color: "red", cursor: "pointer", paddingTop: "2.5rem" }}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Payment Section */}
        <div className="admin-card">
            <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Payments</h2>
            {paymentCards.map((p, i) => (
              <div key={i} style={{ border: "1px solid #eee", padding: 15, marginBottom: 15, borderRadius: 12 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div><label style={labelStyle}>Bank / Title</label><input type="text" className="admin-input" value={p.bank || ""} onChange={e => { setPaymentCards(prev => { const nc = [...prev]; nc[i] = { ...nc[i], bank: e.target.value }; return nc; }); }} /></div>
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
                   <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}><input type="checkbox" checked={!!p.isQris} onChange={e => { setPaymentCards(prev => { const nc = [...prev]; nc[i] = { ...nc[i], isQris: e.target.checked, isAddress: e.target.checked ? false : nc[i].isAddress }; return nc; }); }} /> Is QRIS</label>
                   <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}><input type="checkbox" checked={!!p.isAddress} onChange={e => { setPaymentCards(prev => { const nc = [...prev]; nc[i] = { ...nc[i], isAddress: e.target.checked, isQris: e.target.checked ? false : nc[i].isQris }; return nc; }); }} /> Is Address (Gift)</label>
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
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                  <button onClick={() => setPaymentCards(paymentCards.filter((_, idx) => idx !== i))} style={{ color: "red", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}>Delete Method</button>
                </div>
              </div>
            ))}
            <button className="admin-btn admin-btn-ghost" onClick={() => setPaymentCards([...paymentCards, { bank: "", holderName: "", accountNumber: "", isQris: false, isAddress: false, address: "", images: { logo: "", logoLeft: "", qrisImage: "", chipImage: "" } }])}>+ Add Method</button>
          </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="admin-sticky-bar">
         <Link href="/admin" className="admin-btn admin-btn-ghost" style={{ minHeight: 44 }}>
           Cancel
         </Link>
         <button type="button" onClick={handleSubmit} disabled={saving} className="admin-btn admin-btn-primary" style={{ minHeight: 44, width: "100%", maxWidth: "300px" }}>
            {saving ? (<><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{animation:"spin .6s linear infinite"}}/> Saving...</>) : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Update Changes</>)}
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

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#475569", marginBottom: "0.375rem" };
const previewWrapperStyle: React.CSSProperties = { position: "relative", width: 80, height: 80, borderRadius: 12, overflow: "hidden", marginTop: 10, border: "1px solid #eee", backgroundColor: "#f3f4f6", cursor: "zoom-in" };
const previewImgStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const removeBtnStyle: React.CSSProperties = { position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, zIndex: 5 };

const lightboxOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" };
const lightboxContentStyle: React.CSSProperties = { position: "relative", maxWidth: "90vw", maxHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" };
const lightboxCloseStyle: React.CSSProperties = { position: "absolute", top: 20, right: 30, fontSize: 40, color: "white", border: "none", background: "none", cursor: "pointer", zIndex: 10000 };
