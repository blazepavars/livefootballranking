/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx,js,jsx}',
	],
	theme: {
		extend: {
			colors: {
				// Backgrounds (Dark Mode First)
				'bg-pure-black': '#000000',
				'bg-near-black': '#0a0a0a',
				'bg-elevated': '#141414',
				'bg-elevated-hover': '#1e1e1e',
				'bg-modal': '#1e1e1e',
				
				// Text
				'text-primary': '#e4e4e7',
				'text-secondary': '#a1a1aa',
				'text-tertiary': '#71717a',
				
				// Accents (Stock Market Colors)
				'accent-green': '#22c55e',
				'accent-red': '#ef4444',
				'accent-blue': '#3b82f6',
				'accent-orange': '#f97316',
				
				// Glows
				'glow-green': 'rgba(34, 197, 94, 0.5)',
				'glow-red': 'rgba(239, 68, 68, 0.5)',
				'glow-blue': 'rgba(59, 130, 246, 0.5)',
				
				// Borders
				'border-subtle': 'rgba(255, 255, 255, 0.1)',
				'border-moderate': 'rgba(255, 255, 255, 0.15)',
				
				// Semantic
				'status-live': '#22c55e',
				'status-offline': '#71717a',
			},
			fontFamily: {
				sans: ['Inter', '-apple-system', 'Segoe UI', 'sans-serif'],
				mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
			},
			fontSize: {
				'hero': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'headline-xl': ['40px', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
				'headline-lg': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
				'headline-md': ['24px', { lineHeight: '1.3' }],
				'body-lg': ['18px', { lineHeight: '1.6' }],
				'body': ['16px', { lineHeight: '1.5' }],
				'caption': ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
				'mono-data': ['16px', { lineHeight: '1.4' }],
			},
			spacing: {
				'xs': '8px',
				'sm': '12px',
				'md': '16px',
				'lg': '24px',
				'xl': '32px',
				'2xl': '48px',
				'3xl': '64px',
				'4xl': '96px',
			},
			borderRadius: {
				'sm': '8px',
				'md': '12px',
				'lg': '16px',
				'full': '9999px',
			},
			boxShadow: {
				'card': '0 0 0 1px rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.6)',
				'card-hover': '0 0 0 1px rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.7)',
				'glow-green': '0 0 16px rgba(34,197,94,0.5), 0 0 32px rgba(34,197,94,0.3)',
				'glow-red': '0 0 16px rgba(239,68,68,0.5), 0 0 32px rgba(239,68,68,0.3)',
				'glow-blue': '0 0 20px rgba(59,130,246,0.5)',
			},
			animation: {
				'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'fade-in': 'fadeIn 0.25s ease-out',
				'slide-up': 'slideUp 0.3s ease-out',
			},
			keyframes: {
				pulse: {
					'0%, 100%': { opacity: 1, transform: 'scale(1)' },
					'50%': { opacity: 0.7, transform: 'scale(1.2)' },
				},
				fadeIn: {
					'0%': { opacity: 0 },
					'100%': { opacity: 1 },
				},
				slideUp: {
					'0%': { opacity: 0, transform: 'translateY(20px)' },
					'100%': { opacity: 1, transform: 'translateY(0)' },
				},
			},
			transitionDuration: {
				'fast': '150ms',
				'standard': '250ms',
				'slow': '400ms',
			},
		},
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}