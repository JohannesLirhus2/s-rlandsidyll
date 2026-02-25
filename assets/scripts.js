window.tailwind = window.tailwind || {};
window.tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#5e4b3b", // Deep slate blue accent
                "accent": "#616f43", // Calm teal
                "accent-hover": "#414930", // Lighter accent for hover
                "background-light": "#ffffff",
                "slate-custom": "#f8fafc"
            },
            fontFamily: {
                "display": ["Work Sans", "sans-serif"],
                "serif": ["Playfair Display", "serif"]
            },
            borderRadius: {
                "DEFAULT": "0.125rem",
                "lg": "0.375rem",
                "xl": "0.5rem",
                "full": "9999px"
            }
        }
    }
};
