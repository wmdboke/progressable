'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

/**
 * 表单字段组件 Props
 */
export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

/**
 * 可复用的表单字段组件
 * 包含 label、input、错误提示和帮助文本
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <input
          ref={ref}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
