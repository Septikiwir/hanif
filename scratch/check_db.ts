import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTUwNjAsImV4cCI6MjA5Mjg3MTA2MH0.sBqVvRhlmSSeURPMBxgV0zKiQuPY09eNkZIZP5amOxo'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('slug', 'fizah-hanif')
    .single()

  if (error) {
    console.error('Error fetching data:', error)
    return
  }

  console.log('Music URL in DB:', data.content.media.music)
}

checkData()
