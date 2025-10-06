'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
      title="Toggle Language"
    >
      <Languages className="h-4 w-4" />
      <span className="font-semibold">
        {language === 'en' ? 'हिंदी' : 'English'}
      </span>
    </Button>
  );
}
