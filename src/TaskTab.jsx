import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function TaskTab({ currentTrip, setCurrentTrip, trips, setTrips }) {
  const [newTask, setNewTask] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const addTask = () => {
    if (currentTrip && newTask && newAssignee) {
      const task = {
        id: Date.now(),
        title: newTask,
        assignee: newAssignee,
        status: 'assigned', // assigned, inProgress, completed
      };
      const updated = {
        ...currentTrip,
        tasks: [...(currentTrip.tasks || []), task],
      };
      setCurrentTrip(updated);
      setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
      setNewTask('');
      setNewAssignee('');
    }
  };

  const deleteTask = (taskId) => {
    if (currentTrip) {
      const updated = {
        ...currentTrip,
        tasks: (currentTrip.tasks || []).filter(t => t.id !== taskId),
      };
      setCurrentTrip(updated);
      setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      const updated = {
        ...currentTrip,
        tasks: (currentTrip.tasks || []).map(t =>
          t.id === draggedTask.id ? { ...t, status: newStatus } : t
        ),
      };
      setCurrentTrip(updated);
      setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getTasksByStatus = (status) => {
    return (currentTrip?.tasks || []).filter(t => t.status === status);
  };

  const assignedTasks = getTasksByStatus('assigned');
  const inProgressTasks = getTasksByStatus('inProgress');
  const completedTasks = getTasksByStatus('completed');

  return (
    <div className="space-y-6">
      {/* Add Task Widget */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Task</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Task (e.g., Book flights)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && newAssignee && addTask()}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select assignee</option>
            {currentTrip?.members?.map((member, idx) => (
              <option key={idx} value={member}>
                {member}
              </option>
            ))}
          </select>
          <button
            onClick={addTask}
            disabled={!newTask || !newAssignee}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Assigned Column */}
        <div
          onDragOver={(e) => handleDragOver(e, 'assigned')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'assigned')}
          className={`bg-white rounded-lg shadow-lg p-4 min-h-96 transition-colors ${
            dragOverColumn === 'assigned' ? 'bg-blue-50 ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              📋 Assigned
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {assignedTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {assignedTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No assigned tasks
              </p>
            ) : (
              assignedTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical size={16} className="text-blue-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        👤 {task.assignee}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1 transition"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div
          onDragOver={(e) => handleDragOver(e, 'inProgress')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'inProgress')}
          className={`bg-white rounded-lg shadow-lg p-4 min-h-96 transition-colors ${
            dragOverColumn === 'inProgress' ? 'bg-yellow-50 ring-2 ring-yellow-400' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              🔄 In Progress
            </h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {inProgressTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {inProgressTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No tasks in progress
              </p>
            ) : (
              inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical size={16} className="text-yellow-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        👤 {task.assignee}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1 transition"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div
          onDragOver={(e) => handleDragOver(e, 'completed')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'completed')}
          className={`bg-white rounded-lg shadow-lg p-4 min-h-96 transition-colors ${
            dragOverColumn === 'completed' ? 'bg-green-50 ring-2 ring-green-400' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              ✅ Completed
            </h3>
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {completedTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No completed tasks
              </p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-green-50 border-2 border-green-200 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1 line-through">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        👤 {task.assignee}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1 transition"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm text-indigo-800">
          💡 <strong>Tip:</strong> Drag and drop tasks between columns to update their status. Move tasks from "Assigned" → "In Progress" → "Completed" as you work on them.
        </p>
      </div>
    </div>
  );
}