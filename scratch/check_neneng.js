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
    .select('id, slug, content');

  if (error) {
    console.error('Error fetching invitations:', error);
    return;
  }

  console.log('--- Slugs and couples found in database ---');
  data.forEach(item => {
    const bride = item.content?.couple?.bride?.fullName || item.content?.couple?.bride?.shortName;
    const groom = item.content?.couple?.groom?.fullName || item.content?.couple?.groom?.shortName;
    console.log(`Slug: "${item.slug}" -> ${bride} & ${groom}`);
    if (item.slug.toLowerCase().includes('neneng')) {
      console.log('JSON:', JSON.stringify(item.content, null, 2));
    }
  });
}

main();
