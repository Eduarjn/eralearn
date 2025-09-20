import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['var(--font-sans)'],
				heading: ['var(--font-heading)'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// ERA Theme Brand Colors (usando tokens CSS)
				brand: {
					primary: "rgb(var(--brand-primary) / <alpha-value>)",
					dark: "rgb(var(--brand-dark) / <alpha-value>)",
					muted: "rgb(var(--brand-muted) / <alpha-value>)",
					sand: "rgb(var(--brand-sand) / <alpha-value>)",
					'primary-foreground': "rgb(var(--brand-primary-foreground) / <alpha-value>)",
					'dark-foreground': "rgb(var(--brand-dark-foreground) / <alpha-value>)",
					'muted-foreground': "rgb(var(--brand-muted-foreground) / <alpha-value>)",
					'sand-foreground': "rgb(var(--brand-sand-foreground) / <alpha-value>)",
				},
				// ERA color palette (mantido para compatibilidade)
				'era-white': '#FFFFFF',
				'era-black': '#000000',
				'era-green': '#34C759',
				'era-gray-light': '#F5F5F5',
				'era-gray-medium': '#4A4A4A',
				'era-text-primary': '#000000',
				'era-text-secondary': '#4A4A4A',
				'era-background': '#FFFFFF',
				'era-border': '#E5E5E5',
				
				// Futuristic color palette
				'accent': 'var(--accent)',
				'accent-600': 'var(--accent-600)',
				'accent-300': 'var(--accent-300)',
				'accent-glow': 'var(--accent-glow)',
				'ring': 'var(--ring)',
				'bg': 'var(--bg)',
				'surface': 'var(--surface)',
				'surface-2': 'var(--surface-2)',
				'border': 'var(--border)',
				'text': 'var(--text)',
				'muted': 'var(--muted)',
				'surface-hover': 'var(--surface-hover)',
				'surface-active': 'var(--surface-active)',
				'border-hover': 'var(--border-hover)',
				'text-disabled': 'var(--text-disabled)',
				'glass-bg': 'var(--glass-bg)',
				'glass-border': 'var(--glass-border)',
				'futuristic': 'var(--bg)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
