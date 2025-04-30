const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const uploadToSupabase = async (filePath, fileName) => {
  const fileBuffer = fs.readFileSync(filePath)

  const { error } = await supabase.storage
    .from('resumes')
    .upload(`user_resumes/${fileName}`, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true, // agar bisa replace file lama
    })

  if (error) throw error

  const publicUrl = supabase.storage
    .from('resumes')
    .getPublicUrl(`user_resumes/${fileName}`).data.publicUrl

  return publicUrl
}

module.exports = { uploadToSupabase }
