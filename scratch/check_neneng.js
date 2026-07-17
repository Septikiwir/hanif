const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read from .env.local
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const lines = envFile.split('\n');
let supabaseUrl = '';
let supabaseServiceKey = '';

lines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseServiceKey = line.split('=')[1].trim();
  }
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Could not find Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data, error } = await supabase
    .from('invitations')
    .select('slug, content')
    .eq('slug', 'Indah-Arif')
    .single();

  if (error) {
    console.error('Error fetching invitation:', error);
    return;
  }

  console.log('--- Content for Indah-Arif ---');
  console.log(JSON.stringify(data.content.media, null, 2));
}

main();
