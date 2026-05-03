/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080D18',
          2: '#0E1625',
          3: '#141E30',
          card: '#111927',
        },
        accent: {
          DEFAULT: '#4F8EF7',
          2: '#7C3AED',
          muted: 'rgba(79,142,247,0.12)',
        },
        emerald: {
          token: '#10B981',
          muted: 'rgba(16,185,129,0.12)',
        },
        amber: {
          token: '#F59E0B',
          muted: 'rgba(245,158,11,0.12)',
        },
        rose: {
          token: '#EF4444',
          muted: 'rgba(239,68,68,0.12)',
        },
        slate: {
          border: '#1E2D45',
          border2: '#2A3D58',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #4F8EF7, #7C3AED)',
        'green-gradient': 'linear-gradient(135deg, #059669, #10B981)',
        'red-gradient': 'linear-gradient(135deg, #DC2626, #EF4444)',
        'card-company': 'linear-gradient(135deg, #0f1e3d, #162048)',
        'card-user': 'linear-gradient(135deg, #0a1f14, #0e2b1b)',
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease both',
        'fade-in': 'fadeIn 0.25s ease both',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(79,142,247,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(79,142,247,0)' },
        },
      },
      boxShadow: {
        accent: '0 4px 24px rgba(79,142,247,0.3)',
        'accent-lg': '0 8px 40px rgba(79,142,247,0.4)',
        card: '0 2px 16px rgba(0,0,0,0.4)',
        green: '0 4px 20px rgba(16,185,129,0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
