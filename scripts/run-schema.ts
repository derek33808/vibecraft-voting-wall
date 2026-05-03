import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = 'https://ihkdquydhciabhrwffkb.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloa2RxdXlkaGNpYWJocndmZmtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY1MjkwOSwiZXhwIjoyMDcyMjI4OTA5fQ.-2jwKBYfRo_Ez1lF57iVu_MsTJSsR4m5nxN5iTCwaBw'

const supabase = createClient(supabaseUrl, serviceRoleKey)

const sql = fs.readFileSync(
  path.join(__dirname, '../supabase/schema.sql'),
  'utf-8'
)

async function run() {
  // 按分号分割 SQL 语句，逐条执行
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const stmt of statements) {
    try {
      // 尝试用 rpc 方式执行原生 SQL
      const { error } = await supabase.rpc('exec', { query: stmt + ';' })
      
      if (error) {
        // 如果 rpc 不可用，尝试直接 POST 到 REST API
        console.log('RPC failed, trying direct approach...')
        
        // 使用 fetch 直接调用管理 API
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/exec_sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
            },
            body: JSON.stringify({ query: stmt + ';' }),
          }
        )
        
        if (!response.ok) {
          const text = await response.text()
          console.error(`Statement failed (${response.status}):`, text.substring(0, 200))
        }
      }
    } catch (e: any) {
      console.error('Error:', e.message)
    }
  }
  
  console.log('Schema execution attempted.')
}

run()
