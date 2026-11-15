import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { DadosLote, Lote } from '../../types';
import { buscarCategorias, editarLote, publicarLote } from '../../services/api';
import { dataParaCampo } from '../../services/regras';
import useConsulta from '../../hooks/useConsulta';
import useSessao from '../../hooks/useSessao';
import useAcao from '../../hooks/useAcao';
import AvisoEstado from '../AvisoEstado/AvisoEstado';
import CampoFormulario from '../CampoFormulario/CampoFormulario';
import Feedback from '../Feedback/Feedback';
import Icone from '../Icone/Icone';

interface FormularioLoteProps {
    lote?: Lote;
    aoSalvar?: () => void;
    aoCancelar?: () => void;
}
export default function FormularioLote({ lote, aoSalvar, aoCancelar }: FormularioLoteProps) {
    const categorias = useConsulta(buscarCategorias);
    const { sessao } = useSessao();
    const acao = useAcao();
    const [erros, setErros] = useState<Record<string, string>>({});
    const [publicado, setPublicado] = useState<Lote | null>(null);

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
            bairro: String(campos.get('bairro') || '').trim(),
            local: String(campos.get('local') || '').trim(),
            ofertanteId: lote?.ofertante.id || sessao!.pessoa.id,
        };
        const falhas: Record<string, string> = {};
        if (dados.descricao.length < 5) falhas.descricao = 'Descreva o alimento em pelo menos 5 caracteres.';
        if (!Number.isFinite(dados.quantidade) || dados.quantidade <= 0)
            falhas.quantidade = 'Informe uma quantidade maior que zero.';
        if (dados.unidade !== 'kg' && !Number.isInteger(dados.quantidade))
            falhas.quantidade = 'Para esta unidade, use uma quantidade inteira.';
        if (lote && dados.quantidade < lote.quantidade - lote.saldo)
            falhas.quantidade = `Já há ${lote.quantidade - lote.saldo} ${lote.unidade} comprometidos.`;
        if (lote && lote.saldo < lote.quantidade && dados.unidade !== lote.unidade)
            falhas.unidade = 'A unidade não pode mudar depois de receber reservas.';
        if (!dados.categoriaId) falhas.categoria = 'Escolha uma categoria.';
        if (
            !dados.prazoRetirada ||
            !Number.isFinite(new Date(dados.prazoRetirada).getTime()) ||
            new Date(dados.prazoRetirada).getTime() <= Date.now()
        )
            falhas.prazoRetirada = 'Escolha um prazo no futuro.';
        if (dados.bairro.length < 2) falhas.bairro = 'Informe o bairro da retirada.';
        if (dados.local.length < 5) falhas.local = 'Informe o endereço e um ponto de referência.';
        setErros(falhas);
        if (Object.keys(falhas).length) {
            formulario.querySelector<HTMLInputElement>(`[name="${Object.keys(falhas)[0]}"]`)?.focus();
            return;
        }
        dados.prazoRetirada = new Date(dados.prazoRetirada).toISOString();
        void acao.executar(async () => {
            const resultado = lote ? await editarLote(lote.id, dados) : await publicarLote(dados);
            if (aoSalvar) aoSalvar();
            else setPublicado(resultado);
        });
    }
    if (categorias.carregando) return <AvisoEstado tipo="carregando" mensagem="Buscando as categorias…" />;
    if (categorias.erro)
        return <AvisoEstado tipo="erro" mensagem={categorias.erro} tentarNovamente={categorias.recarregar} />;
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
                <CampoFormulario
                    name="descricao"
                    label="O que você vai compartilhar?"
                    defaultValue={lote?.descricao}
                    placeholder="Ex.: 12 kg de legumes fresquinhos da feira"
                    required
                    maxLength={180}
                    erro={erros.descricao}
                />
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
                            <option value="unidades">Unidades</option>
                            <option value="caixas">Caixas</option>
                            <option value="maços">Maços</option>
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
                        min={dataParaCampo(new Date().toISOString())}
                        defaultValue={lote ? dataParaCampo(lote.prazoRetirada) : ''}
                        required
                        erro={erros.prazoRetirada}
                    />
                </div>
                <CampoFormulario
                    name="bairro"
                    label="Bairro"
                    defaultValue={
                        lote?.bairro ||
                        (sessao?.pessoa && 'bairro' in sessao.pessoa ? sessao.pessoa.bairro : '')
                    }
                    maxLength={80}
                    required
                    erro={erros.bairro}
                />
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