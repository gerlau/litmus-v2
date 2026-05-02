import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  // Dark mode is toggled via data-theme="dark" on <html>
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        's2': 'var(--surface-2)',
        's3': 'var(--surface-3)',
        bdr: 'var(--border)',
        'bdr-strong': 'var(--border-strong)',
        txt: 'var(--text)',
        't2': 'var(--text-2)',
        't3': 'var(--text-3)',
        ink: 'var(--ink)',
        accent: 'var(--accent)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        success: 'var(--success)',
        'success-soft': 'var(--success-soft)',
        warn: 'var(--warn)',
        'warn-soft': 'var(--warn-soft)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      width: { sidebar: '232px' },
    },
  },
  plugins: [],
};

export default config;
