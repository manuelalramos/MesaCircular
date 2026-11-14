import type { ReactNode } from 'react';
import Icone from '../../components/Icone/Icone';

interface AcessoLayoutProps {
    titulo: string;
    descricao: string;
    children: ReactNode;
}

export default function AcessoLayout({ titulo, descricao, children }: AcessoLayoutProps) {
    const corte = titulo.lastIndexOf(' ');
    return (
        <div className="container-page grid gap-10 py-12 md:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <section className="flex flex-col justify-center lg:py-10">
                <p className="sobretitulo">Sempre cabe mais um à mesa</p>
                <h1 className="mt-5 max-w-lg text-4xl font-bold leading-tight tracking-[-1.5px] text-verde-escuro lg:text-5xl">
                    {titulo.slice(0, corte + 1)}
                    <span className="destaque-laranja">{titulo.slice(corte + 1)}</span>
                </h1>
                <p className="mt-5 max-w-md text-sm leading-7 text-tinta/70">{descricao}</p>
                <div className="mt-8 hidden max-w-md items-center gap-4 border-l-2 border-amarelo py-2 pl-5 text-verde-escuro lg:flex">
                    <Icone nome="compartilhar" className="h-9 w-9 shrink-0" />
                    <p className="text-sm leading-6">
                        Uma pequena conexão.
                        <br />
                        <strong>Uma grande diferença na mesa.</strong>
                    </p>
                </div>
                <p className="mt-7 text-xs text-tinta/50">Sem custo. Sem desperdício. Com propósito.</p>
            </section>
            <section className="painel shadow-suave">{children}</section>
        </div>
    );
}