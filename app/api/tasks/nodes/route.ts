import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { taskNodes, tasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH - 更新节点
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nodeId, description, note, isCompleted, completedAt } = await request.json();

    if (!nodeId) {
      return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
    }

    // 验证节点属于该用户
    const node = await db
      .select({ taskId: taskNodes.taskId })
      .from(taskNodes)
      .where(eq(taskNodes.id, nodeId))
      .limit(1);

    if (!node.length) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, node[0].taskId), eq(tasks.userId, session.user.id)))
      .limit(1);

    if (!task.length) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 更新节点
    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (note !== undefined) updateData.note = note;
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    }

    await db.update(taskNodes).set(updateData).where(eq(taskNodes.id, nodeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating node:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - 删除节点
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');

    if (!nodeId) {
      return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
    }

    // 验证节点属于该用户
    const node = await db
      .select({ taskId: taskNodes.taskId })
      .from(taskNodes)
      .where(eq(taskNodes.id, nodeId))
      .limit(1);

    if (!node.length) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, node[0].taskId), eq(tasks.userId, session.user.id)))
      .limit(1);

    if (!task.length) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查任务至少有一个节点
    const nodeCount = await db
      .select()
      .from(taskNodes)
      .where(eq(taskNodes.taskId, node[0].taskId));

    if (nodeCount.length <= 1) {
      return NextResponse.json({ error: 'Task must have at least one node' }, { status: 400 });
    }

    await db.delete(taskNodes).where(eq(taskNodes.id, nodeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting node:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - 添加新节点
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, afterNodeId } = await request.json();

    if (!taskId || !afterNodeId) {
      return NextResponse.json({ error: 'Task ID and After Node ID are required' }, { status: 400 });
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

    // 获取当前节点的顺序
    const afterNode = await db
      .select()
      .from(taskNodes)
      .where(eq(taskNodes.id, afterNodeId))
      .limit(1);

    if (!afterNode.length) {
      return NextResponse.json({ error: 'After node not found' }, { status: 404 });
    }

    const newOrder = afterNode[0].order + 1;

    // 更新后续节点的顺序
    const subsequentNodes = await db
      .select()
      .from(taskNodes)
      .where(and(eq(taskNodes.taskId, taskId), eq(taskNodes.order, newOrder)));

    for (const node of subsequentNodes) {
      await db
        .update(taskNodes)
        .set({ order: node.order + 1 })
        .where(eq(taskNodes.id, node.id));
    }

    // 创建新节点
    const newNodeId = `${taskId}-${Date.now()}`;
    await db.insert(taskNodes).values({
      id: newNodeId,
      taskId,
      description: '新节点',
      isCompleted: false,
      order: newOrder,
    });

    return NextResponse.json({
      id: newNodeId,
      description: '新节点',
      isCompleted: false,
    });
  } catch (error) {
    console.error('Error adding node:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
