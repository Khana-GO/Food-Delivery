module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#B5122A',
        primaryLight: '#FDE8EA',
        primaryDark: '#7F0D1D',
        primaryBg: '#FDE8EA',
        secondary: '#0A0A0A',
        success: '#16834B',
        successLight: '#DCFCE7',
        ratingGold: '#F4B740',
        muted: '#666666',
        border: '#E8E8E8',
        surface: '#FFFFFF',
        background: '#F7F7F5',
      },
      borderRadius: {
        'sm': '12px',
        'md': '14px',
        'lg': '18px',
        'xl': '22px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.06)',
        'medium': '0 4px 12px rgba(0,0,0,0.07)',
        'large': '0 8px 20px rgba(0,0,0,0.10)',
        'floating': '0 8px 24px rgba(0,0,0,0.10)',
        'primary': '0 4px 12px rgba(181,18,42,0.20)',
      },
    },
  },
  plugins: [],
};