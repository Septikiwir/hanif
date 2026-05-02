import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NTA2MCwiZXhwIjoyMDkyODcxMDYwfQ.I-_CqlF7jbxu4nq61L09UHPpqo_y2V0yJGLofg14m-A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkGallery() {
  const { data, error } = await supabase
    .from('invitations')
    .select('content')
    .eq('slug', 'fizah-hanif')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  const gallery = data.content.media.gallery;
  console.log('Gallery Length:', gallery.length);
  gallery.forEach((img: any, idx: number) => {
    console.log(`[${idx}] Landscape: ${img.isLandscape}, URL: ${img.src}`);
  });
}

checkGallery();
