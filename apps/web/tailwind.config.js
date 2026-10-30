/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090D16',
        surface: '#0F172A',
        'surface-elevated': '#1E293B',
        emergency: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          glow: 'rgba(239, 68, 68, 0.4)'
        },
        safety: {
          500: '#10B981',
          600: '#059669',
          glow: 'rgba(16, 185, 129, 0.3)'
        },
        accent: {
          cyan: '#06B6D4',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      },
      animation: {
        'pulse-emergency': 'pulseEmergency 1.8s infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        pulseEmergency: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '50%': { transform: 'scale(1.04)', boxShadow: '0 0 0 20px rgba(239, 68, 68, 0)' }
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}
