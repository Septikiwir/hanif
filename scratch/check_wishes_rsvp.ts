import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val) env[key.trim()] = val.join('=').trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  const { data: w } = await supabase.from('wishes').select('*').limit(1)
  console.log('Wishes sample:', w?.[0] ? Object.keys(w[0]) : 'Empty')

  const { data: r } = await supabase.from('rsvp').select('*').limit(1)
  console.log('RSVP sample:', r?.[0] ? Object.keys(r[0]) : 'Empty')
}

check()
