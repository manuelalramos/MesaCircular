import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Reserva } from '../../types';
import { buscarMinhasReservas, cancelarReserva } from '../../services/api';
import { formatarData, formatarNumero, statusDoLote } from '../../services/regras';
import useSessao from '../../hooks/useSessao';
import useConsulta from '../../hooks/useConsulta';
import useAcao from '../../hooks/useAcao';
import AvisoEstado from '../../components/AvisoEstado/AvisoEstado';
import TagStatus from '../../components/TagStatus/TagStatus';
import Feedback from '../../components/Feedback/Feedback';
import Confirmacao from '../../components/Confirmacao/Confirmacao';
import useAgora from '../../hooks/useAgora';
import Icone from '../../components/Icone/Icone';

export default function MinhasReservas() {
    const agora = useAgora();
    const { sessao } = useSessao();
    const buscar = useCallback(() => buscarMinhasReservas(sessao!.pessoa.id), [sessao]);
    const consulta = useConsulta(buscar);
    const acao = useAcao();
    const [selecionada, setSelecionada] = useState<Reserva | null>(null);
    const [filtro, setFiltro] = useState('');
    function cancelar() {
        if (!selecionada) return;
        void acao.executar(async () => {
            await cancelarReserva(selecionada.id);
            setSelecionada(null);
            consulta.recarregar();
        }, 'Reserva cancelada. O alimento voltou a ficar disponível.');
    }
    const filtradas = consulta.dados?.filter((r) => !filtro || r.status === filtro) || [];
    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                    <p className="sobretitulo">Uma agenda de boas conexões</p>
                    <h1 className="titulo-secao mt-3">
                        Minhas <span className="destaque-laranja">reservas</span>
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-tinta/65">
                        Combine a retirada e acompanhe o que já chegou à sua comunidade.
                    </p>
                </div>
                <Link to="/lotes" className="botao bg-amarelo text-verde-escuro">
                    Encontrar alimentos <Icone nome="seta" className="h-4 w-4" />
                </Link>
            </div>
            <div className="my-7 flex flex-wrap gap-2" role="group" aria-label="Filtrar reservas">
                {[
                    { valor: '', nome: 'Todas' },
                    { valor: 'ATIVA', nome: 'Ativas' },
                    { valor: 'RETIRADA', nome: 'Retiradas' },
                    { valor: 'CANCELADA', nome: 'Canceladas' },
                ].map((item) => (
                    <button
                        key={item.valor}
                        aria-pressed={filtro === item.valor}
                        className={`aba ${filtro === item.valor ? 'bg-verde text-creme' : 'bg-linha/60 text-tinta/65'}`}
                        onClick={() => setFiltro(item.valor)}
                    >
                        {item.nome}
                    </button>
                ))}
            </div>
            <div className="mb-5">
                <Feedback sucesso={acao.sucesso} />
            </div>
            {consulta.carregando ? (
                <AvisoEstado tipo="carregando" />
            ) : consulta.erro ? (
                <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />
            ) : !filtradas.length ? (
                <AvisoEstado
                    tipo="vazio"
                    mensagem="Nenhuma reserva nesta lista. Sua próxima conexão pode estar na vitrine."
                />
            ) : (
                <div className="grid gap-5">
                    {filtradas.map((reserva) => (
                        <article key={reserva.id} className="painel">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-tinta/50">
                                        Reserva #{reserva.id} · feita em {formatarData(reserva.criadaEm)}
                                    </p>
                                    <h2 className="mt-2 text-lg font-semibold text-verde-escuro">
                                        <Link className="hover:underline" to={`/lotes/${reserva.lote.id}`}>
                                            {reserva.lote.descricao}
                                        </Link>
                                    </h2>
                                    <p className="mt-2 text-sm text-tinta/70">
                                        {formatarNumero(reserva.quantidade)} {reserva.lote.unidade} ·{' '}
                                        {reserva.lote.bairro}
                                    </p>
                                </div>
                                <TagStatus status={reserva.status} />
                            </div>
                            <div className="mt-5 grid gap-3 border-t border-linha pt-5 text-xs leading-6 sm:grid-cols-2">
                                <p>
                                    <strong>Retirada até:</strong> {formatarData(reserva.lote.prazoRetirada)}
                                    <br />
                                    <strong>Onde:</strong> {reserva.lote.local}
                                </p>
                                <p>
                                    <strong>Ofertante:</strong> {reserva.lote.ofertante.nome}
                                    <br />
                                    <strong>Contato:</strong> {reserva.lote.ofertante.contato}
                                </p>
                            </div>
                            {reserva.status === 'ATIVA' && (
                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                    <p className="max-w-xl text-xs leading-6 text-tinta/60">
                                        {statusDoLote(reserva.lote, agora) === 'VENCIDO'
                                            ? 'O prazo deste lote passou. Fale com o ofertante para resolver a reserva ou cancele.'
                                            : 'Combine a retirada pelo contato acima. O ofertante confirma a entrega pelo painel dele.'}
                                    </p>
                                    <button
                                        className="botao-pequeno border border-vinho/25 text-vinho"
                                        disabled={acao.enviando}
                                        onClick={() => {
                                            acao.setErro('');
                                            setSelecionada(reserva);
                                        }}
                                    >
                                        Cancelar reserva
                                    </button>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
            <Confirmacao
                aberto={!!selecionada}
                titulo="Cancelar essa reserva?"
                descricao="A quantidade reservada volta para o saldo do lote. Se vocês já combinaram a retirada, avise o ofertante também."
                enviando={acao.enviando}
                erro={acao.erro}
                confirmar={cancelar}
                fechar={() => setSelecionada(null)}
            />
        </section>
    );
}
