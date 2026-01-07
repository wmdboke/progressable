import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authCredentialsSchema } from '../schemas/auth.schema';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Credentials Provider 配置
 * 可自定义数据库查询和密码验证逻辑
 */
export function createCredentialsProvider() {
  return Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      try {
        // 使用 zod 校验凭据
        const validated = authCredentialsSchema.parse(credentials);

        // 查询用户（可自定义数据库查询）
        const userList = await db
          .select()
          .from(users)
          .where(eq(users.email, validated.email))
          .limit(1);

        const user = userList[0];

        // 验证用户存在且有密码
        if (!user || !user.password) {
          return null;
        }

        // 验证密码
        const isValid = await bcrypt.compare(validated.password, user.password);

        if (!isValid) {
          return null;
        }

        // 返回用户信息
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      } catch (error) {
        console.error('Authorization error:', error);
        return null;
      }
    },
  });
}

/**
 * 认证回调配置
 */
export const authCallbacks: NextAuthConfig['callbacks'] = {
  /**
   * 授权检查 - 用于 middleware
   */
  authorized({ auth, request: { nextUrl } }) {
    const isLoggedIn = !!auth?.user;
    const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

    // Dashboard 需要登录
    if (isOnDashboard) {
      return isLoggedIn;
    }

    // 其他页面允许访问
    return true;
  },
};

/**
 * 认证页面配置
 */
export const authPages = {
  signIn: '/login',
  signOut: '/login',
  error: '/login',
  verifyRequest: '/verify-request',
  newUser: '/dashboard', // 新用户注册后跳转
};

/**
 * 会话配置
 */
export const sessionConfig = {
  strategy: 'jwt' as const,
  maxAge: 30 * 24 * 60 * 60, // 30 天
};
