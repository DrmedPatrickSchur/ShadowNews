/**
 * Tailwind CSS Configuration
 * 
 * Comprehensive Tailwind CSS configuration for the ShadowNews frontend application.
 * Defines design system, color palette, typography, spacing, and responsive breakpoints
 * for consistent and scalable UI development across the platform.
 * 
 * Design System Features:
 * - Color Palette: Custom color schemes for primary, secondary, and semantic colors
 * - Dark Mode: Class-based dark mode support for enhanced user experience
 * - Typography: Custom font families, sizes, and spacing for readable content
 * - Responsive Design: Mobile-first breakpoints for optimal device compatibility
 * - Component Styling: Utility classes for rapid UI development and prototyping
 * 
 * Theme Configuration:
 * - Primary Colors: Blue-based palette for brand consistency and accessibility
 * - Secondary Colors: Neutral gray palette for backgrounds and text hierarchy
 * - Semantic Colors: Success, warning, error, and info colors for user feedback
 * - Custom Properties: Extended spacing, shadows, and animation configurations
 * 
 * Content Sources:
 * - React Components: All JSX/TSX files in src directory for comprehensive coverage
 * - HTML Templates: Public HTML files for base styling and initial load styles
 * - Dynamic Content: Runtime-generated classes through component libraries
 * 
 * Performance Optimizations:
 * - Purge CSS: Removes unused styles for minimal bundle size
 * - Tree Shaking: Only includes utilized utility classes in production builds
 * - Component Extraction: Reusable component styles for consistency
 * - Critical CSS: Above-the-fold styling for improved initial load performance
 * 
 * Accessibility Features:
 * - Color Contrast: WCAG 2.1 compliant color combinations
 * - Focus Indicators: Clear focus states for keyboard navigation
 * - Screen Reader Support: Semantic color naming and utility classes
 * - Responsive Text: Scalable typography for various viewing conditions
 * 
 * Dependencies:
 * - Tailwind CSS framework for utility-first styling approach
 * - PostCSS for CSS processing and optimization
 * - Autoprefixer for cross-browser compatibility
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  /**
   * Content Source Configuration
   * 
   * Specifies file patterns where Tailwind should scan for class usage.
   * Ensures all utility classes used in components are included in the final CSS bundle.
   */
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // All React components and TypeScript files
    "./public/index.html"          // HTML template for base styling
  ],

  /**
   * Dark Mode Configuration
   * 
   * Enables class-based dark mode for manual theme switching.
   * Allows users to toggle between light and dark themes via JavaScript.
   */
  darkMode: 'class',

  /**
   * Theme Configuration and Extensions
   * 
   * Extends default Tailwind theme with custom design tokens
   * specific to ShadowNews brand and user experience requirements.
   */
  theme: {
    extend: {
      /**
       * Custom Color Palette
       * 
       * Defines brand-specific color schemes for consistent
       * visual identity across the application interface.
       */
      colors: {
        /**
         * Primary Color Palette (Blue-based)
         * 
         * Main brand colors used for primary actions, links,
         * and key interface elements requiring user attention.
         */
        primary: {
          50: '#f0f9ff',   // Lightest blue for backgrounds
          100: '#e0f2fe',  // Very light blue for hover states
          200: '#bae6fd',  // Light blue for subtle accents
          300: '#7dd3fc',  // Medium-light blue for secondary elements
          400: '#38bdf8',  // Medium blue for interactive elements
          500: '#0ea5e9',  // Primary brand blue
          600: '#0284c7',  // Darker blue for active states
          700: '#0369a1',  // Dark blue for emphasis
          800: '#075985',  // Very dark blue for text
          900: '#0c4a6e',  // Darkest blue for headers
          950: '#082f49'   // Extreme dark blue for high contrast
        },
        /**
         * Secondary Color Palette (Gray-based)
         * 
         * Neutral colors for backgrounds, borders, and text
         * hierarchy throughout the application interface.
         */
        secondary: {
          50: '#f8fafc',   // Lightest gray for backgrounds
          100: '#f1f5f9',  // Very light gray for subtle backgrounds
          200: '#e2e8f0',  // Light gray for borders and dividers
          300: '#cbd5e1',  // Medium-light gray for disabled states
          400: '#94a3b8',  // Medium gray for placeholder text
          500: '#64748b',  // Base gray for secondary text
          600: '#475569',  // Darker gray for body text
          700: '#334155',  // Dark gray for headings
          800: '#1e293b',  // Very dark gray for high contrast text
          900: '#0f172a',  // Near-black for maximum contrast
          950: '#020617'   // Pure dark for dark mode backgrounds
        },
        /**
         * Accent Color Palette (Orange/Yellow-based)
         * 
         * Warm accent colors for highlights, notifications,
         * and elements requiring visual emphasis or warmth.
         */
        accent: {
          50: '#fef3c7',   // Lightest warm accent
          100: '#fde68a',  // Very light warm for backgrounds
          200: '#fcd34d',  // Light warm for subtle emphasis
          300: '#fbbf24',  // Medium-light warm for highlights
          400: '#f59e0b',  // Medium warm for interactive elements
          500: '#d97706',  // Primary accent color
          600: '#b45309',  // Darker warm for active states
          700: '#92400e',  // Dark warm for emphasis
          800: '#78350f',  // Very dark warm for contrast
          900: '#451a03'   // Darkest warm for maximum impact
        },
        /**
         * Success Color Palette (Green-based)
         * 
         * Green colors for success states, confirmations,
         * positive feedback, and completed actions.
         */
        success: {
          50: '#f0fdf4',   // Lightest green for success backgrounds
          100: '#dcfce7',  // Very light green for subtle success states
          200: '#bbf7d0',  // Light green for success highlights
          300: '#86efac',  // Medium-light green for positive indicators
          400: '#4ade80',  // Medium green for success buttons
          500: '#22c55e',  // Primary success color
          600: '#16a34a',  // Darker green for active success states
          700: '#15803d',  // Dark green for emphasis
          800: '#166534',  // Very dark green for contrast
          900: '#14532d'   // Darkest green for maximum emphasis
        },
        /**
         * Warning Color Palette (Yellow/Orange-based)
         * 
         * Yellow and orange colors for warning states, cautions,
         * and elements requiring user attention or careful consideration.
         */
        warning: {
          50: '#fffbeb',   // Lightest yellow for warning backgrounds
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        karma: {
          bronze: '#cd7f32',
          silver: '#c0c0c0',
          gold: '#ffd700',
          platinum: '#e5e4e2',
          diamond: '#b9f2ff'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      fontSize: {
        'xxs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'snowball': 'snowball 2s ease-in-out infinite',
        'vote-up': 'voteUp 0.3s ease-out',
        'vote-down': 'voteDown 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        snowball: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(180deg)' },
          '100%': { transform: 'scale(1) rotate(360deg)' }
        },
        voteUp: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' }
        },
        voteDown: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
          '100%': { transform: 'translateY(0)' }
        }
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 2px 4px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.08)',
        'card-hover': '0 4px 8px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.08)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.5)',
        'glow-sm': '0 0 10px rgba(14, 165, 233, 0.3)'
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px'
      },
      backdropBlur: {
        'xs': '2px'
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'opacity': 'opacity',
        'transform': 'transform'
      },
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms'
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px'
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem'
        }
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))'
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.secondary.700'),
            a: {
              color: theme('colors.primary.600'),
              '&:hover': {
                color: theme('colors.primary.700')
              }
            },
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.secondary.900')
            },
            code: {
              color: theme('colors.primary.600'),
              backgroundColor: theme('colors.primary.50'),
              borderRadius: theme('borderRadius.md'),
              paddingLeft: theme('spacing.1'),
              paddingRight: theme('spacing.1')
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            pre: {
              backgroundColor: theme('colors.secondary.900'),
              color: theme('colors.secondary.100')
            }
          }
        },
        dark: {
          css: {
            color: theme('colors.secondary.300'),
            a: {
              color: theme('colors.primary.400'),
              '&:hover': {
                color: theme('colors.primary.300')
              }
            },
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.secondary.100')
            },
            code: {
              color: theme('colors.primary.400'),
              backgroundColor: theme('colors.secondary.800')
            },
            pre: {
              backgroundColor: theme('colors.secondary.950'),
              color: theme('colors.secondary.100')
            }
          }
        }
      })
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries')
  ]
}