/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        raver: {
          bg: '#06060a',
          bg2: '#0a0a10',
          panel: '#0d0d14',
          line: '#1b1b24',
          white: '#f0ede8',
          dim: '#7d7d8a',
          pos: '#00f0ff',
          web: '#ff6b00',
          bridge: '#a855f7',
        },
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'pos-glow': '0 0 30px rgba(0,240,255,0.35)',
        'web-glow': '0 0 30px rgba(255,107,0,0.35)',
        'bridge-glow': '0 0 14px rgba(168,85,247,0.4)',
      },
      keyframes: {
        drift: {
          from: { backgroundPosition: '0 0, 0 0' },
          to: { backgroundPosition: '44px 44px, 44px 44px' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
        'pulse-travel': {
          from: { left: '-30%' },
          to: { left: '104%' },
        },
        'pulse-travel-v': {
          from: { top: '-30%' },
          to: { top: '104%' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        drift: 'drift 26s linear infinite',
        blink: 'blink 2s infinite',
        'pulse-travel': 'pulse-travel 2.6s linear infinite',
        'pulse-travel-v': 'pulse-travel-v 2.6s linear infinite',
        ticker: 'ticker 25s linear infinite',
      },
    },
  },
  plugins: [],
}
