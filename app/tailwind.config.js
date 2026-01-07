/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0a',
          surface: '#1a1a1a',
          card: '#1f1f1f',
          border: '#2a2a2a',
          text: '#e0e0e0',
          'text-secondary': '#a0a0a0',
        },
        accent: {
          purple: '#9333ea',
          green: '#10b981',
          blue: '#3b82f6',
        }
      },
    },
  },
  plugins: [],
}

