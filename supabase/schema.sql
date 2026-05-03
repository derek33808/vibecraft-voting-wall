-- VibeCraft 投票墙 · Supabase 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件

-- ============================================
-- 1. 学生表
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  day1_url    TEXT NOT NULL,
  day2_url    TEXT DEFAULT '',
  day2_status TEXT DEFAULT 'working' CHECK (day2_status IN ('published', 'working')),
  day2_label  TEXT DEFAULT ''
);

-- 种子数据：4 位创始成员
INSERT INTO students (id, name, day1_url, day2_url, day2_status, day2_label) VALUES
  ('corum',  'Corum',  'https://corum-website.netlify.app/',              '',                                            'working',    '大游戏 · 努力中'),
  ('isaac',  'Isaac',  'https://shiny-buttercream-a762db.netlify.app/',   'https://escape-from-max-game.netlify.app/',   'published',  '小游戏 · 已发布'),
  ('langer', 'Langer', 'https://langer-homepage.netlify.app/',            'https://langer-f1-game.netlify.app/',         'published',  '小游戏 · 已发布'),
  ('max',    'Max',    'https://max-website-nine.vercel.app/',             '',                                            'working',    '大游戏 · 努力中')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  day1_url    = EXCLUDED.day1_url,
  day2_url    = EXCLUDED.day2_url,
  day2_status = EXCLUDED.day2_status,
  day2_label  = EXCLUDED.day2_label;

-- ============================================
-- 2. 投票表
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id                BIGSERIAL PRIMARY KEY,
  student_id        TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  voter_fingerprint TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, voter_fingerprint)
);

-- 索引：按学生查投票数
CREATE INDEX IF NOT EXISTS idx_votes_student ON votes(student_id);

-- ============================================
-- 3. 留言表
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id          BIGSERIAL PRIMARY KEY,
  student_id  TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  author      TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按学生 + 时间排序
CREATE INDEX IF NOT EXISTS idx_comments_student_time ON comments(student_id, created_at DESC);

-- ============================================
-- 4. Row Level Security (公开读写)
-- ============================================
ALTER TABLE students  ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments  ENABLE ROW LEVEL SECURITY;

-- students: 允许公开读取
DROP POLICY IF EXISTS "Public read students" ON students;
CREATE POLICY "Public read students" ON students
  FOR SELECT USING (true);

-- votes: 允许公开读写（唯一约束防刷）
DROP POLICY IF EXISTS "Public insert votes" ON votes;
CREATE POLICY "Public insert votes" ON votes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read votes" ON votes;
CREATE POLICY "Public read votes" ON votes
  FOR SELECT USING (true);

-- comments: 允许公开读写
DROP POLICY IF EXISTS "Public insert comments" ON comments;
CREATE POLICY "Public insert comments" ON comments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read comments" ON comments;
CREATE POLICY "Public read comments" ON comments
  FOR SELECT USING (true);
