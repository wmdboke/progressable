# 数据库设置指南

## 推送数据库 Schema 到 Supabase

按照以下步骤将数据库表结构同步到 Supabase：

### 1. 配置环境变量

确保你的 `.env.local` 文件中已配置 Supabase 数据库连接字符串：

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**如何获取连接字符串：**
1. 登录 [Supabase](https://supabase.com)
2. 进入你的项目
3. 点击左侧菜单的 **Settings** → **Database**
4. 在 **Connection string** 部分找到 **URI** 格式的连接字符串
5. 复制并替换 `[YOUR-PASSWORD]` 为你的数据库密码

### 2. 推送 Schema 到数据库

运行以下命令将表结构推送到 Supabase：

```bash
pnpm db:push
```

这个命令会：
- 读取 `lib/db/schema.ts` 中定义的所有表
- 在 Supabase 数据库中创建对应的表结构
- 包括用户认证表（users, accounts, sessions, verification_tokens）
- 包括任务管理表（tasks, task_nodes）

### 3. 验证数据库表

推送成功后，你可以通过以下方式验证：

**方式 1：使用 Drizzle Studio**
```bash
pnpm db:studio
```
这会在浏览器中打开 Drizzle Studio，你可以查看所有表和数据。

**方式 2：使用 Supabase Dashboard**
1. 登录 Supabase
2. 进入你的项目
3. 点击左侧菜单的 **Table Editor**
4. 查看是否有以下表：
   - users
   - accounts
   - sessions
   - verification_tokens
   - tasks
   - task_nodes

## 数据库表结构

### 用户相关表（Auth.js）

- **users**: 用户信息
- **accounts**: OAuth 账号信息（Google 等）
- **sessions**: 用户会话
- **verification_tokens**: 邮箱验证令牌

### 任务管理表

- **tasks**: 任务表
  - id: 任务 ID
  - name: 任务名称
  - user_id: 关联的用户 ID
  - created_at: 创建时间
  - updated_at: 更新时间

- **task_nodes**: 任务节点表
  - id: 节点 ID
  - task_id: 关联的任务 ID
  - description: 节点描述
  - is_completed: 是否完成
  - completed_at: 完成时间
  - note: 备注
  - order: 节点顺序
  - created_at: 创建时间
  - updated_at: 更新时间

## 常见问题

### 1. 连接失败
- 检查 `DATABASE_URL` 是否正确
- 确保数据库密码正确
- 检查网络连接

### 2. 推送失败
- 确保 Supabase 项目处于活跃状态
- 检查数据库配额是否已满

### 3. 重置数据库
如果需要重新创建表：
```bash
# 删除所有表后重新推送
pnpm db:push
```

## 下一步

数据库设置完成后：
1. 配置 Google OAuth 和 Resend（参考主 README.md）
2. 运行 `pnpm dev` 启动应用
3. 登录后即可开始使用任务管理功能
