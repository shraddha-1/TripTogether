import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, CheckCircle2, Clock, ClipboardList } from 'lucide-react';

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
        status: 'assigned', 
        createdAt: new Date().toISOString(),
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

  const totalTasks = (currentTrip?.tasks || []).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Assigned</p>
              <p className="text-3xl font-bold">{assignedTasks.length}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <ClipboardList size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">In Progress</p>
              <p className="text-3xl font-bold">{inProgressTasks.length}</p>
            </div>
            <div className="bg-amber-400 bg-opacity-30 rounded-full p-3">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold">{completedTasks.length}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-1">Progress</p>
              <p className="text-3xl font-bold">{completionRate}%</p>
            </div>
            <div className="bg-indigo-400 bg-opacity-30 rounded-full p-3">
              <div className="text-2xl">📊</div>
            </div>
          </div>
          <div className="mt-3 bg-indigo-400 bg-opacity-30 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Add Task Widget */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-2.5 shadow-md">
            <Plus className="text-white" size={20} />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Add New Task
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            type="text"
            placeholder="✏️ Task description (e.g., Book flights)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && newAssignee && addTask()}
            className="md:col-span-6 p-3.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <select
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            className="md:col-span-4 p-3.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="">👤 Select assignee</option>
            {currentTrip?.members?.map((member, idx) => (
              <option key={idx} value={member}>
                {member === 'You' ? '👤 ' + member : '👥 ' + member}
              </option>
            ))}
          </select>
          <button
            onClick={addTask}
            disabled={!newTask || !newAssignee}
            className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Plus size={20} />
            Add
          </button>
        </div>
      </div>

      {/* Kanban Board - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Assigned Column */}
        <div
          onDragOver={(e) => handleDragOver(e, 'assigned')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'assigned')}
          className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-5 min-h-96 transition-all border-2 ${
            dragOverColumn === 'assigned' 
              ? 'border-blue-500 ring-4 ring-blue-200 scale-105' 
              : 'border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-lg p-2 shadow-md">
                <ClipboardList className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Assigned
              </h3>
            </div>
            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {assignedTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {assignedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-blue-200 bg-opacity-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <ClipboardList size={28} className="text-blue-400" />
                </div>
                <p className="text-sm text-blue-600 font-medium">No assigned tasks</p>
                <p className="text-xs text-blue-500 mt-1">Tasks will appear here</p>
              </div>
            ) : (
              assignedTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-white border-2 border-blue-300 rounded-xl p-4 cursor-move hover:shadow-xl hover:scale-105 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <GripVertical size={18} className="text-blue-400 mt-1 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 mb-2 break-words">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                          👤 {task.assignee}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg p-1.5 transition-all opacity-0 group-hover:opacity-100"
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
          className={`bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-lg p-5 min-h-96 transition-all border-2 ${
            dragOverColumn === 'inProgress' 
              ? 'border-amber-500 ring-4 ring-amber-200 scale-105' 
              : 'border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 rounded-lg p-2 shadow-md">
                <Clock className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                In Progress
              </h3>
            </div>
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {inProgressTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {inProgressTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-amber-200 bg-opacity-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Clock size={28} className="text-amber-400" />
                </div>
                <p className="text-sm text-amber-600 font-medium">No tasks in progress</p>
                <p className="text-xs text-amber-500 mt-1">Drag tasks here to start</p>
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-white border-2 border-amber-300 rounded-xl p-4 cursor-move hover:shadow-xl hover:scale-105 transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
                  <div className="flex items-start gap-3">
                    <GripVertical size={18} className="text-amber-400 mt-1 flex-shrink-0 group-hover:text-amber-600 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 mb-2 break-words">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                          👤 {task.assignee}
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                          <Clock size={12} />
                          Active
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg p-1.5 transition-all opacity-0 group-hover:opacity-100"
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
          className={`bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-5 min-h-96 transition-all border-2 ${
            dragOverColumn === 'completed' 
              ? 'border-green-500 ring-4 ring-green-200 scale-105' 
              : 'border-green-200'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 rounded-lg p-2 shadow-md">
                <CheckCircle2 className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Completed
              </h3>
            </div>
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {completedTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-green-200 bg-opacity-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={28} className="text-green-400" />
                </div>
                <p className="text-sm text-green-600 font-medium">No completed tasks</p>
                <p className="text-xs text-green-500 mt-1">Finish tasks to celebrate! 🎉</p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-white border-2 border-green-300 rounded-xl p-4 cursor-move hover:shadow-xl hover:scale-105 transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-500"></div>
                  <div className="flex items-start gap-3">
                    <GripVertical size={18} className="text-green-400 mt-1 flex-shrink-0 group-hover:text-green-600 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-500 mb-2 line-through break-words">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                          👤 {task.assignee}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Done
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg p-1.5 transition-all opacity-0 group-hover:opacity-100"
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
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl p-5 shadow-md">
        <div className="flex items-start gap-3">
          <div className="bg-indigo-500 rounded-lg p-2 shadow-sm">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <p className="text-sm text-gray-800 font-medium mb-1">
              How to use the Task Board
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop tasks between columns to update their status. Move tasks from <span className="font-semibold text-blue-600">Assigned</span> → <span className="font-semibold text-amber-600">In Progress</span> → <span className="font-semibold text-green-600">Completed</span> as you work on them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}