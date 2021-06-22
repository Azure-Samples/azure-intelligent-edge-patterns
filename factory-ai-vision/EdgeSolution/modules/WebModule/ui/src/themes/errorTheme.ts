import { ThemeInput, mergeThemes } from '@fluentui/react-northstar';
import { mainTheme } from './mainTheme';

const theme: ThemeInput = {
  siteVariables: {
    colorScheme: {
      brand: {
        foreground: '#C4314B',
        background: '#C4314B',
        foregroundHover: '#A72037',
        backgroundHover: '#A72037',
        foregroundActive: '#8E192E',
        backgroundActive: '#8E192E',
        foregroundPressed: '#8E192E',
        backgroundPressed: '#8E192E',
      },
    },
  },
};

export const errorTheme = mergeThemes(mainTheme, theme);
