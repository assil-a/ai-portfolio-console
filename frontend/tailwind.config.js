/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Monochrome Luxe System
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        panel: "hsl(var(--panel))",
        "panel-elev": "hsl(var(--panel-elev))",
        "border-hairline": "hsl(var(--border-hairline))",
        "border-strong": "hsl(var(--border-strong))",

        // Emerald Accent
        accent: {
          DEFAULT: "hsl(var(--accent))",
          fg: "hsl(var(--accent-fg))",
          subtle: "hsl(var(--accent-subtle))",
          surface: "hsl(var(--accent-surface))",
        },

        // Text Hierarchy
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          tertiary: "hsl(var(--text-tertiary))",
          quaternary: "hsl(var(--text-quaternary))",
        },

        // Semantic
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",

        // Legacy mappings
        border: "hsl(var(--border-hairline))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderWidth: {
        hairline: "0.5px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
      },
      fontSize: {
        'data-xl': ['0.875rem', { lineHeight: '1.25', letterSpacing: '-0.025em', fontWeight: '600' }],
        'data-lg': ['0.875rem', { lineHeight: '1.25', fontWeight: '500' }],
        'data-md': ['0.75rem', { lineHeight: '1.25', letterSpacing: '0.025em', fontWeight: '500' }],
        'data-sm': ['0.75rem', { lineHeight: '1.25' }],
      },
      spacing: {
        'compact': '0.125rem',
        'compact-sm': '0.25rem',
      },
      transitionDuration: {
        'tap': '120ms',
        'fast': '180ms',
        'base': '220ms',
        'slow': '320ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(2px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-collapsible-content-height)", opacity: "1" },
        },
        "slide-up": {
          from: { height: "var(--radix-collapsible-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms cubic-bezier(0, 0, 0.2, 1)",
        "scale-in": "scale-in 120ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "slide-down": "slide-down 220ms cubic-bezier(0, 0, 0.2, 1)",
        "slide-up": "slide-up 220ms cubic-bezier(0, 0, 0.2, 1)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        '.border-hairline': {
          'border-width': '0.5px',
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.elev-1': {
          'box-shadow': '0 0.5px 1px rgb(0 0 0 / 0.05), 0 0 0 0.5px rgb(0 0 0 / 0.08)',
          'transform': 'translateZ(0)',
        },
        '.elev-2': {
          'box-shadow': '0 1px 2px rgb(0 0 0 / 0.08), 0 0 0 0.5px rgb(0 0 0 / 0.05)',
          'transform': 'translateZ(0)',
        },
        '.elev-3': {
          'box-shadow': '0 2px 4px rgb(0 0 0 / 0.1), 0 0 0 0.5px rgb(0 0 0 / 0.05)',
          'transform': 'translateZ(0)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}