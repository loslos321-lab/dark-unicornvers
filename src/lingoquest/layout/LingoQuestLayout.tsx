import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, BookOpen, Mic, Trophy, Settings, 
  Flame, Zap, Menu, X, ChevronLeft, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dashboard } from '../pages/Dashboard';
import { LessonsPage } from '../pages/LessonsPage';
import { CyrillicTrainer, SoftHardSounds } from '../components/CyrillicTrainer';
import { VocabularyTrainer, VocabularyCategories } from '../components/VocabularyTrainer';
import { CaseTrainer, CaseQuickReference } from '../components/CaseTrainer';
import { useProgressStore, getStreakEmoji } from '../store/progressStore';
import type { Lesson } from '../types';

type View = 'dashboard' | 'lessons' | 'cyrillic' | 'vocabulary' | 'cases' | 'pronunciation' | 'profile';

interface LingoQuestLayoutProps {
  onBack?: () => void;
}

export function LingoQuestLayout({ onBack }: LingoQuestLayoutProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { progress } = useProgressStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'lessons', label: 'Lektionen', icon: BookOpen },
    { id: 'cyrillic', label: 'Alphabet', icon: '🔤' },
    { id: 'vocabulary', label: 'Vokabeln', icon: BookOpen },
    { id: 'cases', label: 'Kasus', icon: '⚡' },
    { id: 'pronunciation', label: 'Aussprache', icon: Mic },
  ] as const;

  const renderContent = () => {
    if (selectedLesson) {
      return (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedLesson(null)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Zurück
          </Button>
          <VocabularyTrainer lessonId={selectedLesson.id} />
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'lessons':
        return <LessonsPage onSelectLesson={setSelectedLesson} />;
      case 'cyrillic':
        return (
          <div className="space-y-6">
            <CyrillicTrainer />
            <SoftHardSounds />
          </div>
        );
      case 'vocabulary':
        return (
          <div className="space-y-6">
            <VocabularyCategories />
            <VocabularyTrainer />
          </div>
        );
      case 'cases':
        return (
          <div className="space-y-6">
            <CaseTrainer />
            <CaseQuickReference />
          </div>
        );
      case 'pronunciation':
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Aussprache-Trainer</h2>
              <p className="text-gray-500">Übe deine russische Aussprache</p>
            </div>
            <VocabularyTrainer />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="space-y-6 pt-4">
                  {/* Logo */}
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-3xl">🎯</span>
                    <div>
                      <h1 className="font-bold text-xl">LingoQuest</h1>
                      <p className="text-xs text-gray-500">Russisch-Deutsch</p>
                    </div>
                  </div>

                  {/* Menu */}
                  <nav className="space-y-1">
                    {menuItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={currentView === item.id ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => {
                          setCurrentView(item.id as View);
                          setIsSidebarOpen(false);
                          setSelectedLesson(null);
                        }}
                      >
                        {typeof item.icon === 'string' ? (
                          <span className="mr-2">{item.icon}</span>
                        ) : (
                          <item.icon className="w-4 h-4 mr-2" />
                        )}
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Zurück
              </Button>
            )}
          </div>

          {/* Center - Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-lg hidden sm:inline">LingoQuest</span>
          </div>

          {/* Right - Stats */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-orange-500">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{progress.streak}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-yellow-500">
              <Zap className="w-4 h-4" />
              <span className="font-bold">{progress.xp}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentView('profile')}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (selectedLesson?.id || '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t md:hidden">
        <div className="flex justify-around p-2">
          {menuItems.slice(0, 5).map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex-col gap-1 h-14 ${currentView === item.id ? 'text-indigo-600' : ''}`}
              onClick={() => {
                setCurrentView(item.id as View);
                setSelectedLesson(null);
              }}
            >
              {typeof item.icon === 'string' ? (
                <span className="text-lg">{item.icon}</span>
              ) : (
                <item.icon className="w-5 h-5" />
              )}
              <span className="text-xs">{item.label.slice(0, 4)}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Bottom Padding für Mobile */}
      <div className="h-20 md:h-0" />
    </div>
  );
}
