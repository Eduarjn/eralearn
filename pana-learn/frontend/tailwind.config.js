module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        surface: 'var(--color-surface)',
        neutral: 'var(--color-neutral)',
        accent:  'var(--color-accent)',
        support: 'var(--color-support)',
        contrast:'var(--color-contrast)',
      },
      fontFamily: {
        sans: ['var(--font-base)'],
        heading: ['var(--font-heading)'],
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
      }
    }
  },
  plugins: [],
}; 