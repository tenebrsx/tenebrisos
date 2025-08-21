// Comprehensive Theme System for Tenebris OS
// Site-wide theme transformation with Windows XP/Vista and Mac OS 9 inspiration

export const themes = {
  // Modern Dark Theme (Default)
  default: {
    name: "Tenebris Dark",
    id: "default",
    category: "modern",
    variant: "dark",
    cssVars: {
      // Base Colors
      "--color-bg": "#000000",
      "--color-surface": "#080808",
      "--color-border": "#1a1a1a",
      "--color-text": "#ffffff",
      "--color-text-secondary": "#a1a1aa",
      "--color-text-muted": "#71717a",

      // Accent Colors
      "--color-accent-blue": "#3b82f6",
      "--color-accent-purple": "#8b5cf6",
      "--color-accent-green": "#10b981",
      "--color-accent-orange": "#f59e0b",
      "--color-accent-red": "#ef4444",

      // Component Styles
      "--glass-bg": "rgba(0, 0, 0, 0.8)",
      "--glass-border": "rgba(255, 255, 255, 0.1)",
      "--button-bg": "rgba(59, 130, 246, 0.1)",
      "--button-border": "rgba(255, 255, 255, 0.2)",
      "--button-hover": "rgba(59, 130, 246, 0.2)",
      "--button-shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",

      // Typography
      "--font-display": "'Space Grotesk', system-ui, sans-serif",
      "--font-body": "'Inter', system-ui, sans-serif",
      "--font-mono": "'JetBrains Mono', Menlo, monospace",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",

      // Layout & Spacing
      "--border-radius": "12px",
      "--border-radius-lg": "16px",
      "--border-radius-xl": "20px",
      "--spacing-unit": "8px",
      "--nav-height": "60px",
      "--sidebar-width": "280px",
    },
  },

  // Modern Light Theme
  light: {
    name: "Tenebris Light",
    id: "light",
    category: "modern",
    variant: "light",
    cssVars: {
      // Base Colors
      "--color-bg": "#ffffff",
      "--color-surface": "#f8fafc",
      "--color-border": "#e2e8f0",
      "--color-text": "#1e293b",
      "--color-text-secondary": "#475569",
      "--color-text-muted": "#64748b",

      // Accent Colors
      "--color-accent-blue": "#3b82f6",
      "--color-accent-purple": "#8b5cf6",
      "--color-accent-green": "#10b981",
      "--color-accent-orange": "#f59e0b",
      "--color-accent-red": "#ef4444",

      // Component Styles
      "--glass-bg": "rgba(248, 250, 252, 0.8)",
      "--glass-border": "rgba(0, 0, 0, 0.1)",
      "--button-bg": "rgba(59, 130, 246, 0.05)",
      "--button-border": "rgba(0, 0, 0, 0.1)",
      "--button-hover": "rgba(59, 130, 246, 0.1)",
      "--button-shadow": "0 1px 3px rgba(0, 0, 0, 0.1)",

      // Typography (same as dark)
      "--font-display": "'Space Grotesk', system-ui, sans-serif",
      "--font-body": "'Inter', system-ui, sans-serif",
      "--font-mono": "'JetBrains Mono', Menlo, monospace",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",

      // Layout & Spacing
      "--border-radius": "12px",
      "--border-radius-lg": "16px",
      "--border-radius-xl": "20px",
      "--spacing-unit": "8px",
      "--nav-height": "60px",
      "--sidebar-width": "280px",
    },
  },

  // Windows XP/Vista Classic Light Theme
  "retro-light": {
    name: "Windows Classic",
    id: "retro-light",
    category: "retro",
    variant: "light",
    cssVars: {
      // Windows XP Luna Blue Base Colors
      "--color-bg":
        "linear-gradient(135deg, #c3d9ff 0%, #c3d9ff 50%, #a8c8ec 100%)",
      "--color-surface": "#ece9d8",
      "--color-border": "#0054e3",
      "--color-text": "#000000",
      "--color-text-secondary": "#333333",
      "--color-text-muted": "#666666",

      // Windows XP Accent Colors
      "--color-accent-blue": "#0054e3",
      "--color-accent-purple": "#7b68ee",
      "--color-accent-green": "#4caf50",
      "--color-accent-orange": "#ff8f00",
      "--color-accent-red": "#e53e3e",

      // XP Component Styles
      "--glass-bg":
        "linear-gradient(180deg, #f0f8ff 0%, #e6f3ff 50%, #cce7ff 100%)",
      "--glass-border": "#316ac5",
      "--button-bg":
        "linear-gradient(180deg, #ffffff 0%, #ece9d8 45%, #d4d0c8 50%, #d4d0c8 100%)",
      "--button-border": "#aca899",
      "--button-hover":
        "linear-gradient(180deg, #fff2cc 0%, #ffe066 45%, #ffdb4d 50%, #ffdb4d 100%)",
      "--button-shadow": "1px 1px 0 #ffffff, 2px 2px 4px rgba(0, 0, 0, 0.2)",

      // Classic Windows Typography
      "--font-display": "'Trebuchet MS', 'Lucida Grande', sans-serif",
      "--font-body": "'Tahoma', 'Geneva', 'Verdana', sans-serif",
      "--font-mono": "'Courier New', 'Monaco', monospace",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",

      // Classic UI Elements
      "--border-radius": "3px",
      "--border-radius-lg": "6px",
      "--border-radius-xl": "8px",
      "--spacing-unit": "4px",
      "--nav-height": "28px",
      "--sidebar-width": "200px",

      // XP Specific Variables
      "--window-chrome":
        "linear-gradient(90deg, #0054e3 0%, #0078d4 50%, #005a9e 100%)",
      "--titlebar-text": "#ffffff",
      "--scrollbar-bg": "#c0c0c0",
      "--scrollbar-thumb": "#808080",
      "--menu-bg": "#f0f0f0",
      "--menu-hover": "#316ac5",
      "--menu-border": "#999999",
      "--taskbar-bg":
        "linear-gradient(180deg, #245edb 0%, #1941a5 50%, #1941a5 100%)",
      "--start-button":
        "linear-gradient(90deg, #4caf50 0%, #8bc34a 50%, #cddc39 100%)",

      // Windows Shadows & Effects
      "--inset-shadow":
        "inset 1px 1px 0 rgba(0, 0, 0, 0.2), inset -1px -1px 0 rgba(255, 255, 255, 0.8)",
      "--outset-shadow":
        "1px 1px 0 rgba(255, 255, 255, 0.8), -1px -1px 0 rgba(0, 0, 0, 0.2)",
      "--button-pressed": "inset 2px 2px 4px rgba(0, 0, 0, 0.3)",
      "--selection-bg": "rgba(0, 84, 227, 0.3)",
    },
  },

  // Windows XP/Vista Classic Dark Theme
  "retro-dark": {
    name: "Windows Classic Dark",
    id: "retro-dark",
    category: "retro",
    variant: "dark",
    cssVars: {
      // Dark Windows Vista/7 Aero Colors
      "--color-bg":
        "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      "--color-surface": "#2d2d30",
      "--color-border": "#007acc",
      "--color-text": "#ffffff",
      "--color-text-secondary": "#cccccc",
      "--color-text-muted": "#999999",

      // Vista/7 Dark Accent Colors
      "--color-accent-blue": "#007acc",
      "--color-accent-purple": "#9966cc",
      "--color-accent-green": "#00cc66",
      "--color-accent-orange": "#ff9900",
      "--color-accent-red": "#cc3333",

      // Dark Vista Component Styles
      "--glass-bg":
        "linear-gradient(180deg, rgba(45, 45, 48, 0.95) 0%, rgba(35, 35, 38, 0.95) 50%, rgba(25, 25, 28, 0.95) 100%)",
      "--glass-border": "#007acc",
      "--button-bg":
        "linear-gradient(180deg, #404040 0%, #2d2d30 45%, #1e1e1e 50%, #1e1e1e 100%)",
      "--button-border": "#555555",
      "--button-hover":
        "linear-gradient(180deg, #4d90fe 0%, #007acc 45%, #0056b3 50%, #0056b3 100%)",
      "--button-shadow":
        "0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.3)",

      // Dark Windows Typography
      "--font-display": "'Segoe UI', 'Trebuchet MS', sans-serif",
      "--font-body": "'Segoe UI', 'Tahoma', 'Geneva', sans-serif",
      "--font-mono": "'Consolas', 'Courier New', monospace",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",

      // Classic UI Elements
      "--border-radius": "3px",
      "--border-radius-lg": "6px",
      "--border-radius-xl": "8px",
      "--spacing-unit": "4px",
      "--nav-height": "30px",
      "--sidebar-width": "220px",

      // Vista Dark Specific Variables
      "--window-chrome":
        "linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      "--titlebar-text": "#ffffff",
      "--scrollbar-bg": "#3c3c3c",
      "--scrollbar-thumb": "#606060",
      "--menu-bg": "#2d2d30",
      "--menu-hover": "#007acc",
      "--menu-border": "#555555",
      "--taskbar-bg":
        "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      "--start-button":
        "linear-gradient(90deg, #007acc 0%, #0066b3 50%, #004d99 100%)",

      // Dark Windows Shadows & Effects
      "--inset-shadow":
        "inset 1px 1px 0 rgba(255, 255, 255, 0.1), inset -1px -1px 0 rgba(0, 0, 0, 0.3)",
      "--outset-shadow":
        "0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.3)",
      "--button-pressed": "inset 2px 2px 4px rgba(0, 0, 0, 0.5)",
      "--selection-bg": "rgba(0, 122, 204, 0.4)",
    },
  },

  // Mac OS 9 Platinum Light Theme
  "macos9-light": {
    name: "Mac OS 9 Platinum",
    id: "macos9-light",
    category: "retro",
    variant: "light",
    cssVars: {
      // Classic Mac OS 9 Platinum Colors
      "--color-bg": "#c0c0c0",
      "--color-surface": "#e0e0e0",
      "--color-border": "#808080",
      "--color-text": "#000000",
      "--color-text-secondary": "#333333",
      "--color-text-muted": "#666666",

      // Mac OS 9 Accent Colors
      "--color-accent-blue": "#007acc",
      "--color-accent-purple": "#9966cc",
      "--color-accent-green": "#339966",
      "--color-accent-orange": "#ff9933",
      "--color-accent-red": "#cc3333",

      // Mac OS 9 Component Styles
      "--glass-bg":
        "linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 50%, #d0d0d0 100%)",
      "--glass-border": "#999999",
      "--button-bg":
        "linear-gradient(180deg, #f5f5f5 0%, #e0e0e0 50%, #cccccc 100%)",
      "--button-border": "#999999",
      "--button-hover":
        "linear-gradient(180deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)",
      "--button-shadow": "1px 1px 0 #ffffff, 2px 2px 3px rgba(0, 0, 0, 0.2)",

      // Classic Mac Typography
      "--font-display": "'Lucida Grande', 'Geneva', 'Helvetica', sans-serif",
      "--font-body": "'Geneva', 'Lucida Grande', 'Helvetica', sans-serif",
      "--font-mono": "'Monaco', 'Courier New', monospace",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",

      // Mac OS 9 UI Elements
      "--border-radius": "8px",
      "--border-radius-lg": "12px",
      "--border-radius-xl": "16px",
      "--spacing-unit": "6px",
      "--nav-height": "22px",
      "--sidebar-width": "180px",

      // Mac OS 9 Specific Variables
      "--window-chrome":
        "linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 50%, #b8b8b8 100%)",
      "--titlebar-text": "#000000",
      "--scrollbar-bg": "#e0e0e0",
      "--scrollbar-thumb": "#a0a0a0",
      "--menu-bg": "#e8e8e8",
      "--menu-hover": "rgba(0, 122, 204, 0.2)",
      "--menu-border": "#999999",

      // Mac Platinum Effects
      "--inset-shadow": "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #999999",
      "--outset-shadow": "1px 1px 0 #ffffff, 2px 2px 3px rgba(0, 0, 0, 0.2)",
      "--button-pressed": "inset 2px 2px 3px rgba(0, 0, 0, 0.2)",
      "--selection-bg": "rgba(0, 122, 204, 0.3)",
    },
  },

  // Mac OS 9 Dark Variant - Authentic Dark Platinum
  "macos9-dark": {
    name: "Mac OS 9 Dark",
    id: "macos9-dark",
    category: "retro",
    variant: "dark",
    cssVars: {
      // Authentic Dark Mac OS 9 Platinum Colors - Warm grays, not black
      "--color-bg":
        "linear-gradient(135deg, #606060 0%, #505050 50%, #404040 100%)",
      "--color-surface":
        "linear-gradient(180deg, #585858 0%, #484848 50%, #383838 100%)",
      "--color-border": "#707070",
      "--color-text": "#f0f0f0",
      "--color-text-secondary": "#d0d0d0",
      "--color-text-muted": "#a0a0a0",

      // Mac OS 9 System Colors - More muted, authentic palette
      "--color-accent-blue": "#6699ff",
      "--color-accent-purple": "#9966cc",
      "--color-accent-green": "#66cc99",
      "--color-accent-orange": "#ffcc66",
      "--color-accent-red": "#ff6666",

      // Authentic Mac Platinum Component Styles
      "--glass-bg":
        "linear-gradient(180deg, #686868 0%, #585858 30%, #484848 70%, #404040 100%)",
      "--glass-border": "#808080",
      "--button-bg":
        "linear-gradient(180deg, #787878 0%, #686868 25%, #585858 75%, #484848 100%)",
      "--button-border": "#909090",
      "--button-hover":
        "linear-gradient(180deg, #888888 0%, #787878 25%, #686868 75%, #585858 100%)",
      "--button-shadow":
        "1px 1px 0 rgba(255, 255, 255, 0.2), 2px 2px 3px rgba(0, 0, 0, 0.4)",

      // Classic Mac Typography - Authentic fonts
      "--font-display": "'Chicago', 'Lucida Grande', 'Geneva', sans-serif",
      "--font-body": "'Geneva', 'Charcoal', 'Helvetica', sans-serif",
      "--font-mono": "'Monaco', 'Courier New', monospace",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",

      // Mac OS 9 UI Proportions
      "--border-radius": "6px",
      "--border-radius-lg": "8px",
      "--border-radius-xl": "12px",
      "--spacing-unit": "4px",
      "--nav-height": "20px",
      "--sidebar-width": "160px",

      // Authentic Mac Window Chrome - Platinum brushed metal
      "--window-chrome":
        "linear-gradient(180deg, #707070 0%, #606060 25%, #505050 75%, #454545 100%)",
      "--titlebar-text": "#f0f0f0",
      "--scrollbar-bg":
        "linear-gradient(90deg, #606060 0%, #505050 50%, #606060 100%)",
      "--scrollbar-thumb":
        "linear-gradient(90deg, #808080 0%, #707070 50%, #808080 100%)",
      "--menu-bg": "linear-gradient(180deg, #606060 0%, #505050 100%)",
      "--menu-hover": "rgba(102, 153, 255, 0.3)",
      "--menu-border": "#808080",

      // Mac Platinum 3D Effects - Authentic embossed look
      "--inset-shadow":
        "inset 1px 1px 0 rgba(0, 0, 0, 0.4), inset -1px -1px 0 rgba(255, 255, 255, 0.15)",
      "--outset-shadow":
        "1px 1px 0 rgba(255, 255, 255, 0.15), 2px 2px 3px rgba(0, 0, 0, 0.4)",
      "--button-pressed":
        "inset 2px 2px 3px rgba(0, 0, 0, 0.5), inset -1px -1px 0 rgba(255, 255, 255, 0.1)",
      "--selection-bg": "rgba(102, 153, 255, 0.4)",
    },
  },

  // Minimalist Monochrome Dark Theme
  "monochrome-dark": {
    name: "Monochrome Dark",
    id: "monochrome-dark",
    category: "modern",
    variant: "dark",
    cssVars: {
      // Pure Black & White Base Colors
      "--color-bg": "#000000",
      "--color-surface": "#000000",
      "--color-border": "#ffffff",
      "--color-text": "#ffffff",
      "--color-text-secondary": "#ffffff",
      "--color-text-muted": "#cccccc",

      // Monochrome Accent Colors (using white/gray variations)
      "--color-accent-blue": "#ffffff",
      "--color-accent-purple": "#ffffff",
      "--color-accent-green": "#ffffff",
      "--color-accent-orange": "#ffffff",
      "--color-accent-red": "#ffffff",

      // Minimalist Component Styles
      "--glass-bg": "rgba(0, 0, 0, 0.95)",
      "--glass-border": "rgba(255, 255, 255, 0.3)",
      "--button-bg": "rgba(255, 255, 255, 0.1)",
      "--button-border": "rgba(255, 255, 255, 0.3)",
      "--button-hover": "rgba(255, 255, 255, 0.2)",
      "--button-shadow": "0 1px 3px rgba(255, 255, 255, 0.1)",

      // Clean Typography
      "--font-display": "'Space Grotesk', system-ui, sans-serif",
      "--font-body": "'Inter', system-ui, sans-serif",
      "--font-mono": "'JetBrains Mono', Menlo, monospace",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",

      // Same Layout & Spacing as default
      "--border-radius": "12px",
      "--border-radius-lg": "16px",
      "--border-radius-xl": "20px",
      "--spacing-unit": "8px",
      "--nav-height": "60px",
      "--sidebar-width": "280px",
    },
  },

  // Minimalist Monochrome Light Theme
  "monochrome-light": {
    name: "Monochrome Light",
    id: "monochrome-light",
    category: "modern",
    variant: "light",
    cssVars: {
      // Pure White & Black Base Colors
      "--color-bg": "#ffffff",
      "--color-surface": "#ffffff",
      "--color-border": "#000000",
      "--color-text": "#000000",
      "--color-text-secondary": "#000000",
      "--color-text-muted": "#333333",

      // Monochrome Accent Colors (using black/gray variations)
      "--color-accent-blue": "#000000",
      "--color-accent-purple": "#000000",
      "--color-accent-green": "#000000",
      "--color-accent-orange": "#000000",
      "--color-accent-red": "#000000",

      // Minimalist Component Styles
      "--glass-bg": "rgba(255, 255, 255, 0.95)",
      "--glass-border": "rgba(0, 0, 0, 0.3)",
      "--button-bg": "rgba(0, 0, 0, 0.05)",
      "--button-border": "rgba(0, 0, 0, 0.3)",
      "--button-hover": "rgba(0, 0, 0, 0.1)",
      "--button-shadow": "0 1px 3px rgba(0, 0, 0, 0.1)",

      // Clean Typography
      "--font-display": "'Space Grotesk', system-ui, sans-serif",
      "--font-body": "'Inter', system-ui, sans-serif",
      "--font-mono": "'JetBrains Mono', Menlo, monospace",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",

      // Same Layout & Spacing as default
      "--border-radius": "12px",
      "--border-radius-lg": "16px",
      "--border-radius-xl": "20px",
      "--spacing-unit": "8px",
      "--nav-height": "60px",
      "--sidebar-width": "280px",
    },
  },
};

