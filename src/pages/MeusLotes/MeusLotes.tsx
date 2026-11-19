import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Lote } from '../../types';
import { buscarMeusLotes, excluirLote } from '../../services/api';
import useSessao from '../../hooks/useSessao';
import useConsulta from '../../hooks/useConsulta';
import useAcao from '../../hooks/useAcao';
import CardLote from '../../components/CardLote/CardLote';
import AvisoEstado from '../../components/AvisoEstado/AvisoEstado';
import Icone from '../../components/Icone/Icone';
import Feedback from '../../components/Feedback/Feedback';
import Confirmacao from '../../components/Confirmacao/Confirmacao';
import FormularioLote from '../../components/FormularioLote/FormularioLote';
import ReservasLote from '../../components/ReservasLote/ReservasLote';

export default function MeusLotes() {
    
    const { sessao } = useSessao();
    const buscar = useCallback(() => buscarMeusLotes(sessao!.pessoa.id), [sessao]);
    const consulta = useConsulta(buscar);
    const acao = useAcao();
    const [editar, setEditar] = useState<Lote | null>(null);
    const [excluir, setExcluir] = useState<Lote | null>(null);
    const [parametros, setParametros] = useSearchParams();
    const loteSolicitado = parametros.get('lote');
    const reservasId = consulta.dados?.find((lote) => String(lote.id) === loteSolicitado)?.id ?? null;
    const areaReservas = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (reservasId) areaReservas.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [reservasId]);
    function selecionarReservas(id: number | null) {
        const novos = new URLSearchParams(parametros);
        if (id) novos.set('lote', String(id));
        else novos.delete('lote');
        setParametros(novos, { replace: true });
    }
    function remover() {
        if (!excluir) return;
        void acao.executar(async () => {
            await excluirLote(excluir.id);
            setExcluir(null);
            consulta.recarregar();
        }, 'Lote excluído.');
    }

    return (
        <section>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
                <div>
                    <p className="sobretitulo">O que você colocou na roda</p>
                    <h1 className="titulo-secao mt-3">
                        Meus <span className="destaque-laranja">lotes</span>
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-tinta/65">
                        Acompanhe as reservas e confirme quando o alimento chegar a uma nova mão.
                    </p>
                </div>
                <Link to="/app/publicar" className="botao bg-amarelo text-verde-escuro">
                    <Icone nome="mais" className="h-4 w-4" />
                    Publicar lote
                </Link>
            </div>
            <Feedback sucesso={acao.sucesso} />
            {editar ? (
                <div className="mb-8 mt-5 max-w-3xl">
                    <h2 className="mb-5 text-xl font-semibold text-verde-escuro">Editar lote</h2>
                    <FormularioLote
                        key={editar.id}
                        lote={editar}
                        aoCancelar={() => setEditar(null)}
                        aoSalvar={() => {
                            setEditar(null);
                            acao.setSucesso('Alterações salvas!');
                            consulta.recarregar();
                        }}
                    />
                </div>
            ) : consulta.carregando ? (
                <AvisoEstado tipo="carregando" />
            ) : consulta.erro ? (
                <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />
            ) : !consulta.dados?.length ? (
                <AvisoEstado
                    tipo="vazio"
                    mensagem="Sua primeira publicação ainda está por vir. Tem alimento bom aí?"
                />
            ) : (
                <div className="mt-6 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {consulta.dados.map((lote) => (
                        <div key={lote.id}>
                            <CardLote lote={lote} />
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    className="botao-pequeno bg-verde/10 text-verde-escuro"
                                    aria-expanded={reservasId === lote.id}
                                    aria-controls="reservas-selecionadas"
                                    onClick={() => selecionarReservas(reservasId === lote.id ? null : lote.id)}
                                >
                                    Ver reservas
                                </button>
                                <button
                                    className="rounded-full p-3 text-verde hover:bg-verde/10"
                                    aria-label={`Editar ${lote.descricao}`}
                                    onClick={() => {
                                        selecionarReservas(null);
                                        setEditar(lote);
                                    }}
                                >
                                    <Icone nome="editar" className="h-4 w-4" />
                                </button>
                                <button
                                    className="rounded-full p-3 text-vinho hover:bg-rosa/20"
                                    aria-label={`Excluir ${lote.descricao}`}
                                    onClick={() => {
                                        acao.setErro('');
                                        setExcluir(lote);
                                    }}
                                >
                                    <Icone nome="lixeira" className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {reservasId && !editar && (
                <div ref={areaReservas} id="reservas-selecionadas" className="mt-8 scroll-mt-28">
                    <ReservasLote
                        key={reservasId}
                        loteId={reservasId}
                        aoConfirmar={() => {
                            acao.setSucesso('Retirada confirmada! O alimento ganhou uma nova mesa.');
                            consulta.recarregar();
                        }}
                    />
                </div>
            )}
            <Confirmacao
                aberto={!!excluir}
                titulo="Excluir este lote?"
                descricao={`O lote “${excluir?.descricao || ''}” será removido. Lotes com reservas ativas precisam ser resolvidos antes.`}
                enviando={acao.enviando}
                erro={acao.erro}
                confirmar={remover}
                fechar={() => setExcluir(null)}
            />
        </section>
    );
}
