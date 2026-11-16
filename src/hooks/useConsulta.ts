import { useCallback, useEffect, useState } from 'react';
import { mensagemErro } from '../services/erro';

interface ResultadoConsulta<T> {
    buscar: () => Promise<T>;
    tentativa: number;
    dados: T | null;
    erro: string;
    statusErro: number;
}

export default function useConsulta<T>(buscar: () => Promise<T>) {
    const [resultado, setResultado] = useState<ResultadoConsulta<T> | null>(null);
    const [tentativa, setTentativa] = useState(0);
    const recarregar = useCallback(() => setTentativa((atual) => atual + 1), []);

    useEffect(() => {
        let cancelada = false;
        Promise.resolve().then(buscar)
            .then((resultado) => {
                if (!cancelada) setResultado({ buscar, tentativa, dados: resultado, erro: '', statusErro: 0 });
            })
            .catch((falha: unknown) => {
                if (!cancelada) setResultado({
                    buscar, tentativa, dados: null, erro: mensagemErro(falha),
                    statusErro: falha && typeof falha === 'object' && 'status' in falha ? Number(falha.status) : 0,
                });
            });
        return () => { cancelada = true; };
    }, [buscar, tentativa]);

    // Uma resposta anterior nunca aparece como resultado de outra consulta.
    const atual = resultado?.buscar === buscar && resultado.tentativa === tentativa ? resultado : null;
    return {
        dados: atual?.dados ?? null, carregando: !atual,
        erro: atual?.erro || '', statusErro: atual?.statusErro || 0, recarregar,
    };
}
