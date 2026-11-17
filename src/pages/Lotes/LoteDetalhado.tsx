import { useCallback, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Lote } from '../../types';
import useConsulta from '../../hooks/useConsulta';
import useAcao from '../../hooks/useAcao';
import useSessao from '../../hooks/useSessao';
import { buscarLote, buscarMinhasReservas, reservarLote } from '../../services/api';
import { ErroApi } from '../../services/erro';
import { formatarData, formatarNumero, formatarQuantidade, statusDoLote, validarReserva } from '../../services/regras';
import useAgora from '../../hooks/useAgora';
import AvisoEstado from '../../components/AvisoEstado/AvisoEstado';
import TagStatus from '../../components/TagStatus/TagStatus';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import Feedback from '../../components/Feedback/Feedback';
import Icone from '../../components/Icone/Icone';
import { imagemDoLote } from '../../data/imagem';
import Imagem from '../../components/Imagem/Imagem';

function ReservarFormulario({
    lote,
    organizacaoId,
    aoReservar,
}: {
    lote: Lote;
    organizacaoId: number;
    aoReservar: () => void;
}) {
    const buscar = useCallback(() => buscarMinhasReservas(organizacaoId), [organizacaoId]);
    const consulta = useConsulta(buscar);
    const [quantidade, setQuantidade] = useState('');
    const acao = useAcao();
    const jaReservou = consulta.dados?.some(
        (reserva) => reserva.lote.id === lote.id && reserva.status === 'ATIVA',
    );
    if (consulta.carregando) return <AvisoEstado tipo="carregando" mensagem="Conferindo suas reservas…" />;
    if (consulta.erro)
        return <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />;
    if (jaReservou)
        return (
            <div className="rounded-2xl bg-verde/10 p-5">
                <p className="text-sm font-semibold text-verde-escuro">Esse lote já está na sua agenda.</p>
                <Link
                    to="/app/minhas-reservas"
                    className="mt-3 inline-block text-xs font-semibold text-verde underline"
                >
                    Ver minhas reservas
                </Link>
            </div>
        );

    function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const falha = validarReserva(lote, Number(quantidade), jaReservou);
        if (falha) {
            acao.setErro(falha);
            return;
        }
        void acao.executar(async () => {
            await reservarLote({ loteId: lote.id, organizacaoId, quantidade: Number(quantidade) });
            aoReservar();
        });
    }
    return (
        <form className="grid gap-4" onSubmit={enviar} noValidate>
            <h2 className="text-xl font-semibold text-verde-escuro">Bora levar pra outra mesa?</h2>
            <p className="text-xs leading-6 text-tinta/65">
                Escolha a quantidade. Depois da reserva, combine a retirada com o ofertante.
            </p>
            <CampoFormulario
                label={`Quanto você precisa? (${lote.unidade})`}
                type="number"
                inputMode="decimal"
                min={['kg', 'l'].includes(lote.unidade) ? 0.01 : 1}
                step={['kg', 'l'].includes(lote.unidade) ? '0.01' : '1'}
                max={lote.saldo}
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
                ajuda={`Disponível: ${formatarNumero(lote.saldo)} ${lote.unidade}`}
                disabled={acao.enviando}
            />
            <Feedback erro={acao.erro} />
            <button className="botao bg-verde text-creme" type="submit" disabled={acao.enviando}>
                {acao.enviando ? 'Reservando…' : 'Confirmar reserva'}
                <Icone nome="check" className="h-4 w-4" />
            </button>
        </form>
    );
}

