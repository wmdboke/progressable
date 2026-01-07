'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { registerSchema, type RegisterInput } from '@/lib/auth/schemas/auth.schema';
import { zodErrorToFormErrors, getAuthErrorMessage } from '@/lib/auth/utils/validation';
import { FormField } from './FormField';

/**
 * 注册表单 Props
 */
export interface RegisterFormProps {
  /**
   * 注册 API 端点
   */
  apiEndpoint?: string;
  /**
   * 注册成功后的回调 URL
   */
  callbackUrl?: string;
  /**
   * 自定义提交按钮文本
   */
  submitText?: string;
  /**
   * 是否显示用户名字段
   */
  showNameField?: boolean;
  /**
   * 注册成功回调
   */
  onSuccess?: () => void;
  /**
   * 注册失败回调
   */
  onError?: (error: string) => void;
}

/**
 * 可复用的注册表单组件
 */
export function RegisterForm({
  apiEndpoint = '/api/auth/register',
  callbackUrl = '/login',
  submitText = 'Sign Up',
  showNameField = true,
  onSuccess,
  onError,
}: RegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterInput>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
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
      const validated = registerSchema.parse({
        ...formData,
        name: formData.name || undefined,
      });

      // 调用注册 API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: validated.email,
          password: validated.password,
          name: validated.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const successMsg = 'Registration successful! Redirecting to login...';
        setMessage(successMsg);
        onSuccess?.();
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1500);
      } else {
        const errorMsg = data.error || 'Registration failed, please try again';
        setMessage(errorMsg);
        onError?.(errorMsg);
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

  const handleChange = (field: keyof RegisterInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showNameField && (
        <FormField
          label="Name"
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
          placeholder="Enter your name"
          autoComplete="name"
          disabled={isLoading}
          helperText="Optional"
        />
      )}

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
        required
      />

      <FormField
        label="Password"
        id="password"
        type="password"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        placeholder="At least 6 characters"
        autoComplete="new-password"
        disabled={isLoading}
        helperText="At least 6 characters"
        required
      />

      <FormField
        label="Confirm Password"
        id="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={errors.confirmPassword}
        placeholder="Re-enter password"
        autoComplete="new-password"
        disabled={isLoading}
        required
      />

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes('successful')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Signing up...' : submitText}
      </button>
    </form>
  );
}
