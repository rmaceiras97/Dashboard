/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ED8E06',
          hover: '#f59e0b',
        },
      },
      backdropBlur: {
        xl: '32px',
        '2xl': '48px',
      },
      boxShadow: {
        brand: '0 0 20px rgba(237, 142, 6, 0.35)',
        'brand-lg': '0 0 40px rgba(237, 142, 6, 0.45)',
        human: '0 0 20px rgba(59, 130, 246, 0.3)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        toast: 'toast 0.25s ease-out',
      },
      keyframes: {
        toast: {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
