'use client';

import Link from 'next/link';
import { RegisterForm, SocialAuthButton, SocialAuthDivider } from '@/components/auth';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative">
        <Link
          href="/"
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
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Sign Up</h1>
        <p className="text-gray-600 text-center mb-8">Create your account</p>

        <RegisterForm
          apiEndpoint="/api/auth/register"
          callbackUrl="/login"
          showNameField={true}
        />

        <SocialAuthDivider />

        <SocialAuthButton provider="google" callbackUrl="/dashboard" text="Sign up with Google" />

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Login now
          </Link>
        </p>
      </div>
    </div>
  );
}
