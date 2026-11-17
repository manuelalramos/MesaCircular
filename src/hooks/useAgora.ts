import { useEffect, useState } from 'react';

export default function useAgora() {
    const [agora, setAgora] = useState(Date.now);
    useEffect(() => {
        const atualizar = () => setAgora(Date.now());
        const intervalo = window.setInterval(atualizar, 30_000);
        window.addEventListener('focus', atualizar);
        document.addEventListener('visibilitychange', atualizar);
        return () => {
            window.clearInterval(intervalo);
            window.removeEventListener('focus', atualizar);
            document.removeEventListener('visibilitychange', atualizar);
        };
    }, []);
    return agora;
}
