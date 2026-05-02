import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'sans-serif'],
        heading: ['"Playfair Display"', 'serif'],
      },
      colors: {
        vintage: {
          cream: '#faf8f3',
          creamLight: '#f5f1e8',
          creamDark: '#f0ebe0',
          paper: '#f7f4ed',
          brown: '#3d2817',
          brownLight: 'rgba(61, 40, 23, 0.8)',
          brownMuted: 'rgba(61, 40, 23, 0.6)',
          gold: '#c9a961',
          goldDark: '#b8860b',
          goldLight: '#d4a574',
          tan: '#8b6f47',
          border: 'rgba(201, 169, 97, 0.3)',
          borderHover: 'rgba(201, 169, 97, 0.5)',
        },
      },
    },
  },
  plugins: [],
};