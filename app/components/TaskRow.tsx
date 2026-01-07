"use client";

import { Task } from "../types";
import TaskNodeCard from "./TaskNodeCard";

interface TaskRowProps {
  task: Task;
  index: number;
  onAddNote?: (taskId: string, nodeId: string, note: string) => void;
  onAddNode?: (taskId: string, afterNodeId: string) => void;
  onComplete?: (taskId: string, nodeId: string) => void;
  onUpdateDescription?: (
    taskId: string,
    nodeId: string,
    description: string
  ) => void;
  onDelete?: (taskId: string, nodeId: string) => void;
  onCompleteTask?: (taskId: string) => void;
}

export default function TaskRow({
  task,
  index,
  onAddNote,
  onAddNode,
  onComplete,
  onUpdateDescription,
  onDelete,
  onCompleteTask,
}: TaskRowProps) {
  // 检查当前节点和下一个节点是否都完成了
  const isArrowCompleted = (currentIndex: number) => {
    const currentNode = task.nodes[currentIndex];
    const nextNode = task.nodes[currentIndex + 1];
    return currentNode?.isCompleted && nextNode?.isCompleted;
  };

  // 检查所有节点是否都完成
  const isAllCompleted = task.nodes.every((node) => node.isCompleted);

  const handleCompleteTask = () => {
    if (onCompleteTask) {
      onCompleteTask(task.id);
    }
  };

  return (
    <div className="flex items-center gap-4 p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      {/* 序号 */}
      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
        {index + 1}
      </div>

      {/* 任务名称 */}
      <div className="flex-shrink-0 w-48">
        <h3 className="text-lg font-semibold text-gray-800">{task.name}</h3>
      </div>

      {/* 节点列表和箭头 */}
      <div className="flex items-center flex-1 overflow-x-auto py-4">
        {task.nodes.map((node, nodeIndex) => (
          <div key={node.id} className="flex items-center">
            {/* 节点卡片 */}
            <TaskNodeCard
              node={node}
              onAddNote={(nodeId, note) => onAddNote?.(task.id, nodeId, note)}
              onAddNode={(nodeId) => onAddNode?.(task.id, nodeId)}
              onComplete={(nodeId) => onComplete?.(task.id, nodeId)}
              onUpdateDescription={(nodeId, description) =>
                onUpdateDescription?.(task.id, nodeId, description)
              }
              onDelete={(nodeId) => onDelete?.(task.id, nodeId)}
            />

            {/* 箭头（不是最后一个节点） */}
            {nodeIndex < task.nodes.length - 1 && (
              <div className="flex-shrink-0 mx-2">
                <svg
                  width="40"
                  height="24"
                  viewBox="0 0 40 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-all duration-300"
                >
                  {/* 箭头线 */}
                  <line
                    x1="0"
                    y1="12"
                    x2="32"
                    y2="12"
                    stroke={isArrowCompleted(nodeIndex) ? "#4ade80" : "#d1d5db"}
                    strokeWidth="3"
                  />
                  {/* 箭头头部 */}
                  <path
                    d="M 28 6 L 38 12 L 28 18"
                    stroke={isArrowCompleted(nodeIndex) ? "#4ade80" : "#d1d5db"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* 结束按钮 */}
        <button
          onClick={handleCompleteTask}
          disabled={isAllCompleted}
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ml-4
            transition-all duration-300
            ${
              isAllCompleted
                ? "bg-green-500 cursor-default"
                : "bg-gray-300 hover:bg-green-400 hover:scale-110 cursor-pointer"
            }
          `}
          title={isAllCompleted ? "任务已完成" : "点击完成整个任务"}
        >
          <span className={`text-xl font-bold ${isAllCompleted ? "text-white" : "text-gray-600"}`}>
            ✓
          </span>
        </button>
      </div>
    </div>
  );
}
