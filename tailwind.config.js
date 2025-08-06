/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#fdfbf7',
          100: '#f9f5ed',
          200: '#f3e8d5',
          300: '#e8d5b7',
          400: '#d9b896',
          500: '#c89f7b',
          600: '#b18862',
          700: '#946f51',
          800: '#795b46',
          900: '#634b3b',
        },
        sand: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#f9f0df',
          300: '#f4e4c6',
          400: '#ecd3a7',
          500: '#e2bd84',
          600: '#d3a066',
          700: '#b17d4e',
          800: '#8f6442',
          900: '#755238',
        },
        cream: '#FFF8E7',
        'warm-white': '#FAF7F0',
      },
      fontFamily: {
        'sans': ['Playfair Display', 'Georgia', 'serif'],
        'body': ['Lato', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}