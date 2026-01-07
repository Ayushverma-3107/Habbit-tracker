# Sample Code - Core Implementations

This document contains sample code for the core screens and components of the Goal Planner App.

## 1. Dashboard Component

```typescript
// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/goalService';
import { Goal } from '../types';
import { Target, Plus, TrendingUp, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';

const motivationalQuotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
  // ... more quotes
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadGoals();
    }
  }, [currentUser]);

  const loadGoals = async () => {
    try {
      const userGoals = await goalService.getGoals(currentUser!.uid);
      setGoals(userGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalGoals = goals.length;
  const activeGoals = goals.filter((g) => !g.completed && new Date(g.endDate) >= new Date()).length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const averageProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header with New Goal button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Dashboard</h1>
          <p className="text-dark-text-secondary mt-1">Welcome back!</p>
        </div>
        <Link to="/goals/new" className="...">
          <Plus className="h-5 w-5 mr-2" />
          New Goal
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total, Active, Completed, Average Progress cards */}
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-accent-purple/20 to-accent-blue/20...">
        <p className="text-dark-text italic text-lg">"{randomQuote}"</p>
      </div>

      {/* Recent Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.slice(0, 6).map((goal) => (
          <Link key={goal.id} to={`/goals/${goal.id}`} className="...">
            {/* Goal card with progress bar */}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## 2. Goal Creation Component

```typescript
// src/pages/CreateGoal.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/goalService';
import { Category, Priority } from '../types';

const categories: Category[] = ['Health', 'Study', 'Career', 'Finance', 'Personal', 'Other'];
const priorities: Priority[] = ['Low', 'Medium', 'High'];

export default function CreateGoal() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Health' as Category,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    priority: 'Medium' as Priority,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      await goalService.createGoal({
        userId: currentUser!.uid,
        title: formData.title,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
        description: formData.description,
        completed: false,
        completionPercentage: 0,
      });
      navigate('/goals');
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="...">
      {/* Form fields: title, category, priority, dates, description */}
      {/* Submit and Cancel buttons */}
    </form>
  );
}
```

## 3. Progress View with Charts

```typescript
// src/pages/Progress.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Progress() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);

  // Prepare chart data
  const progressData = goals.map((goal) => ({
    name: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title,
    progress: goal.completionPercentage,
  }));

  const categoryData = goals.reduce((acc, goal) => {
    const existing = acc.find((item) => item.name === goal.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: goal.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      
      {/* Bar Chart - Goal Progress */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-dark-text mb-4">Goal Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="name" stroke="#a0a0a0" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#a0a0a0" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0' }} />
            <Bar dataKey="progress" fill="#9333ea" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Categories */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-dark-text mb-4">Goals by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

## 4. Goal Service (Business Logic)

```typescript
// src/services/goalService.ts
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Goal, WeeklyTask, MonthlyReflection } from '../types';

export const goalService = {
  // Get all goals for a user
  async getGoals(userId: string): Promise<Goal[]> {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Goal[];
  },

  // Create a new goal
  async createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'completionPercentage'>): Promise<string> {
    const now = new Date().toISOString();
    const goalData = {
      ...goal,
      completionPercentage: 0,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(collection(db, 'goals'), goalData);
    return docRef.id;
  },

  // Calculate completion percentage from weekly tasks
  async calculateCompletionPercentage(goalId: string): Promise<number> {
    const weeklyTasks = await this.getAllWeeklyTasks(goalId);
    
    if (weeklyTasks.length === 0) {
      return 0;
    }

    const totalTasks = weeklyTasks.reduce((sum, week) => sum + week.tasks.length, 0);
    const completedTasks = weeklyTasks.reduce(
      (sum, week) => sum + week.tasks.filter((task) => task.completed).length,
      0
    );

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  },

  // Update task completion and recalculate progress
  async updateTaskCompletion(
    goalId: string,
    weekStartDate: string,
    taskId: string,
    completed: boolean
  ): Promise<void> {
    const weeklyTask = await this.getWeeklyTasks(goalId, weekStartDate);
    if (!weeklyTask) return;

    const updatedTasks = weeklyTask.tasks.map((task) =>
      task.id === taskId
        ? { ...task, completed, completedAt: completed ? new Date().toISOString() : undefined }
        : task
    );

    await this.saveWeeklyTasks({
      ...weeklyTask,
      tasks: updatedTasks,
      completed: updatedTasks.every((t) => t.completed),
    });

    // Recalculate and update goal progress
    const percentage = await this.calculateCompletionPercentage(goalId);
    await this.updateGoal(goalId, { completionPercentage: percentage });
  },
};
```

## 5. Authentication Context

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, displayName?: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName || user.displayName || '',
      createdAt: new Date().toISOString(),
    });
  }

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
      });
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    loginWithGoogle,
    logout: () => signOut(auth),
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
```

## 6. Weekly Planning Component

```typescript
// src/components/WeeklyPlanning.tsx
export default function WeeklyPlanning({ goal, onUpdate }: WeeklyPlanningProps) {
  const [selectedWeek, setSelectedWeek] = useState<string>(
    format(startOfWeek(new Date()), 'yyyy-MM-dd')
  );
  const [weeklyTask, setWeeklyTask] = useState<WeeklyTask | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await goalService.updateTaskCompletion(goal.id, selectedWeek, taskId, !completed);
    await loadWeeklyTasks();
    onUpdate(); // Refresh parent goal data
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
    };

    const updatedTasks = weeklyTask
      ? { ...weeklyTask, tasks: [...weeklyTask.tasks, newTask] }
      : {
          goalId: goal.id,
          weekStartDate: selectedWeek,
          tasks: [newTask],
          completed: false,
        };

    await goalService.saveWeeklyTasks(updatedTasks);
    setNewTaskTitle('');
    await loadWeeklyTasks();
    onUpdate();
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      {/* Week selector */}
      {/* Progress bar */}
      {/* Add task input */}
      {/* Task list with checkboxes */}
    </div>
  );
}
```

## Key Patterns Used

1. **Custom Hooks**: `useAuth()` for authentication state
2. **Service Layer**: `goalService` for all Firestore operations
3. **Type Safety**: Full TypeScript with strict types
4. **Error Handling**: Try-catch blocks with user-friendly messages
5. **Loading States**: Loading indicators during async operations
6. **Form Validation**: Client-side validation before submission
7. **Responsive Design**: Tailwind CSS grid and flexbox
8. **Dark Mode**: Consistent dark theme throughout

