'use client';

import { useState, useEffect } from 'react';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskName: string) => void;
}

export default function AddTaskDialog({ isOpen, onClose, onConfirm }: AddTaskDialogProps) {
  const [taskName, setTaskName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTaskName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (taskName.trim()) {
      onConfirm(taskName.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 对话框 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">添加新任务</h2>

        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请输入任务名称"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          autoFocus
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!taskName.trim()}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
