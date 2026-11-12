import { useEffect, useState } from 'react';
import Icone from '../Icone/Icone';

interface AvisoEstadoProps {
    tipo: 'carregando' | 'erro' | 'vazio';
    mensagem?: string;
    tentarNovamente?: () => void;
}

export default function AvisoEstado({ tipo, mensagem, tentarNovamente }: AvisoEstadoProps) {
    const [demorando, setDemorando] = useState(false);
    useEffect(() => {
        const tempo = setTimeout(() => setDemorando(true), 8000);
        return () => clearTimeout(tempo);
    }, []);

    return (
        <div className="rounded-3xl border border-dashed border-linha bg-creme px-6 py-12 text-center" role={tipo === 'erro' ? 'alert' : 'status'} aria-live="polite">
            {tipo === 'carregando' ? (
                <Icone nome="carregar" className="carregando-icone mx-auto mb-4 h-7 w-7 text-verde" />
            ) : (
                <span className="mx-auto mb-4 flex h-10 w-10 items-center justify-center text-verde">
                    <Icone nome={tipo === 'erro' ? 'info' : 'caixa'} />
                </span>
            )}
            <p className="font-semibold text-verde-escuro">
                {mensagem ||
                    (tipo === 'carregando'
                        ? 'Só um instante, estamos buscando por aqui…'
                        : tipo === 'erro'
                            ? 'Não deu pra carregar agora.'
                            : 'Ainda não tem nada por aqui.')}
            </p>
            {tipo === 'carregando' && demorando && (
                <p className="mx-auto mt-3 max-w-lg text-sm text-tinta/70">
                    A primeira chamada pode levar de 30 a 60 segundos enquanto a API inicia no Render. Pode
                    deixar esta tela aberta.
                </p>
            )}

            {tipo === 'erro' && tentarNovamente && (
                <button onClick={tentarNovamente} className="botao botao-contorno mt-5">
                    Tentar de novo
                </button>
            )}
        </div>
    );
}