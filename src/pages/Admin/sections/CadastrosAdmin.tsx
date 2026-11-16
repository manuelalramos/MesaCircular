import { useState } from 'react';
import {
    buscarOfertantes,
    buscarOrganizacoes,
    excluirOfertante,
    excluirOrganizacao,
} from '../../../services/api';
import useConsulta from '../../../hooks/useConsulta';
import useAcao from '../../../hooks/useAcao';
import AvisoEstado from '../../../components/AvisoEstado/AvisoEstado';
import Confirmacao from '../../../components/Confirmacao/Confirmacao';
import Feedback from '../../../components/Feedback/Feedback';
import Icone from '../../../components/Icone/Icone';

async function buscarCadastros() {
    const [ofertantes, organizacoes] = await Promise.all([buscarOfertantes(), buscarOrganizacoes()]);
    return [
        ...ofertantes.map((pessoa) => ({ pessoa, tipo: 'ofertante' as const })),
        ...organizacoes.map((pessoa) => ({ pessoa, tipo: 'organizacao' as const })),
    ];
}
type Cadastro = Awaited<ReturnType<typeof buscarCadastros>>[number];

export default function CadastrosAdmin() {
    const consulta = useConsulta(buscarCadastros);
    const acao = useAcao();
    const [selecionado, setSelecionado] = useState<Cadastro | null>(null);
    function remover() {
        if (!selecionado) return;
        void acao.executar(async () => {
            if (selecionado.tipo === 'ofertante') await excluirOfertante(selecionado.pessoa.id);
            else await excluirOrganizacao(selecionado.pessoa.id);
            setSelecionado(null);
            consulta.recarregar();
        }, 'Cadastro removido.');
    }
    return (
        <>
            <h2 className="mb-3 text-xl font-semibold text-verde-escuro">Pessoas que fazem parte</h2>
            <p className="mb-6 text-sm leading-7 text-tinta/65">
                Ofertantes e organizações da comunidade. Cadastros vinculados a lotes ou reservas não podem
                ser excluídos.
            </p>
            <div className="mb-5">
                <Feedback sucesso={acao.sucesso} />
            </div>
            {consulta.carregando ? (
                <AvisoEstado tipo="carregando" />
            ) : consulta.erro ? (
                <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />
            ) : !consulta.dados?.length ? (
                <AvisoEstado tipo="vazio" mensagem="Ainda não há participantes cadastrados." />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {consulta.dados.map(({ pessoa, tipo }) => (
                        <article className="painel" key={`${tipo}-${pessoa.id}`}>
                            <span
                                className={`inline-block rounded-full px-3 py-1 text-[10px] font-semibold ${tipo === 'ofertante' ? 'bg-amarelo/40 text-verde-escuro' : 'bg-verde/10 text-verde'}`}
                            >
                                {tipo === 'ofertante' ? 'Ofertante' : 'Organização'}
                            </span>
                            <h3 className="mt-4 font-semibold text-verde-escuro">{pessoa.nome}</h3>
                            <p className="mt-3 break-all text-xs leading-6 text-tinta/65">
                                {pessoa.email}
                                <br />
                                {pessoa.contato}
                                <br />
                                {pessoa.bairro}
                            </p>
                            <button
                                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-vinho"
                                disabled={acao.enviando}
                                onClick={() => {
                                    acao.setErro('');
                                    setSelecionado({ pessoa, tipo } as Cadastro);
                                }}
                            >
                                <Icone nome="lixeira" className="h-4 w-4" />
                                Remover cadastro
                            </button>
                        </article>
                    ))}
                </div>
            )}
            <Confirmacao
                aberto={!!selecionado}
                titulo="Remover este cadastro?"
                descricao={`O cadastro de ${selecionado?.pessoa.nome || ''} será excluído permanentemente. A remoção só será feita se não houver vínculos com lotes ou reservas.`}
                enviando={acao.enviando}
                erro={acao.erro}
                confirmar={remover}
                fechar={() => setSelecionado(null)}
            />
        </>
    );
}