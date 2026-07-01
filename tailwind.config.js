/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo_400Regular'],
        'cairo-medium': ['Cairo_500Medium'],
        'cairo-semibold': ['Cairo_600SemiBold'],
        'cairo-bold': ['Cairo_700Bold'],
      },
      colors: {
        primary: {
          DEFAULT: '#D64535',
          dark: '#FF6B54',
        },
        secondary: {
          DEFAULT: '#F2A93B',
          dark: '#F2B85C',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#2A2019',
        },
        background: {
          DEFAULT: '#FFF8F1',
          dark: '#1C1410',
        },
        'text-primary': {
          DEFAULT: '#2B1B12',
          dark: '#F5EDE6',
        },
        'text-secondary': {
          DEFAULT: '#7A6A5F',
          dark: '#B8A99B',
        },
        success: {
          DEFAULT: '#3E8E4F',
          dark: '#6FCB7F',
        },
        danger: {
          DEFAULT: '#B3261E',
          dark: '#FF6B60',
        },
        border: {
          DEFAULT: '#EDE0D4',
          dark: '#3D3128',
        },
      },
    },
  },
  plugins: [],
};
