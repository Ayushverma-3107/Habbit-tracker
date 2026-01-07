import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/goalService';
import { Goal, MonthlyReflection } from '../types';
import { BookOpen, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Reflections() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reflections, setReflections] = useState<{ [key: string]: MonthlyReflection[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      const userGoals = await goalService.getGoals(currentUser!.uid);
      setGoals(userGoals);

      // Load reflections for each goal
      const reflectionsMap: { [key: string]: MonthlyReflection[] } = {};
      for (const goal of userGoals) {
        // Get all months for this goal
        const start = parseISO(goal.startDate);
        const end = parseISO(goal.endDate);
        const months: string[] = [];
        let current = new Date(start.getFullYear(), start.getMonth(), 1);

        while (current <= end) {
          months.push(format(current, 'yyyy-MM'));
          current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }

        // Load reflections for each month
        const goalReflections: MonthlyReflection[] = [];
        for (const month of months) {
          const reflection = await goalService.getMonthlyReflection(goal.id, month);
          if (reflection) {
            goalReflections.push(reflection);
          }
        }
        if (goalReflections.length > 0) {
          reflectionsMap[goal.id] = goalReflections;
        }
      }
      setReflections(reflectionsMap);
    } catch (error) {
      console.error('Error loading reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-text-secondary">Loading...</div>
      </div>
    );
  }

  const allReflections = Object.entries(reflections).flatMap(([goalId, goalReflections]) => {
    const goal = goals.find((g) => g.id === goalId);
    return goalReflections.map((reflection) => ({ goal, reflection }));
  });

  // Sort by month (newest first)
  allReflections.sort((a, b) => {
    if (!a.reflection || !b.reflection) return 0;
    return b.reflection.month.localeCompare(a.reflection.month);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-text">Reflections</h1>
        <p className="text-dark-text-secondary mt-1">Review your monthly reflections and learnings</p>
      </div>

      {allReflections.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <BookOpen className="h-12 w-12 text-dark-text-secondary mx-auto mb-4" />
          <p className="text-dark-text-secondary mb-4">
            You haven't written any reflections yet.
          </p>
          <p className="text-sm text-dark-text-secondary">
            Go to a goal detail page and use the Reflection tab to add your first reflection.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {allReflections.map(({ goal, reflection }) => {
            if (!goal || !reflection) return null;
            return (
              <div
                key={`${goal.id}-${reflection.month}`}
                className="bg-dark-surface border border-dark-border rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link
                      to={`/goals/${goal.id}`}
                      className="text-xl font-semibold text-dark-text hover:text-accent-purple"
                    >
                      {goal.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-2 text-sm text-dark-text-secondary">
                      <Calendar className="h-4 w-4" />
                      <span>{format(parseISO(reflection.month + '-01'), 'MMMM yyyy')}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-accent-purple/20 text-accent-purple rounded">
                    {goal.category}
                  </span>
                </div>

                <div className="space-y-4">
                  {reflection.whatWentWell && (
                    <div>
                      <h3 className="text-sm font-medium text-accent-green mb-2">
                        ✨ What Went Well
                      </h3>
                      <p className="text-dark-text-secondary">{reflection.whatWentWell}</p>
                    </div>
                  )}

                  {reflection.whatDidntGoWell && (
                    <div>
                      <h3 className="text-sm font-medium text-yellow-400 mb-2">
                        🤔 What Didn't Go Well
                      </h3>
                      <p className="text-dark-text-secondary">{reflection.whatDidntGoWell}</p>
                    </div>
                  )}

                  {reflection.lessonsLearned && (
                    <div>
                      <h3 className="text-sm font-medium text-accent-blue mb-2">
                        📚 Lessons Learned
                      </h3>
                      <p className="text-dark-text-secondary">{reflection.lessonsLearned}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

