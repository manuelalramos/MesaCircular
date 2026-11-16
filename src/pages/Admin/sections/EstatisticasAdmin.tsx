import useConsulta from '../../../hooks/useConsulta';
import { buscarEstatisticas } from '../../../services/api';
import { formatarNumero } from '../../../services/regras';
import CardImpacto from '../../../components/CardImpacto/CardImpacto';
import AvisoEstado from '../../../components/AvisoEstado/AvisoEstado';

export default function EstatisticasAdmin() {
    const consulta = useConsulta(buscarEstatisticas);
    if (consulta.carregando) return <AvisoEstado tipo="carregando" />;
    if (consulta.erro)
        return <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />;
    const dados = consulta.dados!;
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
                        rotulo="de alimentos aproveitados"
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
                O impacto em quilos considera apenas reservas retiradas de lotes publicados em kg. Unidades,
                caixas e pacotes não são convertidos automaticamente.
            </p>
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
