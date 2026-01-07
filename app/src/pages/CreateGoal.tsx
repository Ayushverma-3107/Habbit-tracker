import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/goalService';
import { Category, Priority } from '../types';
import { ArrowLeft } from 'lucide-react';

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

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.endDate) {
      setError('End date is required');
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
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/goals')}
        className="inline-flex items-center text-dark-text-secondary hover:text-dark-text transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Goals
      </button>

      <div>
        <h1 className="text-3xl font-bold text-dark-text">Create New Goal</h1>
        <p className="text-dark-text-secondary mt-1">Set a new goal and start tracking your progress</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-dark-text mb-2">
            Goal Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-purple"
            placeholder="e.g., Run a marathon"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-dark-text mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              required
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-purple"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-dark-text mb-2">
              Priority *
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              required
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-purple"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-dark-text mb-2">
              Start Date *
            </label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-purple"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-dark-text mb-2">
              End Date *
            </label>
            <input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              min={formData.startDate}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-purple"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-dark-text mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-purple resize-none"
            placeholder="Add details about your goal..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/goals')}
            className="flex-1 px-4 py-2 border border-dark-border rounded-md text-dark-text hover:bg-dark-card transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-accent-purple hover:bg-purple-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
}

