import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NTA2MCwiZXhwIjoyMDkyODcxMDYwfQ.I-_CqlF7jbxu4nq61L09UHPpqo_y2V0yJGLofg14m-A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData(slug: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('content')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error [${slug}]:`, error);
    return;
  }

  const media = data.content.media;
  console.log(`--- Media Content [${slug}] ---`);
  console.log('Quote:', media.quote);
  console.log('Greeting Text:', media.greetingText || '(Not set)');
  console.log('Intro Text:', media.introText || '(Not set)');
}

async function run() {
    await checkData('fizah-hanif');
    await checkData('Indah-Arif');
}

run();
