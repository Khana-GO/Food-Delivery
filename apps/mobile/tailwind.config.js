module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#B91C1C', // darker red for attractive contrast (was #E23744)
        primaryLight: '#FEE2E2',
        primaryDark: '#7F1D1D',
        secondary: '#1A1A1A',
        success: '#15803D', // darker green (was #16A34A)
        successLight: '#DCFCE7',
      },
    },
  },
  plugins: [],
}
