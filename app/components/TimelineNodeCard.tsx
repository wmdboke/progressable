'use client';

import { TaskNode } from '../types';
import { useState, memo, useCallback, useMemo } from 'react';

interface TimelineNodeCardProps {
  node: TaskNode;
  onAddNote?: (nodeId: string, note: string) => void;
  onAddNode?: (afterNodeId: string) => void;
  onComplete?: (nodeId: string) => void;
  onUpdateDescription?: (nodeId: string, description: string) => void;
  onDelete?: (nodeId: string) => void;
}

function TimelineNodeCard({
  node,
  onAddNote,
  onAddNode,
  onComplete,
  onUpdateDescription,
  onDelete
}: TimelineNodeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(node.note || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState(node.description);

  const formatTime = useCallback((dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleSaveNote = useCallback(() => {
    if (onAddNote) {
      onAddNote(node.id, noteText);
    }
    setIsEditingNote(false);
  }, [node.id, noteText, onAddNote]);

  const handleSaveDescription = useCallback(() => {
    if (onUpdateDescription && descriptionText.trim()) {
      onUpdateDescription(node.id, descriptionText);
    }
    setIsEditingDescription(false);
  }, [node.id, descriptionText, onUpdateDescription]);

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete(node.id);
    }
  }, [node.id, onComplete]);

  const handleDelete = useCallback(() => {
    if (onDelete && confirm('Are you sure you want to delete this node?')) {
      onDelete(node.id);
    }
  }, [node.id, onDelete]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`
            relative rounded-lg border-2 transition-all duration-300
            ${node.isCompleted
              ? 'bg-green-50 border-green-400'
              : 'bg-white border-gray-300'
            }
            ${isHovered ? 'shadow-lg' : 'shadow-md'}
          `}
        >
          {/* Top-right button group */}
          <div className="absolute -top-2 -right-2 flex gap-1 z-10">
            {/* Edit note button */}
            <button
              onClick={() => setIsEditingNote(true)}
              className={`
                w-6 h-6 bg-blue-500 text-white rounded-full
                flex items-center justify-center text-xs hover:bg-blue-600 transition-all
                ${isHovered ? 'opacity-100' : 'opacity-0'}
              `}
              title="Add note"
            >
              ✎
            </button>

            {/* Add node button */}
            {onAddNode && (
              <button
                onClick={() => onAddNode(node.id)}
                className={`
                  w-6 h-6 bg-green-500 text-white rounded-full
                  flex items-center justify-center text-xs hover:bg-green-600 transition-all
                  ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}
                title="Add new node"
              >
                +
              </button>
            )}

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className={`
                w-6 h-6 bg-red-500 text-white rounded-full
                flex items-center justify-center text-xs hover:bg-red-600 transition-all
                ${isHovered ? 'opacity-100' : 'opacity-0'}
              `}
              title="Delete node"
            >
              ×
            </button>
          </div>

          {/* Top section: node description */}
          <div className="px-4 py-3 border-b border-gray-200 min-h-20 flex flex-col justify-between">
            {isEditingDescription ? (
              <input
                type="text"
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                onBlur={handleSaveDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveDescription();
                  } else if (e.key === 'Escape') {
                    setDescriptionText(node.description);
                    setIsEditingDescription(false);
                  }
                }}
                className="w-full text-sm font-medium border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${node.isCompleted ? 'text-green-800' : 'text-gray-800'} cursor-text break-words`}
                    onDoubleClick={() => setIsEditingDescription(true)}
                    title="Double-click to edit"
                  >
                    {node.description}
                  </p>
                  {node.note && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {node.note}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom section: completion time or complete button */}
          <div className={`px-4 py-2 h-12 flex items-center ${node.isCompleted ? 'bg-green-100' : 'bg-gray-50'}`}>
            {node.isCompleted ? (
              <p className="text-xs text-green-700">
                {formatTime(node.completedAt)}
              </p>
            ) : (
              <button
                onClick={handleComplete}
                className="w-full py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Mark as complete
              </button>
            )}
          </div>
        </div>

        {/* Note editing dialog */}
        {isEditingNote && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            onClick={() => setIsEditingNote(false)}
          >
            <div
              className="bg-white rounded-lg p-6 w-96 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Add Note</h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter note..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEditingNote(false);
                    setNoteText(node.note || '');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TimelineNodeCard);
