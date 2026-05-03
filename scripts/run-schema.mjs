import pg from 'pg'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const { Client } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = 'https://ihkdquydhciabhrwffkb.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloa2RxdXlkaGNpYWJocndmZmtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY1MjkwOSwiZXhwIjoyMDcyMjI4OTA5fQ.-2jwKBYfRo_Ez1lF57iVu_MsTJSsR4m5nxN5iTCwaBw'

const sql = fs.readFileSync(
  path.join(__dirname, '../supabase/schema.sql'),
  'utf-8'
)

const dbHost = 'db.ihkdquydhciabhrwffkb.supabase.co'

async function run() {
  console.log('Connecting to Supabase database...')

  // 尝试使用 service_role key 作为密码直连
  const client = new Client({
    host: dbHost,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  })

  try {
    await client.connect()
    console.log('Connected! Executing schema...')
    
    await client.query(sql)
    console.log('Schema executed successfully!')
    
    // 验证表创建
    const { rows: tables } = await client.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name IN ('students', 'votes', 'comments')`
    )
    console.log('Tables created:', tables.map(t => t.table_name).join(', '))
    
    await client.end()
  } catch (err) {
    console.error('Connection failed:', err.message)
    console.log('\nPlease check TamX dashboard → "Infrastructure" for the database password.')
    await client.end().catch(() => {})
    process.exit(1)
  }
}

run()
