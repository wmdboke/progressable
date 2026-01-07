import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import {
  createCredentialsProvider,
  authCallbacks,
  authPages,
} from './lib/auth/config/providers.config';

/**
 * NextAuth 配置
 * 使用模块化的 providers 和 callbacks
 */
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
