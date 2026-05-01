import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val) env[key.trim()] = val.join('=').trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function migrate() {
  console.log('Migrating wishes...')
  const { error: e1 } = await supabase.from('wishes').update({ invitation_slug: 'fizah-hanif' }).is('invitation_slug', null)
  if (e1) console.error(e1)

  console.log('Migrating rsvp...')
  const { error: e2 } = await supabase.from('rsvp').update({ invitation_slug: 'fizah-hanif' }).is('invitation_slug', null)
  if (e2) console.error(e2)

  console.log('Migration done.')
}

migrate()
