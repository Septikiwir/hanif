import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NTA2MCwiZXhwIjoyMDkyODcxMDYwfQ.I-_CqlF7jbxu4nq61L09UHPpqo_y2V0yJGLofg14m-A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearData() {
  const slug = 'fizah-hanif';
  
  console.log(`Clearing RSVP and Wishes for: ${slug}`);

  // 1. Clear Wishes
  const { count: wishesCount, error: wishesError } = await supabase
    .from('wishes')
    .delete({ count: 'exact' })
    .eq('invitation_slug', slug);
  
  if (wishesError) {
    console.error('Error clearing wishes:', wishesError);
  } else {
    console.log(`Successfully cleared ${wishesCount} wishes.`);
  }

  // 2. Clear RSVP
  const { count: rsvpCount, error: rsvpError } = await supabase
    .from('rsvp')
    .delete({ count: 'exact' })
    .eq('invitation_slug', slug);
  
  if (rsvpError) {
    console.error('Error clearing RSVP:', rsvpError);
  } else {
    console.log(`Successfully cleared ${rsvpCount} RSVP records.`);
  }
}

clearData();
