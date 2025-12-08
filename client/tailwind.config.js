/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#020617',
        'bg-secondary': '#0f172a',
        'bg-card': '#1e293b',
        'bg-user': '#4f46e5',
        'accent-primary': '#6366f1',
        'accent-secondary': '#f97316',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
