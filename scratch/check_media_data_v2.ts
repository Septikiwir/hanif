import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Manual env load
const env = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
const envConfig = dotenv.parse(env)
for (const k in envConfig) { process.env[k] = envConfig[k] }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('invitations').select('content').eq('slug', 'fizah-hanif').single()
  if (error) console.error(error)
  else {
    console.log('--- MEDIA CONTENT ---')
    console.log(JSON.stringify(data.content.media, null, 2))
  }
}

check()