// Theme utility functions
export const applyTheme = (themeId) => {
  const theme = themes[themeId];
  if (!theme) {
    console.warn(`Theme "${themeId}" not found, falling back to default`);
    return applyTheme("default");
  }

  const root = document.documentElement;
  const body = document.body;

  // Clear existing theme classes
  body.classList.remove(
    "theme-default",
    "theme-light",
    "theme-retro-light",
    "theme-retro-dark",
    "theme-macos9-light",
    "theme-macos9-dark",
    "theme-monochrome-dark",
    "theme-monochrome-light",
    "modern-theme",
    "retro-theme",
  );

  // Apply CSS variables
  Object.entries(theme.cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Add theme-specific classes
  body.classList.add(`theme-${themeId}`);
  body.classList.add(`${theme.category}-theme`);
  body.setAttribute("data-theme", themeId);
  body.setAttribute("data-theme-category", theme.category);
  body.setAttribute("data-theme-variant", theme.variant);

  // Apply theme-specific font loading
  if (theme.category === "retro") {
    loadRetroFonts();
  }

  // Apply cursor styles for retro themes
  if (theme.category === "retro") {
    applyRetroCursors();
  } else {
    removeRetroCursors();
  }

  // Store theme preference
  localStorage.setItem("tenebris-theme", themeId);

  console.debug(
    `🎨 Applied theme: ${theme.name} (${theme.category}/${theme.variant})`,
  );
  return theme;
};

// Load retro fonts
const loadRetroFonts = () => {
  const fonts = [
    { family: "Tahoma", weights: ["400", "700"] },
    { family: "Trebuchet MS", weights: ["400", "700"] },
    { family: "Segoe UI", weights: ["400", "500", "600", "700"] },
    { family: "Geneva", weights: ["400", "700"] },
    { family: "Lucida Grande", weights: ["400", "700"] },
  ];

  fonts.forEach((font) => {
    font.weights.forEach((weight) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.crossOrigin = "anonymous";

      // These are system fonts, so we don't need to load them from Google Fonts
      // They'll fallback to system equivalents
    });
  });
};

