import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Goal, WeeklyTask, MonthlyReflection, Task } from '../types';
import { differenceInDays, startOfWeek, format, parseISO } from 'date-fns';

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

  // Get a single goal
  async getGoal(goalId: string): Promise<Goal | null> {
    const docRef = doc(db, 'goals', goalId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Goal;
    }
    return null;
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

  // Update a goal
  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    const docRef = doc(db, 'goals', goalId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // Delete a goal
  async deleteGoal(goalId: string): Promise<void> {
    await deleteDoc(doc(db, 'goals', goalId));
  },

  // Get all weekly tasks for a goal
  async getAllWeeklyTasks(goalId: string): Promise<WeeklyTask[]> {
    const q = query(
      collection(db, 'weeklyTasks'),
      where('goalId', '==', goalId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WeeklyTask[];
  },

  // Calculate completion percentage
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

  // Get or create weekly tasks for a goal
  async getWeeklyTasks(goalId: string, weekStartDate: string): Promise<WeeklyTask | null> {
    const q = query(
      collection(db, 'weeklyTasks'),
      where('goalId', '==', goalId),
      where('weekStartDate', '==', weekStartDate)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as WeeklyTask;
    }
    return null;
  },

  // Create or update weekly tasks
  async saveWeeklyTasks(weeklyTask: Omit<WeeklyTask, 'id'>): Promise<string> {
    const existing = await this.getWeeklyTasks(weeklyTask.goalId, weeklyTask.weekStartDate);
    
    if (existing) {
      await updateDoc(doc(db, 'weeklyTasks', existing.id), weeklyTask);
      return existing.id;
    } else {
      const docRef = await addDoc(collection(db, 'weeklyTasks'), weeklyTask);
      return docRef.id;
    }
  },

  // Update task completion
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

    // Update goal completion percentage
    const percentage = await this.calculateCompletionPercentage(goalId);
    await this.updateGoal(goalId, { completionPercentage: percentage });
  },

  // Save monthly reflection
  async saveMonthlyReflection(reflection: Omit<MonthlyReflection, 'id' | 'createdAt'>): Promise<string> {
    const q = query(
      collection(db, 'monthlyReflections'),
      where('goalId', '==', reflection.goalId),
      where('month', '==', reflection.month)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docRef = doc(db, 'monthlyReflections', snapshot.docs[0].id);
      await updateDoc(docRef, {
        ...reflection,
        createdAt: new Date().toISOString(),
      });
      return snapshot.docs[0].id;
    } else {
      const docRef = await addDoc(collection(db, 'monthlyReflections'), {
        ...reflection,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    }
  },

  // Get monthly reflection
  async getMonthlyReflection(goalId: string, month: string): Promise<MonthlyReflection | null> {
    const q = query(
      collection(db, 'monthlyReflections'),
      where('goalId', '==', goalId),
      where('month', '==', month)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as MonthlyReflection;
    }
    return null;
  },
};

