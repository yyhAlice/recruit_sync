/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0c56d0', dark: '#003d9b', light: '#dae2ff' },
        surface: '#f8f9fb',
        success: '#36B37E',
        warning: '#FFAB00',
        danger: '#FF5630',
        'client-purple': '#6554C0',
        teal: '#0D9488',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
