import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTUwNjAsImV4cCI6MjA5Mjg3MTA2MH0.sBqVvRhlmSSeURPMBxgV0zKiQuPY09eNkZIZP5amOxo'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]))
  } else {
    console.log('No data found')
  }
}

checkColumns()
