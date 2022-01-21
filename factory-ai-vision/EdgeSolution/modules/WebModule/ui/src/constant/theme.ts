import { IPalette } from '@fluentui/react'
import { PartialTheme } from '@fluentui/react-theme-provider'

interface Color {
  grayDark: string
  grayLight: string
  blue: string
  orange: string
}
interface Theme extends PartialTheme {
  palette: Partial<IPalette> & Partial<Color>
}

export const theme: Theme = {
  palette: {
    themeDarker: '#202F65',
    themeDark: '#2C408A',
    themeDarkAlt: '#344CA3',
    themePrimary: '#3A54B4',
    themeSecondary: '#4C65BE',
    themeTertiary: '#7D8FD3',
    themeLight: '#B9C4E9',
    themeLighter: '#D9DEF3',
    themeLighterAlt: '#F5F7FC',
    black: '#000000',
    neutralDark: '#201F1E',
    neutralPrimary: '#323130',
    neutralPrimaryAlt: '#3B3A39',
    neutralSecondary: '#605E5C',
    neutralTertiary: '#A19F9D',
    neutralQuaternary: '#2A2A2A',
    white: '#FFFFFF',
    neutralTertiaryAlt: '#C8C6C4',
    neutralQuaternaryAlt: '#E1DFDD',
    neutralLight: '#EDEBE9',
    neutralLighter: '#F3F2F1',
    neutralLighterAlt: '#FAF9F8',
    yellow: '#F2C94C',
    blueLight: 'rgba(58, 84, 180, 0.1)',
    greenDark: '#107C10',
    greenLight: '#27AE60',
    grayDark: '#8A8886',
    grayLight: '#919191',
    blue: '#2F80ED',
    orange: '#F2994A',
    red: '#EB5757',
    redDark: '#A4262C',
  },
  defaultFontStyle: {
    fontFamily: "'Open Sans', 'Noto Sans TC', sans-serif",
  },
}
