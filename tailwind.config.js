/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: '#1C1610',
        surface: '#2A2117',
        surfaceVariant: '#352B1E',
        // Text
        onBg: '#F0E8D4',
        onSurface: '#E8DCC8',
        // Primary / Gold
        primary: '#C9A84C',
        primaryDark: '#B8760A',
        // Tile states
        tileCorrect: '#538D4E',
        tilePresent: '#C9A84C',
        tileAbsent: '#555759',
        tileEmpty: '#121213',
        tileFilled: '#1C1B1F',
        tileHint: '#00838F',
        tileHintBorder: '#00BCD4',
        // Difficulty accents
        accentEasy: '#2DD4BF',
        accentRegular: '#F59E0B',
        accentHard: '#EF4444',
        accentVip: '#C9A84C',
        // Currency
        coinGold: '#F59E0B',
        diamondCyan: '#67E8F9',
        heartRed: '#EF4444',
        bonusBlue: '#3B82F6',
        // Borders
        borderEmpty: '#3A3A3C',
        borderFilled: '#565758',
        // Keys
        keyDefault: '#818384',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      keyframes: {
        'tile-flip': {
          '0%':   { transform: 'rotateX(0deg)' },
          '49%':  { transform: 'rotateX(90deg)' },
          '50%':  { transform: 'rotateX(90deg)' },
          '100%': { transform: 'rotateX(0deg)' },
        },
        'tile-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.08)' },
        },
        'shake': {
          '0%':   { transform: 'translateX(0)' },
          '10%':  { transform: 'translateX(-10px)' },
          '20%':  { transform: 'translateX(10px)' },
          '30%':  { transform: 'translateX(-8px)' },
          '40%':  { transform: 'translateX(8px)' },
          '50%':  { transform: 'translateX(-5px)' },
          '60%':  { transform: 'translateX(5px)' },
          '70%':  { transform: 'translateX(-2px)' },
          '80%':  { transform: 'translateX(2px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pop-in': {
          '0%':   { transform: 'scale(0.7)', opacity: '0' },
          '80%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-border': {
          '0%, 100%': { opacity: '0.3' },
          '50%':      { opacity: '0.9' },
        },
        'compass-spin': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bounce-trophy': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'coin-pop': {
          '0%':   { transform: 'scale(0)', opacity: '0' },
          '70%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'count-up': {
          '0%':   { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'tile-flip':      'tile-flip 0.5s ease forwards',
        'tile-bounce':    'tile-bounce 0.15s ease',
        'shake':          'shake 0.5s ease',
        'pop-in':         'pop-in 0.25s ease forwards',
        'float':          'float 3s ease-in-out infinite',
        'pulse-border':   'pulse-border 1.2s ease-in-out infinite',
        'compass-spin':   'compass-spin 20s linear infinite',
        'bounce-trophy':  'bounce-trophy 1s ease-in-out infinite',
        'coin-pop':       'coin-pop 0.3s ease forwards',
        'count-up':       'count-up 0.2s ease forwards',
      },
    },
  },
  plugins: [],
}

