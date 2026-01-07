export type Priority = 'Low' | 'Medium' | 'High';
export type Category = 'Health' | 'Study' | 'Career' | 'Finance' | 'Personal' | 'Other';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  category: Category;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  priority: Priority;
  description?: string;
  completed: boolean;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
  weeklyTasks?: WeeklyTask[];
  monthlyReflections?: MonthlyReflection[];
}

export interface WeeklyTask {
  id: string;
  goalId: string;
  weekStartDate: string; // ISO date string
  tasks: Task[];
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface MonthlyReflection {
  id: string;
  goalId: string;
  month: string; // YYYY-MM format
  whatWentWell: string;
  whatDidntGoWell: string;
  lessonsLearned: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface StreakData {
  goalId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

