'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from 'next-intl';
import NavSelect from './NavSelect';

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const t = useTranslations('navigation');

  /*
    The trigger says "Theme", not the theme's own name. A label that changes with
    the selection is a status readout; the panel already shows which one is
    checked, and a fixed word keeps the bar from reflowing on every change.
  */
  return (
    <NavSelect
      label={t('theme')}
      ariaLabel={t('theme')}
      value={currentTheme.name}
      onChange={setTheme}
      options={availableThemes.map((theme) => ({
        value: theme.name,
        label: theme.displayName,
      }))}
    />
  );
}
