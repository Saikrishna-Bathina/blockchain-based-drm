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
                    dark: "#0b0c15", // Deep Navy Background
                    primary: "#2563eb", // Vibrant Blue
                    secondary: "#f97316", // Orange
                    accent: "#3b82f6", // Lighter Blue
                    surface: "#1e293b", // Surface color for cards
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
