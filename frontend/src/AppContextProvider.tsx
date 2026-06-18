import React, { type PropsWithChildren } from 'react';
import UserProvider from '@Context/user';
import { ThemeProvider } from '@ui/theme';
import { ThemeProviderPropsBase } from '@ui/theme/themeContext';
import getTokensByMode from '@ui/theme/helpers/getTokensByMode';

type AppContextProviderProps = PropsWithChildren<ThemeProviderPropsBase>;

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  return (
    <ThemeProvider
      theme={{
        lightMode: getTokensByMode('light'),
        darkMode: getTokensByMode('light'),
      }}
    >
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
