import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5EFE3',
        cream: '#E9E4D4',
        coffee: {
          DEFAULT: '#6F4E37',
          dark: '#4B3621',
        },
        bronze: '#CD7F32',
        brown: '#A0785A',
        ink: {
          DEFAULT: '#3B3028',
          soft: '#6F6258',
        },
        border: '#D1C3AE',
        success: '#3F7D58',
        danger: '#B3452C',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(75, 54, 33, 0.08)',
        card: '0 4px 20px rgba(75, 54, 33, 0.10)',
        modal: '0 20px 60px rgba(59, 48, 40, 0.35)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
        slideUp: 'slideUp 0.25s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
