/** @type {import('tailwindcss').Config} */

const themeColor = (name) => ({ opacityValue }) => {
  if (opacityValue !== undefined) {
    return `rgb(var(--color-${name}) / ${opacityValue})`
  }
  return `rgb(var(--color-${name}))`
}

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: themeColor('bg'),
        panel: themeColor('panel'),
        text: themeColor('text'),
        accent: '#7eb8da',
        'accent-warm': '#c8a45c',
        danger: '#c34043',
        success: '#5a9e6f',
        muted: '#6b7280',
        // 五行色
        metal: '#d4af37',
        wood: '#4a9e5f',
        water: '#4c8a9e',
        fire: '#c35050',
        earth: '#8b7355',
        // 灵根品质
        'spirit-common': '#9ca3af',
        'spirit-fine': '#7eb8da',
        'spirit-rare': '#b794f6',
        'spirit-epic': '#f59e0b',
        'spirit-legendary': '#ffd700'
      },
      fontFamily: {
        game: ['zpix', 'monospace']
      },
      spacing: {
        30: '7.5rem',
        62.5: '15.625rem'
      },
      borderRadius: {
        xs: '0.125rem'
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90'
      },
      animation: {
        float: 'float-up 8s ease-in-out infinite',
        glow: 'realm-pulse 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
