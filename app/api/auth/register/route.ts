import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  registerSchema,
  zodErrorToArray,
  generateUsernameFromEmail,
} from '@/lib/auth';

/**
 * 用户注册 API
 * 使用模块化的 zod schema 和工具函数
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 使用 zod 校验输入数据
    const validatedData = registerSchema.parse({
      ...body,
      confirmPassword: body.password, // API 端不需要 confirmPassword，但为了使用同一个 schema
    });

    const { email, password, name } = validatedData;

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = `user-${Date.now()}`;
    await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
      name: name || generateUsernameFromEmail(email),
      // 开发阶段：直接设置为已验证
      // TODO: 生产环境需要添加邮箱验证
      emailVerified: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 返回 zod 验证错误
      return NextResponse.json(
        { error: 'Validation failed', fields: zodErrorToArray(error) },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed, please try again' },
      { status: 500 }
    );
  }
}

