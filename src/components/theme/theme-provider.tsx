import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type TTheme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: TTheme
  storageKey?: string
}

type ThemeProviderState = {
  theme: TTheme
  setTheme: (theme: TTheme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider(props: ThemeProviderProps) {
  const { children, defaultTheme = 'system', storageKey = 'theme' } = props;
  const [theme, setTheme] = useState<TTheme>(() => (localStorage.getItem(storageKey) as TTheme) || defaultTheme);

  const setMetaColor = (mode: 'dark' | 'light') => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = mode == 'dark' ? '#09090b' : '#ffffff';

    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", color);
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
      setMetaColor(resolvedTheme);
    };

    const getSystemTheme = () =>
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(getSystemTheme());
      applyTheme(getSystemTheme());
      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: TTheme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
