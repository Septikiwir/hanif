const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Hardcoded for this one-time task
const supabaseUrl = 'https://moiverzptaelrnqfmsjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXZlcnpwdGFlbHJucWZtc2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NTA2MCwiZXhwIjoyMDkyODcxMDYwfQ.I-_CqlF7jbxu4nq61L09UHPpqo_y2V0yJGLofg14m-A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const bucketName = 'invitations';
const sourceDir = path.join(process.cwd(), 'public', 'fizah-hanif');

async function uploadFile(filePath, relativePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = `fizah-hanif/${relativePath.replace(/\\/g, '/')}`;
  
  console.log(`Uploading ${storagePath}...`);
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      upsert: true,
      contentType: getContentType(filePath)
    });

  if (error) {
    console.error(`Error uploading ${storagePath}:`, error.message);
  } else {
    console.log(`Successfully uploaded ${storagePath}`);
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.mp4': return 'video/mp4';
    case '.mp3': return 'audio/mpeg';
    default: return 'application/octet-stream';
  }
}

async function walkDir(dir, relativeDir = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(relativeDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await walkDir(fullPath, relPath);
    } else {
      await uploadFile(fullPath, relPath);
    }
  }
}

async function main() {
  console.log('Checking bucket...');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  
  if (bucketError) {
    console.error('Error listing buckets:', bucketError.message);
    return;
  }

  const bucketExists = buckets.some(b => b.name === bucketName);
  if (!bucketExists) {
    console.log(`Creating bucket ${bucketName}...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    if (createError) {
      console.error('Error creating bucket:', createError.message);
      return;
    }
  }

  console.log(`Starting upload from ${sourceDir}...`);
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory ${sourceDir} not found.`);
    return;
  }

  await walkDir(sourceDir);
  console.log('Upload process completed.');
}

main();