export default function LoteDetalhe() {
    const agora = useAgora();
    const { id } = useParams();
    const { sessao } = useSessao();
    const [sucesso, setSucesso] = useState('');
    const buscar = useCallback(() => {
        if (!id || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)))
            return Promise.reject(new ErroApi('Esse lote não foi encontrado.', 404));
        return buscarLote(Number(id));
    }, [id]);
    const consulta = useConsulta(buscar);
    const lote = consulta.dados;
    const disponivel = lote && statusDoLote(lote, agora) === 'DISPONIVEL' && lote.saldo > 0;
    return (
        <section className="container-page py-9 md:py-12">
            {!lote && consulta.statusErro !== 404 && <h1 className="sr-only">Detalhe do lote</h1>}
            <Link
                to="/lotes"
                className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-verde"
            >
                <Icone nome="voltar" className="h-4 w-4" /> Voltar para os lotes
            </Link>
            {consulta.carregando ? (
                <AvisoEstado tipo="carregando" />
            ) : consulta.statusErro === 404 ? (
                <div className="painel py-14 text-center">
                    <h1 className="text-2xl font-bold text-verde-escuro">
                        Esse lote não está mais por aqui.
                    </h1>
                    <p className="mt-4 text-sm text-tinta/65">Talvez ele já tenha encontrado outra mesa.</p>
                    <Link className="botao mt-6 bg-amarelo" to="/lotes">
                        Voltar para os lotes
                    </Link>
                </div>
            ) : consulta.erro ? (
                <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />
            ) : (
                lote && (
                    <>
                        <div className="mb-6">
                            <Feedback sucesso={sucesso} />
                        </div>
                        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                            <div>
                                <Imagem
                                    src={imagemDoLote(lote)}
                                    alt={lote.descricao}
                                    className="h-52 w-full rounded-[24px] object-cover sm:h-72"
                                />
                                <div className="painel mt-6">
                                    <h2 className="text-lg font-semibold text-verde-escuro">
                                        Quem está compartilhando
                                    </h2>
                                    <p className="mt-4 font-medium">{lote.ofertante.nome}</p>
                                    <p className="mt-2 text-sm text-tinta/70">
                                        Contato: {lote.ofertante.contato}
                                    </p>
                                    <p className="mt-5 flex items-start gap-2 text-sm leading-7 text-tinta/70">
                                        <Icone nome="pin" className="mt-1 h-5 w-5 shrink-0 text-verde" />
                                        {lote.local} · {lote.bairro}
                                    </p>
                                    <p className="mt-4 text-xs leading-6 text-tinta/55">
                                        Combine os detalhes antes de sair e leve recipientes adequados para
                                        transportar os alimentos.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <TagStatus status={statusDoLote(lote, agora)} />
                                <p className="sobretitulo mt-5">{lote.categoria.nome}</p>
                                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-1px] text-verde-escuro md:text-4xl">
                                    {lote.descricao}
                                </h1>
                                <div className="my-7 grid gap-5 rounded-2xl bg-[#E8EDDC] p-5 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-tinta/65">Saldo do lote</p>
                                        <p className="mt-2 text-xl font-bold text-verde-escuro">
                                            {formatarQuantidade(lote.saldo, lote.unidade)}
                                        </p>
                                        <p className="mt-1 text-xs leading-6 text-tinta/65">
                                            {disponivel ? 'Disponível para novas reservas.' : 'A situação atual não permite novas reservas.'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-tinta/65">Total publicado</p>
                                        <p className="mt-2 text-xl font-bold text-verde-escuro">
                                            {formatarQuantidade(lote.quantidade, lote.unidade)}
                                        </p>
                                        <p className="mt-1 text-xs leading-6 text-tinta/65">Quantidade total, incluindo o que já foi reservado ou retirado.</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-tinta/65">Retirada até</p>
                                        <p className="mt-2 text-sm font-semibold leading-6 text-verde-escuro">
                                            {formatarData(lote.prazoRetirada)}
                                        </p>
                                    </div>
                                </div>
                                {sessao?.tipo === 'organizacao' && disponivel ? (
                                    <ReservarFormulario
                                        key={lote.id}
                                        lote={lote}
                                        organizacaoId={sessao.pessoa.id}
                                        aoReservar={() => {
                                            setSucesso(
                                                'Reserva feita! Agora combine a retirada com o ofertante. Acompanhe em Minhas reservas.',
                                            );
                                            consulta.recarregar();
                                        }}
                                    />
                                ) : !sessao ? (
                                    <div className="painel">
                                        <h2 className="font-semibold text-verde-escuro">
                                            Quer reservar esse alimento?
                                        </h2>
                                        <p className="mt-3 text-sm leading-7 text-tinta/65">
                                            Entre como organização para reservar e combinar a retirada.
                                        </p>
                                        <Link
                                            className="botao mt-5 bg-verde text-creme"
                                            to="/login?tipo=organizacao"
                                            state={{ de: `/lotes/${lote.id}` }}
                                        >
                                            Entrar como organização
                                        </Link>
                                    </div>
                                ) : sessao.tipo === 'organizacao' ? (
                                    <div className="rounded-2xl bg-rosa/20 p-5">
                                        <p className="text-sm leading-7 text-vinho">
                                            Este lote está {statusDoLote(lote, agora).toLowerCase()} e não recebe
                                            novas reservas.
                                        </p>
                                        <Link
                                            to="/app/minhas-reservas"
                                            className="mt-3 inline-block text-xs font-semibold text-vinho underline"
                                        >
                                            Ver minhas reservas
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl bg-verde/5 p-5">
                                        <p className="text-sm leading-7 text-tinta/70">
                                            As reservas são feitas por organizações. Você pode acompanhar seus
                                            lotes no painel.
                                        </p>
                                        <Link
                                            to={
                                                sessao.tipo === 'administrador' ? '/admin' : '/app/meus-lotes'
                                            }
                                            className="mt-3 inline-block text-xs font-semibold text-verde underline"
                                        >
                                            Ir para o painel
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )
            )}
        </section>
    );
}