// Apply retro cursors
const applyRetroCursors = () => {
  const style = document.createElement("style");
  style.id = "retro-cursors";
  style.textContent = `
    .retro-theme * {
      cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAQCAYAAADAvYV+AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVCiRY/z//z8DJQAggJiQOAAggJhQ2QAggBhR2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QAggBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJhQ2QACCBBR2QAggJg==") 2 2, auto !important;
    }

    .retro-theme button, .retro-theme a, .retro-theme [role="button"] {
      cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGYSUIBVCiRY/z//z8DJQAggJiQOAAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJg==") 2 2, pointer !important;
    }

    .retro-theme input, .retro-theme textarea {
      cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAQCAYAAAArij59AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSUIBVCiRY/z//z8DJQAggJiQOAAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJhQ2QAggJg==") 4 8, text !important;
    }
  `;

  const existing = document.getElementById("retro-cursors");
  if (existing) existing.remove();
  document.head.appendChild(style);
};

// Remove retro cursors
const removeRetroCursors = () => {
  const existing = document.getElementById("retro-cursors");
  if (existing) existing.remove();
};

export const getCurrentTheme = () => {
  return localStorage.getItem("tenebris-theme") || "default";
};

export const getThemeList = () => {
  return Object.values(themes).map((theme) => ({
    id: theme.id,
    name: theme.name,
    category: theme.category,
    variant: theme.variant,
  }));
};

