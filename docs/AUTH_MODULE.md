# 认证模块使用文档

这是一个可移植的 Next.js 认证模块，集成了 NextAuth、Zod 验证、和可复用的 UI 组件。

## 📁 目录结构

```
lib/auth/
├── schemas/
│   └── auth.schema.ts          # Zod 验证 schemas
├── utils/
│   └── validation.ts           # 认证工具函数
├── config/
│   └── providers.config.ts     # NextAuth providers 配置
└── index.ts                    # 统一导出

components/auth/
├── FormField.tsx               # 表单字段组件
├── LoginForm.tsx               # 登录表单组件
├── RegisterForm.tsx            # 注册表单组件
├── ForgotPasswordForm.tsx      # 忘记密码表单组件
├── ResetPasswordForm.tsx       # 重置密码表单组件
├── PasswordStrengthIndicator.tsx # 密码强度指示器组件
├── SocialAuthButton.tsx        # 社交登录按钮组件
└── index.ts                    # 统一导出
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install next-auth zod bcryptjs drizzle-orm
pnpm install -D @types/bcryptjs
```

### 2. 复制认证模块

将以下目录复制到你的项目：
- `lib/auth/` → 认证核心逻辑
- `components/auth/` → 认证 UI 组件

### 3. 配置 NextAuth

```typescript
// auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import {
  createCredentialsProvider,
  authCallbacks,
  authPages,
} from './lib/auth/config/providers.config';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    createCredentialsProvider(),
  ],
  pages: authPages,
  callbacks: authCallbacks,
} satisfies NextAuthConfig;
```

```typescript
// auth.ts
import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { authConfig } from './auth.config';
import { db } from './lib/db';
import * as schema from './lib/db/schema';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
```

### 4. 配置 Middleware

```typescript
// proxy.ts or middleware.ts
import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
  const isProtectedPage = nextUrl.pathname.startsWith('/dashboard');

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (!isLoggedIn && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 📦 组件使用

### LoginForm 组件

```tsx
import { LoginForm, SocialAuthButton, SocialAuthDivider } from '@/components/auth';

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>

      {/* 登录表单 */}
      <LoginForm
        callbackUrl="/dashboard"
        onSuccess={() => console.log('Login success')}
        onError={(error) => console.error(error)}
      />

      {/* 社交登录分隔线 */}
      <SocialAuthDivider />

      {/* Google 登录按钮 */}
      <SocialAuthButton provider="google" callbackUrl="/dashboard" />
    </div>
  );
}
```

### RegisterForm 组件

```tsx
import { RegisterForm, SocialAuthButton, SocialAuthDivider } from '@/components/auth';

export default function RegisterPage() {
  return (
    <div>
      <h1>Sign Up</h1>

      {/* 注册表单 */}
      <RegisterForm
        apiEndpoint="/api/auth/register"
        callbackUrl="/login"
        showNameField={true}
        onSuccess={() => console.log('Registration success')}
        onError={(error) => console.error(error)}
      />

      {/* 社交登录 */}
      <SocialAuthDivider />
      <SocialAuthButton provider="google" callbackUrl="/dashboard" text="Sign up with Google" />
    </div>
  );
}
```

### ForgotPasswordForm 组件

```tsx
import { ForgotPasswordForm } from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1>Forgot Password</h1>

      {/* 忘记密码表单 */}
      <ForgotPasswordForm
        apiEndpoint="/api/auth/forgot-password"
        onSuccess={() => console.log('Reset link sent')}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

### ResetPasswordForm 组件

```tsx
import { ResetPasswordForm } from '@/components/auth';

export default function ResetPasswordPage({ token }: { token: string }) {
  return (
    <div>
      <h1>Reset Password</h1>

      {/* 重置密码表单 */}
      <ResetPasswordForm
        token={token}
        apiEndpoint="/api/auth/reset-password"
        onSuccess={() => router.push('/login')}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

### PasswordStrengthIndicator 组件

```tsx
import { useState } from 'react';
import { FormField, PasswordStrengthIndicator } from '@/components/auth';

export default function MyForm() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <FormField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* 密码强度指示器 */}
      <PasswordStrengthIndicator password={password} showLabel={true} />
    </div>
  );
}
```

### FormField 组件

```tsx
import { FormField } from '@/components/auth';

<FormField
  label="Email Address"
  id="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  placeholder="your@email.com"
  helperText="We'll never share your email"
  required
