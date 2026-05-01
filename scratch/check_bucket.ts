import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NTA2MCwiZXhwIjoyMDkyODcxMDYwfQ.I-_CqlF7jbxu4nq61L09UHPpqo_y2V0yJGLofg14m-A'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBucket() {
  const { data, error } = await supabase.storage.getBucket('invitations')
  if (error) {
    console.error('Error:', error)
    return
  }
  console.log('Bucket Info:', data)
}

checkBucket()
