import React, { useState, useMemo } from 'react';
import { Task, UserStats, DailyMission } from '../types.ts';

interface DashboardProps {
  tasks: Task[];
  stats: UserStats;
  dailyMission: DailyMission | null;
  onToggleTask: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, stats, dailyMission, onToggleTask }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const categories = useMemo(() => {
    const unique = Array.from(new Set(tasks.map(t => t.category)));
    return ['All', ...unique];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let baseTasks = tasks.filter(t => !t.isCompleted);
    if (activeCategory !== 'All') {
      baseTasks = baseTasks.filter(t => t.category === activeCategory);
    }
    return baseTasks;
  }, [tasks, activeCategory]);

  const completedToday = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedToday / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Daily Motivation Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 text-indigo-100 group-hover:text-indigo-200 transition-colors">
          <i className="fas fa-quote-right text-4xl"></i>
        </div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Daily Inspiration</h3>
        <p className="text-slate-800 text-lg font-medium leading-tight relative z-10">
          "{dailyMission?.quote || 'Success is not final, failure is not fatal: it is the courage to continue that counts.'}"
        </p>
      </div>

      {/* Daily Focus / Mission Card */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-bullseye"></i>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Mission of the Day</h3>
            <p className="text-xs text-indigo-600 font-semibold tracking-wide uppercase">Today's Priority</p>
          </div>
        </div>
        <p className="text-slate-700 font-medium mb-3">{dailyMission?.goal || 'Crush your schedule and stay focused!'}</p>
        <div className="bg-white/80 p-3 rounded-xl border border-indigo-100">
          <span className="text-[10px] font-bold text-indigo-500 uppercase block mb-1">Secret Challenge</span>
          <p className="text-sm text-slate-600 italic">" {dailyMission?.challenge || 'Complete all high-priority tasks by noon.'} "</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Daily Progress</h3>
            <p className="text-2xl font-hero">{Math.round(progress)}%</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-hero text-indigo-400">{completedToday} / {tasks.length}</p>
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-1">
          <div 
            className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-center mt-3 text-slate-500 uppercase tracking-[0.2em] font-bold">
          {progress === 100 ? "Level Cleared! 🎉" : "Keep moving forward, Hero!"}
        </p>
      </div>

      {/* Up Next List with Category Filter */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-lg">Next Objectives</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredTasks.length} Pending</span>
        </div>

        {/* Category Tabs */}
        {categories.length > 2 && (
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        
        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.slice(0, 5).map((task) => (
              <div 
                key={task.id} 
                onClick={() => onToggleTask(task.id)}
                className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-indigo-300 transition-all active:scale-95 shadow-sm"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group">
                   <div className="w-6 h-6 border-2 border-slate-300 rounded-md group-hover:border-indigo-400 flex items-center justify-center transition-colors">
                     <i className="fas fa-check text-indigo-500 opacity-0 group-hover:opacity-20"></i>
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 rounded-md">{task.time}</span>
                    <h4 className="font-semibold text-slate-800 truncate">{task.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 italic font-medium truncate">
                    {task.motivationalMessage || 'No battle plan survives first contact. Adapt and win!'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <i className="fas fa-award text-4xl text-yellow-500 mb-3 block animate-bounce"></i>
            <p className="text-slate-500 font-medium">All missions in "{activeCategory}" cleared!</p>
            <p className="text-xs text-slate-400 mt-1">Check other categories or add new tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;