-- 在 Supabase SQL Editor 中运行此脚本来添加 password 字段

-- 添加 password 列到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
