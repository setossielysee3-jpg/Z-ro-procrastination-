
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  time: string;
  duration: number; // in minutes
  priority: Priority;
  isCompleted: boolean;
  motivationalMessage?: string;
  category: string;
}

export interface UserStats {
  points: number;
  level: number;
  tasksCompleted: number;
  perfectDays: number;
  streak: number;
}

export interface DailyMission {
  quote: string;
  challenge: string;
  goal: string;
}

export type AppView = 'dashboard' | 'tasks' | 'stats' | 'profile';
