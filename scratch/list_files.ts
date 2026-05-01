import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NTA2MCwiZXhwIjoyMDkyODcxMDYwfQ.I-_CqlF7jbxu4nq61L09UHPpqo_y2V0yJGLofg14m-A'
const supabase = createClient(supabaseUrl, supabaseKey)

async function listFiles() {
  try {
    const { data: buckets, error: bError } = await supabase.storage.listBuckets()
    if (bError) throw bError
    console.log('Buckets:', buckets.map(b => b.name))

    const { data, error } = await supabase
      .storage
      .from('invitations')
      .list('fizah-hanif')

    if (error) throw error
    console.log('Files in fizah-hanif:', data.map(f => f.name))
  } catch (err) {
    console.error('Error:', err)
  }
}

listFiles()
