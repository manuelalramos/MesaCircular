import type {
    Bairro,
    Categoria,
    Credenciais,
    DadosCadastro,
    DadosContato,
    DadosLote,
    DadosReserva,
    Lote,
    Ofertante,
    Organizacao,
    Perfil,
    Reserva,
    Sessao,
    Estatisticas,
} from '../types';
import {
    converterBairro, converterCategoria, converterLote, converterOfertante, converterOrganizacao, converterReserva, listaApi,
    type BairroApi, type CategoriaApi, type LoteApi, type PessoaApi, type ReferenciasLote, type ReservaApi,
} from './contrato.ts';

import { ErroApi } from './erro.ts';

export const API_BASE = import.meta.env?.VITE_API_BASE || 'https://mesacircular-api.onrender.com'; // api atualizada
let sessaoAtual: Sessao | null = null;
const leiturasEmAndamento = new Map<string, Promise<unknown>>();
export function definirSessaoApi(sessao: Sessao | null) {
    sessaoAtual = sessao;
    leiturasEmAndamento.clear();
}
function requisicao<T>(caminho: string, metodo = 'GET', dados?: unknown): Promise<T> {
    if (metodo !== 'GET') {
        leiturasEmAndamento.clear();
        return executarRequisicao<T>(caminho, metodo, dados).finally(() => leiturasEmAndamento.clear());
    }
    const chave = JSON.stringify([caminho, sessaoAtual?.tipo, sessaoAtual?.pessoa.id, sessaoAtual?.token]);
    const pendente = leiturasEmAndamento.get(chave);
    if (pendente) return pendente as Promise<T>;
    const leitura = executarRequisicao<T>(caminho, metodo, dados).finally(() => {
        if (leiturasEmAndamento.get(chave) === leitura) leiturasEmAndamento.delete(chave);
    });
    leiturasEmAndamento.set(chave, leitura);
    return leitura;
}

async function executarRequisicao<T>(caminho: string, metodo: string, dados?: unknown): Promise<T> {
    const controle = new AbortController();
    // Dá tempo para o serviço iniciar no Render, sem repetir gravações automaticamente.
    const limite = setTimeout(() => controle.abort(), 75000);
    try {
        const resposta = await fetch(`${API_BASE.replace(/\/$/, '')}${caminho}`, {
            method: metodo,
            headers: {
                Accept: 'application/json',
                ...(dados !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...(sessaoAtual?.token ? { Authorization: `Bearer ${sessaoAtual.token}` } : {}),
            },
            body: dados === undefined ? undefined : JSON.stringify(dados),
            signal: controle.signal,
        });
        const texto = await resposta.text();
        let conteudo: unknown;
        try {
            conteudo = texto ? JSON.parse(texto) : undefined;
        } catch {
            conteudo = undefined;

        }
        if (!resposta.ok) {
            const erro = conteudo as { mensagem?: unknown; message?: unknown } | undefined;
            const mensagem =
                resposta.status === 401
                    ? 'E-mail ou senha não conferem. Tente de novo.'
                    : resposta.status === 404
                        ? 'Esse registro não foi encontrado.'
                        : 'Não foi possível concluir agora. Aguarde um instante e tente novamente.';
            const mensagemServidor = typeof erro?.mensagem === 'string'
                ? erro.mensagem
                : typeof erro?.message === 'string' ? erro.message : '';
            throw new ErroApi(resposta.status >= 500 ? mensagem : mensagemServidor || mensagem, resposta.status);
        }
        return conteudo as T;

    } catch (erro) {
        if (erro instanceof ErroApi) throw erro;
        if (erro instanceof DOMException && erro.name === 'AbortError')
            throw new ErroApi(
                'O serviço está demorando para responder. A primeira conexão pode levar um pouco mais de tempo. Aguarde um instante e tente novamente.',
                408,
            );
        throw new ErroApi('Não foi possível carregar os dados. Confira sua conexão e tente de novo.', 0);
    } finally {
        clearTimeout(limite);
    }
}

const recursos: Record<Perfil, string> = {
    ofertante: 'ofertantes',
    organizacao: 'organizacoes',
    administrador: 'administradores',
};

export async function login(perfil: Perfil, dados: Credenciais): Promise<Sessao> {
    let retorno: PessoaApi;
    try {
        retorno = await requisicao<PessoaApi>(`/${recursos[perfil]}/login`, 'POST', dados);
    } catch (erro) {
        if (erro instanceof ErroApi && erro.status === 401) {
            const mensagem = perfil === 'administrador'
                ? 'Não foi possível entrar. Confira o e-mail e a senha do cadastro administrativo.'
                : 'Não foi possível entrar. Confira o e-mail, a senha e o perfil selecionado. Se ainda não tem conta, faça seu cadastro.';
            throw new ErroApi(mensagem, 401);
        }
        throw erro;
    }
    const falha = 'Não conseguimos concluir seu acesso agora. Aguarde um instante e tente novamente.';
    if (!retorno || typeof retorno !== 'object') throw new ErroApi(falha, 502);
    const id = perfil === 'ofertante' ? retorno.idOfertante
        : perfil === 'organizacao' ? retorno.idOrganizacao : retorno.idAdministrador;
    const nome = perfil === 'ofertante' ? retorno.nomeOfertante
        : perfil === 'organizacao' ? retorno.nomeOrganizacao : retorno.nomeAdministrador;
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0 || typeof nome !== 'string' || !nome.trim()
        || typeof retorno.email !== 'string' || !retorno.email.trim())
        throw new ErroApi(falha, 502);

    const pessoa = { id, nome, email: retorno.email };
    if (perfil === 'administrador') return { tipo: perfil, pessoa };
    const bairro = retorno.idBairro
        ? await requisicao<BairroApi>(`/bairros/${retorno.idBairro}`)
        : undefined;
    const participante = { ...pessoa, contato: retorno.contato || '', bairro: bairro?.nomeBairro || '', idBairro: retorno.idBairro || 0 };
    if (perfil === 'ofertante') return { tipo: perfil, pessoa: participante };
    return { tipo: perfil, pessoa: { ...participante, responsavel: retorno.nomeResponsavel || '' } };
}

