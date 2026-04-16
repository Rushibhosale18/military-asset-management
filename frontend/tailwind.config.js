/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        primary: {
          500: '#3b82f6',
          400: '#60a5fa',
        },
        accent: {
          500: '#8b5cf6',
          400: '#a78bfa',
        }
      }
    },
  },
  plugins: [],
}
