import useConsulta from '../../../hooks/useConsulta';
import { buscarResumoAdmin } from '../../../services/api';
import { formatarNumero, formatarQuantidade, resumirQuantidades } from '../../../services/regras';
import CardImpacto from '../../../components/CardImpacto/CardImpacto';
import AvisoEstado from '../../../components/AvisoEstado/AvisoEstado';

const unidades: Record<string, string> = { kg: 'Quilos', l: 'Litros', un: 'Unidades', cx: 'Caixas', pct: 'Pacotes' };

export default function EstatisticasAdmin() {
    const consulta = useConsulta(buscarResumoAdmin);
    if (consulta.carregando) return <AvisoEstado tipo="carregando" />;
    if (consulta.erro)
        return <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />;
    const dados = consulta.dados!.estatisticas;
    const quantidades = resumirQuantidades(consulta.dados!.reservas);
    return (
        <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-tinta/65">Números dos cadastros e retiradas da comunidade.</p>
                <button className="botao-pequeno botao-contorno" onClick={consulta.recarregar}>Atualizar números</button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                <div className="painel">
                    <CardImpacto
                        numero={`${formatarNumero(dados.quilos)} kg`}
                        rotulo="com retirada confirmada em kg"
                        icone="folha"
                    />
                </div>
                <div className="painel">
                    <CardImpacto numero={dados.lotes} rotulo={dados.lotes === 1 ? 'lote cadastrado' : 'lotes cadastrados'} icone="caixa" />
                </div>
                <div className="painel">
                    <CardImpacto
                        numero={dados.concluidas}
                        rotulo={dados.concluidas === 1 ? 'reserva concluída' : 'reservas concluídas'}
                        icone="check"
                    />
                </div>
                <div className="painel">
                    <CardImpacto
                        numero={dados.organizacoes}
                        rotulo={dados.organizacoes === 1 ? 'organização cadastrada' : 'organizações cadastradas'}
                        icone="pessoas"
                    />
                </div>
            </div>
            <p className="mt-5 text-xs leading-6 text-tinta/60">
                Quilos só somam retiradas confirmadas de lotes em kg. Zero kg significa que não houve
                retirada confirmada nessa unidade; pacotes, caixas, litros e unidades aparecem abaixo.
            </p>
            {!!quantidades.length && (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-linha bg-[#FFFDF8]">
                    <table className="w-full text-left text-sm">
                        <caption className="p-4 text-left text-sm font-semibold text-verde-escuro">Quantidades por unidade, sem conversão de peso</caption>
                        <thead className="bg-verde/5 text-xs text-verde-escuro">
                            <tr>
                                <th scope="col" className="p-4">Unidade</th>
                                <th scope="col" className="p-4">Reservado, aguardando retirada</th>
                                <th scope="col" className="p-4">Retirado e confirmado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quantidades.map((total) => (
                                <tr key={total.unidade} className="border-t border-linha">
                                    <th scope="row" className="p-4 font-medium">{unidades[total.unidade] || total.unidade}</th>
                                    <td className="p-4">{formatarQuantidade(total.reservada, total.unidade)}</td>
                                    <td className="p-4">{formatarQuantidade(total.retirada, total.unidade)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!dados.lotes && (
                <div className="mt-7">
                    <AvisoEstado
                        tipo="vazio"
                        mensagem="A comunidade ainda está começando. Os números aparecem com os primeiros lotes e retiradas."
                    />
                </div>
            )}
        </>
    );
}
