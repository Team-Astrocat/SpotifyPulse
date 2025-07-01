export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export const themes = {
  'red-black': {
    primary: 'hsl(0, 100%, 50%)',
    secondary: 'hsl(0, 100%, 40%)',
    accent: 'hsl(0, 100%, 60%)',
    background: 'hsl(0, 0%, 0%)',
    surface: 'hsl(0, 0%, 10%)',
    text: 'hsl(0, 0%, 100%)',
    textSecondary: 'hsl(0, 0%, 60%)',
  },
  'blue-dark': {
    primary: 'hsl(210, 100%, 50%)',
    secondary: 'hsl(210, 100%, 40%)',
    accent: 'hsl(210, 100%, 60%)',
    background: 'hsl(220, 13%, 13%)',
    surface: 'hsl(220, 13%, 18%)',
    text: 'hsl(0, 0%, 100%)',
    textSecondary: 'hsl(0, 0%, 60%)',
  },
  'purple-dark': {
    primary: 'hsl(270, 100%, 50%)',
    secondary: 'hsl(270, 100%, 40%)',
    accent: 'hsl(270, 100%, 60%)',
    background: 'hsl(260, 13%, 13%)',
    surface: 'hsl(260, 13%, 18%)',
    text: 'hsl(0, 0%, 100%)',
    textSecondary: 'hsl(0, 0%, 60%)',
  },
  'green-dark': {
    primary: 'hsl(120, 100%, 50%)',
    secondary: 'hsl(120, 100%, 40%)',
    accent: 'hsl(120, 100%, 60%)',
    background: 'hsl(120, 13%, 13%)',
    surface: 'hsl(120, 13%, 18%)',
    text: 'hsl(0, 0%, 100%)',
    textSecondary: 'hsl(0, 0%, 60%)',
  },
};

export type ThemeName = keyof typeof themes;

export function applyTheme(themeName: ThemeName, customColors?: Partial<ThemeColors>): void {
  const theme = themes[themeName];
  const colors = { ...theme, ...customColors };

  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--red-primary', colors.primary);
  root.style.setProperty('--red-secondary', colors.secondary);
  root.style.setProperty('--red-light', colors.accent);
  root.style.setProperty('--black-primary', colors.background);
  root.style.setProperty('--black-secondary', colors.surface);
  root.style.setProperty('--black-tertiary', adjustColor(colors.surface, 8));
  root.style.setProperty('--gray-primary', adjustColor(colors.surface, 15));
  root.style.setProperty('--gray-secondary', colors.textSecondary);
  root.style.setProperty('--gray-tertiary', adjustColor(colors.textSecondary, 10));

  // Apply to Tailwind CSS variables
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--card', colors.surface);
  root.style.setProperty('--muted', adjustColor(colors.surface, 5));
  root.style.setProperty('--accent', adjustColor(colors.surface, 8));
  root.style.setProperty('--border', adjustColor(colors.surface, 15));
  root.style.setProperty('--input', adjustColor(colors.surface, 15));
  root.style.setProperty('--ring', colors.primary);
}

function adjustColor(hslColor: string, lightnessDelta: number): string {
  // Parse HSL color and adjust lightness
  const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslColor;
  
  const [, h, s, l] = match;
  const newL = Math.max(0, Math.min(100, parseInt(l) + lightnessDelta));
  
  return `hsl(${h}, ${s}%, ${newL}%)`;
}

export function createCustomTheme(baseTheme: ThemeName, customizations: Partial<ThemeColors>): ThemeColors {
  return {
    ...themes[baseTheme],
    ...customizations,
  };
}

export function exportTheme(theme: ThemeColors): string {
  return JSON.stringify(theme, null, 2);
}

export function importTheme(themeJson: string): ThemeColors {
  try {
    const theme = JSON.parse(themeJson);
    // Validate theme structure
    const requiredKeys: (keyof ThemeColors)[] = [
      'primary', 'secondary', 'accent', 'background', 'surface', 'text', 'textSecondary'
    ];
    
    for (const key of requiredKeys) {
      if (!(key in theme)) {
        throw new Error(`Missing required theme property: ${key}`);
      }
    }
    
    return theme;
  } catch (error) {
    throw new Error('Invalid theme format');
  }
}
