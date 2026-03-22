import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProgress, Achievement, League } from '../types';

// Achievements definieren
const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_steps',
    name: 'Erste Schritte',
    description: 'Schließe deine erste Lektion ab',
    icon: '🎯',
    condition: (p: UserProgress) => p.completedLessons.length >= 1,
  },
  {
    id: 'cyrillic_master',
    name: 'Kyrillisch-Meister',
    description: 'Lerne alle 33 Buchstaben des kyrillischen Alphabets',
    icon: '🔤',
    condition: (p: UserProgress) => p.completedLessons.filter(l => l.includes('cyrillic')).length >= 5,
  },
  {
    id: 'case_wizard',
    name: 'Kasus-Zauberer',
    description: 'Schließe 20 Kasus-Übungen erfolgreich ab',
    icon: '⚡',
    condition: (p: UserProgress) => p.completedLessons.filter(l => l.includes('case')).length >= 20,
  },
  {
    id: 'perfect_accent',
    name: 'Perfekter Akzent',
    description: 'Erreiche 95% Genauigkeit in einer Aussprache-Übung',
    icon: '🎤',
    condition: (p: UserProgress) => p.xp >= 500, // Simplifiziert
  },
  {
    id: 'verb_aspects',
    name: 'Aspekt-Experte',
    description: 'Meistere 10 Verb-Aspekt-Paare',
    icon: '⏳',
    condition: (p: UserProgress) => p.completedLessons.filter(l => l.includes('aspect')).length >= 10,
  },
  {
    id: 'polyglot',
    name: 'Polyglott',
    description: 'Lerne 100 Vokabeln',
    icon: '📚',
    condition: (p: UserProgress) => p.completedLessons.filter(l => l.includes('vocab')).length >= 20,
  },
  {
    id: 'streak_7',
    name: 'Woche gewonnen',
    description: 'Lerne 7 Tage am Stück',
    icon: '🔥',
    condition: (p: UserProgress) => p.streak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Monat Meister',
    description: 'Lerne 30 Tage am Stück',
    icon: '📅',
    condition: (p: UserProgress) => p.streak >= 30,
  },
  {
    id: 'xp_1000',
    name: 'XP-Sammler',
    description: 'Sammle 1000 Erfahrungspunkte',
    icon: '💎',
    condition: (p: UserProgress) => p.xp >= 1000,
  },
  {
    id: 'xp_5000',
    name: 'XP-Champion',
    description: 'Sammle 5000 Erfahrungspunkte',
    icon: '👑',
    condition: (p: UserProgress) => p.xp >= 5000,
  },
  {
    id: 'bronze_league',
    name: 'Bronze-Liga',
    description: 'Erreiche die Bronze-Liga',
    icon: '🥉',
    condition: (p: UserProgress) => ['Bronze', 'Silver', 'Gold', 'Sapphire', 'Ruby', 'Diamond'].includes(p.league),
  },
  {
    id: 'silver_league',
    name: 'Silber-Liga',
    description: 'Erreiche die Silber-Liga',
    icon: '🥈',
    condition: (p: UserProgress) => ['Silver', 'Gold', 'Sapphire', 'Ruby', 'Diamond'].includes(p.league),
  },
  {
    id: 'gold_league',
    name: 'Gold-Liga',
    description: 'Erreiche die Gold-Liga',
    icon: '🥇',
    condition: (p: UserProgress) => ['Gold', 'Sapphire', 'Ruby', 'Diamond'].includes(p.league),
  },
  {
    id: 'diamond_league',
    name: 'Diamant-Liga',
    description: 'Erreiche die Diamant-Liga',
    icon: '💎',
    condition: (p: UserProgress) => p.league === 'Diamond',
  },
];

// XP für verschiedene Aktionen
export const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  PERFECT_LESSON: 20, // Ohne Fehler
  STREAK_BONUS: 5,    // Pro Tag Streak
  DAILY_GOAL: 50,     // Tägliches Ziel erreicht
  NEW_ACHIEVEMENT: 100,
};

// League-Grenzen
const LEAGUE_THRESHOLDS: { league: League; minXP: number }[] = [
  { league: 'Bronze', minXP: 0 },
  { league: 'Silver', minXP: 500 },
  { league: 'Gold', minXP: 1500 },
  { league: 'Sapphire', minXP: 3000 },
  { league: 'Ruby', minXP: 6000 },
  { league: 'Diamond', minXP: 10000 },
];

interface ProgressState {
  progress: UserProgress;
  achievements: Achievement[];
  dailyGoal: { target: number; current: number; date: string };
  
  // Aktionen
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  updateStreak: () => void;
  checkAchievements: () => string[]; // Gibt neue Achievement-IDs zurück
  getLeagueProgress: () => { current: number; next: number; league: League; nextLeague: League | null };
  resetProgress: () => void;
}

const initialProgress: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null,
  crowns: 0,
  completedLessons: [],
  league: 'Bronze',
};

const initialAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(def => ({
  ...def,
  unlocked: false,
}));

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,
      achievements: initialAchievements,
      dailyGoal: { target: 50, current: 0, date: new Date().toDateString() },

      addXP: (amount: number) => {
        set(state => {
          const newXP = state.progress.xp + amount;
          const newLevel = Math.floor(newXP / 100) + 1;
          
          // Liga bestimmen
          let newLeague: League = 'Bronze';
          for (const threshold of LEAGUE_THRESHOLDS) {
            if (newXP >= threshold.minXP) {
              newLeague = threshold.league;
            }
          }

          return {
            progress: {
              ...state.progress,
              xp: newXP,
              level: newLevel,
              league: newLeague,
            },
            dailyGoal: {
              ...state.dailyGoal,
              current: state.dailyGoal.current + amount,
            },
          };
        });
        
        // Achievements prüfen
        get().checkAchievements();
      },

      completeLesson: (lessonId: string) => {
        set(state => {
          if (state.progress.completedLessons.includes(lessonId)) {
            return state;
          }
          
          const newCompleted = [...state.progress.completedLessons, lessonId];
          const xpGain = XP_REWARDS.LESSON_COMPLETE;
          const newXP = state.progress.xp + xpGain;
          const newCrowns = state.progress.crowns + 1;
          
          return {
            progress: {
              ...state.progress,
              xp: newXP,
              crowns: newCrowns,
              completedLessons: newCompleted,
              level: Math.floor(newXP / 100) + 1,
            },
          };
        });
        
        get().updateStreak();
        get().checkAchievements();
      },

      updateStreak: () => {
        set(state => {
          const today = new Date().toDateString();
          const lastDate = state.progress.lastStudyDate;
          
          if (lastDate === today) {
            return state; // Heute bereits gelernt
          }
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          let newStreak = 1;
          if (lastDate === yesterday.toDateString()) {
            newStreak = state.progress.streak + 1;
          }
          
          return {
            progress: {
              ...state.progress,
              streak: newStreak,
              lastStudyDate: today,
            },
          };
        });
      },

      checkAchievements: () => {
        const state = get();
        const newAchievements: string[] = [];
        
        set(state => {
          const updatedAchievements = state.achievements.map(achievement => {
            if (!achievement.unlocked && achievement.condition(state.progress)) {
              newAchievements.push(achievement.id);
              return {
                ...achievement,
                unlocked: true,
                unlockedAt: new Date().toISOString(),
              };
            }
            return achievement;
          });
          
          // XP für neue Achievements
          if (newAchievements.length > 0) {
            const bonusXP = newAchievements.length * XP_REWARDS.NEW_ACHIEVEMENT;
            return {
              achievements: updatedAchievements,
              progress: {
                ...state.progress,
                xp: state.progress.xp + bonusXP,
              },
            };
          }
          
          return { achievements: updatedAchievements };
        });
        
        return newAchievements;
      },

      getLeagueProgress: () => {
        const { xp } = get().progress;
        
        for (let i = 0; i < LEAGUE_THRESHOLDS.length; i++) {
          const current = LEAGUE_THRESHOLDS[i];
          const next = LEAGUE_THRESHOLDS[i + 1];
          
          if (xp >= current.minXP && (!next || xp < next.minXP)) {
            return {
              current: xp - current.minXP,
              next: next ? next.minXP - current.minXP : 10000,
              league: current.league,
              nextLeague: next?.league || null,
            };
          }
        }
        
        return {
          current: xp,
          next: 500,
          league: 'Bronze' as League,
          nextLeague: 'Silver' as League,
        };
      },

      resetProgress: () => {
        set({
          progress: initialProgress,
          achievements: initialAchievements,
          dailyGoal: { target: 50, current: 0, date: new Date().toDateString() },
        });
      },
    }),
    {
      name: 'lingoquest-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progress: state.progress,
        achievements: state.achievements,
        dailyGoal: state.dailyGoal,
      }),
    }
  )
);

// Hilfsfunktionen
export function getLevelTitle(level: number): string {
  if (level < 5) return 'Anfänger';
  if (level < 10) return 'Schüler';
  if (level < 20) return 'Student';
  if (level < 30) return 'Experte';
  if (level < 50) return 'Meister';
  return 'Professor';
}

export function getStreakEmoji(streak: number): string {
  if (streak === 0) return '💤';
  if (streak < 3) return '🔥';
  if (streak < 7) return '⚡';
  if (streak < 14) return '🌟';
  if (streak < 30) return '👑';
  if (streak < 100) return '🏆';
  return '🦄';
}

export function getLeagueColor(league: League): string {
  const colors: Record<League, string> = {
    'Bronze': '#CD7F32',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
    'Sapphire': '#0F52BA',
    'Ruby': '#E0115F',
    'Diamond': '#B9F2FF',
  };
  return colors[league];
}
