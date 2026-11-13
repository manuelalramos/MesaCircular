import Icone, { type NomeIcone } from '../Icone/Icone';

const passos: { numero: string; titulo: string; texto: string; icone: NomeIcone; cor: string }[] = [
    {
        numero: '01',
        titulo: 'Sobrou? Publique.',
        texto: 'Feirantes, mercados e produtores contam o que têm e até quando dá pra retirar.',
        icone: 'caixa',
        cor: 'text-verde',
    },
    {
        numero: '02',
        titulo: 'Encontrou? Reserve.',
        texto: 'A organização escolhe o lote e a quantidade que faz sentido para a sua comunidade.',
        icone: 'saco',
        cor: 'destaque-laranja',
    },
    {
        numero: '03',
        titulo: 'Retirou? Transformou.',
        texto: 'Vocês combinam a retirada. O alimento ganha outra mesa, e o impacto começa.',
        icone: 'compartilhar',
        cor: 'text-vinho',
    },
];

export default function ComoFunciona() {

    
    return (
        <section id="como-funciona" className="secao">
            <div className="container-page">
                <div className="text-center">
                    <p className="sobretitulo">Simples de fazer. Grande no impacto.</p>
                    <h2 className="titulo-secao mt-3">
                        Do excedente ao <span className="destaque-laranja">essencial.</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-tinta/65">
                        Três passos para mudar o destino de um alimento.
                    </p>
                </div>
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {passos.map((passo) => (
                        <article
                            className="card-interativo rounded-3xl border border-linha p-7"
                            key={passo.numero}
                        >
                            <div className="mb-7 flex items-center justify-between">
                                <span className={`flex h-10 w-10 items-center justify-center ${passo.cor}`}>
                                    <Icone nome={passo.icone} className="h-7 w-7" />
                                </span>
                                <span className="text-3xl font-bold tracking-tighter text-linha">
                                    {passo.numero}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-verde-escuro">{passo.titulo}</h3>
                            <p className="mt-3 text-sm leading-7 text-tinta/65">{passo.texto}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}