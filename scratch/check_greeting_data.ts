import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NTA2MCwiZXhwIjoyMDkyODcxMDYwfQ.I-_CqlF7jbxu4nq61L09UHPpqo_y2V0yJGLofg14m-A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  const { data, error } = await supabase
    .from('invitations')
    .select('content')
    .eq('slug', 'fizah-hanif')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  const media = data.content.media;
  console.log('--- Media Content ---');
  console.log('Greeting Text:', media.greetingText || '(Not set)');
  console.log('Intro Text:', media.introText || '(Not set)');
  console.log('Gallery Items:', media.gallery.length);
}

checkData();
