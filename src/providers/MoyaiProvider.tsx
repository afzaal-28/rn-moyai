import React, { createContext, useContext, useMemo } from 'react';
import type { ColorValue } from 'react-native';
import { Colors } from '../theme/Colors';

export type MoyaiTheme = {
  colors: {
    primary: ColorValue;
    track: ColorValue;
    buffer: ColorValue;
  };
};

const defaultTheme: MoyaiTheme = {
  colors: {
    primary: Colors.primary,
    track: Colors.track,
    buffer: Colors.buffer,
  },
};

const MoyaiThemeContext = createContext<MoyaiTheme>(defaultTheme);

export type MoyaiProviderProps = {
  theme?: Partial<MoyaiTheme>;
  children: React.ReactNode;
};

export function MoyaiProvider({ theme, children }: MoyaiProviderProps) {
  const value = useMemo<MoyaiTheme>(() => {
    return {
      colors: {
        primary: theme?.colors?.primary ?? defaultTheme.colors.primary,
        track: theme?.colors?.track ?? defaultTheme.colors.track,
        buffer: theme?.colors?.buffer ?? defaultTheme.colors.buffer,
      },
    };
  }, [theme]);

  return (
    <MoyaiThemeContext.Provider value={value}>
      {children}
    </MoyaiThemeContext.Provider>
  );
}

export function useMoyaiTheme() {
  return useContext(MoyaiThemeContext);
}
