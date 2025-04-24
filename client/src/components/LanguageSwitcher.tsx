import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

// Language codes supported
const languageCodes = ['en', 'es', 'fr', 'zh-CN', 'ar'];

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation('common');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Generate language options using translation keys
  const languages = languageCodes.map(code => ({
    code,
    label: t(`languages.${code}`)
  }));

  const currentLanguageLabel = t(`languages.${i18n.language}`) || t('languages.en');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
          <Globe className="h-4 w-4" />
          <span>{currentLanguageLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? 'bg-muted font-semibold' : ''}
          >
            {language.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher; 