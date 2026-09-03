/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './public/**/*.{html,js}',
    './src/**/*.{html,js}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c2d6b'
        }
      },
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-bottom))'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};
