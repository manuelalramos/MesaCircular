interface PageIntroProps {
    titulo: string;
    descricao: string;
    etiqueta?: string;
}

export default function PageIntro({
    titulo,
    descricao,
    etiqueta = 'Uma nova chance à mesa',
}: PageIntroProps) {
    const corte = titulo.lastIndexOf(' ');
    return (
        <section className="border-b border-linha py-12 md:py-16">
            <div className="container-page">
                <p className="sobretitulo">{etiqueta}</p>
                <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-[-1.3px] text-verde-escuro sm:text-4xl lg:text-5xl">
                    {corte > 0 ? (
                        <>
                            {titulo.slice(0, corte + 1)}
                            <span className="destaque-laranja">{titulo.slice(corte + 1)}</span>
                        </>
                    ) : (
                        titulo
                    )}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-tinta/70 md:text-base">{descricao}</p>
            </div>
        </section>
    );
}