/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gd: {
          bg:         '#F0EFE9',
          card:       '#0D0F1A',
          sidebar:    '#FFFFFF',
          surface:    '#F7F7F4',
          ink:        '#111111',
          muted:      '#6B6B6B',
          ghost:      '#9A9A9A',
          inverse:    '#FFFFFF',
          line:       '#E5E5E5',
          lineDark:   '#2A2E3F',
          cta:        '#0D0F1A',
          ctaHover:   '#2A2E3F',
          reserveMet: '#1A7A4A',
          noReserve:  '#1A3A6A',
          endingSoon: '#7A4A0A',
          endingText: '#F5A623',
          newListing: '#2A1A6A',
          success:    '#1A7A4A',
          warning:    '#F5A623',
          error:      '#C0392B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        eyebrow: ['10px', { lineHeight: '1.4', letterSpacing: '0.15em' }],
        label:   ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        xs:      ['12px', { lineHeight: '1.5' }],
        sm:      ['13px', { lineHeight: '1.5' }],
        base:    ['15px', { lineHeight: '1.6' }],
        lg:      ['18px', { lineHeight: '1.4' }],
        xl:      ['22px', { lineHeight: '1.3' }],
        '2xl':   ['28px', { lineHeight: '1.2' }],
        '3xl':   ['36px', { lineHeight: '1.1' }],
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semi:   600,
        bold:   700,
      },
      borderRadius: {
        none: '0',
        sm:   '4px',
        DEFAULT: '6px',
        md:   '8px',
        pill: '999px',
      },
      boxShadow: {
        none:  'none',
        card:  '0 1px 3px rgba(0,0,0,0.06)',
        modal: '0 8px 32px rgba(0,0,0,0.18)',
        dropdown: '0 4px 12px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}
