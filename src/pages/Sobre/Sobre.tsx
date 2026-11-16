import { Link } from 'react-router-dom';
import PageIntro from '../../components/PageIntro/PageIntro';
import Imagem from '../../components/Imagem/Imagem';
import Icone, { type NomeIcone } from '../../components/Icone/Icone';
import { imagens } from '../../data/imagem';

const valores: { nome: string; texto: string; icone: NomeIcone; cor: string }[] = [
    {
        nome: 'Aproveitamento',
        texto: 'O que ainda está bom tem valor. A aparência não conta a história inteira de um alimento.',
        icone: 'folha',
        cor: 'text-verde',
    },
    {
        nome: 'Comunidade',
        texto: 'Uma banca e uma cozinha do mesmo bairro podem se ajudar muito mais do que imaginam.',
        icone: 'pessoas',
        cor: 'destaque-laranja',
    },
    {
        nome: 'Transparência',
        texto: 'Quantidade, prazo e local claros. Cada pessoa sabe o que está combinando.',
        icone: 'escudo',
        cor: 'text-vinho',
    },
    {
        nome: 'Acesso',
        texto: 'Publicar e reservar precisa ser simples para quem está na correria do dia a dia.',
        icone: 'compartilhar',
        cor: 'text-verde',
    },
];

export default function Sobre() {
    return (
        <>
            <PageIntro
                titulo="Sobre o Mesa Circular"
                descricao="A tecnologia entra como ponte. O que faz a diferença são as pessoas dos dois lados."
                etiqueta="Nossa história"
            />
            <section className="container-page secao grid items-center gap-10 md:grid-cols-2">
                <div>
                    <p className="sobretitulo">Por que essa ideia existe</p>
                    <h2 className="titulo-secao mt-4">
                        O desperdício não precisa ser{' '}
                        <span className="destaque-laranja">o último destino.</span>
                    </h2>
                    <p className="mt-5 text-sm leading-7 text-tinta/70">
                        A feira termina, o mercado fecha e alimentos em boas condições ficam sem destino.
                        Perto dali, uma organização pode estar procurando ingredientes para a próxima
                        refeição.
                    </p>
                    <p className="mt-4 text-sm leading-7 text-tinta/70">
                        Esse desencontro motivou nosso projeto de CitizenTech. O Mesa Circular aproxima
                        estabelecimentos e organizações para que o que sobrou em um lugar seja aproveitado em
                        outro.
                    </p>
                </div>
                <aside className="rounded-3xl border-l-4 border-laranja bg-amarelo/20 p-8 md:p-10">
                    <p className="text-5xl font-bold tracking-tighter text-verde-escuro">1,05 bilhão</p>
                    <p className="mt-4 text-sm leading-7 text-tinta/75">
                        de toneladas de resíduos alimentares foram geradas no varejo, nos serviços de
                        alimentação e nos lares em 2022, incluindo partes não comestíveis.
                    </p>
                    <a
                        className="link-seta mt-6 text-xs font-medium text-verde underline underline-offset-4"
                        href="https://www.unep.org/en/news-and-stories/press-release/world-squanders-over-1-billion-meals-day-un-report"
                        target="_blank"
                        rel="noreferrer"
                    >
                        PNUMA · Food Waste Index 2024 <Icone nome="diagonal" className="h-4 w-4" />
                    </a>
                </aside>
            </section>
            <section className="bg-[#F1EDE2]">
                <div className="container-page secao grid items-center gap-10 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-3xl">
                        <Imagem
                            src={imagens.sobre}
                            alt="Legumes e verduras frescos prontos para serem aproveitados"
                            loading="lazy"
                            className="foto-editorial h-56 w-full object-cover md:h-72"
                        />
                    </div>
                    <div>
                        <p className="sobretitulo">Uma solução que cabe na rotina</p>
                        <h2 className="titulo-secao mt-4">
                            Da última banca <span className="destaque-laranja">à próxima refeição.</span>
                        </h2>
                        <p className="mt-5 text-sm leading-7 text-tinta/70">
                            Pense em uma feirante com legumes que não foram vendidos. Ela informa a quantidade
                            e até quando consegue entregar. Uma organização próxima encontra o lote e reserva
                            o que consegue aproveitar.
                        </p>
                        <p className="mt-4 text-sm leading-7 text-tinta/70">
                            A retirada é combinada diretamente entre as partes. Quando o alimento é entregue,
                            o ofertante confirma. Assim, a plataforma registra o que foi aproveitado sem
                            contar promessa como resultado.
                        </p>
                        <Link className="link-seta mt-6 text-sm font-semibold text-verde" to="/lotes">
                            Veja o que está disponível <Icone nome="seta" className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
            <section className="bg-amarelo/35">
                <div className="container-page secao">
                    <p className="sobretitulo">ODS 2 + ODS 11</p>
                    <h2 className="titulo-secao mt-3">
                        O cuidado começa <span className="destaque-laranja">no bairro.</span>
                    </h2>
                    <div className="mt-9 grid gap-8 md:grid-cols-2">
                        <article className="border-l-2 border-verde pl-6">
                            <Icone nome="talheres" className="mb-4 h-7 w-7 text-verde" />
                            <h3 className="text-xl font-semibold text-verde-escuro">Fome Zero</h3>
                            <p className="mt-3 text-sm leading-7 text-tinta/75">
                                Ao aproximar alimentos disponíveis de cozinhas comunitárias, a proposta apoia
                                o acesso à alimentação. Quem recebe escolhe a quantidade que consegue retirar
                                e usar.
                            </p>
                        </article>
                        <article className="border-l-2 border-laranja pl-6">
                            <Icone nome="cidade" className="mb-4 h-7 w-7 destaque-laranja" />
                            <h3 className="text-xl font-semibold text-verde-escuro">
                                Comunidades sustentáveis
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-tinta/75">
                                Conectar quem já está perto ajuda a construir redes de apoio e a usar melhor
                                os recursos do bairro. O alimento circula junto com a colaboração entre as
                                pessoas.
                            </p>
                        </article>
                    </div>
                </div>
            </section>
            <section className="container-page secao">
                <p className="sobretitulo">O que orienta nossas escolhas</p>
                <h2 className="titulo-secao mt-3">
                    Valores que vão <span className="destaque-laranja">pra prática.</span>
                </h2>
                <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {valores.map((valor) => (
                        <article key={valor.nome} className="painel card-interativo">
                            <Icone nome={valor.icone} className={`mb-5 h-7 w-7 ${valor.cor}`} />
                            <h3 className="font-semibold text-verde-escuro">{valor.nome}</h3>
                            <p className="mt-3 text-sm leading-7 text-tinta/65">{valor.texto}</p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}