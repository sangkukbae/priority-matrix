/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        trello: {
          blue: '#0079BF',
          navy: '#0C3953',
          light: '#F4F5F7',
          success: '#61BD4F',
          warning: '#F2D600',
          danger: '#EB5A46',
          charcoal: '#172B4D',
          gray: '#6B778C',
          border: '#DFE1E6',
        },
        quadrant: {
          do: { bg: '#FFE2E2', text: '#8B0000', accent: '#EB5A46' },
          plan: { bg: '#E6F4EA', text: '#1E7E34', accent: '#61BD4F' },
          delegate: { bg: '#E3F2FD', text: '#0D47A1', accent: '#0079BF' },
          delete: { bg: '#F5F5F5', text: '#616161', accent: '#9E9E9E' },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'trello': '8px',
      },
      boxShadow: {
        'trello-card': '0 1px 0 rgba(9, 30, 66, 0.25)',
        'trello-card-hover': '0 4px 8px rgba(9, 30, 66, 0.25)',
        'trello-drag': '0 8px 16px rgba(9, 30, 66, 0.3)',
      },
    },
  },
  plugins: [],
}
