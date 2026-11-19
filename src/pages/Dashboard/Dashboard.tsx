import { useCallback } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import type { Lote, Reserva } from '../../types';
import useSessao from '../../hooks/useSessao';
import useConsulta from '../../hooks/useConsulta';
import { buscarMeusLotes, buscarMinhasReservas, buscarReservasLote } from '../../services/api';
import { formatarData, formatarQuantidade, quantidadesPublicadas, reservasRecentes, resumirQuantidades, statusDoLote } from '../../services/regras';
import useAgora from '../../hooks/useAgora';
import CardImpacto from '../../components/CardImpacto/CardImpacto';
import AvisoEstado from '../../components/AvisoEstado/AvisoEstado';
import TagStatus from '../../components/TagStatus/TagStatus';
import Feedback from '../../components/Feedback/Feedback';
import Icone from '../../components/Icone/Icone';
import ResumoQuantidades from '../../components/ResumoQuantidades/ResumoQuantidades';

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
    const retiradas = resumirQuantidades(resumo?.reservas || [])
        .map((total) => ({ unidade: total.unidade, quantidade: total.retirada }));
    const publicados = quantidadesPublicadas(resumo?.lotes || []);
    const atividades = reservasRecentes(resumo?.reservas || []);
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
                        <div className={`grid items-start gap-4 ${ofertante ? 'lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
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
                                    <ResumoQuantidades
                                        titulo="Alimentos publicados"
                                        descricao="Total publicado por unidade, incluindo lotes encerrados."
                                        quantidades={publicados}
                                        vazio="As quantidades aparecem aqui depois da sua primeira publicação."
                                    />
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
                                    <ResumoQuantidades
                                        titulo="Alimentos retirados"
                                        descricao="Somente retiradas confirmadas, separadas por unidade."
                                        quantidades={retiradas}
                                        vazio="Você ainda não tem retiradas confirmadas. As quantidades aparecem aqui depois da confirmação da entrega."
                                    />
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
                            Atividades recentes
                        </h2>
                        {resumo.reservas.length ? (
                            <div className="grid gap-3">
                                {atividades.map((reserva) => (
                                    <article
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-linha p-5"
                                        key={reserva.id}
                                    >
                                        <div>
                                            <p className="mb-2 text-xs font-medium text-verde">
                                                {reserva.status === 'ATIVA' ? (ofertante ? 'Nova reserva recebida' : 'Reserva realizada')
                                                    : reserva.status === 'RETIRADA' ? 'Retirada confirmada' : 'Reserva cancelada'}
                                                {' · Reserva de '}{formatarData(reserva.criadaEm)}
                                            </p>
                                            <Link
                                                to={`/lotes/${reserva.lote.id}`}
                                                className="text-sm font-semibold text-verde-escuro hover:underline"
                                            >
                                                {reserva.lote.descricao}
                                            </Link>
                                            <p className="mt-1 text-xs text-tinta/65">
                                                {reserva.status === 'RETIRADA' ? 'Retirado: ' : reserva.status === 'CANCELADA' ? 'Cancelado: ' : 'Reservado: '}
                                                {formatarQuantidade(reserva.status === 'RETIRADA' ? reserva.quantidadeRetirada : reserva.quantidade, reserva.lote.unidade)} ·{' '}
                                                {reserva.lote.bairro}
                                            </p>
                                            <p className="mt-2 text-xs text-tinta/65">
                                                {ofertante ? reserva.organizacao.nome : reserva.lote.ofertante.nome}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <TagStatus status={reserva.status} />
                                            <Link
                                                to={ofertante ? `/app/meus-lotes?lote=${reserva.lote.id}` : `/app/minhas-reservas#reserva-${reserva.id}`}
                                                className="botao-pequeno botao-contorno"
                                                aria-label={`${ofertante ? 'Ver reservas de' : 'Acompanhar reserva de'} ${reserva.lote.descricao}`}
                                            >
                                                {ofertante ? 'Ver reservas' : 'Acompanhar reserva'}
                                                <Icone nome="seta" className="h-4 w-4" />
                                            </Link>
                                        </div>
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
