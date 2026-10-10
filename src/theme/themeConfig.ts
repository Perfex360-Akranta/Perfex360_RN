
export type ThemeMode = 'light' | 'dark' | 'system';

export const themeConfig = {
  light: {
    background: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceSecondary: '#F4F6F9',
    primary: '#07547D',
    text: '#2E3841',
    textSecondary: '#6B7683',
    border: '#E3E7EC',
    icon: '#3B4652',
    header: '#FFFFFF',
    avatar: '#DDE8F5',
    rolePill: '#F1E9F7',
    roleText: '#5E5470',
    row: '#FFFFFF',
    shadow: '#7C8A99',
    bands: {
      overview: '#CFDCEF',
      abnormality: '#D3EBDB',
      suggestion: '#F4CFCF',
      breakdown: '#F6DFC2',
      maintenance: '#CEDEF2',
      workOrder: '#E3D9F1',
      clti: '#CEDEF2',
    },
  },
  dark: {
    background: '#101820',
    surface: '#1B2732',
    surfaceSecondary: '#263541',
    primary: '#65B8E8',
    text: '#F0F4F8',
    textSecondary: '#AAB8C5',
    border: '#364653',
    icon: '#D6E0E8',
    header: '#17232D',
    avatar: '#33495D',
    rolePill: '#40334E',
    roleText: '#E1C9F4',
    row: '#263541',
    shadow: '#000000',
    bands: {
      overview: '#263B54',
      abnormality: '#24463C',
      suggestion: '#503535',
      breakdown: '#50402F',
      maintenance: '#293F56',
      workOrder: '#423650',
      clti: '#293F56',
    },
  },
} as const;

export type AppTheme = typeof themeConfig.light;
