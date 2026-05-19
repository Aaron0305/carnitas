import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6701',
        'primary-light': '#FFA82F',
        accent: '#FCECDD',
        'accent-light': '#FFC288',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-reverse': 'float 8s ease-in-out infinite reverse',
        'shimmer': 'shimmer 3s infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(30px)' },
        },
        shimmer: {
          '0%': { left: '-100%' },
          '50%': { left: '100%' },
          '100%': { left: '100%' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 103, 1, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(255, 103, 1, 0)' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(255, 103, 1, 0.3)',
        'glow-primary-lg': '0 0 40px rgba(255, 103, 1, 0.4)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
