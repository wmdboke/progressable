'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { loginSchema, type LoginInput } from '@/lib/auth/schemas/auth.schema';
import { zodErrorToFormErrors, getAuthErrorMessage } from '@/lib/auth/utils/validation';
import { FormField } from './FormField';

/**
 * 登录表单 Props
 */
export interface LoginFormProps {
  /**
   * 登录成功后的回调 URL
   */
  callbackUrl?: string;
  /**
   * 自定义提交按钮文本
   */
  submitText?: string;
  /**
   * 登录成功回调
   */
  onSuccess?: () => void;
  /**
   * 登录失败回调
   */
  onError?: (error: string) => void;
}

/**
 * 可复用的登录表单组件
 */
export function LoginForm({
  callbackUrl = '/dashboard',
  submitText = 'Login',
  onSuccess,
  onError,
}: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setErrors({});

    try {
      // 校验表单数据
      const validated = loginSchema.parse(formData);

      // 调用 NextAuth signIn
      const result = await signIn('credentials', {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMsg = 'Invalid email or password';
        setMessage(errorMsg);
        onError?.(errorMsg);
      } else if (result?.ok) {
        onSuccess?.();
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(zodErrorToFormErrors(error));
      } else {
        const errorMsg = getAuthErrorMessage(error);
        setMessage(errorMsg);
        onError?.(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Email Address"
        id="email"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        placeholder="your@email.com"
        autoComplete="email"
        disabled={isLoading}
      />

      <FormField
        label="Password"
        id="password"
        type="password"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        placeholder="••••••••"
        autoComplete="current-password"
        disabled={isLoading}
      />

      {message && (
        <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Logging in...' : submitText}
      </button>
    </form>
  );
}
