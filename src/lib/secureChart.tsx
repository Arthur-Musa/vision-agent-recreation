import { useMemo } from 'react';

// Secure chart theme generation without dangerouslySetInnerHTML
export const useSecureChartTheme = (id: string, colorConfig: Array<[string, any]>) => {
  return useMemo(() => {
    if (!colorConfig.length) {
      return {};
    }

    // Generate CSS variables safely without innerHTML
    const cssVariables: Record<string, string> = {};
    
    colorConfig.forEach(([key, itemConfig]) => {
      const lightColor = itemConfig.theme?.light || itemConfig.color;
      const darkColor = itemConfig.theme?.dark || itemConfig.color;
      
      if (lightColor) {
        cssVariables[`--color-${key}`] = lightColor;
      }
      if (darkColor) {
        cssVariables[`--color-${key}-dark`] = darkColor;
      }
    });

    return cssVariables;
  }, [id, colorConfig]);
};

// Safe CSS class generation
export const generateChartClasses = (id: string): string => {
  return `chart-${id}`;
};

// Validate color values to prevent CSS injection
export const validateColor = (color: string): boolean => {
  // Allow only hex colors, RGB, HSL, and CSS color names
  const validColorPattern = /^(#[0-9A-Fa-f]{3,8}|rgb\(.*\)|rgba\(.*\)|hsl\(.*\)|hsla\(.*\)|[a-zA-Z]+)$/;
  return validColorPattern.test(color);
};