/>
```

---

## 🔧 API Routes

### 注册 API

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {
  registerSchema,
  zodErrorToArray,
  generateUsernameFromEmail,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse({
      ...body,
      confirmPassword: body.password,
    });

    const { email, password, name } = validatedData;

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // 加密密码并创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;

    await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
      name: name || generateUsernameFromEmail(email),
      emailVerified: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', fields: zodErrorToArray(error) },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

---

## 🛠️ 工具函数

### Zod 错误处理

```typescript
import { zodErrorToFormErrors, zodErrorToArray } from '@/lib/auth';

try {
  const data = loginSchema.parse(formData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // 转换为表单错误对象 { email: 'Invalid email format' }
    const formErrors = zodErrorToFormErrors(error);
    setErrors(formErrors);

    // 或转换为数组 [{ field: 'email', message: '...' }]
    const errorArray = zodErrorToArray(error);
  }
}
```

### 安全解析表单数据

```typescript
import { safeParseFormData, loginSchema } from '@/lib/auth';

const result = safeParseFormData(loginSchema, formData);

if (result.success) {
  // result.data 是类型安全的
  console.log(result.data.email, result.data.password);
} else {
  // result.errors 是字段错误对象
  setErrors(result.errors);
}
```

### 密码处理

```typescript
import { checkPasswordStrength, generateStrongPassword } from '@/lib/auth';

// 检查密码强度
const strength = checkPasswordStrength('MyPass123!'); // 返回: 'weak' | 'medium' | 'strong'

// 生成强密码
const password = generateStrongPassword(16); // 生成 16 位强密码
```

### 用户名处理

```typescript
import { generateUsernameFromEmail, sanitizeUsername } from '@/lib/auth';

// 从邮箱生成用户名
const username = generateUsernameFromEmail('john.doe@example.com'); // 返回: 'john.doe'

// 清理用户名
const clean = sanitizeUsername('john@doe#123'); // 返回: 'johndoe123'
```

---

## 📋 Schema 定义

### 可用的 Schemas

```typescript
import {
  loginSchema,           // 登录表单
  registerSchema,        // 注册表单
  authCredentialsSchema, // NextAuth credentials
  forgotPasswordSchema,  // 忘记密码
  resetPasswordSchema,   // 重置密码
  updateProfileSchema,   // 更新个人资料
  changePasswordSchema,  // 更改密码
} from '@/lib/auth';
```

### 自定义 Schema

```typescript
import { createPasswordSchema, createNameSchema } from '@/lib/auth';

// 创建自定义密码验证（最小 8 位，最大 50 位）
const customPasswordSchema = createPasswordSchema(8, 50);

// 创建必填的用户名验证
const requiredNameSchema = createNameSchema(true);
```

---

## 🎨 自定义样式

所有组件都使用 Tailwind CSS，可以通过 `className` prop 自定义样式：

```tsx
<FormField
  label="Email"
  className="border-2 border-blue-500"
  // ...
/>

<SocialAuthButton
  provider="google"
  className="bg-blue-500 text-white"
/>
```

---

## 🔄 迁移到其他项目

### 需要的步骤：

1. **复制目录**：
   - `lib/auth/` → 认证逻辑
   - `components/auth/` → UI 组件

2. **调整数据库查询**：
   - 修改 `lib/auth/config/providers.config.ts` 中的数据库查询逻辑
   - 根据你的数据库 schema 调整字段名

3. **配置环境变量**：
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **调整路由**：
   - 修改 `lib/auth/config/providers.config.ts` 中的 `authPages`
   - 根据项目需求调整回调 URL

---

## 📝 类型支持

所有组件和函数都提供完整的 TypeScript 类型支持：

```typescript
import type {
  LoginInput,
  RegisterInput,
  AuthCredentialsInput,
  FormErrors,
  ValidationError,
} from '@/lib/auth';
```

---

## ⚡ 性能优化

- 所有表单组件都使用了 `useCallback` 和 `useMemo`
- 减少不必要的重渲染
- 乐观更新 UI

---

## 🐛 错误处理

模块提供统一的错误处理：

```typescript
import { getAuthErrorMessage } from '@/lib/auth';

try {
  // 认证操作
} catch (error) {
  const userFriendlyMessage = getAuthErrorMessage(error);
  console.error(userFriendlyMessage);
}
```

---

## 📚 完整示例

查看 `app/login/page.tsx` 和 `app/register/page.tsx` 获取完整的使用示例。

---

## 🤝 贡献

这是一个模块化、可移植的认证系统，可以轻松集成到任何 Next.js 项目中。

**特点：**
- ✅ 完全类型安全
- ✅ 模块化设计
- ✅ 易于定制
- ✅ 开箱即用
- ✅ 代码简洁优雅
