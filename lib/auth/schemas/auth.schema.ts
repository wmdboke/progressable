import { z } from 'zod';

/**
 * 认证相关的 Zod Schema
 * 可移植到其他项目使用
 */

// ============ 基础字段 Schema ============

/**
 * 邮箱校验
 */
export const emailSchema = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email format' })
  .toLowerCase()
  .trim();

/**
 * 密码校验
 * @param min 最小长度（默认 6）
 * @param max 最大长度（默认 100）
 */
export const createPasswordSchema = (min = 6, max = 100) =>
  z
    .string()
    .min(min, { message: `Password must be at least ${min} characters` })
    .max(max, { message: `Password must be less than ${max} characters` });

export const passwordSchema = createPasswordSchema();

/**
 * 用户名校验
 * @param required 是否必填
 */
export const createNameSchema = (required = false) => {
  const schema = z
    .string()
    .max(50, { message: 'Name must be less than 50 characters' })
    .trim();

  return required
    ? schema.min(1, { message: 'Name is required' })
    : schema.optional();
};

export const nameSchema = createNameSchema(false);

// ============ 表单 Schema ============

/**
 * 登录表单校验
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

/**
 * 注册表单校验
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    name: nameSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * NextAuth Credentials 校验
 */
export const authCredentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

/**
 * 忘记密码表单校验
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * 重置密码表单校验
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * 更新个人资料校验
 */
export const updateProfileSchema = z.object({
  name: createNameSchema(true),
  email: emailSchema,
});

/**
 * 更改密码校验
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ['newPassword'],
  });

// ============ 类型导出 ============

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
