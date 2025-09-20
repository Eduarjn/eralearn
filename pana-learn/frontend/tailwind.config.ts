import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx,css}",
    ],
    safelist: [
        "bg-background",
        "text-foreground",
        "border-border",
        "bg-hero-gradient",
        "text-pana-accent",
        "bg-pana-accent",
        "ring-pana-purple",
        "border-pana-purple",
        "text-pana-text",
        "text-pana-text-secondary",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: { "2xl": "1400px" },
        },
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
                // PANA Theme Colors
                "pana-purple": "#A435F0",
                "pana-background": "#F7F9FA",
                "pana-text": "#2D2F31",
                "pana-success": "#19A38C",
                "pana-accent": "#ECB22E",
                "pana-light-gray": "#F7F9FA",
                "pana-gray": "#6A6F73",
                "pana-text-primary": "#2D2F31",
                "pana-text-secondary": "#6A6F73",
                "high-contrast": "#1C1D1F",
                "medium-contrast": "#3E4143",
                "card-improved": "#FFFFFF",
                "primary-bg": "#CCFF00",
                "primary-fg": "#2B2B2B",
                "era-neon": "#CCFF00",
                "era-dark": "#2B2B2B",
            },
            backgroundImage: {
                "hero-gradient":
                    "linear-gradient(135deg, #A435F0 0%, #8710D8 50%, #ECB22E 100%)",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
            fontFamily: {
                heading: ["EraGeometric", "Orbitron", "Square 721", "Arial", "sans-serif"],
                base: ["EraGeometric", "Orbitron", "Square 721", "Arial", "sans-serif"],
            },
            fontSize: {
                heading: "2rem",
                subheading: "1.5rem",
                base: "1rem",
            },
            letterSpacing: {
                heading: "0.05em",
            },
            borderColor: {
                "era-dark": "#2B2B2B",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;