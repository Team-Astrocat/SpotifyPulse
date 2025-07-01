import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { applyTheme, themes, type ThemeName, type ThemeColors } from "@/lib/theme";

export function useTheme() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<ThemeName>('red-black');
  const [customColors, setCustomColors] = useState<Partial<ThemeColors> | null>(null);

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    retry: false,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: any) => apiRequest('POST', '/api/settings', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
  });

  useEffect(() => {
    if (settings) {
      const themeName = settings.theme || 'red-black';
      const customThemeColors = settings.customColors;
      
      setTheme(themeName);
      setCustomColors(customThemeColors);
      applyTheme(themeName, customThemeColors);
    }
  }, [settings]);

  const changeTheme = (newTheme: ThemeName, customThemeColors?: Partial<ThemeColors>) => {
    setTheme(newTheme);
    setCustomColors(customThemeColors || null);
    applyTheme(newTheme, customThemeColors);
    
    updateSettingsMutation.mutate({
      theme: newTheme,
      customColors: customThemeColors || null,
    });
  };

  const updateCustomColors = (colors: Partial<ThemeColors>) => {
    const newCustomColors = { ...customColors, ...colors };
    setCustomColors(newCustomColors);
    applyTheme(theme, newCustomColors);
    
    updateSettingsMutation.mutate({
      theme,
      customColors: newCustomColors,
    });
  };

  const resetTheme = () => {
    setCustomColors(null);
    applyTheme(theme);
    
    updateSettingsMutation.mutate({
      theme,
      customColors: null,
    });
  };

  return {
    theme,
    customColors,
    availableThemes: Object.keys(themes) as ThemeName[],
    changeTheme,
    updateCustomColors,
    resetTheme,
    isUpdating: updateSettingsMutation.isPending,
  };
}
