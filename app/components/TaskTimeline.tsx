"use client";

import { Task } from "../types";
import TimelineNodeCard from "./TimelineNodeCard";
import { memo, useCallback, useMemo } from "react";

interface TaskTimelineProps {
  task: Task;
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

function TaskTimeline({
  task,
  onAddNote,
  onAddNode,
  onComplete,
  onUpdateDescription,
  onDelete,
  onCompleteTask,
}: TaskTimelineProps) {
  // Check if current and next nodes are both completed
  const isConnectorCompleted = useCallback((currentIndex: number) => {
    const currentNode = task.nodes[currentIndex];
    const nextNode = task.nodes[currentIndex + 1];
    return currentNode?.isCompleted && nextNode?.isCompleted;
  }, [task.nodes]);

  // Check if all nodes are completed
  const isAllCompleted = useMemo(
    () => task.nodes.every((node) => node.isCompleted),
    [task.nodes]
  );

  const handleCompleteTask = useCallback(() => {
    if (onCompleteTask) {
      onCompleteTask(task.id);
    }
  }, [task.id, onCompleteTask]);

  // Memoize event handlers
  const handleAddNote = useCallback(
    (nodeId: string, note: string) => onAddNote?.(task.id, nodeId, note),
    [task.id, onAddNote]
  );

  const handleAddNode = useCallback(
    (nodeId: string) => onAddNode?.(task.id, nodeId),
    [task.id, onAddNode]
  );

  const handleComplete = useCallback(
    (nodeId: string) => onComplete?.(task.id, nodeId),
    [task.id, onComplete]
  );

  const handleUpdateDescription = useCallback(
    (nodeId: string, description: string) =>
      onUpdateDescription?.(task.id, nodeId, description),
    [task.id, onUpdateDescription]
  );

  const handleDelete = useCallback(
    (nodeId: string) => onDelete?.(task.id, nodeId),
    [task.id, onDelete]
  );

  return (
    <div className="p-8 pb-12">
      {/* Task Title */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{task.name}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {task.nodes.filter(n => n.isCompleted).length} / {task.nodes.length} 节点完成
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {task.nodes.map((node, nodeIndex) => (
          <div key={node.id}>
            {/* Node Card */}
            <TimelineNodeCard
              node={node}
              onAddNote={handleAddNote}
              onAddNode={handleAddNode}
              onComplete={handleComplete}
              onUpdateDescription={handleUpdateDescription}
              onDelete={handleDelete}
            />

            {/* Vertical Connector (not for the last node) */}
            {nodeIndex < task.nodes.length - 1 && (
              <div className="flex justify-center py-2">
                <div
                  className={`
                    w-1 h-8 rounded-full transition-all duration-300
                    ${isConnectorCompleted(nodeIndex) ? 'bg-green-400' : 'bg-gray-300'}
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Complete Task Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleCompleteTask}
          disabled={isAllCompleted}
          className={`
            px-6 py-3 rounded-lg font-semibold
            transition-all duration-300
            ${
              isAllCompleted
                ? "bg-green-500 text-white cursor-default"
                : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg"
            }
          `}
          title={isAllCompleted ? "Task completed" : "Click to complete entire task"}
        >
          {isAllCompleted ? "✓ 任务已完成" : "完成整个任务"}
        </button>
      </div>
    </div>
  );
}

export default memo(TaskTimeline);
