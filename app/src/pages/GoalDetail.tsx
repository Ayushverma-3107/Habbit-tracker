import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/goalService';
import { Goal, WeeklyTask, Task } from '../types';
import { ArrowLeft, Edit, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { format, startOfWeek, addWeeks, parseISO } from 'date-fns';
import WeeklyPlanning from '../components/WeeklyPlanning';
import MonthlyReflection from '../components/MonthlyReflection';

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly' | 'reflection'>('overview');

  useEffect(() => {
    if (id && currentUser) {
      loadGoal();
    }
  }, [id, currentUser]);

  const loadGoal = async () => {
    try {
      const goalData = await goalService.getGoal(id!);
      if (goalData && goalData.userId === currentUser!.uid) {
        setGoal(goalData);
      } else {
        navigate('/goals');
      }
    } catch (error) {
      console.error('Error loading goal:', error);
      navigate('/goals');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!goal) return;

    try {
      await goalService.updateGoal(goal.id, { completed: !goal.completed });
      setGoal({ ...goal, completed: !goal.completed });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!goal) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/goals')}
        className="inline-flex items-center text-dark-text-secondary hover:text-dark-text transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Goals
      </button>

      {/* Goal Header */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-dark-text">{goal.title}</h1>
              <button
                onClick={handleToggleComplete}
                className={`p-2 rounded transition-colors ${
                  goal.completed
                    ? 'text-accent-green hover:bg-accent-green/20'
                    : 'text-dark-text-secondary hover:bg-dark-card'
                }`}
              >
                {goal.completed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 text-sm font-medium bg-accent-purple/20 text-accent-purple rounded">
                {goal.category}
              </span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${
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
            {goal.description && (
              <p className="text-dark-text-secondary mb-4">{goal.description}</p>
            )}
          </div>
          <button
            onClick={() => navigate(`/goals/${goal.id}?edit=true`)}
            className="p-2 hover:bg-dark-card rounded transition-colors"
          >
            <Edit className="h-5 w-5 text-dark-text-secondary" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-text-secondary">Progress</span>
            <span className="text-dark-text font-semibold">{goal.completionPercentage}%</span>
          </div>
          <div className="w-full bg-dark-card rounded-full h-3">
            <div
              className="bg-accent-purple h-3 rounded-full transition-all"
              style={{ width: `${goal.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-6 text-sm text-dark-text-secondary">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Start: {format(new Date(goal.startDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {format(new Date(goal.endDate), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-border">
        <div className="flex gap-4">
          {(['overview', 'weekly', 'reflection'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-accent-purple text-accent-purple'
                  : 'border-transparent text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-dark-text mb-4">Goal Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-card border border-dark-border rounded-lg p-4">
                  <p className="text-sm text-dark-text-secondary mb-1">Status</p>
                  <p className="text-lg font-semibold text-dark-text">
                    {goal.completed ? 'Completed' : 'In Progress'}
                  </p>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-lg p-4">
                  <p className="text-sm text-dark-text-secondary mb-1">Days Remaining</p>
                  <p className="text-lg font-semibold text-dark-text">
                    {Math.max(0, Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weekly' && goal && (
          <WeeklyPlanning goal={goal} onUpdate={loadGoal} />
        )}

        {activeTab === 'reflection' && goal && (
          <MonthlyReflection goal={goal} onUpdate={loadGoal} />
        )}
      </div>
    </div>
  );
}

