/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          primary: '#714B67',
          'primary-dark': '#5d3a54',
          'primary-light': '#8a5d7d',
          secondary: '#17A2B8',
          success: '#28A745',
          warning: '#FFC107',
          danger: '#DC3545',
          info: '#6F42C1',
          gray: {
            50: '#F8F9FA',
            100: '#E9ECEF',
            200: '#DEE2E6',
            300: '#CED4DA',
            400: '#6C757D',
            500: '#495057',
            600: '#343A40',
            700: '#212529',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'odoo': '0 2px 8px rgba(113, 75, 103, 0.1)',
        'odoo-lg': '0 4px 16px rgba(113, 75, 103, 0.15)',
      },
      borderRadius: {
        'odoo': '6px',
      }
    },
  },
  plugins: [],
}