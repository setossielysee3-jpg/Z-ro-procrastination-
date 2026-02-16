import React from 'react';
import { Task, UserStats } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatsProps {
  tasks: Task[];
  stats: UserStats;
}

const Stats: React.FC<StatsProps> = ({ tasks, stats }) => {
  const completed = tasks.filter(t => t.isCompleted).length;
  const pending = tasks.length - completed;
  
  const chartData = [
    { name: 'Completed', value: completed, color: '#6366f1' },
    { name: 'Pending', value: pending, color: '#94a3b8' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Your Legend</h2>
        <p className="text-sm text-slate-500">Track your evolution as a hero.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 p-5 rounded-2xl text-white shadow-lg">
          <i className="fas fa-fire text-2xl mb-2 text-indigo-300"></i>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total XP</p>
          <p className="text-3xl font-hero">{stats.points}</p>
        </div>
        <div className="bg-purple-600 p-5 rounded-2xl text-white shadow-lg">
          <i className="fas fa-check-double text-2xl mb-2 text-purple-300"></i>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Completed</p>
          <p className="text-3xl font-hero">{stats.tasksCompleted}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fas fa-chart-bar text-indigo-500"></i>
          Activity Overview
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" hide />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={50}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs font-bold text-slate-600">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-5 text-white">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-trophy text-yellow-400"></i>
          Heroic Achievements
        </h3>
        <div className="space-y-3">
          <AchievementItem 
            icon="fa-seedling" 
            title="Rookie Hero" 
            desc="Completed your first mission." 
            unlocked={stats.tasksCompleted >= 1} 
          />
          <AchievementItem 
            icon="fa-bolt" 
            title="Disciplined" 
            desc="Reach 100 points." 
            unlocked={stats.points >= 100} 
          />
          <AchievementItem 
            icon="fa-crown" 
            title="Perfect Day" 
            desc="Complete all tasks in a single day." 
            unlocked={stats.perfectDays >= 1} 
          />
          <AchievementItem 
            icon="fa-dragon" 
            title="Warrior Elite" 
            desc="Complete 50 tasks total." 
            unlocked={stats.tasksCompleted >= 50} 
          />
        </div>
      </div>
    </div>
  );
};

interface AchievementItemProps {
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ icon, title, desc, unlocked }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border ${unlocked ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/5 opacity-40 grayscale'}`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${unlocked ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <h4 className="text-sm font-bold leading-none mb-1">{title}</h4>
      <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
    </div>
    {unlocked && (
      <div className="ml-auto">
        <i className="fas fa-check-circle text-indigo-400"></i>
      </div>
    )}
  </div>
);

export default Stats;