export async function buscarBairros(): Promise<Bairro[]> {
    return listaApi<BairroApi>(await requisicao<unknown>('/bairros')).map(converterBairro);
}

async function carregarReferencias(): Promise<ReferenciasLote> {
    const [bairros, categorias, ofertantes] = await Promise.all([
        buscarBairros(), buscarCategorias(), requisicao<unknown>('/ofertantes'),
    ]);
    return {
        bairros, categorias,
        ofertantes: listaApi<PessoaApi>(ofertantes).map((pessoa) => converterOfertante(pessoa, bairros)),
    };
}

async function lerLotes(caminho: string): Promise<Lote[]> {
    const lotes = listaApi<LoteApi>(await requisicao<unknown>(caminho));
    if (!lotes.length) return [];
    const referencias = await carregarReferencias();
    return lotes.map((lote) => converterLote(lote, referencias));
}

async function lerReservas(caminho: string): Promise<Reserva[]> {
    const reservas = listaApi<ReservaApi>(await requisicao<unknown>(caminho));
    if (!reservas.length) return [];
    const [lotes, organizacoes] = await Promise.all([buscarLotes(), buscarOrganizacoes()]);
    return reservas.map((reserva) => converterReserva(reserva, lotes, organizacoes));
}

function dadosLoteJava(dados: DadosLote) {
    return {
        descricaoLote: dados.descricao, quantidade: dados.quantidade, unidade: dados.unidade,
        idCategoria: dados.categoriaId, dataPrazoRetirada: dados.prazoRetirada,
        idBairro: dados.idBairro, localRetirada: dados.local, idOfertante: dados.ofertanteId,
        imagemUrl: dados.imagem || null, ativo: dados.ativo === false ? 'N' : 'S',
    };
}

export const cadastrarOfertante = (dados: DadosCadastro) =>
    requisicao<PessoaApi>('/ofertantes', 'POST', {
        nomeOfertante: dados.nome,
        tipoOfertante: dados.tipoOfertante,
        idBairro: dados.idBairro,
        email: dados.email,
        senha: dados.senha,
        contato: dados.contato,
    });

export const cadastrarOrganizacao = (dados: DadosCadastro) =>
    requisicao<PessoaApi>('/organizacoes', 'POST', {
        nomeOrganizacao: dados.nome,
        nomeResponsavel: dados.responsavel,
        idBairro: dados.idBairro,
        email: dados.email,
        senha: dados.senha,
        contato: dados.contato,
    });

export const buscarLotes = () => lerLotes('/lotes');

export async function buscarLote(id: number): Promise<Lote> {
    const [lote, referencias] = await Promise.all([requisicao<LoteApi>(`/lotes/${id}`), carregarReferencias()]);
    return converterLote(lote, referencias);
}

