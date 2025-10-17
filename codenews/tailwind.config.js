/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'codenews-blue': '#1E40AF',
        'codenews-green': '#16A34A'
      }
    },
  },
  plugins: [],
}