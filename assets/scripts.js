tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#334155", // Deep slate blue accent
                "accent": "#0d9488", // Calm teal
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
