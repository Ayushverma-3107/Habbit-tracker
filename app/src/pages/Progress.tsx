import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/goalService';
import { Goal } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#9333ea', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Progress() {
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

  // Prepare chart data
  const progressData = goals.map((goal) => ({
    name: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title,
    progress: goal.completionPercentage,
    category: goal.category,
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

  const priorityData = goals.reduce((acc, goal) => {
    const existing = acc.find((item) => item.name === goal.priority);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: goal.priority, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length)
    : 0;

  const completedGoals = goals.filter((g) => g.completed).length;
  const activeGoals = goals.filter((g) => !g.completed && new Date(g.endDate) >= new Date()).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark-text">Progress Overview</h1>
        <p className="text-dark-text-secondary mt-1">Track your progress across all goals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Overall Progress</p>
              <p className="text-3xl font-bold text-dark-text mt-2">{totalProgress}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-accent-purple" />
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Active Goals</p>
              <p className="text-3xl font-bold text-dark-text mt-2">{activeGoals}</p>
            </div>
            <Target className="h-8 w-8 text-accent-green" />
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Completed</p>
              <p className="text-3xl font-bold text-dark-text mt-2">{completedGoals}</p>
            </div>
            <Award className="h-8 w-8 text-accent-blue" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Bar Chart */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-dark-text mb-4">Goal Progress</h2>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="name"
                  stroke="#a0a0a0"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#a0a0a0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#e0e0e0',
                  }}
                />
                <Bar dataKey="progress" fill="#9333ea" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-dark-text-secondary">
              No goals to display
            </div>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-dark-text mb-4">Goals by Category</h2>
          {categoryData.length > 0 ? (
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#e0e0e0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-dark-text-secondary">
              No categories to display
            </div>
          )}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-dark-text mb-4">Goals by Priority</h2>
        {priorityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" stroke="#a0a0a0" />
              <YAxis stroke="#a0a0a0" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  color: '#e0e0e0',
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-dark-text-secondary">
            No priority data to display
          </div>
        )}
      </div>
    </div>
  );
}