export async function publicarLote(dados: DadosLote): Promise<Lote> {
    const referencias = await carregarReferencias();
    return converterLote(await requisicao<LoteApi>('/lotes', 'POST', dadosLoteJava(dados)), referencias);
}

export async function editarLote(id: number, dados: DadosLote): Promise<Lote> {
    const referencias = await carregarReferencias();
    return converterLote(await requisicao<LoteApi>(`/lotes/${id}`, 'PUT', dadosLoteJava(dados)), referencias);
}

export const excluirLote = (id: number) => requisicao<void>(`/lotes/${id}`, 'DELETE');

export const buscarMeusLotes = (id: number) => lerLotes(`/ofertantes/${id}/lotes`);

export const buscarReservasLote = (id: number) => lerReservas(`/lotes/${id}/reservas`);

export const buscarReservas = () => lerReservas('/reservas');

export async function buscarResumoAdmin() {
    const [estatisticas, reservas] = await Promise.all([buscarEstatisticas(), buscarReservas()]);
    return { estatisticas, reservas };
}

export const buscarMinhasReservas = (id: number) => lerReservas(`/organizacoes/${id}/reservas`);

export const reservarLote = (dados: DadosReserva) => requisicao<ReservaApi>('/reservas', 'POST', {
    idLote: dados.loteId, idOrganizacao: dados.organizacaoId, quantidadeReservada: dados.quantidade,
});

export const confirmarRetirada = (id: number, quantidade: number) =>
    requisicao<ReservaApi>(`/reservas/${id}`, 'PUT', { statusReserva: 'retirada', quantidadeRetirada: quantidade });

export const cancelarReserva = (id: number) => requisicao<void>(`/reservas/${id}`, 'DELETE');

export async function buscarCategorias(): Promise<Categoria[]> {
    return listaApi<CategoriaApi>(await requisicao<unknown>('/categorias')).map(converterCategoria);
}

export const criarCategoria = async (nome: string) =>
    converterCategoria(await requisicao<CategoriaApi>('/categorias', 'POST', { nomeCategoria: nome }));

export const editarCategoria = async (id: number, nome: string, descricao?: string) =>
    converterCategoria(await requisicao<CategoriaApi>(`/categorias/${id}`, 'PUT', { nomeCategoria: nome, descricaoCategoria: descricao }));

export const excluirCategoria = (id: number) => requisicao<void>(`/categorias/${id}`, 'DELETE');

export async function buscarOfertantes(): Promise<Ofertante[]> {
    const [pessoas, bairros] = await Promise.all([requisicao<unknown>('/ofertantes'), buscarBairros()]);
    return listaApi<PessoaApi>(pessoas).map((pessoa) => converterOfertante(pessoa, bairros));
}
export async function buscarOrganizacoes(): Promise<Organizacao[]> {
    const [pessoas, bairros] = await Promise.all([requisicao<unknown>('/organizacoes'), buscarBairros()]);
    return listaApi<PessoaApi>(pessoas).map((pessoa) => converterOrganizacao(pessoa, bairros));
}
export const excluirOfertante = (id: number) => requisicao<void>(`/ofertantes/${id}`, 'DELETE');
export const excluirOrganizacao = (id: number) => requisicao<void>(`/organizacoes/${id}`, 'DELETE');



export const enviarContato = (dados: DadosContato) => requisicao<void>('/contatos', 'POST', {
    nomeRemetente: dados.nome, email: dados.email, assunto: dados.assunto, mensagem: dados.mensagem,
});
export const alterarEmail = (perfil: Perfil, id: number, email: string, senhaAtual: string) =>
    requisicao<void>(`/${recursos[perfil]}/${id}/email`, 'PUT', { email, senhaAtual });
export const alterarSenha = (perfil: Perfil, id: number, senhaAtual: string, novaSenha: string) =>
    requisicao<void>(`/${recursos[perfil]}/${id}/senha`, 'PUT', { senhaAtual, novaSenha });

export async function buscarEstatisticas(): Promise<Estatisticas> {
    const dados = await requisicao<Estatisticas>('/estatisticas');
    if (!dados || ![dados.quilos, dados.lotes, dados.organizacoes, dados.concluidas]
        .every((numero) => typeof numero === 'number' && Number.isFinite(numero) && numero >= 0))
        throw new ErroApi('Não foi possível carregar os números da comunidade. Tente novamente.', 502);
    return dados;
}
