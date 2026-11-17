import { useCallback } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import type { Lote, Reserva } from '../../types';
import useSessao from '../../hooks/useSessao';
import useConsulta from '../../hooks/useConsulta';
import { buscarMeusLotes, buscarMinhasReservas, buscarReservasLote } from '../../services/api';
import { formatarNumero, quilosRetirados, statusDoLote } from '../../services/regras';
import useAgora from '../../hooks/useAgora';
import CardImpacto from '../../components/CardImpacto/CardImpacto';
import AvisoEstado from '../../components/AvisoEstado/AvisoEstado';
import TagStatus from '../../components/TagStatus/TagStatus';
import Feedback from '../../components/Feedback/Feedback';
import Icone from '../../components/Icone/Icone';

interface Resumo {
    lotes: Lote[];
    reservas: Reserva[];
}

export default function Dashboard() {
    const agora = useAgora();

    
    const { sessao } = useSessao();
    const localizacao = useLocation();
    const buscar = useCallback(async (): Promise<Resumo> => {
        if (sessao?.tipo === 'ofertante') {
            const lotes = await buscarMeusLotes(sessao.pessoa.id);
            const recebidas = await Promise.all(lotes.map((lote) => buscarReservasLote(lote.id)));
            return { lotes, reservas: recebidas.flat() };
        }
        if (sessao?.tipo === 'organizacao')
            return { lotes: [], reservas: await buscarMinhasReservas(sessao.pessoa.id) };
        return { lotes: [], reservas: [] };
    }, [sessao]);
    const consulta = useConsulta(buscar);
    if (sessao?.tipo === 'administrador') return <Navigate to="/admin" replace />;
    const ofertante = sessao?.tipo === 'ofertante';
    const resumo = consulta.dados;
    return (
        <section>
            <p className="sobretitulo">Toda conexão conta</p>
            <h1 className="titulo-secao mt-3">
                <span className="destaque-laranja">Olá,</span> {sessao?.pessoa.nome}
            </h1>
            <p className="mb-7 mt-4 text-sm leading-7 text-tinta/65">
                {ofertante
                    ? 'Veja o que está circulando a partir da sua mesa.'
                    : 'Suas próximas retiradas e o impacto que você já fez acontecer.'}
            </p>
            {(localizacao.state as { bemVindo?: boolean } | null)?.bemVindo && (
                <div className="mb-6">
                    <Feedback sucesso="Conta criada! Que bom ter você nessa mesa." />
                </div>
            )}
            {consulta.carregando ? (
                <AvisoEstado tipo="carregando" />
            ) : consulta.erro ? (
                <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />
            ) : (
                resumo && (
                    <>
                        <div className={`grid gap-4 ${ofertante ? 'lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
                            {ofertante ? (
                                <>
                                    <div className="painel">
                                        <CardImpacto
                                            numero={
                                                resumo.lotes.filter((l) =>
                                                    ['DISPONIVEL', 'RESERVADO'].includes(statusDoLote(l, agora)),
                                                ).length
                                            }
                                            rotulo="meus lotes ativos"
                                            icone="caixa"
                                        />
                                    </div>
                                    <div className="painel">
                                        <CardImpacto
                                            numero={`${formatarNumero(resumo.lotes.filter((l) => l.unidade === 'kg').reduce((total, l) => total + l.quantidade, 0))} kg`}
                                            rotulo="que publiquei em quilos"
                                            icone="folha"
                                        />
                                    </div>
                                    <div className="painel">
                                        <CardImpacto
                                            numero={
                                                resumo.reservas.filter((r) => r.status !== 'CANCELADA').length
                                            }
                                            rotulo="reservas recebidas"
                                            icone="pessoas"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="painel">
                                        <CardImpacto
                                            numero={
                                                resumo.reservas.filter((r) => r.status === 'ATIVA').length
                                            }
                                            rotulo="minhas reservas ativas"
                                            icone="saco"
                                        />
                                    </div>
                                    <div className="painel">
                                        <CardImpacto
                                            numero={`${formatarNumero(quilosRetirados(resumo.reservas))} kg`}
                                            rotulo="que retirei e aproveitei"
                                            icone="folha"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                className="botao bg-verde text-creme"
                                to={ofertante ? '/app/publicar' : '/lotes'}
                            >
                                <Icone nome={ofertante ? 'mais' : 'busca'} className="h-4 w-4" />
                                {ofertante ? 'Publicar lote' : 'Ver lotes disponíveis'}
                            </Link>
                            <Link
                                className="botao botao-contorno"
                                to={ofertante ? '/app/meus-lotes' : '/app/minhas-reservas'}
                            >
                                {ofertante ? 'Meus lotes' : 'Minhas reservas'}
                                <Icone nome="seta" className="h-4 w-4" />
                            </Link>
                        </div>
                        <h2 className="mb-5 mt-12 text-xl font-semibold text-verde-escuro">
                            Últimas conexões
                        </h2>
                        {resumo.reservas.length ? (
                            <div className="grid gap-3">
                                {resumo.reservas.slice(0, 4).map((reserva) => (
                                    <article
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-linha p-5"
                                        key={reserva.id}
                                    >
                                        <div>
                                            <Link
                                                to={`/lotes/${reserva.lote.id}`}
                                                className="text-sm font-semibold text-verde-escuro hover:underline"
                                            >
                                                {reserva.lote.descricao}
                                            </Link>
                                            <p className="mt-1 text-xs text-tinta/65">
                                                {formatarNumero(reserva.quantidade)} {reserva.lote.unidade} ·{' '}
                                                {reserva.lote.bairro}
                                            </p>
                                        </div>
                                        <TagStatus status={reserva.status} />
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <AvisoEstado
                                tipo="vazio"
                                mensagem="Sua primeira conexão ainda está por vir. Vamos começar?"
                            />
                        )}
                    </>
                )
            )}
        </section>
    );
}
