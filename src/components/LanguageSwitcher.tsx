import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
];

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  
  const currentLang = languages.find(l => l.code === i18n.language) || languages[1];
  
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 font-mono text-xs">
          <Globe className="w-4 h-4" />
          <span>{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`font-mono text-xs cursor-pointer ${
              i18n.language === lang.code 
                ? 'bg-green-900/50 text-green-400' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
            {i18n.language === lang.code && (
              <span className="ml-auto text-green-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
