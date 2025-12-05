/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fidu: {
          50: '#fef2f3',
          100: '#fde6e7',
          200: '#fad0d4',
          300: '#f6aab1',
          400: '#f07a88',
          500: '#e54d61',
          600: '#d12d49',
          700: '#a51d31',
          800: '#8b1a2d',
          900: '#771a2b',
          950: '#420a13',
        },
      },
    },
  },
  plugins: [],
};
