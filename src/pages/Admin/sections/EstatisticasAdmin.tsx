import useConsulta from '../../../hooks/useConsulta';
import { buscarLotes, buscarOrganizacoes, buscarReservas } from '../../../services/api';
import { formatarNumero, quilosRetirados } from '../../../services/regras';
import CardImpacto from '../../../components/CardImpacto/CardImpacto';
import AvisoEstado from '../../../components/AvisoEstado/AvisoEstado';

async function buscarResumo() {
    const [lotes, reservas, organizacoes] = await Promise.all([
        buscarLotes(),
        buscarReservas(),
        buscarOrganizacoes(),
    ]);
    return { lotes, reservas, organizacoes };
}
export default function EstatisticasAdmin() {
    const consulta = useConsulta(buscarResumo);
    if (consulta.carregando) return <AvisoEstado tipo="carregando" />;
    if (consulta.erro)
        return <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />;
    const dados = consulta.dados!;
    return (
        <>
            <div className="grid gap-5 md:grid-cols-2">
                <div className="painel">
                    <CardImpacto
                        numero={`${formatarNumero(quilosRetirados(dados.reservas))} kg`}
                        rotulo="de alimentos aproveitados"
                        icone="folha"
                    />
                </div>
                <div className="painel">
                    <CardImpacto numero={dados.lotes.length} rotulo="lotes publicados" icone="caixa" />
                </div>
                <div className="painel">
                    <CardImpacto
                        numero={dados.reservas.filter((r) => r.status === 'RETIRADA').length}
                        rotulo="reservas concluídas"
                        icone="check"
                    />
                </div>
                <div className="painel">
                    <CardImpacto
                        numero={dados.organizacoes.length}
                        rotulo="organizações cadastradas"
                        icone="pessoas"
                    />
                </div>
            </div>
            <p className="mt-5 text-xs leading-6 text-tinta/60">
                O impacto em quilos considera apenas reservas retiradas de lotes publicados em kg. Unidades,
                caixas e maços não são convertidos automaticamente.
            </p>
            {!dados.lotes.length && (
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