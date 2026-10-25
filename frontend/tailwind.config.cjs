/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#004bb0', container: '#1e63d6', on: '#ffffff', 'on-container': '#ffffff' },
        secondary: { DEFAULT: '#006a68', container: '#68f8f4', on: '#ffffff', 'on-container': '#00201f' },
        tertiary: { DEFAULT: '#5a1cdd', container: '#7342f5', on: '#ffffff', 'on-container': '#ffffff' },
        error: { DEFAULT: '#ba1a1a', container: '#ffdad6', on: '#ffffff', 'on-container': '#410002' },
        brandBlue: '#1E63D6',
        'brand-blue': '#1E63D6',
        learningTeal: '#21C7C4',
        'learning-teal': '#21C7C4',
        skyBlue: '#4DA3FF',
        'sky-blue': '#4DA3FF',
        energyOrange: '#FF8A00',
        'energy-orange': '#FF8A00',
        deepNavy: '#0A1F44',
        'deep-navy': '#0A1F44',
        innovationViolet: '#7C4DFF',
        'innovation-violet': '#7C4DFF',
        roseGold: '#F4B6A6',
        'rose-gold': '#F4B6A6',
        lavenderLight: '#E9E3FF',
        'lavender-light': '#E9E3FF',
        bgLight: '#F6F8FC',
        'bg-light': '#F6F8FC',
        'bg-dark': '#081221',
        surface: {
          DEFAULT: '#faf9ff',
          container: '#f1f3ff',
          'container-high': '#e9edff',
          'container-highest': '#e1e8ff',
          dim: '#d9e2ff',
          dark: '#111A2E'
        },
        'on-surface': '#041a3f',
        'on-surface-variant': '#424653',
        outline: '#737785',
        'outline-variant': '#c2c6d6',
        'ai-gradient-start': '#7C4DFF',
        'ai-gradient-end': '#B388FF',
        brand: {
          50: '#EEF4FF',
          100: '#DCE9FF',
          200: '#B9D2FF',
          300: '#8DB4FF',
          400: '#5E90F8',
          500: '#3B72E8',
          600: '#1E63D6',
          700: '#164EAD',
          800: '#123F8A',
          900: '#0F336D'
        },
        ai: {
          50: '#F4F0FF',
          100: '#EAE2FF',
          200: '#D5C6FF',
          300: '#B99FFF',
          400: '#9B76FF',
          500: '#7C4DFF',
          600: '#6633E0',
          700: '#5326B8',
          800: '#421E92',
          900: '#351A74'
        },
        danger: {
          50: '#FFF1F1',
          100: '#FFE0E0',
          200: '#FFC4C4',
          300: '#FF9B9B',
          400: '#FF6B6B',
          500: '#E5484D',
          600: '#BA1A1A',
          700: '#961414',
          800: '#741010',
          900: '#560C0C'
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Jost', '"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
        jost: ['Jost', '"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      maxWidth: {
        'container-max': '1280px'
      },
      spacing: {
        gutter: '16px',
        'margin-mobile': '16px',
        'margin-desktop': '32px'
      },
      borderRadius: {
        DEFAULT: '.25rem',
        md: '.375rem',
        lg: '.5rem',
        xl: '.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        full: '9999px'
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgb(10 31 68 / 0.05)',
        xs: '0 1px 3px 0 rgb(10 31 68 / 0.07), 0 1px 2px -1px rgb(10 31 68 / 0.05)',
        bento: '0 12px 32px -16px rgb(10 31 68 / 0.18), 0 2px 6px -2px rgb(10 31 68 / 0.06)',
        'bento-lg': '0 28px 60px -28px rgb(10 31 68 / 0.28), 0 4px 12px -4px rgb(10 31 68 / 0.08)',
        glow: '0 0 0 1px rgb(30 99 214 / 0.12), 0 20px 40px -20px rgb(30 99 214 / 0.4)',
        'ai-glow': '0 20px 50px -24px rgb(124 77 255 / 0.55)'
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #0A1F44 0%, #1E63D6 55%, #21C7C4 100%)',
        'ai-gradient': 'linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)',
        'hero-gradient': 'linear-gradient(135deg, #1E63D6 0%, #4DA3FF 45%, #7C4DFF 100%)',
        'rose-gradient': 'linear-gradient(135deg, #F4B6A6 0%, #FDE7DF 100%)',
        'mesh-light': 'radial-gradient(at 12% 18%, rgba(77,163,255,0.18) 0, transparent 50%), radial-gradient(at 88% 8%, rgba(124,77,255,0.14) 0, transparent 45%), radial-gradient(at 70% 82%, rgba(33,199,196,0.16) 0, transparent 50%)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.65' },
          '50%': { opacity: '1' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'bar-grow': {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        'bar-grow': 'bar-grow 0.6s cubic-bezier(0.22, 1, 0.36, 1) both'
      }
    }
  },
  plugins: []
};
