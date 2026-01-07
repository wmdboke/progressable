'use client';

import { memo, useState, useCallback, FormEvent } from 'react';
import { z } from 'zod';
import { resetPasswordSchema, zodErrorToFormErrors } from '@/lib/auth';
import { FormField } from './FormField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface ResetPasswordFormProps {
  token: string;
  apiEndpoint?: string;
  submitText?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * 重置密码表单组件
 * 使用令牌重置密码
 */
function ResetPasswordForm({
  token,
  apiEndpoint = '/api/auth/reset-password',
  submitText = '重置密码',
  onSuccess,
  onError,
  className = '',
}: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setMessage('');
      setErrors({});

      try {
        // 验证密码
        const validated = resetPasswordSchema.parse({
          token,
          ...formData,
        });

        // 发送请求
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token,
            password: validated.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || '重置失败，请稍后重试';
          setMessage(errorMessage);
          onError?.(errorMessage);
          return;
        }

        // 成功
        setMessage(data.message || '密码重置成功！正在跳转...');
        onSuccess?.();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formErrors = zodErrorToFormErrors(error);
          setErrors(formErrors);
        } else {
          const errorMessage = '重置失败，请稍后重试';
          setMessage(errorMessage);
          onError?.(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [token, formData, apiEndpoint, onSuccess, onError]
  );

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('成功')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <FormField
        label="新密码"
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handlePasswordChange}
        error={errors.password}
        placeholder="至少6位字符"
        helperText="建议使用字母、数字和特殊字符的组合"
        required
        disabled={isLoading}
      />

      <PasswordStrengthIndicator password={formData.password} />

      <FormField
        label="确认新密码"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handlePasswordChange}
        error={errors.confirmPassword}
        placeholder="再次输入新密码"
        required
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? '重置中...' : submitText}
      </button>
    </form>
  );
}

export default memo(ResetPasswordForm);
