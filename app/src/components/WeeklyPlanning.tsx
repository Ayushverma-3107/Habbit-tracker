import { useState, useEffect } from 'react';
import { Goal, WeeklyTask, Task } from '../types';
import { goalService } from '../services/goalService';
import { format, startOfWeek, addWeeks, parseISO, eachWeekOfInterval } from 'date-fns';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

interface WeeklyPlanningProps {
  goal: Goal;
  onUpdate: () => void;
}

export default function WeeklyPlanning({ goal, onUpdate }: WeeklyPlanningProps) {
  const [selectedWeek, setSelectedWeek] = useState<string>(
    format(startOfWeek(new Date()), 'yyyy-MM-dd')
  );
  const [weeklyTask, setWeeklyTask] = useState<WeeklyTask | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate weeks between start and end date
  const weeks = eachWeekOfInterval({
    start: parseISO(goal.startDate),
    end: parseISO(goal.endDate),
  });

  useEffect(() => {
    loadWeeklyTasks();
  }, [selectedWeek, goal.id]);

  const loadWeeklyTasks = async () => {
    try {
      const task = await goalService.getWeeklyTasks(goal.id, selectedWeek);
      setWeeklyTask(task);
    } catch (error) {
      console.error('Error loading weekly tasks:', error);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setLoading(true);
    try {
      await goalService.updateTaskCompletion(goal.id, selectedWeek, taskId, !completed);
      await loadWeeklyTasks();
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
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

    setLoading(true);
    try {
      await goalService.saveWeeklyTasks(updatedTasks);
      setNewTaskTitle('');
      await loadWeeklyTasks();
      onUpdate();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!weeklyTask) return;

    const updatedTasks = {
      ...weeklyTask,
      tasks: weeklyTask.tasks.filter((t) => t.id !== taskId),
    };

    setLoading(true);
    try {
      await goalService.saveWeeklyTasks(updatedTasks);
      await loadWeeklyTasks();
      onUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentWeekTasks = weeklyTask?.tasks || [];
  const completedCount = currentWeekTasks.filter((t) => t.completed).length;
  const totalCount = currentWeekTasks.length;
  const weekProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-dark-text mb-4">Weekly Planning</h2>
        
        {/* Week Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-dark-text mb-2">Select Week</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-purple"
          >
            {weeks.map((week) => {
              const weekStr = format(week, 'yyyy-MM-dd');
              const weekEnd = format(addWeeks(week, 1), 'MMM dd');
              return (
                <option key={weekStr} value={weekStr}>
                  {format(week, 'MMM dd')} - {weekEnd}
                </option>
              );
            })}
          </select>
        </div>

        {/* Week Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-text-secondary">Week Progress</span>
            <span className="text-dark-text font-semibold">
              {completedCount}/{totalCount} tasks ({weekProgress}%)
            </span>
          </div>
          <div className="w-full bg-dark-card rounded-full h-2">
            <div
              className="bg-accent-green h-2 rounded-full transition-all"
              style={{ width: `${weekProgress}%` }}
            />
          </div>
        </div>

        {/* Add Task */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a new task for this week..."
            className="flex-1 px-4 py-2 bg-dark-card border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-purple"
          />
          <button
            onClick={handleAddTask}
            disabled={loading || !newTaskTitle.trim()}
            className="px-4 py-2 bg-accent-purple hover:bg-purple-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {currentWeekTasks.length === 0 ? (
            <p className="text-dark-text-secondary text-center py-8">
              No tasks for this week. Add tasks to get started!
            </p>
          ) : (
            currentWeekTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-dark-card border border-dark-border rounded-lg hover:border-accent-purple transition-colors"
              >
                <button
                  onClick={() => handleToggleTask(task.id, task.completed)}
                  disabled={loading}
                  className={`flex-shrink-0 ${
                    task.completed
                      ? 'text-accent-green'
                      : 'text-dark-text-secondary hover:text-accent-green'
                  } transition-colors`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={`flex-1 ${
                    task.completed
                      ? 'line-through text-dark-text-secondary'
                      : 'text-dark-text'
                  }`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={loading}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

