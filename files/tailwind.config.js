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
        bg: {
          primary: '#080b10',
          secondary: '#0d1117',
          tertiary: '#111827',
          card: '#161d2b',
          hover: '#1a2235',
        },
        accent: {
          cyan: '#00f5ff',
          purple: '#bf5af2',
          pink: '#ff375f',
          green: '#30d158',
          orange: '#ff9f0a',
          blue: '#0a84ff',
        },
        text: {
          primary: '#f0f6fc',
          secondary: '#8b949e',
          muted: '#484f58',
        },
        border: '#21262d',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pop-in': 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,245,255,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(0,245,255,0.6)' },
        },
        slideIn: {
          from: { transform: 'translateX(-20px)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        popIn: {
          from: { transform: 'scale(0.8)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
