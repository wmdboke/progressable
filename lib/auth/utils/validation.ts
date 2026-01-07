import { z } from 'zod';

/**
 * 认证相关工具函数
 * 可移植到其他项目使用
 */

// ============ 类型定义 ============

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// ============ Zod 错误处理 ============

/**
 * 将 Zod 错误转换为字段错误对象
 * @param error Zod 错误对象
 * @returns 字段错误对象 { fieldName: errorMessage }
 */
export function zodErrorToFormErrors(error: z.ZodError): FormErrors {
  const errors: FormErrors = {};
  error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field) {
      errors[field.toString()] = issue.message;
    }
  });
  return errors;
}

/**
 * 将 Zod 错误转换为错误数组（用于 API 响应）
 * @param error Zod 错误对象
 * @returns 错误数组
 */
export function zodErrorToArray(error: z.ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

// ============ 表单数据处理 ============

/**
 * 安全地解析表单数据
 * @param schema Zod schema
 * @param data 待验证的数据
 * @returns { success: true, data } 或 { success: false, errors }
 */
export function safeParseFormData<T extends z.ZodType>(
  schema: T,
  data: unknown
):
  | { success: true; data: z.infer<T>; errors: null }
  | { success: false; data: null; errors: FormErrors } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  return {
    success: false,
    data: null,
    errors: zodErrorToFormErrors(result.error),
  };
}

// ============ 密码处理 ============

/**
 * 检查密码强度
 * @param password 密码
 * @returns 强度等级: weak, medium, strong
 */
export function checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (password.length < 8 || criteriaCount < 2) {
    return 'weak';
  }

  if (password.length >= 12 && criteriaCount >= 3) {
    return 'strong';
  }

  return 'medium';
}

/**
 * 生成强密码
 * @param length 密码长度（默认 16）
 * @returns 随机强密码
 */
export function generateStrongPassword(length = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + special;
  let password = '';

  // 确保至少包含每种类型的字符
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 打乱顺序
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

// ============ 用户名处理 ============

/**
 * 从邮箱生成用户名
 * @param email 邮箱地址
 * @returns 用户名
 */
export function generateUsernameFromEmail(email: string): string {
  return email.split('@')[0];
}

/**
 * 清理用户名（移除特殊字符）
 * @param name 用户名
 * @returns 清理后的用户名
 */
export function sanitizeUsername(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 50);
}

// ============ 会话处理 ============

/**
 * 检查会话是否过期
 * @param expiresAt 过期时间戳
 * @returns 是否过期
 */
export function isSessionExpired(expiresAt: Date | string): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() < Date.now();
}

/**
 * 计算会话剩余时间（秒）
 * @param expiresAt 过期时间戳
 * @returns 剩余秒数
 */
export function getSessionRemainingTime(expiresAt: Date | string): number {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const remaining = Math.floor((expiry.getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
}

// ============ URL 处理 ============

/**
 * 获取回调 URL（带回退）
 * @param callbackUrl 回调 URL
 * @param defaultUrl 默认 URL
 * @returns 安全的回调 URL
 */
export function getSafeCallbackUrl(callbackUrl: string | null, defaultUrl = '/dashboard'): string {
  if (!callbackUrl) return defaultUrl;

  // 只允许相对路径
  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl;
  }

  return defaultUrl;
}

// ============ 错误消息处理 ============

/**
 * 标准化错误消息
 * @param error 错误对象
 * @returns 用户友好的错误消息
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || 'Validation failed';
  }

  if (error instanceof Error) {
    // 映射常见的 NextAuth 错误
    const message = error.message.toLowerCase();
    if (message.includes('credentials')) {
      return 'Invalid email or password';
    }
    if (message.includes('email') && message.includes('exists')) {
      return 'Email already registered';
    }
    return error.message;
  }

  return 'An unexpected error occurred';
}
