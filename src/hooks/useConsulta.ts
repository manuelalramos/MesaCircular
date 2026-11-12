import { useCallback, useEffect, useRef, useState } from 'react';
import { mensagemErro } from '../services/erro';

export default function useConsulta<T>(buscar: () => Promise<T>) {
    const [dados, setDados] = useState<T | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [statusErro, setStatusErro] = useState(0);
    const [tentativa, setTentativa] = useState(0);
    const sequencia = useRef(0);
    const recarregar = useCallback(() => setTentativa((atual) => atual + 1), []);

    useEffect(() => {
        const numero = ++sequencia.current;
        setCarregando(true);
        setErro('');
        setStatusErro(0);
        setDados(null);
        buscar()
            .then((resultado) => {
                if (numero === sequencia.current) setDados(resultado);
            })

            .catch((falha: unknown) => {
                if (numero === sequencia.current) {
                    setErro(mensagemErro(falha));
                    setStatusErro(
                        falha && typeof falha === 'object' && 'status' in falha ? Number(falha.status) : 0,
                    );
                }
            })

            .finally(() => {
                if (numero === sequencia.current) setCarregando(false);
            });
            
        // se trocar de página, a resposta antiga não mexe mais na tela.
        return () => {
            sequencia.current++;
        };
    }, [buscar, tentativa]);

    
    return { dados, carregando, erro, statusErro, recarregar };
}
