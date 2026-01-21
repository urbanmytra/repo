import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [resolvedTheme, setResolvedTheme] = useState('light');

  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const applyTheme = (themeToApply) => {
    document.documentElement.setAttribute('data-theme', themeToApply);
    setResolvedTheme(themeToApply);
  };

  // Load from localStorage once
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setTheme(stored);
    } else {
      localStorage.setItem('theme', 'system');
      setTheme('system');
    }
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!theme) return;

    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Watch for OS-level theme change
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  const setSpecificTheme = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, toggleTheme, setTheme: setSpecificTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
