import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6e9ed',
          100: '#ccd2db',
          200: '#99a6b7',
          300: '#667993',
          400: '#334d6f',
          500: '#002147', // Main navy blue (matches code.html)
          600: '#001e40',
          700: '#001a38',
          800: '#001630',
          900: '#001228',
          DEFAULT: '#002147'
        },
        gold: {
          50: '#fef9e7',
          100: '#fdf2c3',
          200: '#fce89b',
          300: '#fade73',
          400: '#f6d445',
          500: '#ecc813', // Main gold
          600: '#d4b311',
          700: '#b8990e',
          800: '#9c800c',
          900: '#7a6309',
          950: '#4d3e06',
          DEFAULT: '#ecc813'
        },
        'background-dark': {
          DEFAULT: '#0a192f',
          50: '#e6e9ed',
          100: '#b8c2d1',
          200: '#8a9bb5',
          300: '#5c7499',
          400: '#2e4d7d',
          500: '#1a3051',
          600: '#0a192f', // Main dark navy
          700: '#081425',
          800: '#060f1b',
          900: '#040a11'
        },
        'navy-accent': {
          DEFAULT: '#112240',
          50: '#e7eaf0',
          100: '#bec6d6',
          200: '#95a2bc',
          300: '#6c7ea2',
          400: '#435a88',
          500: '#2a3c5e',
          600: '#112240', // Main navy accent
          700: '#0d1a33',
          800: '#091226',
          900: '#050a19'
        },
        'deep-navy': '#0a192f', // Alias for background-dark
        'mist-blue': '#f0f4f8', // Light blue/gray for search bar
        blue: {
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        '8xl': '90rem',
      },
      letterSpacing: {
        'widest': '0.3em',
        'ultra-wide': '0.4em',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    }
  }
}
