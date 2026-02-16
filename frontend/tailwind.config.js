/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: "#000000", // Pure Black
                    surface: "#18181b", // Zinc-900
                    border: "#27272a", // Zinc-800
                    primary: "#2563eb", // Blue-600
                    secondary: "#4f46e5", // Indigo-600
                    success: "#10b981", // Emerald-500
                    warning: "#f59e0b", // Amber-500
                    error: "#ef4444", // Red-500
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'gradient-x': 'gradient-x 3s ease infinite',
            },
            keyframes: {
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    },
                },
            },
        },
    },
    plugins: [],
}
