import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val) env[key.trim()] = val.join('=').trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_URL = `${supabaseUrl}/storage/v1/object/public/invitations`

function fixPath(pathStr: string | undefined): string {
  if (!pathStr) return ""
  if (pathStr.startsWith('http')) return pathStr
  const cleanPath = pathStr.startsWith('/') ? pathStr.slice(1) : pathStr
  // Encode URI to handle spaces
  return encodeURI(`${BUCKET_URL}/${cleanPath}`)
}

const rawData = {
  "couple": {
    "bride": {
      "shortName": "Fizah",
      "fullName": "Nur Hafizah, S.Pd.",
      "label": "Putri Pertama Dari",
      "parents": {
        "father": "Bapak H. Muhammad Salmani, S.Ag. (Alm)",
        "mother": "Ibu Hj. Yumita, S.H."
      },
      "instagram": {
        "username": "NRHFZH22",
        "url": "https://www.instagram.com/nrhfzh22?igsh=eXp6N2dja25ua294"
      },
      "photo": "/fizah-hanif/Fizah.JPG"
    },
    "groom": {
      "shortName": "Hanif",
      "fullName": "Hanif Assalam, M.Pd.",
      "label": "Putra Pertama Dari",
      "parents": {
        "father": "Bapak H. Pandaya, S.Pd.",
        "mother": "Ibu Hj. Rusmiyati, S.Pd.SD."
      },
      "instagram": {
        "username": "HANIFASSALAMM",
        "url": "https://www.instagram.com/hanifassalamm?igsh=Z3psZGN3YzcwOXd1&utm_source=qr"
      },
      "photo": "/fizah-hanif/Hanif.JPG"
    }
  },
  "event": {
    "date": "2026-05-17T00:00:00+07:00",
    "displayDate": "17 Mei 2026",
    "day": "Minggu",
    "locationName": "Gedung Pancasila",
    "locationCity": "Kabupaten Ketapang",
    "mapsUrl": "https://www.google.com/maps/place//data=!4m2!3m1!1s0x2e05185c3dff60d5:0x224a938d719caf80?entry=s&sa=X&ved=2ahUKEwiFseeC4_qPAxVy3jgGHXElL1QQ4kB6BAgUEAA",
    "akad": { "time": "09.00 WIB — Selesai" },
    "resepsi": { "time": "16.00 WIB — Selesai" },
    "livestream": { 
      "time": "08.45 WIB", 
      "url": "https://www.instagram.com/hanifassalamm?upcoming_event_id=17882896233394607" 
    }
  },
  "media": {
    "music": "/fizah-hanif/Nadhif Basalamah - Kota Ini Tak Sama Tanpamu (Official Music Video Lyric).mp3",
    "heroVideo": "/fizah-hanif/Undangan Digital Video.mp4",
    "logo": "/fizah-hanif/logo_hanif.png",
    "openingPhoto": "/fizah-hanif/opening.JPG",
    "galleryVideo": "/fizah-hanif/Video Landscape Galery.mp4",
    "paymentLogoLeft": "/fizah-hanif/Qris3.jpeg",
    "qrBannerPhoto": "/fizah-hanif/3.jpg",
    "quote": {
      "text": "Dan diantara tanda-tanda kekuasaanNya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikanNya diantaramu rasa kasih dan sayang.",
      "ref": "QS. Ar-Rum : 21"
    },
    "story": [
      { "src": "/fizah-hanif/1.JPG", "subtitle": "Yogyakarta, 8 Mei 2018, kota tempat pertama kali bertemu. Pertemanan sederhana yang berkembang menjadi sesuatu yang lebih dalam." },
      { "src": "/fizah-hanif/2.JPG", "subtitle": "Waktu membawa kami ke ketinggian Gunung Prau—pendakian pertama kami bersama. Di sanalah, hati kami mulai saling mengenal." },
      { "src": "/fizah-hanif/3.jpg", "subtitle": "Seiring berjalannya waktu, —hingga cinta dengan lembut menemukan jalannya dalam hidup kami. 13 September 2025, kami mengikat janji, dan pada 17 Mei 2026, kami memulai selamanya." },
      { "src": "/fizah-hanif/4.jpg", "subtitle": "Pertemuan yang menjadi perjalanan seumur hidup—ini adalah kisah kami, cerita kami, cinta kami." }
    ],
    "gallery": [
      { "src": "/fizah-hanif/gallery/1.jpg", "isLandscape": true },
      { "src": "/fizah-hanif/gallery/2.jpg", "isLandscape": false },
      { "src": "/fizah-hanif/gallery/3.jpg", "isLandscape": false },
      { "src": "/fizah-hanif/gallery/4.jpg", "isLandscape": true },
      { "src": "/fizah-hanif/gallery/5.JPG", "isLandscape": false },
      { "src": "/fizah-hanif/gallery/6.jpg", "isLandscape": false },
      { "src": "/fizah-hanif/gallery/7.jpg", "isLandscape": false },
      { "src": "/fizah-hanif/gallery/8.JPG", "isLandscape": true },
      { "src": "/fizah-hanif/gallery/9.JPG", "isLandscape": false },
      { "src": "/fizah-hanif/gallery/10.png", "isLandscape": false },
      { "src": "/fizah-hanif/gallery/11.JPG", "isLandscape": true },
      { "src": "/fizah-hanif/gallery/12.JPG", "isLandscape": false },
      { "src": "/fizah-hanif/gallery/13.JPG", "isLandscape": false },
      { "src": "/fizah-hanif/gallery/14.JPG", "isLandscape": false }
    ]
  },
  "payment": [
    {
      "id": "bca",
      "bank": "BCA",
      "holderName": "HANIF ASSALAM",
      "images": {
        "qrisImage": "/fizah-hanif/Qris.jpeg",
        "chipImage": "/fizah-hanif/Qris1.jpeg",
        "logo": "/fizah-hanif/Qris2.jpeg"
      }
    },
    {
      "id": "address",
      "bank": "Alamat Pengiriman",
      "isAddress": true,
      "address": "Jalan Merak, Gg Dedek, Kelurahan Sampit, Kecamatan Delta Pawan, Kabupaten Ketapang, Kalimantan Barat, 78813 (Rumah Cat Kuning, Belakang Kantor PAN)\n(HP : +62 895-6158-01699)",
      "holderName": "Nur Hafizah",
      "images": {
        "qrisImage": "",
        "chipImage": "",
        "logo": ""
      }
    }
  ]
}