// Initialize theme on load
export const initializeTheme = () => {
  const savedTheme = getCurrentTheme();
  applyTheme(savedTheme);
};

// Get theme by category
export const getThemesByCategory = (category) => {
  return Object.values(themes).filter((theme) => theme.category === category);
};

// Get retro theme variants
export const getRetroThemes = () => {
  return getThemesByCategory("retro");
};

// Get modern theme variants
export const getModernThemes = () => {
  return getThemesByCategory("modern");
};

// Check if current theme is retro
export const isRetroTheme = () => {
  const currentTheme = getCurrentTheme();
  const theme = themes[currentTheme];
  return theme?.category === "retro";
};

// Check if current theme is dark variant
export const isDarkTheme = () => {
  const currentTheme = getCurrentTheme();
  const theme = themes[currentTheme];
  return theme?.variant === "dark";
};

// Switch between light and dark variants of same category
export const toggleThemeVariant = () => {
  const currentTheme = getCurrentTheme();
  const theme = themes[currentTheme];

  if (!theme) return applyTheme("default");

  // Handle monochrome themes
  if (currentTheme.startsWith("monochrome-")) {
    if (theme.variant === "dark") {
      return applyTheme("monochrome-light");
    } else {
      return applyTheme("monochrome-dark");
    }
  }

  if (theme.category === "retro") {
    // Toggle between retro variants
    if (theme.variant === "dark") {
      return applyTheme("retro-light");
    } else {
      return applyTheme("retro-dark");
    }
  } else {
    // Toggle between modern variants
    if (theme.variant === "dark") {
      return applyTheme("light");
    } else {
      return applyTheme("default");
    }
  }
};

export default {
  themes,
  applyTheme,
  getCurrentTheme,
  getThemeList,
  initializeTheme,
  getThemesByCategory,
  getRetroThemes,
  getModernThemes,
  isRetroTheme,
  isDarkTheme,
  toggleThemeVariant,
};
