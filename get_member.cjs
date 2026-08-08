const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const env = fs.readFileSync('f:/hyperspace/.env.local', 'utf8')
const envUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim()
const envKey = env.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim()

const supabase = createClient(envUrl, envKey)

async function run() {
  const { data, error } = await supabase.from('core_members').select('*')
  console.log('Members:', data)
  console.log('Error:', error)
}
run()
