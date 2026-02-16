
import React, { useState, useEffect } from 'react';
import { AppView, Task, UserStats, DailyMission } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import TaskList from './components/TaskList.tsx';
import Stats from './components/Stats.tsx';
import { generateDailyBriefing } from './services/geminiService.ts';

const LEVEL_THRESHOLD = 100;

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats>({
    points: 0,
    level: 1,
    tasksCompleted: 0,
    perfectDays: 0,
    streak: 0,
  });
  const [dailyMission, setDailyMission] = useState<DailyMission | null>(null);
  const [loading, setLoading] = useState(true);

  // Load state from localStorage with safety
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      const savedStats = localStorage.getItem('user_stats');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedStats) setStats(JSON.parse(savedStats));
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }

    const fetchMission = async () => {
      try {
        const today = new Date().toDateString();
        const savedMission = localStorage.getItem('daily_mission');
        const savedMissionDate = localStorage.getItem('daily_mission_date');

        if (savedMission && savedMissionDate === today) {
          setDailyMission(JSON.parse(savedMission));
        } else {
          const mission = await generateDailyBriefing();
          setDailyMission(mission);
          localStorage.setItem('daily_mission', JSON.stringify(mission));
          localStorage.setItem('daily_mission_date', today);
        }
      } catch (e) {
        console.error("Mission fetch failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('user_stats', JSON.stringify(stats));
  }, [stats]);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = !t.isCompleted;
        if (isNowCompleted) {
          handleTaskCompletion();
        } else {
          handleTaskReversal();
        }
        return { ...t, isCompleted: isNowCompleted };
      }
      return t;
    }));
  };

  const handleTaskCompletion = () => {
    setStats(prev => {
      const newPoints = prev.points + 10;
      const newLevel = Math.floor(newPoints / LEVEL_THRESHOLD) + 1;
      return {
        ...prev,
        points: newPoints,
        level: newLevel,
        tasksCompleted: prev.tasksCompleted + 1,
      };
    });
  };

  const handleTaskReversal = () => {
    setStats(prev => {
      const newPoints = Math.max(0, prev.points - 10);
      const newLevel = Math.floor(newPoints / LEVEL_THRESHOLD) + 1;
      return {
        ...prev,
        points: newPoints,
        level: newLevel,
        tasksCompleted: Math.max(0, prev.tasksCompleted - 1),
      };
    });
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Récupération de votre mission...</p>
        </div>
      );
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard tasks={tasks} stats={stats} dailyMission={dailyMission} onToggleTask={toggleTask} />;
      case 'tasks':
        return <TaskList tasks={tasks} onAddTask={addTask} onToggleTask={toggleTask} onRemoveTask={removeTask} />;
      case 'stats':
        return <Stats tasks={tasks} stats={stats} />;
      default:
        return <Dashboard tasks={tasks} stats={stats} dailyMission={dailyMission} onToggleTask={toggleTask} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-xl relative pb-20 overflow-hidden">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-b-3xl text-white shadow-lg sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-hero tracking-wider">TaskHero</h1>
            <p className="text-indigo-100 text-sm">Devenez la meilleure version de vous.</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl flex items-center gap-3">
            <div className="text-center">
              <span className="block text-[10px] uppercase font-bold tracking-tight opacity-80">Niveau</span>
              <span className="text-lg font-hero leading-none">{stats.level}</span>
            </div>
            <div className="h-8 w-[1px] bg-white/30"></div>
            <div className="text-center">
              <span className="block text-[10px] uppercase font-bold tracking-tight opacity-80">Points</span>
              <span className="text-lg font-hero leading-none">{stats.points}</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-yellow-400 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
            style={{ width: `${(stats.points % LEVEL_THRESHOLD)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold mt-1 uppercase tracking-widest text-indigo-100">
          <span>{stats.points % LEVEL_THRESHOLD} XP</span>
          <span>{LEVEL_THRESHOLD} XP avant Niveau SUIVANT</span>
        </div>
      </header>

      <main className="flex-1 p-5 overflow-y-auto">
        {renderView()}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-slate-100 flex justify-around items-center p-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <i className="fas fa-home text-xl"></i>
          <span className="text-[10px] font-bold uppercase tracking-wider">Accueil</span>
        </button>
        <button 
          onClick={() => setView('tasks')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'tasks' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <i className="fas fa-list-check text-xl"></i>
          <span className="text-[10px] font-bold uppercase tracking-wider">Missions</span>
        </button>
        <button 
          onClick={() => setView('stats')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'stats' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <i className="fas fa-chart-line text-xl"></i>
          <span className="text-[10px] font-bold uppercase tracking-wider">Stats</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
