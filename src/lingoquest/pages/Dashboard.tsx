import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Trophy, Target, Star, Zap, BookOpen, 
  TrendingUp, Clock, Calendar, Award, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProgressStore, getStreakEmoji, getLevelTitle, getLeagueColor } from '../store/progressStore';
import { VOCABULARY_CATEGORIES } from '../types';
import { VOCABULARY_LESSONS } from '../data/vocabulary';

export function Dashboard() {
  const { 
    progress, 
    achievements, 
    checkAchievements, 
    getLeagueProgress,
    dailyGoal 
  } = useProgressStore();

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  const leagueProgress = getLeagueProgress();
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const recentAchievements = unlockedAchievements.slice(-3);

  // Lektionsfortschritt pro Kategorie
  const getCategoryProgress = (categoryId: string) => {
    const categoryLessons = VOCABULARY_LESSONS.filter(l => l.category === categoryId);
    const completed = categoryLessons.filter(l => progress.completedLessons.includes(l.id)).length;
    return {
      total: categoryLessons.length,
      completed,
      percentage: categoryLessons.length > 0 ? (completed / categoryLessons.length) * 100 : 0,
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Willkommen */}
      <div className="text-center space-y-2">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Willkommen zurück! 👋
        </motion.h1>
        <p className="text-gray-500">
          Du bist ein <span className="font-semibold text-indigo-600">{getLevelTitle(progress.level)}</span>
        </p>
      </div>

      {/* Stats-Karten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Streak"
          value={`${progress.streak} Tage`}
          emoji={getStreakEmoji(progress.streak)}
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-yellow-500" />}
          label="XP"
          value={progress.xp.toLocaleString()}
          subtext={`Level ${progress.level}`}
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-purple-500" />}
          label="Liga"
          value={progress.league}
          color={getLeagueColor(progress.league)}
        />
        <StatCard
          icon={<Crown className="w-5 h-5 text-amber-500" />}
          label="Kronen"
          value={progress.crowns}
          subtext={`${progress.completedLessons.length} Lektionen`}
        />
      </div>

      {/* Liga-Fortschritt */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold">Liga-Fortschritt</h3>
          </div>
          <Badge style={{ backgroundColor: getLeagueColor(progress.league) }}>
            {progress.league}
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress 
            value={(leagueProgress.current / leagueProgress.next) * 100} 
            className="h-3"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{leagueProgress.current} XP</span>
            <span>{leagueProgress.next} XP</span>
          </div>
          {leagueProgress.nextLeague && (
            <p className="text-sm text-center text-indigo-600">
              Noch {leagueProgress.next - leagueProgress.current} XP bis {leagueProgress.nextLeague}
            </p>
          )}
        </div>
      </Card>

      {/* Tägliches Ziel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Tägliches Ziel</h3>
          </div>
          <Badge variant={dailyGoal.current >= dailyGoal.target ? 'default' : 'secondary'}>
            {dailyGoal.current}/{dailyGoal.target} XP
          </Badge>
        </div>
        <Progress 
          value={(dailyGoal.current / dailyGoal.target) * 100} 
          className="h-3"
        />
        {dailyGoal.current >= dailyGoal.target && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-green-600 mt-2 text-sm"
          >
            🎉 Tägliches Ziel erreicht!
          </motion.p>
        )}
      </Card>

      {/* Lernfortschritt */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Dein Fortschritt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VOCABULARY_CATEGORIES.slice(0, 6).map((category) => {
            const progress = getCategoryProgress(category.id);
            return (
              <Card key={category.id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-gray-500">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      {recentAchievements.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Award className="w-5 h-5" />
            Neueste Errungenschaften
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-shrink-0"
              >
                <Card className="p-4 text-center w-32">
                  <span className="text-3xl">{achievement.icon}</span>
                  <p className="text-xs font-medium mt-2 truncate">{achievement.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Schnellstart */}
      <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Bereit zu lernen?</h3>
            <p className="text-indigo-100">Setze deine Streak fort!</p>
          </div>
          <Button variant="secondary" className="gap-2">
            <Zap className="w-4 h-4" />
            Weiterlernen
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subtext, 
  emoji,
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  subtext?: string;
  emoji?: string;
  color?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
        {emoji && <span className="text-xl">{emoji}</span>}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
      </div>
    </Card>
  );
}
