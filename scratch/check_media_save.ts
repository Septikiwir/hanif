import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NTA2MCwiZXhwIjoyMDkyODcxMDYwfQ.I-_CqlF7jbxu4nq61L09UHPpqo_y2V0yJGLofg14m-A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Latest Invitation slug:', data[0].slug);
    console.log('Content structure:', JSON.stringify(data[0].content, null, 2));
  } else {
    console.log('No data found in invitations table.');
  }
}

checkSchema();
