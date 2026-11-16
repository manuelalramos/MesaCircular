import { useState, type FormEvent } from 'react';
import type { Categoria } from '../../../types';
import { buscarCategorias, criarCategoria, editarCategoria, excluirCategoria } from '../../../services/api';
import useConsulta from '../../../hooks/useConsulta';
import useAcao from '../../../hooks/useAcao';
import AvisoEstado from '../../../components/AvisoEstado/AvisoEstado';
import CampoFormulario from '../../../components/CampoFormulario/CampoFormulario';
import Confirmacao from '../../../components/Confirmacao/Confirmacao';
import Feedback from '../../../components/Feedback/Feedback';
import Icone from '../../../components/Icone/Icone';

export default function CategoriasAdmin() {
    const consulta = useConsulta(buscarCategorias);
    const acao = useAcao();
    const [nome, setNome] = useState('');
    const [editar, setEditar] = useState<Categoria | null>(null);
    const [excluir, setExcluir] = useState<Categoria | null>(null);
    function salvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (nome.trim().length < 2) {
            acao.setErro('Dê um nome de pelo menos 2 letras à categoria.');
            return;
        }
        void acao.executar(
            async () => {
                if (editar) await editarCategoria(editar.id, nome.trim());
                else await criarCategoria(nome.trim());
                setNome('');
                setEditar(null);
                consulta.recarregar();
            },
            editar ? 'Categoria atualizada.' : 'Nova categoria cadastrada.',
        );
    }
    function remover() {
        if (!excluir) return;
        void acao.executar(async () => {
            await excluirCategoria(excluir.id);
            setExcluir(null);
            consulta.recarregar();
        }, 'Categoria removida.');
    }
    return (
        <>
            <h2 className="mb-5 text-xl font-semibold text-verde-escuro">Categorias de alimentos</h2>
            <form onSubmit={salvar} className="painel mb-6" noValidate>
                <fieldset
                    disabled={acao.enviando}
                    className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end"
                >
                    <div className="grow">
                        <CampoFormulario
                            label={editar ? 'Editar categoria' : 'Nome da nova categoria'}
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            maxLength={80}
                            required
                        />
                    </div>
                    <button type="submit" className="botao shrink-0 bg-verde text-creme">
                        {acao.enviando ? 'Salvando…' : editar ? 'Salvar' : 'Adicionar'}
                    </button>
                    {editar && (
                        <button
                            type="button"
                            className="botao botao-contorno"
                            onClick={() => {
                                setEditar(null);
                                setNome('');
                                acao.setErro('');
                            }}
                        >
                            Cancelar
                        </button>
                    )}
                </fieldset>
            </form>
            <div className="mb-5">
                <Feedback sucesso={acao.sucesso} erro={!excluir ? acao.erro : ''} />
            </div>
            {consulta.carregando ? (
                <AvisoEstado tipo="carregando" />
            ) : consulta.erro ? (
                <AvisoEstado tipo="erro" mensagem={consulta.erro} tentarNovamente={consulta.recarregar} />
            ) : !consulta.dados?.length ? (
                <AvisoEstado tipo="vazio" mensagem="Nenhuma categoria ainda. Crie a primeira acima." />
            ) : (
                <div className="grid gap-3">
                    {consulta.dados.map((categoria) => (
                        <article
                            key={categoria.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-linha bg-[#FFFDF8] px-5 py-4"
                        >
                            <p className="text-sm font-medium text-verde-escuro">{categoria.nome}</p>
                            <div className="flex shrink-0 gap-2">
                                <button
                                    disabled={acao.enviando}
                                    aria-label={`Editar ${categoria.nome}`}
                                    className="rounded-full p-2.5 text-verde hover:bg-verde/10"
                                    onClick={() => {
                                        setEditar(categoria);
                                        setNome(categoria.nome);
                                        acao.setErro('');
                                    }}
                                >
                                    <Icone nome="editar" className="h-4 w-4" />
                                </button>
                                <button
                                    disabled={acao.enviando}
                                    aria-label={`Excluir ${categoria.nome}`}
                                    className="rounded-full p-2.5 text-vinho hover:bg-rosa/20"
                                    onClick={() => {
                                        acao.setErro('');
                                        setExcluir(categoria);
                                    }}
                                >
                                    <Icone nome="lixeira" className="h-4 w-4" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
            <Confirmacao
                aberto={!!excluir}
                titulo="Excluir esta categoria?"
                descricao={`A categoria “${excluir?.nome || ''}” será removida. Se algum lote estiver usando ela, a exclusão será bloqueada.`}
                enviando={acao.enviando}
                erro={acao.erro}
                confirmar={remover}
                fechar={() => setExcluir(null)}
            />
        </>
    );
}