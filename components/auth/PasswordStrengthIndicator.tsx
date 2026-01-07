'use client';

import { memo, useMemo } from 'react';
import { checkPasswordStrength } from '@/lib/auth';

interface PasswordStrengthIndicatorProps {
  password: string;
  showLabel?: boolean;
  className?: string;
}

/**
 * 密码强度指示器组件
 * 可视化显示密码强度（弱、中、强）
 */
function PasswordStrengthIndicator({
  password,
  showLabel = true,
  className = '',
}: PasswordStrengthIndicatorProps) {
  const { strength, color, label, percentage } = useMemo(() => {
    if (!password) {
      return {
        strength: null,
        color: 'bg-gray-200',
        label: '',
        percentage: 0,
      };
    }

    const strength = checkPasswordStrength(password);

    const config = {
      weak: {
        color: 'bg-red-500',
        label: '弱',
        percentage: 33,
      },
      medium: {
        color: 'bg-yellow-500',
        label: '中等',
        percentage: 66,
      },
      strong: {
        color: 'bg-green-500',
        label: '强',
        percentage: 100,
      },
    };

    return {
      strength,
      ...config[strength],
    };
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-300 ease-in-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className={`text-sm font-medium ${
            strength === 'weak' ? 'text-red-600' :
            strength === 'medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(PasswordStrengthIndicator);
