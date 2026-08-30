module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#B91C1C',
        primaryLight: '#FEE2E2',
        primaryDark: '#7F1D1D',
        primaryBg: '#FEF2F2',
        secondary: '#0F172A',
        success: '#15803D',
        successLight: '#DCFCE7',
        accent: '#F59E0B',
        muted: '#64748B',
        border: '#E5E7EB',
        surface: '#FFFFFF',
        background: '#FAFAFB',
      },
      borderRadius: {
        'xl': '18px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(15,23,42,0.06)',
        'medium': '0 4px 12px rgba(15,23,42,0.08)',
        'large': '0 8px 20px rgba(15,23,42,0.10)',
        'primary': '0 4px 12px rgba(185,28,28,0.18)',
      },
    },
  },
  plugins: [],
}
