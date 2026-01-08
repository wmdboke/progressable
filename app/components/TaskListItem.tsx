'use client';

import { Task } from '../types';
import { memo, useMemo } from 'react';

interface TaskListItemProps {
  task: Task;
  isSelected: boolean;
  isCompleted: boolean;
  onClick: (taskId: string) => void;
}

function TaskListItem({ task, isSelected, isCompleted, onClick }: TaskListItemProps) {
  // 计算进度
  const { completedCount, totalCount, progress } = useMemo(() => {
    const total = task.nodes.length;
    const completed = task.nodes.filter(node => node.isCompleted).length;
    return {
      completedCount: completed,
      totalCount: total,
      progress: total > 0 ? (completed / total) * 100 : 0
    };
  }, [task.nodes]);

  // 截断任务名称，最多显示8个字
  const displayName = task.name.length > 8 ? task.name.slice(0, 8) + '...' : task.name;

  return (
    <div
      onClick={() => onClick(task.id)}
      className={`
        flex items-center justify-between px-3 py-2 cursor-pointer
        transition-all duration-200 border-l-4
        ${isSelected
          ? 'border-blue-500 bg-blue-50'
          : isCompleted
            ? 'border-green-500 bg-white hover:bg-green-50'
            : 'border-transparent bg-white hover:bg-gray-50'
        }
      `}
    >
      {/* 任务名称 */}
      <span
        className={`
          text-sm font-medium flex-shrink-0 w-20
          ${isCompleted ? 'text-green-700' : 'text-gray-800'}
        `}
        title={task.name}
      >
        {displayName}
      </span>

      {/* 进度 */}
      <span className="text-xs text-gray-600 flex-shrink-0">
        {completedCount}/{totalCount}
      </span>

      {/* 进度百分比 */}
      <span className={`
        text-xs font-semibold flex-shrink-0
        ${isCompleted ? 'text-green-600' : 'text-blue-600'}
      `}>
        {Math.round(progress)}%
      </span>
    </div>
  );
}

export default memo(TaskListItem);
