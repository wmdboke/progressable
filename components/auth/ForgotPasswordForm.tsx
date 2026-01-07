'use client';

import { memo, useState, useCallback, FormEvent } from 'react';
import { z } from 'zod';
import { forgotPasswordSchema, zodErrorToFormErrors } from '@/lib/auth';
import { FormField } from './FormField';

interface ForgotPasswordFormProps {
  apiEndpoint?: string;
  submitText?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * 忘记密码表单组件
 * 发送密码重置邮件
 */
function ForgotPasswordForm({
  apiEndpoint = '/api/auth/forgot-password',
  submitText = '发送重置链接',
  onSuccess,
  onError,
  className = '',
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setMessage('');
      setErrors({});
      setIsSuccess(false);

      try {
        // 验证邮箱
        const validated = forgotPasswordSchema.parse({ email });

        // 发送请求
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: validated.email }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || '发送失败，请稍后重试';
          setMessage(errorMessage);
          onError?.(errorMessage);
          return;
        }

        // 成功
        setIsSuccess(true);
        setMessage(data.message || '重置链接已发送到您的邮箱');
        setEmail('');
        onSuccess?.();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formErrors = zodErrorToFormErrors(error);
          setErrors(formErrors);
        } else {
          const errorMessage = '发送失败，请稍后重试';
          setMessage(errorMessage);
          onError?.(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [email, apiEndpoint, onSuccess, onError]
  );

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // 清除该字段的错误
    if (errors.email) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  }, [errors.email]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            isSuccess
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <FormField
        label="邮箱地址"
        id="email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        error={errors.email}
        placeholder="your@email.com"
        helperText="我们将向此邮箱发送密码重置链接"
        required
        disabled={isLoading || isSuccess}
      />

      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? '发送中...' : submitText}
      </button>

      {isSuccess && (
        <p className="mt-3 text-sm text-gray-600 text-center">
          没收到邮件？{' '}
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            重新发送
          </button>
        </p>
      )}
    </form>
  );
}

export default memo(ForgotPasswordForm);
