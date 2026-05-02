import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NTA2MCwiZXhwIjoyMDkyODcxMDYwfQ.I-_CqlF7jbxu4nq61L09UHPpqo_y2V0yJGLofg14m-A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkIndahArif() {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('slug', 'Indah-Arif')
    .single();
  
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  if (data) {
    console.log('Indah-Arif Content:', JSON.stringify(data.content, null, 2));
  }
}

checkIndahArif();