async function updateData() {
  // Fix paths
  rawData.couple.bride.photo = fixPath(rawData.couple.bride.photo)
  rawData.couple.groom.photo = fixPath(rawData.couple.groom.photo)
  rawData.media.music = fixPath(rawData.media.music)
  rawData.media.heroVideo = fixPath(rawData.media.heroVideo)
  rawData.media.logo = fixPath(rawData.media.logo)
  rawData.media.openingPhoto = fixPath(rawData.media.openingPhoto)
  rawData.media.galleryVideo = fixPath(rawData.media.galleryVideo)
  rawData.media.paymentLogoLeft = fixPath(rawData.media.paymentLogoLeft)
  rawData.media.qrBannerPhoto = fixPath(rawData.media.qrBannerPhoto)
  
  rawData.media.story = rawData.media.story.map(s => ({ ...s, src: fixPath(s.src) }))
  rawData.media.gallery = rawData.media.gallery.map(g => ({ ...g, src: fixPath(g.src) }))
  
  rawData.payment = rawData.payment.map(p => ({
    ...p,
    images: {
      ...p.images,
      qrisImage: fixPath(p.images?.qrisImage),
      chipImage: fixPath(p.images?.chipImage),
      logo: fixPath(p.images?.logo)
    }
  }))

  const { data, error } = await supabase
    .from('invitations')
    .update({ content: rawData })
    .eq('slug', 'fizah-hanif')
    .select()

  if (error) {
    console.error('Error updating data:', error)
  } else {
    console.log('Update success!', JSON.stringify(data, null, 2))
  }
}

updateData()
