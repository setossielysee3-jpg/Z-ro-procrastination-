import React, { useState } from 'react';
import { Task, Priority } from '../types.ts';
import { generateMotivationalReminder } from '../services/geminiService.ts';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
}

const CATEGORIES = [
  { name: 'Work', icon: 'fa-briefcase' },
  { name: 'Sport', icon: 'fa-running' },
  { name: 'Study', icon: 'fa-book' },
  { name: 'Personal', icon: 'fa-user' },
  { name: 'Health', icon: 'fa-heartbeat' },
  { name: 'Other', icon: 'fa-star' },
];

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onToggleTask, onRemoveTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newCategory, setNewCategory] = useState('Work');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsGenerating(true);
    
    const partialTask: Task = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      duration: 30,
      priority: newPriority,
      isCompleted: false,
      category: newCategory
    };

    const motivationalMessage = await generateMotivationalReminder(partialTask);
    
    onAddTask({
      ...partialTask,
      motivationalMessage
    });

    setNewTitle('');
    setIsAdding(false);
    setIsGenerating(false);
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-rose-100 text-rose-700',
  };

  const getCategoryIcon = (catName: string) => {
    return CATEGORIES.find(c => c.name === catName)?.icon || 'fa-tag';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Your Missions</h2>
          <p className="text-sm text-slate-500">Plan your path to glory.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white w-12 h-12 rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center active:scale-95 transition-all"
        >
          <i className={`fas ${isAdding ? 'fa-times' : 'fa-plus'} text-lg`}></i>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div>
            <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Objective Title</label>
            <input 
              type="text" 
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 ring-indigo-500 transition-all"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Category</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 ring-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Priority</label>
              <select 
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 ring-indigo-500"
              >
                <option value="low">Low - Routine</option>
                <option value="medium">Medium - Important</option>
                <option value="high">High - CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Scheduled Time</label>
            <input 
              type="time" 
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 ring-indigo-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={isGenerating}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <i className="fas fa-circle-notch animate-spin"></i>
                Consulting AI Mentor...
              </>
            ) : (
              <>
                <i className="fas fa-plus"></i>
                Deploy Mission
              </>
            )}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <i className="fas fa-clipboard-list text-3xl text-slate-300"></i>
            </div>
            <p className="text-slate-500 font-medium">Your quest log is empty.</p>
            <p className="text-xs text-slate-400 mt-1">Tap the plus button to start your day.</p>
          </div>
        ) : (
          tasks.sort((a,b) => a.time.localeCompare(b.time)).map((task) => (
            <div 
              key={task.id} 
              className={`bg-white border p-4 rounded-2xl flex items-center gap-4 transition-all group ${task.isCompleted ? 'opacity-60 grayscale-[0.5] border-slate-100 bg-slate-50' : 'border-slate-100 shadow-sm'}`}
            >
              <button 
                onClick={() => onToggleTask(task.id)}
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 text-white hover:border-indigo-400'}`}
              >
                <i className={`fas fa-check text-lg ${task.isCompleted ? 'opacity-100' : 'opacity-0'}`}></i>
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{task.time}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                    <i className={`fas ${getCategoryIcon(task.category)}`}></i>
                    {task.category}
                  </span>
                </div>
                <h4 className={`font-bold text-slate-800 truncate ${task.isCompleted ? 'line-through' : ''}`}>
                  {task.title}
                </h4>
                {!task.isCompleted && task.motivationalMessage && (
                  <p className="text-xs text-indigo-500 italic font-medium mt-1 line-clamp-1">
                    "{task.motivationalMessage}"
                  </p>
                )}
              </div>

              <button 
                onClick={() => onRemoveTask(task.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;