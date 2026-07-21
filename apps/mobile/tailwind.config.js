/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946',
          light: '#F8AD9D',
          dark: '#9B2226',
        },
        secondary: {
          DEFAULT: '#1D3557',
          light: '#457B9D',
        },
        background: {
          DEFAULT: '#F1FAEE',
          dark: '#121212',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1E1E1E',
        },
      },
    },
  },
  plugins: [],
};
