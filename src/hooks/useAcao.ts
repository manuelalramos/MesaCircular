import { useRef, useState } from 'react';
import { mensagemErro } from '../services/erro';

export default function useAcao() {

    const bloqueado = useRef(false);

    const [enviando, setEnviando] = useState(false);

    const [erro, setErro] = useState('');

    const [sucesso, setSucesso] = useState('');

    async function executar(acao: () => Promise<void>, mensagem = '') {

        if (bloqueado.current) return;

        bloqueado.current = true;
        setEnviando(true);
        setErro('');
        setSucesso('');
        try {
            await acao();
            setSucesso(mensagem);
        } catch (falha) {
            setErro(mensagemErro(falha));
        } finally {
            bloqueado.current = false;
            setEnviando(false);
        }
    }
    
    return { enviando, erro, sucesso, executar, setErro, setSucesso };
}