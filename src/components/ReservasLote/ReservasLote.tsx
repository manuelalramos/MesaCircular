import { useCallback, useState } from 'react';
import { buscarReservasLote, confirmarRetirada } from '../../services/api';
import { formatarNumero } from '../../services/regras';
import useConsulta from '../../hooks/useConsulta';
import useAcao from '../../hooks/useAcao';
import AvisoEstado from '../AvisoEstado/AvisoEstado';
import TagStatus from '../TagStatus/TagStatus';
import Feedback from '../Feedback/Feedback';
import Confirmacao from '../Confirmacao/Confirmacao';
import type { Reserva } from '../../types';

export default function ReservasLote({ loteId, aoConfirmar }: { loteId: number; aoConfirmar: () => void }) {
    const buscar = useCallback(() => buscarReservasLote(loteId), [loteId]);
    const consulta = useConsulta(buscar);
    const [selecionada, setSelecionada] = useState<Reserva | null>(null);
    const acao = useAcao();
    function confirmar() {
        if (!selecionada) return;
        void acao.executar(async () => {
            await confirmarRetirada(selecionada.id, selecionada.quantidade);
            setSelecionada(null);
            consulta.recarregar();
            aoConfirmar();
        }, 'Retirada confirmada! Mais alimento chegando a uma nova mesa.');
    }
    return (
        <div className="mt-6 rounded-3xl border border-verde/20 bg-verde/5 p-5">
            <h3 className="mb-5 font-semibold text-verde-escuro">Quem reservou este lote</h3>
            <Feedback sucesso={acao.sucesso} />
            {consulta.carregando ? (
                <AvisoEstado tipo="carregando" />
            ) : consulta.erro ? (
                <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />
            ) : !consulta.dados?.length ? (
                <AvisoEstado tipo="vazio" mensagem="Ainda não chegaram reservas para este lote." />
            ) : (
                <div className="mt-4 grid gap-3">
                    {consulta.dados.map((reserva) => (
                        <article
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-creme p-4"
                            key={reserva.id}
                        >
                            <div>
                                <p className="text-sm font-semibold">{reserva.organizacao.nome}</p>
                                <p className="mt-1 text-xs text-tinta/65">
                                    {formatarNumero(reserva.quantidade)} {reserva.lote.unidade} ·{' '}
                                    {reserva.organizacao.contato}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <TagStatus status={reserva.status} />
                                {reserva.status === 'ATIVA' && (
                                    <button
                                        className="botao-pequeno bg-verde text-creme"
                                        disabled={acao.enviando}
                                        onClick={() => {
                                            acao.setErro('');
                                            setSelecionada(reserva);
                                        }}
                                    >
                                        Confirmar retirada
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
            <Confirmacao
                aberto={!!selecionada}
                titulo="O alimento já foi entregue?"
                descricao="Confirme somente depois que a organização tiver retirado o alimento. Essa ação encerra a reserva e contabiliza o impacto."
                enviando={acao.enviando}
                erro={acao.erro}
                confirmar={confirmar}
                fechar={() => setSelecionada(null)}
            />
        </div>
    );
}
