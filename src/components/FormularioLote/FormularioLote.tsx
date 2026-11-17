import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { DadosLote, Lote } from '../../types';
import { buscarBairros, buscarCategorias, editarLote, publicarLote } from '../../services/api';
import { dataParaCampo, formatarQuantidade, statusDoLote, validarLinkImagem, validarPrazoRetirada } from '../../services/regras';
import useAgora from '../../hooks/useAgora';
import useConsulta from '../../hooks/useConsulta';
import useSessao from '../../hooks/useSessao';
import useAcao from '../../hooks/useAcao';
import AvisoEstado from '../AvisoEstado/AvisoEstado';
import CampoFormulario from '../CampoFormulario/CampoFormulario';
import Feedback from '../Feedback/Feedback';
import Icone from '../Icone/Icone';
import Imagem from '../Imagem/Imagem';
import TagStatus from '../TagStatus/TagStatus';

interface FormularioLoteProps {
    lote?: Lote;
    aoSalvar?: () => void;
    aoCancelar?: () => void;
}
export default function FormularioLote({ lote, aoSalvar, aoCancelar }: FormularioLoteProps) {
    const categorias = useConsulta(buscarCategorias);
    const bairros = useConsulta(buscarBairros);
    const { sessao } = useSessao();
    const acao = useAcao();
    const [erros, setErros] = useState<Record<string, string>>({});
    const [publicado, setPublicado] = useState<Lote | null>(null);
    const agora = useAgora();
    const minimoPrazo = dataParaCampo(new Date(agora).toISOString());
    const administrador = sessao?.tipo === 'administrador';
    const [prazo, setPrazo] = useState(lote ? dataParaCampo(lote.prazoRetirada) : '');
    const [ativo, setAtivo] = useState(lote?.ativo ?? true);
    const [imagem, setImagem] = useState(lote?.imagem || '');
    const linkImagem = imagem.trim();
    const previa = lote ? { ...lote, prazoRetirada: prazo, ativo } : null;

    function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const campos = new FormData(formulario);
        const dados: DadosLote = {
            descricao: String(campos.get('descricao') || '').trim(),
            quantidade: Number(campos.get('quantidade')),
            unidade: String(campos.get('unidade')),
            categoriaId: Number(campos.get('categoria')),
            prazoRetirada: String(campos.get('prazoRetirada')),
            idBairro: Number(campos.get('idBairro')),
            local: String(campos.get('local') || '').trim(),
            ofertanteId: lote?.ofertante.id || sessao!.pessoa.id,
            imagem: linkImagem,
            ativo: administrador && lote ? campos.get('ativo') === 'S' : lote?.ativo ?? true,
        };
        const falhas: Record<string, string> = {};
        if (dados.descricao.length < 5) falhas.descricao = 'Descreva o alimento em pelo menos 5 caracteres.';
        if (!Number.isFinite(dados.quantidade) || dados.quantidade <= 0)
            falhas.quantidade = 'Informe uma quantidade maior que zero.';
        if (!['kg', 'l'].includes(dados.unidade) && !Number.isInteger(dados.quantidade))
            falhas.quantidade = 'Para esta unidade, use uma quantidade inteira.';
        if (lote && dados.quantidade < lote.quantidade - lote.saldo)
            falhas.quantidade = `Já há ${lote.quantidade - lote.saldo} ${lote.unidade} comprometidos.`;
        if (lote && lote.saldo < lote.quantidade && dados.unidade !== lote.unidade)
            falhas.unidade = 'A unidade não pode mudar depois de receber reservas.';
        if (!dados.categoriaId) falhas.categoria = 'Escolha uma categoria.';
        const erroPrazo = validarPrazoRetirada(dados.prazoRetirada, lote, administrador);
        if (erroPrazo) falhas.prazoRetirada = erroPrazo;
        if (!bairros.dados?.some((bairro) => bairro.id === dados.idBairro)) falhas.idBairro = 'Selecione o bairro da retirada.';
        if (dados.local.length < 5) falhas.local = 'Informe o endereço e um ponto de referência.';
        const erroImagem = validarLinkImagem(linkImagem);
        if (erroImagem) falhas.imagem = erroImagem;
        setErros(falhas);
        if (Object.keys(falhas).length) {
            formulario.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${Object.keys(falhas)[0]}"]`)?.focus();
            return;
        }
        void acao.executar(async () => {
            const resultado = lote ? await editarLote(lote.id, dados) : await publicarLote(dados);
            if (aoSalvar) aoSalvar();
            else setPublicado(resultado);
        });
    }
    if (categorias.carregando) return <AvisoEstado tipo="carregando" mensagem="Buscando as categorias…" />;
    if (categorias.erro)
        return <AvisoEstado tipo="erro" mensagem={categorias.erro} tentarNovamente={categorias.recarregar} />;
    if (bairros.carregando) return <AvisoEstado tipo="carregando" mensagem="Buscando os bairros…" />;
    if (bairros.erro) return <AvisoEstado tipo="erro" mensagem={bairros.erro} tentarNovamente={bairros.recarregar} />;
    if (!bairros.dados?.length) return <AvisoEstado tipo="vazio" mensagem="Ainda não há bairros disponíveis para publicar um lote." />;
    if (!categorias.dados?.length)
        return (
            <AvisoEstado
                tipo="vazio"
                mensagem="Ainda não há categorias. Peça à administração para cadastrar uma antes de publicar."
            />
        );
    if (publicado)
        return (
            <div className="painel py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center text-verde">
                    <Icone nome="check" className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-2xl font-bold text-verde-escuro">Pronto pra circular!</h2>
                <p className="mt-3 text-sm leading-7 text-tinta/65" role="status">
                    Seu lote foi publicado. Agora ele pode encontrar uma nova mesa.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link to={`/lotes/${publicado.id}`} className="botao bg-verde text-creme">
                        Ver meu lote
                    </Link>
                    <button
                        className="botao botao-contorno"
                        onClick={() => {
                            setPublicado(null);
                            setErros({});
                            setImagem('');
                            setPrazo('');
                        }}
                    >
                        Publicar outro
                    </button>
                </div>
            </div>
        );

    return (
        <form onSubmit={enviar} noValidate className="painel">
            <fieldset disabled={acao.enviando} className="grid gap-5">
                {previa && administrador && (
                    <div className="rounded-2xl border border-linha p-4">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            <span className="text-sm font-semibold">Situação ao salvar</span>
                            <TagStatus status={statusDoLote(previa, agora)} />
                        </div>
                        <label htmlFor="ativo-lote" className="mb-2 block text-sm font-semibold">Publicação do lote</label>
                        <select id="ativo-lote" name="ativo" className="campo" value={ativo ? 'S' : 'N'} onChange={(e) => setAtivo(e.target.value === 'S')} aria-describedby="ajuda-ativo-lote">
                            <option value="S">Ativo</option>
                            <option value="N">Inativo</option>
                        </select>
                        <p id="ajuda-ativo-lote" className="mt-2 text-xs leading-6 text-tinta/65">
                            Inativar impede novas reservas sem excluir o lote ou seu histórico.
                        </p>
                    </div>
                )}
                <CampoFormulario
                    name="descricao"
                    label="O que você vai compartilhar?"
                    defaultValue={lote?.descricao}
                    placeholder="Ex.: 12 kg de legumes fresquinhos da feira"
                    required
                    maxLength={180}
                    erro={erros.descricao}
                />
                <div>
                    <CampoFormulario
                        name="imagem"
                        label="Link da foto (opcional)"
                        type="url"
                        inputMode="url"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={500}
                        value={imagem}
                        onChange={(evento) => setImagem(evento.target.value)}
                        placeholder="https://exemplo.com/foto-do-alimento.jpg"
                        ajuda="Cole um link público direto para a imagem. Sem link, usamos a foto padrão da categoria."
                        erro={erros.imagem}
                    />
                    {linkImagem && !validarLinkImagem(linkImagem) && (
                        <figure className="mt-4 max-w-sm">
                            <Imagem src={linkImagem} alt="Prévia da foto do lote" className="h-44 w-full rounded-2xl object-cover" />
                            <figcaption className="mt-2 text-xs leading-5 text-tinta/60">
                                Prévia da foto. Se ela não aparecer, confira se o link abre uma imagem pública.
                            </figcaption>
                        </figure>
                    )}
                    {imagem && (
                        <button type="button" className="mt-3 text-xs font-semibold text-vinho underline underline-offset-4" onClick={() => setImagem('')}>
                            Remover foto
                        </button>
                    )}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    <CampoFormulario
                        name="quantidade"
                        label="Quantidade total"
                        type="number"
                        min="0.01"
                        step="0.01"
                        inputMode="decimal"
                        defaultValue={lote?.quantidade}
                        required
                        erro={erros.quantidade}
                        ajuda={lote
                            ? `Total originalmente publicado: ${formatarQuantidade(lote.quantidade, lote.unidade)}. Saldo atual: ${formatarQuantidade(lote.saldo, lote.unidade)}. O saldo é recalculado ao salvar, preservando reservas e retiradas.`
                            : 'Informe o total na unidade escolhida. Ex.: 40 pacotes significa 40 embalagens, não 40 kg.'}
                    />
                    <div>
                        <label htmlFor="unidade" className="mb-2 block text-sm font-semibold">
                            Unidade *
                        </label>
                        <select
                            className="campo"
                            name="unidade"
                            id="unidade"
                            defaultValue={lote?.unidade || 'kg'}
                            aria-invalid={!!erros.unidade}
                            aria-describedby={erros.unidade ? 'erro-unidade' : undefined}
                        >
                            <option value="kg">Quilos (kg)</option>
                            <option value="un">Unidades (un)</option>
                            <option value="l">Litros (l)</option>
                            <option value="cx">Caixas (cx)</option>
                            <option value="pct">Pacotes (pct)</option>
                        </select>
                        {erros.unidade && (
                            <p id="erro-unidade" className="mt-2 text-xs text-vinho">
                                {erros.unidade}
                            </p>
                        )}
                    </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="categoria" className="mb-2 block text-sm font-semibold">
                            Categoria *
                        </label>
                        <select
                            name="categoria"
                            id="categoria"
                            className="campo"
                            defaultValue={lote?.categoria.id || ''}
                            required
                            aria-invalid={!!erros.categoria}
                            aria-describedby={erros.categoria ? 'erro-categoria' : undefined}
                        >
                            <option value="">Selecione a categoria</option>
                            {categorias.dados.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nome}
                                </option>
                            ))}
                        </select>
                        {erros.categoria && (
                            <p id="erro-categoria" className="mt-2 text-xs text-vinho">
                                {erros.categoria}
                            </p>
                        )}
                    </div>
                    <CampoFormulario
                        name="prazoRetirada"
                        label="Retirar até quando?"
                        type="datetime-local"
                        min={lote ? undefined : minimoPrazo}
                        value={prazo}
                        onChange={(e) => setPrazo(e.target.value)}
                        required
                        erro={erros.prazoRetirada}
                        ajuda={administrador && lote
                            ? 'No horário de São Paulo, um prazo anterior ao momento atual deixa o lote vencido automaticamente. A data precisa ser posterior à publicação.'
                            : 'Informe o dia e o horário de retirada no horário de São Paulo.'}
                    />
                </div>
                <div>
                    <label htmlFor="bairro-publicacao" className="mb-2 block text-sm font-semibold">Bairro da retirada *</label>
                    <select
                        id="bairro-publicacao" name="idBairro" className="campo" required
                        defaultValue={lote?.idBairro || (sessao?.pessoa && 'idBairro' in sessao.pessoa ? sessao.pessoa.idBairro : '')}
                        aria-invalid={!!erros.idBairro} aria-describedby={erros.idBairro ? 'erro-bairro-publicacao' : undefined}
                    >
                        <option value="">Selecione o bairro</option>
                        {bairros.dados.map((bairro) => <option key={bairro.id} value={bairro.id}>{bairro.nome} · {bairro.cidade}/{bairro.uf}</option>)}
                    </select>
                    {erros.idBairro && <p id="erro-bairro-publicacao" className="mt-1.5 text-xs text-vinho">{erros.idBairro}</p>}
                </div>
                <CampoFormulario
                    name="local"
                    label="Endereço e ponto de referência"
                    defaultValue={lote?.local}
                    maxLength={200}
                    placeholder="Rua, número, banca ou ponto de encontro"
                    required
                    erro={erros.local}
                    ajuda="Esse local aparece no detalhe do lote para combinar a retirada."
                />
                <Feedback erro={acao.erro} />
                <p className="rounded-xl bg-verde/5 p-4 text-xs leading-6 text-tinta/65">
                    Compartilhe apenas alimentos em condições de consumo. Informe um prazo que permita retirar
                    e transportar tudo com cuidado.
                </p>
                <div className="flex flex-wrap gap-3">
                    <button type="submit" className="botao bg-verde text-creme">
                        {acao.enviando ? 'Salvando…' : lote ? 'Salvar alterações' : 'Publicar lote'}
                        <Icone nome="diagonal" className="h-4 w-4" />
                    </button>
                    {aoCancelar && (
                        <button type="button" className="botao botao-contorno" onClick={aoCancelar}>
                            Cancelar edição
                        </button>
                    )}
                </div>
            </fieldset>
        </form>
    );
}
