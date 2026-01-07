import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { tasks, taskNodes } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - 获取所有任务
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户的所有任务
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, session.user.id))
      .orderBy(desc(tasks.createdAt));

    // 获取所有任务的节点
    const tasksWithNodes = await Promise.all(
      userTasks.map(async (task) => {
        const nodes = await db
          .select()
          .from(taskNodes)
          .where(eq(taskNodes.taskId, task.id))
          .orderBy(taskNodes.order);

        return {
          id: task.id,
          name: task.name,
          nodes: nodes.map((node) => ({
            id: node.id,
            description: node.description,
            isCompleted: node.isCompleted,
            completedAt: node.completedAt?.toISOString(),
            note: node.note,
          })),
        };
      })
    );

    return NextResponse.json(tasksWithNodes);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - 创建新任务
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
    }

    const taskId = `task-${Date.now()}`;
    const nodeId = `${taskId}-node-1`;

    // 创建任务
    await db.insert(tasks).values({
      id: taskId,
      name,
      userId: session.user.id,
    });

    // 创建默认节点
    await db.insert(taskNodes).values({
      id: nodeId,
      taskId,
      description: '新节点',
      isCompleted: false,
      order: 0,
    });

    return NextResponse.json({
      id: taskId,
      name,
      nodes: [
        {
          id: nodeId,
          description: '新节点',
          isCompleted: false,
        },
      ],
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
