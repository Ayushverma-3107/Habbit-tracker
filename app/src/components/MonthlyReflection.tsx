import { useState, useEffect } from 'react';
import { Goal, MonthlyReflection } from '../types';
import { goalService } from '../services/goalService';
import { format, parseISO } from 'date-fns';
import { Save } from 'lucide-react';

interface MonthlyReflectionProps {
  goal: Goal;
  onUpdate: () => void;
}

export default function MonthlyReflection({ goal, onUpdate }: MonthlyReflectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [reflection, setReflection] = useState<MonthlyReflection | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    whatWentWell: '',
    whatDidntGoWell: '',
    lessonsLearned: '',
  });

  // Generate months between start and end date
  const months: string[] = [];
  const start = parseISO(goal.startDate);
  const end = parseISO(goal.endDate);
  let current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    months.push(format(current, 'yyyy-MM'));
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  useEffect(() => {
    loadReflection();
  }, [selectedMonth, goal.id]);

  const loadReflection = async () => {
    try {
      const data = await goalService.getMonthlyReflection(goal.id, selectedMonth);
      if (data) {
        setReflection(data);
        setFormData({
          whatWentWell: data.whatWentWell,
          whatDidntGoWell: data.whatDidntGoWell,
          lessonsLearned: data.lessonsLearned,
        });
      } else {
        setReflection(null);
        setFormData({
          whatWentWell: '',
          whatDidntGoWell: '',
          lessonsLearned: '',
        });
      }
    } catch (error) {
      console.error('Error loading reflection:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await goalService.saveMonthlyReflection({
        goalId: goal.id,
        month: selectedMonth,
        whatWentWell: formData.whatWentWell,
        whatDidntGoWell: formData.whatDidntGoWell,
        lessonsLearned: formData.lessonsLearned,
      });
      await loadReflection();
      onUpdate();
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('Failed to save reflection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-dark-text mb-4">Monthly Reflection</h2>
        
        {/* Month Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-dark-text mb-2">Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-purple"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {format(parseISO(month + '-01'), 'MMMM yyyy')}
              </option>
            ))}
          </select>
        </div>

        {/* Reflection Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              What Went Well? ✨
            </label>
            <textarea
              value={formData.whatWentWell}
              onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-purple resize-none"
              placeholder="Reflect on what went well this month..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              What Didn't Go Well? 🤔
            </label>
            <textarea
              value={formData.whatDidntGoWell}
              onChange={(e) => setFormData({ ...formData, whatDidntGoWell: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-purple resize-none"
              placeholder="What challenges did you face?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Lessons Learned 📚
            </label>
            <textarea
              value={formData.lessonsLearned}
              onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-purple resize-none"
              placeholder="What did you learn from this month?"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-accent-purple hover:bg-purple-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Saving...' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </div>
  );
}

