'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">无效的重置链接</h1>
          <p className="text-gray-600 mb-6">
            该链接无效或已过期，请重新请求密码重置
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            重新请求
          </Link>
        </div>
      </div>
    );
  }

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

        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">重置密码</h1>
        <p className="text-gray-600 text-center mb-8">
          请输入您的新密码
        </p>

        <ResetPasswordForm
          token={token}
          onSuccess={() => {
            // 成功后延迟跳转到登录页
            setTimeout(() => {
              router.push('/login');
            }, 2000);
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
