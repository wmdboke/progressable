'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative">
        <Link
          href="/login"
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          返回登录
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">忘记密码</h1>
        <p className="text-gray-600 text-center mb-8">
          输入您的邮箱地址，我们将发送密码重置链接
        </p>

        <ForgotPasswordForm
          onSuccess={() => {
            // 可选：延迟跳转到登录页
            setTimeout(() => {
              router.push('/login');
            }, 3000);
          }}
        />

        <p className="mt-6 text-center text-sm text-gray-600">
          记起密码了？{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
