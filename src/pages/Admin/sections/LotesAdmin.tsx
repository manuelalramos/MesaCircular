import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Lote } from '../../../types';
import { buscarLotes, excluirLote } from '../../../services/api';
import { statusDoLote, formatarData, formatarQuantidade, prazoDivergente } from '../../../services/regras';
import useAgora from '../../../hooks/useAgora';
import useConsulta from '../../../hooks/useConsulta';
import useAcao from '../../../hooks/useAcao';
import AvisoEstado from '../../../components/AvisoEstado/AvisoEstado';
import FormularioLote from '../../../components/FormularioLote/FormularioLote';
import TagStatus from '../../../components/TagStatus/TagStatus';
import Confirmacao from '../../../components/Confirmacao/Confirmacao';
import Feedback from '../../../components/Feedback/Feedback';
import Icone from '../../../components/Icone/Icone';

export default function LotesAdmin() {
    const agora = useAgora();
    const consulta = useConsulta(buscarLotes);
    const acao = useAcao();
    const [editar, setEditar] = useState<Lote | null>(null);
    const [excluir, setExcluir] = useState<Lote | null>(null);
    const [busca, setBusca] = useState('');
    function remover() {
        if (!excluir) return;
        void acao.executar(async () => {
            await excluirLote(excluir.id);
            setExcluir(null);
            consulta.recarregar();
        }, 'Lote removido com sucesso.');
    }
    const filtrados =
        consulta.dados?.filter((lote) =>
            `${lote.descricao} ${lote.ofertante.nome}`.toLowerCase().includes(busca.toLowerCase()),
        ) || [];
    return (
        <>
            <h2 className="mb-5 text-xl font-semibold text-verde-escuro">Moderação de lotes</h2>
            <div className="mb-5">
                <Feedback sucesso={acao.sucesso} />
            </div>
            {editar ? (
                <div className="max-w-3xl">
                    <FormularioLote
                        lote={editar}
                        key={editar.id}
                        aoCancelar={() => setEditar(null)}
                        aoSalvar={() => {
                            setEditar(null);
                            acao.setSucesso('Lote atualizado.');
                            consulta.recarregar();
                        }}
                    />
                </div>
            ) : (
                <>
                    <label htmlFor="busca-admin" className="mb-2 block text-xs font-semibold">
                        Buscar por alimento ou ofertante
                    </label>
                    <input
                        id="busca-admin"
                        className="campo mb-6 max-w-lg"
                        type="search"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Encontre um lote"
                    />
                    {consulta.carregando ? (
                        <AvisoEstado tipo="carregando" />
                    ) : consulta.erro ? (
                        <AvisoEstado
                            tipo="erro"
                            mensagem={consulta.erro}
                            tentarNovamente={consulta.recarregar}
                        />
                    ) : !filtrados.length ? (
                        <AvisoEstado tipo="vazio" mensagem="Nenhum lote encontrado." />
                    ) : (
                        <div className="grid gap-3">
                            {filtrados.map((lote) => (
                                <article
                                    key={lote.id}
                                    className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-linha bg-[#FFFDF8] p-5"
                                >
                                    <div className="min-w-0">
                                        <Link
                                            className="font-semibold text-verde-escuro hover:underline"
                                            to={`/lotes/${lote.id}`}
                                        >
                                            {lote.descricao}
                                        </Link>
                                        <p className="mt-2 text-xs leading-6 text-tinta/65">
                                            #{lote.id} · {lote.ofertante.nome} · {lote.bairro}
                                        </p>
                                        <p className="mt-1 text-xs leading-6 text-tinta/65">
                                            Saldo: {formatarQuantidade(lote.saldo, lote.unidade)} · Total: {formatarQuantidade(lote.quantidade, lote.unidade)}
                                        </p>
                                        <p className="mt-1 text-xs text-tinta/65">Retirada até {formatarData(lote.prazoRetirada)}</p>
                                        {prazoDivergente(lote, agora) && <p className="mt-2 text-xs text-vinho">Prazo futuro, mas marcado como vencido no cadastro. Necessita revisão.</p>}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <TagStatus status={statusDoLote(lote, agora)} />
                                        <button
                                            className="rounded-full p-2.5 text-verde hover:bg-verde/10"
                                            aria-label={`Editar ${lote.descricao}`}
                                            onClick={() => setEditar(lote)}
                                        >
                                            <Icone nome="editar" />
                                        </button>
                                        <button
                                            className="rounded-full p-2.5 text-vinho hover:bg-rosa/20"
                                            aria-label={`Excluir ${lote.descricao}`}
                                            onClick={() => {
                                                acao.setErro('');
                                                setExcluir(lote);
                                            }}
                                        >
                                            <Icone nome="lixeira" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
            <Confirmacao
                aberto={!!excluir}
                titulo="Remover este lote?"
                descricao={`Você está moderando “${excluir?.descricao || ''}”. A exclusão é definitiva. Lotes com reservas ativas não podem ser removidos.`}
                enviando={acao.enviando}
                erro={acao.erro}
                confirmar={remover}
                fechar={() => setExcluir(null)}
            />
        </>
    );
}
