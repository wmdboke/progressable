"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import CurrentTime from "../components/CurrentTime";
import TaskListItem from "../components/TaskListItem";
import TaskTimeline from "../components/TaskTimeline";
import AddTaskDialog from "../components/AddTaskDialog";
import { Task } from "../types";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<Record<string, boolean>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // 从数据库获取任务
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks();
    }
  }, [status, fetchTasks]);

  const handleAddNote = useCallback(async (taskId: string, nodeId: string, note: string) => {
    const loadingKey = `note-${nodeId}`;
    if (operationLoading[loadingKey]) return;

    setOperationLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const response = await fetch("/api/tasks/nodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId, note }),
      });

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                nodes: task.nodes.map((node) =>
                  node.id === nodeId ? { ...node, note } : node
                ),
              };
            }
            return task;
          })
        );
      }
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setOperationLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [operationLoading]);

  const handleAddNode = useCallback(async (taskId: string, afterNodeId: string) => {
    const loadingKey = `addNode-${taskId}-${afterNodeId}`;
    if (operationLoading[loadingKey]) return;

    setOperationLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const response = await fetch("/api/tasks/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, afterNodeId }),
      });

      if (response.ok) {
        const newNode = await response.json();
        // 乐观更新：在afterNodeId后插入新节点
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === taskId) {
              const afterIndex = task.nodes.findIndex((n) => n.id === afterNodeId);
              const newNodes = [...task.nodes];
              newNodes.splice(afterIndex + 1, 0, {
                ...newNode,
                note: undefined,
                completedAt: undefined,
              });
              return { ...task, nodes: newNodes };
            }
            return task;
          })
        );
      }
    } catch (error) {
      console.error("Error adding node:", error);
    } finally {
      setOperationLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [operationLoading]);

  const handleComplete = useCallback(async (taskId: string, nodeId: string) => {
    const loadingKey = `complete-${nodeId}`;
    if (operationLoading[loadingKey]) return;

    setOperationLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const response = await fetch("/api/tasks/nodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                nodes: task.nodes.map((node) =>
                  node.id === nodeId
                    ? {
                        ...node,
                        isCompleted: true,
                        completedAt: new Date().toISOString(),
                      }
                    : node
                ),
              };
            }
            return task;
          })
        );
      }
    } catch (error) {
      console.error("Error completing node:", error);
    } finally {
      setOperationLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [operationLoading]);

  const handleUpdateDescription = useCallback(async (
    taskId: string,
    nodeId: string,
    description: string
  ) => {
    const loadingKey = `desc-${nodeId}`;
    if (operationLoading[loadingKey]) return;

    setOperationLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const response = await fetch("/api/tasks/nodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId, description }),
      });

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                nodes: task.nodes.map((node) =>
                  node.id === nodeId ? { ...node, description } : node
                ),
              };
            }
            return task;
          })
        );
      }
    } catch (error) {
      console.error("Error updating description:", error);
    } finally {
      setOperationLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [operationLoading]);

  const handleDelete = useCallback(async (taskId: string, nodeId: string) => {
    const loadingKey = `delete-${nodeId}`;
    if (operationLoading[loadingKey]) return;

    setOperationLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const response = await fetch(`/api/tasks/nodes?nodeId=${nodeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                nodes: task.nodes.filter((node) => node.id !== nodeId),
              };
            }
            return task;
          })
        );
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting node:", error);
    } finally {
      setOperationLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [operationLoading]);

  const handleAddTask = useCallback(async (taskName: string) => {
    const loadingKey = 'addTask';
    if (operationLoading[loadingKey]) return;

    setOperationLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: taskName }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks((prevTasks) => [...prevTasks, newTask]);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setOperationLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [operationLoading]);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    const loadingKey = `completeTask-${taskId}`;
    if (operationLoading[loadingKey]) return;

    setOperationLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const response = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });

      if (response.ok) {
        const now = new Date().toISOString();
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                nodes: task.nodes.map((node) =>
                  node.isCompleted
                    ? node
                    : { ...node, isCompleted: true, completedAt: now }
                ),
              };
            }
            return task;
          })
        );
      }
    } catch (error) {
      console.error("Error completing task:", error);
    } finally {
      setOperationLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [operationLoading]);

  // 分组任务：未完成和已完成
  const { incompleteTasks, completedTasks } = useMemo(() => {
    const incomplete = tasks.filter(task =>
      !task.nodes.every(node => node.isCompleted)
    );
    const completed = tasks.filter(task =>
      task.nodes.every(node => node.isCompleted)
    );
    return { incompleteTasks: incomplete, completedTasks: completed };
  }, [tasks]);

  // 选中的任务
  const selectedTask = useMemo(
    () => tasks.find(t => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  // 自动选中第一个未完成任务
  useEffect(() => {
    if (!selectedTaskId && incompleteTasks.length > 0) {
      setSelectedTaskId(incompleteTasks[0].id);
    } else if (selectedTaskId && !tasks.find(t => t.id === selectedTaskId)) {
      // 如果选中的任务被删除，重新选中第一个未完成任务
      if (incompleteTasks.length > 0) {
        setSelectedTaskId(incompleteTasks[0].id);
      } else if (completedTasks.length > 0) {
        setSelectedTaskId(completedTasks[0].id);
      } else {
        setSelectedTaskId(null);
      }
    }
  }, [selectedTaskId, incompleteTasks, completedTasks, tasks]);

  // 缓存 actions 避免 CurrentTime 重渲染
  const timeActions = useMemo(() => (
    <div className="flex gap-3">
      <button
        onClick={() => setIsDialogOpen(true)}
        className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
      >
        Add Task
      </button>
      <div className="flex items-center gap-3">
        <span className="text-gray-700">
          {session?.user?.name || session?.user?.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 text-indigo-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm border border-indigo-200"
        >
          Logout
        </button>
      </div>
    </div>
  ), [session?.user?.name, session?.user?.email]);

  // 认证状态加载中
  if (status === "loading") {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 已认证 - 显示页面（middleware 已处理未认证的情况）
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Fixed time display and buttons */}
      <div className="flex-shrink-0">
        <CurrentTime actions={timeActions} />
      </div>

      {/* Main content area - Left-Right Split */}
      <div className="flex-1 flex overflow-hidden px-8 pb-8 gap-6">
        {/* Left side: Task list */}
        <div className="w-80 bg-white rounded-xl shadow-md overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No tasks yet. Click "Add Task" to create your first task!</p>
            </div>
          ) : (
            <>
              {/* Incomplete tasks */}
              <div className="space-y-2">
                {incompleteTasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    isCompleted={false}
                    onClick={setSelectedTaskId}
                  />
                ))}
              </div>

              {/* Divider */}
              {completedTasks.length > 0 && (
                <div className="my-4 border-t-2 border-gray-300 relative">
                  <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                    已完成
                  </span>
                </div>
              )}

              {/* Completed tasks */}
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    isCompleted={true}
                    onClick={setSelectedTaskId}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right side: Timeline */}
        <div className="flex-1 bg-white rounded-xl shadow-md overflow-y-auto">
          {selectedTask ? (
            <TaskTimeline
              task={selectedTask}
              onAddNote={handleAddNote}
              onAddNode={handleAddNode}
              onComplete={handleComplete}
              onUpdateDescription={handleUpdateDescription}
              onDelete={handleDelete}
              onCompleteTask={handleCompleteTask}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>请从左侧选择一个任务</p>
            </div>
          )}
        </div>
      </div>

      {/* Add task dialog */}
      <AddTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleAddTask}
      />
    </div>
  );
}
