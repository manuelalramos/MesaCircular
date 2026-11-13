import { Link } from 'react-router-dom';
import Icone from '../../components/Icone/Icone';
import Imagem from '../../components/Imagem/Imagem';
import CardImpacto from '../../components/CardImpacto/CardImpacto';
import CardLote from '../../components/CardLote/CardLote';
import AvisoEstado from '../../components/AvisoEstado/AvisoEstado';
import ComoFunciona from '../../components/ComoFunciona/ComoFunciona';
import SecaoODS from '../../components/SessaoODS/SessaoODS';
import useConsulta from '../../hooks/useConsulta';
import { buscarLotes } from '../../services/api';
import { formatarNumero, statusDoLote } from '../../services/regras';
import { imagens } from '../../data/imagem';

export default function Home() {
    const consulta = useConsulta(buscarLotes);
    const disponiveis = consulta.dados?.filter((lote) => statusDoLote(lote) === 'DISPONIVEL') || [];
    const destaques = disponiveis.slice(0, 3);
    const quilos = disponiveis
        .filter((lote) => lote.unidade === 'kg')
        .reduce((total, lote) => total + lote.saldo, 0);
    const bairros = new Set(disponiveis.map((lote) => lote.bairro)).size;
    const temDados = !!consulta.dados && !consulta.erro;

    return (
        <>
            <section>
                <div className="container-page grid items-center gap-10 pb-14 pt-10 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
                    <div>
                        <p className="sobretitulo mb-5 inline-flex items-center gap-2">
                            <Icone nome="folha" className="h-4 w-4" />
                            Menos desperdício. Mais comunidade.
                        </p>
                        <h1 className="max-w-xl text-[36px] font-bold leading-[1.16] tracking-[-1.5px] text-verde-escuro sm:text-[46px] lg:text-[50px]">
                            Alimento que <span className="text-verde">sobra de um lado,</span>{' '}
                            <span className="destaque-laranja">falta do outro.</span>
                        </h1>
                        <p className="mt-6 max-w-md text-sm leading-7 text-tinta/70">
                            Da banca da feira à cozinha de uma ONG: a gente aproxima quem tem alimento de quem
                            pode fazer ele chegar mais longe.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link className="botao bg-amarelo text-verde-escuro" to="/lotes">
                                Ver lotes disponíveis <Icone nome="seta" className="h-4 w-4" />
                            </Link>
                            <a className="botao botao-contorno" href="#como-funciona">
                                Como funciona <Icone nome="baixo" className="h-4 w-4" />
                            </a>
                        </div>
                        <p className="mt-6 text-xs leading-6 text-tinta/60">
                            Perto de você. Sem custo. Com um destino melhor.
                        </p>
                    </div>
                    <figure className="mx-auto w-full min-w-0 max-w-[390px] overflow-hidden rounded-[20px] lg:ml-auto lg:mr-0">
                        <Imagem
                            src={imagens.feira}
                            alt="Banca de feira com frutas e verduras frescas"
                            loading="eager"
                            className="foto-editorial h-[220px] w-full object-cover sm:h-[260px] lg:h-[310px]"
                        />
                        <figcaption className="flex items-center gap-2 bg-creme px-3 py-3 text-[11px] font-medium leading-6 text-verde-escuro">
                            <Icone nome="talheres" className="h-4 w-4" />
                            Alimento bom demais pra ir pro lixo.
                        </figcaption>
                    </figure>
                </div>
            </section>
            <section className="border-y border-linha bg-[#F1EDE2] py-8">
                <div className="container-page grid gap-7 sm:grid-cols-3">
                    <CardImpacto
                        numero={temDados ? formatarNumero(quilos) + ' kg' : '—'}
                        rotulo="disponíveis para compartilhar"
                        icone="folha"
                    />
                    <CardImpacto
                        numero={temDados ? disponiveis.length : '—'}
                        rotulo="lotes esperando uma nova mesa"
                        icone="caixa"
                    />
                    <CardImpacto numero={temDados ? bairros : '—'} rotulo="bairros conectados" icone="pin" />
                </div>
            </section>
            <ComoFunciona />
            <section className="secao bg-[#F6F1E7]">
                <div className="container-page">
                    <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <p className="sobretitulo">Tem coisa boa pertinho de você</p>
                            <h2 className="titulo-secao mt-3">
                                Prontos para <span className="destaque-laranja">uma nova mesa.</span>
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-tinta/65">
                                Alimentos disponíveis, esperando uma boa conexão.
                            </p>
                        </div>
                        <Link className="link-seta text-sm font-semibold text-verde" to="/lotes">
                            Ver todos os lotes <Icone nome="seta" className="h-4 w-4" />
                        </Link>
                    </div>
                    {consulta.carregando ? (
                        <AvisoEstado tipo="carregando" />
                    ) : consulta.erro ? (
                        <AvisoEstado
                            tipo="erro"
                            mensagem={consulta.erro}
                            tentarNovamente={consulta.recarregar}
                        />
                    ) : destaques.length ? (
                        <div className="grid gap-6 md:grid-cols-3">
                            {destaques.map((lote) => (
                                <CardLote key={lote.id} lote={lote} />
                            ))}
                        </div>
                    ) : (
                        <AvisoEstado
                            tipo="vazio"
                            mensagem="Ainda não tem lote disponível. Volte daqui a pouco para conferir as novidades."
                        />
                    )}
                </div>
            </section>
            <SecaoODS />
            <section className="secao">
                <div className="container-page">
                    <div className="grid items-center gap-8 border-y border-linha py-12 md:grid-cols-[1.2fr_1fr]">
                        <div>
                            <p className="sobretitulo">Faça parte</p>
                            <h2 className="titulo-secao mt-3">
                                Essa mesa <span className="destaque-laranja">também é sua.</span>
                            </h2>
                            <p className="mt-4 max-w-lg text-sm leading-7 text-tinta/65">
                                Tem alimento sobrando ou uma comunidade pra alimentar? A próxima conexão pode
                                começar com você.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 md:justify-end">
                            <Link to="/cadastro?tipo=ofertante" className="botao bg-verde text-creme">
                                <Icone nome="caixa" className="h-4 w-4" />
                                Sou ofertante
                            </Link>
                            <Link
                                to="/cadastro?tipo=organizacao"
                                className="botao bg-amarelo text-verde-escuro"
                            >
                                <Icone nome="pessoas" className="h-4 w-4" />
                                Sou organização
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}