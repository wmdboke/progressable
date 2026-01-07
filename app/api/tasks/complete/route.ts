import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { taskNodes, tasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// POST - 完成整个任务
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // 验证任务属于该用户
    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))
      .limit(1);

    if (!task.length) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // 获取所有未完成的节点并更新
    const nodes = await db
      .select()
      .from(taskNodes)
      .where(and(eq(taskNodes.taskId, taskId), eq(taskNodes.isCompleted, false)));

    for (const node of nodes) {
      await db
        .update(taskNodes)
        .set({
          isCompleted: true,
          completedAt: now,
        })
        .where(eq(taskNodes.id, node.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
