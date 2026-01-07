import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/goalService';
import { Goal } from '../types';
import { Plus, Target, Edit, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function Goals() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalService.deleteGoal(goalId);
      setGoals(goals.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal');
    }
  };

  const filteredGoals = goals.filter((goal) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'active' && !goal.completed && new Date(goal.endDate) >= new Date()) ||
      (filter === 'completed' && goal.completed);
    const matchesCategory = categoryFilter === 'all' || goal.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const categories = ['all', 'Health', 'Study', 'Career', 'Finance', 'Personal', 'Other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">My Goals</h1>
          <p className="text-dark-text-secondary mt-1">Manage and track all your goals</p>
        </div>
        <Link
          to="/goals/new"
          className="inline-flex items-center px-4 py-2 bg-accent-purple hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Goal
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-dark-text-secondary" />
            <span className="text-sm text-dark-text-secondary">Filter:</span>
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-accent-purple text-white'
                    : 'bg-dark-card text-dark-text-secondary hover:bg-dark-border'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-dark-card border border-dark-border rounded-md text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-purple"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <Target className="h-12 w-12 text-dark-text-secondary mx-auto mb-4" />
          <p className="text-dark-text-secondary mb-4">
            {goals.length === 0
              ? "You don't have any goals yet."
              : 'No goals match your filters.'}
          </p>
          {goals.length === 0 && (
            <Link
              to="/goals/new"
              className="inline-flex items-center px-4 py-2 bg-accent-purple hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Goal
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-accent-purple transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <Link to={`/goals/${goal.id}`} className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-text hover:text-accent-purple">
                    {goal.title}
                  </h3>
                </Link>
                <div className="flex gap-2">
                  <Link
                    to={`/goals/${goal.id}?edit=true`}
                    className="p-2 hover:bg-dark-card rounded transition-colors"
                  >
                    <Edit className="h-4 w-4 text-dark-text-secondary" />
                  </Link>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 hover:bg-dark-card rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-accent-purple/20 text-accent-purple rounded">
                    {goal.category}
                  </span>
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
                  {goal.completed && (
                    <span className="px-2 py-1 text-xs font-medium bg-accent-green/20 text-accent-green rounded">
                      Completed
                    </span>
                  )}
                </div>

                <div>
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

                <div className="text-xs text-dark-text-secondary space-y-1">
                  <p>Start: {format(new Date(goal.startDate), 'MMM dd, yyyy')}</p>
                  <p>Due: {format(new Date(goal.endDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

