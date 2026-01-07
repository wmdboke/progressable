import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// 开发阶段：直接注册成功，不进行邮箱验证
// TODO: 生产环境需要添加邮箱验证（使用 Resend 或其他邮件服务）
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为 6 位' },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户（开发阶段：直接创建，不需要邮箱验证）
    const userId = `user-${Date.now()}`;
    await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      // 开发阶段：直接设置为已验证
      emailVerified: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '注册成功，请登录',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
