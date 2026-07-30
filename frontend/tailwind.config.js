/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Moodboard palette — VLearn
        primary: {
          DEFAULT: '#134D8B',
          deep: '#0B2F55',
          dark: '#0F3F73',
          light: '#1A5EA6',
          soft: '#5A7BDB',
        },
        secondary: '#C72127',
        ink: '#14213D',
        muted: '#718198',
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        subtle: '#F1F5F9',
        line: '#DCE5EF',
        success: '#1F9D68',
        warning: '#F59E0B',
        danger: '#C72127',
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl2: '18px',
      },
      boxShadow: {
        soft: '0 6px 16px rgba(19,77,139,.08)',
        card: '0 12px 28px rgba(19,77,139,.11)',
        pop: '0 24px 70px rgba(0,0,0,.22)',
        btn: '0 4px 0 #0F3F73',
        'btn-red': '0 4px 0 #98191E',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'grow-x': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .22s ease both',
        'grow-x': 'grow-x .5s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
}
