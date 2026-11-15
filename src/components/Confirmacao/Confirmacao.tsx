import { useEffect, useId, useRef } from 'react';
import Icone from '../Icone/Icone';

interface ConfirmacaoProps {
    titulo: string;
    descricao: string;
    aberto: boolean;
    enviando: boolean;
    erro?: string;
    confirmar: () => void;
    fechar: () => void;
}
export default function Confirmacao({


    titulo,
    descricao,
    aberto,
    enviando,
    erro,
    confirmar,
    fechar,
}: ConfirmacaoProps) {
    const dialogo = useRef<HTMLDialogElement>(null);
    const tituloId = useId();
    useEffect(() => {
        if (aberto) dialogo.current?.showModal();
        else dialogo.current?.close();
    }, [aberto]);
    return (
        <dialog
            ref={dialogo}
            onCancel={(evento) => {
                evento.preventDefault();
                if (!enviando) fechar();
            }}
            className="w-[calc(100%-2rem)] max-w-md rounded-3xl border border-linha bg-creme p-7 text-tinta shadow-xl backdrop:bg-verde-escuro/50"
            aria-labelledby={tituloId}
        >
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rosa/30 text-vinho">
                <Icone nome="info" />
            </span>
            <h2 id={tituloId} className="text-xl font-bold text-verde-escuro">
                {titulo}
            </h2>
            <p className="mt-3 text-sm leading-7 text-tinta/70">{descricao}</p>
            {erro && (
                <p role="alert" className="mt-4 text-sm text-vinho">
                    {erro}
                </p>
            )}
            <div className="mt-7 flex flex-wrap justify-end gap-3">
                <button autoFocus disabled={enviando} className="botao botao-contorno" onClick={fechar}>
                    Voltar
                </button>
                <button disabled={enviando} className="botao bg-vinho text-creme" onClick={confirmar}>
                    {enviando ? 'Aguarde…' : 'Confirmar'}
                </button>
            </div>
        </dialog>
    );
}