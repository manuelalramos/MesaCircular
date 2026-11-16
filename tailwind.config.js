/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                verde: '#2F7A4D',
                'verde-escuro': '#1C4B33',
                laranja: '#F28C38',
                amarelo: '#FFC94D',
                vinho: '#7A2E3A',
                rosa: '#F4A6B0',
                creme: '#FBF7F0',
                tinta: '#241A17',
                linha: '#ECE4D8',
            },
            fontFamily: { sans: ['Poppins', 'sans-serif'] },
            boxShadow: { suave: '0 12px 40px #1c4b3309' },
        },
    },
    plugins: [],
};
