import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lock, CheckCircle, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VOCABULARY_LESSONS } from '../data/vocabulary';
import { CASE_EXERCISES } from '../data/grammar';
import { CYRILLIC_ALPHABET } from '../data/cyrillic';
import { VOCABULARY_CATEGORIES } from '../types';
import { useProgressStore } from '../store/progressStore';
import type { Lesson, LanguageLevel } from '../types';

interface LessonsPageProps {
  onSelectLesson?: (lesson: Lesson) => void;
}

export function LessonsPage({ onSelectLesson }: LessonsPageProps) {
  const [activeLevel, setActiveLevel] = useState<LanguageLevel>('A1');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { progress } = useProgressStore();

  const levels: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2'];

  // Lektionen filtern
  const filteredLessons = VOCABULARY_LESSONS.filter(lesson => {
    const levelMatch = lesson.level === activeLevel;
    const categoryMatch = activeCategory === 'all' || lesson.category === activeCategory;
    return levelMatch && categoryMatch;
  });

  const isLessonUnlocked = (lesson: Lesson) => {
    // Erste Lektion oder vorherige abgeschlossen
    const lessonIndex = VOCABULARY_LESSONS.findIndex(l => l.id === lesson.id);
    if (lessonIndex === 0) return true;
    const prevLesson = VOCABULARY_LESSONS[lessonIndex - 1];
    return progress.completedLessons.includes(prevLesson.id);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.completedLessons.includes(lessonId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Lektionen</h1>
        <p className="text-gray-500">Wähle eine Lektion zum Lernen</p>
      </div>

      {/* Level-Auswahl */}
      <Tabs value={activeLevel} onValueChange={(v) => setActiveLevel(v as LanguageLevel)}>
        <TabsList className="grid w-full grid-cols-4">
          {levels.map((level) => (
            <TabsTrigger key={level} value={level}>
              {level}
            </TabsTrigger>
          ))}
        </TabsList>

        {levels.map((level) => (
          <TabsContent key={level} value={level} className="space-y-6">
            {/* Spezielle Lektionen */}
            {level === 'A1' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SpecialLessonCard
                  title="Kyrillisches Alphabet"
                  description={`Lerne alle ${CYRILLIC_ALPHABET.length} Buchstaben`}
                  icon="🔤"
                  color="from-blue-500 to-cyan-500"
                  onClick={() => {}}
                />
                <SpecialLessonCard
                  title="Kasus-Grundlagen"
                  description={`${CASE_EXERCISES.length} Übungen`}
                  icon="📚"
                  color="from-purple-500 to-pink-500"
                  onClick={() => {}}
                />
              </div>
            )}

            {/* Kategorie-Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('all')}
              >
                Alle
              </Button>
              {VOCABULARY_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Lektionen-Liste */}
            <div className="space-y-3">
              {filteredLessons.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Lektionen für dieses Level vorhanden</p>
                </div>
              ) : (
                filteredLessons.map((lesson, index) => {
                  const unlocked = isLessonUnlocked(lesson);
                  const completed = isLessonCompleted(lesson.id);

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all ${
                          unlocked 
                            ? 'hover:shadow-md' 
                            : 'opacity-60 cursor-not-allowed'
                        } ${completed ? 'bg-green-50 border-green-200' : ''}`}
                        onClick={() => unlocked && onSelectLesson?.(lesson)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Status-Icon */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            completed 
                              ? 'bg-green-100 text-green-600' 
                              : unlocked 
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-gray-100 text-gray-400'
                          }`}>
                            {completed ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : unlocked ? (
                              <Star className="w-6 h-6" />
                            ) : (
                              <Lock className="w-5 h-5" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{lesson.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {lesson.content.length} Wörter
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{lesson.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {VOCABULARY_CATEGORIES.find(c => c.id === lesson.category)?.icon} {lesson.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Pfeil */}
                          {unlocked && (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function SpecialLessonCard({
  title,
  description,
  icon,
  color,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`p-6 bg-gradient-to-br ${color} text-white cursor-pointer`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-4xl">{icon}</span>
            <h3 className="font-bold text-lg mt-2">{title}</h3>
            <p className="text-white/80 text-sm">{description}</p>
          </div>
          <ChevronRight className="w-6 h-6 text-white/60" />
        </div>
      </Card>
    </motion.div>
  );
}
