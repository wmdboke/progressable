"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import CurrentTime from "../components/CurrentTime";
import TaskRow from "../components/TaskRow";
import AddTaskDialog from "../components/AddTaskDialog";
import { Task } from "../types";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  // 从数据库获取任务
  const fetchTasks = async () => {
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
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
    } else {
      setIsLoading(false);
      router.push("/login");
    }
  }, [session, router]);

  const handleAddNote = async (taskId: string, nodeId: string, note: string) => {
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
    }
  };

  const handleAddNode = async (taskId: string, afterNodeId: string) => {
    try {
      const response = await fetch("/api/tasks/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, afterNodeId }),
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  const handleComplete = async (taskId: string, nodeId: string) => {
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
    }
  };

  const handleUpdateDescription = async (
    taskId: string,
    nodeId: string,
    description: string
  ) => {
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
    }
  };

  const handleDelete = async (taskId: string, nodeId: string) => {
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
    }
  };

  const handleAddTask = async (taskName: string) => {
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
    }
  };

  const handleCompleteTask = async (taskId: string) => {
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
    }
  };

  if (!session) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login first...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Fixed time display and buttons */}
      <div className="flex-shrink-0">
        <CurrentTime
          actions={
            <div className="flex gap-3">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Add Task
              </button>
              <div className="flex items-center gap-3">
                <span className="text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 text-indigo-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm border border-indigo-200"
                >
                  Logout
                </button>
              </div>
            </div>
          }
        />
      </div>

      {/* Scrollable task list area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1800px] mx-auto px-8 pb-12">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No tasks yet. Click "Add Task" to create your first task!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={index}
                  onAddNote={handleAddNote}
                  onAddNode={handleAddNode}
                  onComplete={handleComplete}
                  onUpdateDescription={handleUpdateDescription}
                  onDelete={handleDelete}
                  onCompleteTask={handleCompleteTask}
                />
              ))}
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
