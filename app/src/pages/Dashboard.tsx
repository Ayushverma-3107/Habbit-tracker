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
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
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

  const totalGoals = goals.length;
  const activeGoals = goals.filter((g) => !g.completed && new Date(g.endDate) >= new Date()).length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const averageProgress =
    goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length)
      : 0;

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Dashboard</h1>
          <p className="text-dark-text-secondary mt-1">Welcome back! Here's your progress overview.</p>
        </div>
        <Link
          to="/goals/new"
          className="inline-flex items-center px-4 py-2 bg-accent-purple hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Goal
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Total Goals</p>
              <p className="text-3xl font-bold text-dark-text mt-2">{totalGoals}</p>
            </div>
            <Target className="h-8 w-8 text-accent-purple" />
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Active Goals</p>
              <p className="text-3xl font-bold text-dark-text mt-2">{activeGoals}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-accent-green" />
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

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Avg. Progress</p>
              <p className="text-3xl font-bold text-dark-text mt-2">{averageProgress}%</p>
            </div>
            <Calendar className="h-8 w-8 text-accent-green" />
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 rounded-lg p-6">
        <p className="text-dark-text italic text-lg">"{randomQuote}"</p>
      </div>

      {/* Recent Goals */}
      <div>
        <h2 className="text-2xl font-bold text-dark-text mb-4">Your Goals</h2>
        {goals.length === 0 ? (
          <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
            <Target className="h-12 w-12 text-dark-text-secondary mx-auto mb-4" />
            <p className="text-dark-text-secondary mb-4">You don't have any goals yet.</p>
            <Link
              to="/goals/new"
              className="inline-flex items-center px-4 py-2 bg-accent-purple hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Goal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.slice(0, 6).map((goal) => (
              <Link
                key={goal.id}
                to={`/goals/${goal.id}`}
                className="bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-accent-purple transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dark-text">{goal.title}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      goal.priority === 'High'
                        ? 'bg-red-900/20 text-red-400'
                        : goal.priority === 'Medium'
                        ? 'bg-yellow-900/20 text-yellow-400'
                        : 'bg-blue-900/20 text-blue-400'
                    }`}
                  >
                    {goal.priority}
                  </span>
                </div>
                <p className="text-sm text-dark-text-secondary mb-4">{goal.category}</p>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-text-secondary">Progress</span>
                    <span className="text-dark-text">{goal.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-dark-card rounded-full h-2">
                    <div
                      className="bg-accent-purple h-2 rounded-full transition-all"
                      style={{ width: `${goal.completionPercentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-dark-text-secondary mt-4">
                  Due: {format(new Date(goal.endDate), 'MMM dd, yyyy')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

