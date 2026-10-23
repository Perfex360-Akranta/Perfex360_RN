
export type ThemeMode = 'light' | 'dark' | 'system';

export const themeConfig = {
  light: {
    background: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceSecondary: '#F4F6F9',
    surfaceElevated: '#FFFFFF',

    primary: '#07547D',
    primaryLight: '#E5F1F8',
    accent: '#1686B0',

    text: '#2E3841',
    textSecondary: '#6B7683',
    textMuted: '#8C97A3',
    icon: '#3B4652',
    iconSecondary: '#8B98A5',

    border: '#E3E7EC',
    divider: '#E9EDF1',
    inputBackground: '#F8FAFC',
    disabled: '#E8EDF2',

    header: '#FFFFFF',
    avatar: '#DDE8F5',
    rolePill: '#F1E9F7',
    roleText: '#5E5470',

    row: '#FFFFFF',
    rowPressed: '#EDF3F8',
    rowOverlay: 'rgba(255,255,255,0.65)',

    success: '#237A4B',
    successBackground: '#E1F3E7',
    warning: '#9A6200',
    warningBackground: '#FFF0D2',
    error: '#B42332',
    errorBackground: '#FCE7E9',
    info: '#07547D',
    infoBackground: '#E5F1F8',

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

    bandIcons: {
      overview: '#5279AC',
      abnormality: '#357B62',
      suggestion: '#AD5555',
      breakdown: '#A66D30',
      maintenance: '#426FA8',
      workOrder: '#795CA4',
      clti: '#426FA8',
    },
  },

  dark: {
    background: '#101820',
    surface: '#1B2732',
    surfaceSecondary: '#263541',
    surfaceElevated: '#22313D',

    primary: '#65B8E8',
    primaryLight: '#203B4D',
    accent: '#78C9F0',

    text: '#F0F4F8',
    textSecondary: '#AAB8C5',
    textMuted: '#8FA0AE',
    icon: '#D6E0E8',
    iconSecondary: '#9DAFBD',

    border: '#364653',
    divider: '#334451',
    inputBackground: '#17232D',
    disabled: '#2B3945',

    header: '#17232D',
    avatar: '#33495D',
    rolePill: '#40334E',
    roleText: '#E1C9F4',

    row: '#263541',
    rowPressed: '#344956',
    rowOverlay: 'rgba(255,255,255,0.035)',

    success: '#76D6A0',
    successBackground: '#203F35',
    warning: '#F5C66A',
    warningBackground: '#493A25',
    error: '#FF929B',
    errorBackground: '#492B32',
    info: '#81CCF3',
    infoBackground: '#203B4D',

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

    bandIcons: {
      overview: '#9BBDEB',
      abnormality: '#8DD4B3',
      suggestion: '#F0A5A5',
      breakdown: '#F0C18C',
      maintenance: '#9DC6F5',
      workOrder: '#C8A9F1',
      clti: '#9DC6F5',
    },
  },
} as const;

// export const themeConfig = {
//   light: {
//     background: '#FAF7F2',
//     surface: '#FFFFFF',
//     surfaceSecondary: '#F4F6F9',
//     primary: '#07547D',
//     text: '#2E3841',
//     textSecondary: '#6B7683',
//     border: '#E3E7EC',
//     icon: '#3B4652',
//     header: '#FFFFFF',
//     avatar: '#DDE8F5',
//     rolePill: '#F1E9F7',
//     roleText: '#5E5470',
//     row: '#FFFFFF',
//     shadow: '#7C8A99',
//     bands: {
//       overview: '#CFDCEF',
//       abnormality: '#D3EBDB',
//       suggestion: '#F4CFCF',
//       breakdown: '#F6DFC2',
//       maintenance: '#CEDEF2',
//       workOrder: '#E3D9F1',
//       clti: '#CEDEF2',
//     },
//   },
//   dark: {
//     background: '#101820',
//     surface: '#1B2732',
//     surfaceSecondary: '#263541',
//     primary: '#65B8E8',
//     text: '#F0F4F8',
//     textSecondary: '#AAB8C5',
//     border: '#364653',
//     icon: '#D6E0E8',
//     header: '#17232D',
//     avatar: '#33495D',
//     rolePill: '#40334E',
//     roleText: '#E1C9F4',
//     row: '#263541',
//     shadow: '#000000',
//     bands: {
//       overview: '#263B54',
//       abnormality: '#24463C',
//       suggestion: '#503535',
//       breakdown: '#50402F',
//       maintenance: '#293F56',
//       workOrder: '#423650',
//       clti: '#293F56',
//     },
//   },
// } as const;

export type AppTheme = typeof themeConfig.light;
