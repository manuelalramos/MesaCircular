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
} from '../types';

import { ErroApi } from './erro.ts';

export const API_BASE = import.meta.env?.VITE_API_BASE || 'https://mesacircular-api.onrender.com'; // api atualizada
let sessaoAtual: Sessao | null = null;
export function definirSessaoApi(sessao: Sessao | null) {
    sessaoAtual = sessao;
}
async function requisicao<T>(caminho: string, metodo = 'GET', dados?: unknown): Promise<T> {
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
    const participante = { ...pessoa, contato: retorno.contato || '', bairro: bairro?.nomeBairro || '' };
    if (perfil === 'ofertante') return { tipo: perfil, pessoa: participante };
    return { tipo: perfil, pessoa: { ...participante, responsavel: retorno.nomeResponsavel || '' } };
}

interface PessoaApi {
    idOfertante?: number;
    nomeOfertante?: string;
    idOrganizacao?: number;
    nomeOrganizacao?: string;
    idAdministrador?: number;
    nomeAdministrador?: string;
    email: string;
    contato?: string;
    idBairro?: number;
    nomeResponsavel?: string;
}

interface BairroApi {
    idBairro: number;
    nomeBairro: string;
    nomeCidade: string;
    uf: string;
}

export async function buscarBairros(): Promise<Bairro[]> {
    const bairros = await requisicao<BairroApi[]>('/bairros');
    return bairros.map((bairro) => ({
        id: bairro.idBairro,
        nome: bairro.nomeBairro,
        cidade: bairro.nomeCidade,
        uf: bairro.uf,
    }));
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

export const buscarLotes = () => requisicao<Lote[]>('/lotes');

export const buscarLote = (id: number) => requisicao<Lote>(`/lotes/${id}`);

export const publicarLote = (dados: DadosLote) => requisicao<Lote>('/lotes', 'POST', dados);

export const editarLote = (id: number, dados: DadosLote) => requisicao<Lote>(`/lotes/${id}`, 'PUT', dados);

export const excluirLote = (id: number) => requisicao<void>(`/lotes/${id}`, 'DELETE');

export const buscarMeusLotes = (id: number) => requisicao<Lote[]>(`/ofertantes/${id}/lotes`);

export const buscarReservasLote = (id: number) => requisicao<Reserva[]>(`/lotes/${id}/reservas`);

export const buscarReservas = () => requisicao<Reserva[]>('/reservas');

export const buscarMinhasReservas = (id: number) => requisicao<Reserva[]>(`/organizacoes/${id}/reservas`);

export const reservarLote = (dados: DadosReserva) => requisicao<Reserva>('/reservas', 'POST', dados);

export const confirmarRetirada = (id: number) =>
    requisicao<Reserva>(`/reservas/${id}`, 'PUT', { status: 'RETIRADA' });

export const cancelarReserva = (id: number) => requisicao<void>(`/reservas/${id}`, 'DELETE');

export const buscarCategorias = () => requisicao<Categoria[]>('/categorias');

export const criarCategoria = (nome: string) => requisicao<Categoria>('/categorias', 'POST', { nome });

export const editarCategoria = (id: number, nome: string) =>
    requisicao<Categoria>(`/categorias/${id}`, 'PUT', { nome });

export const excluirCategoria = (id: number) => requisicao<void>(`/categorias/${id}`, 'DELETE');

export const buscarOfertantes = () => requisicao<Ofertante[]>('/ofertantes');
export const buscarOrganizacoes = () => requisicao<Organizacao[]>('/organizacoes');
export const excluirOfertante = (id: number) => requisicao<void>(`/ofertantes/${id}`, 'DELETE');
export const excluirOrganizacao = (id: number) => requisicao<void>(`/organizacoes/${id}`, 'DELETE');



export const enviarContato = (dados: DadosContato) => requisicao<void>('/contatos', 'POST', dados);
export const alterarEmail = (perfil: Perfil, id: number, email: string, senhaAtual: string) =>
    requisicao<void>(`/${recursos[perfil]}/${id}/email`, 'PUT', { email, senhaAtual });
export const alterarSenha = (perfil: Perfil, id: number, senhaAtual: string, novaSenha: string) =>
    requisicao<void>(`/${recursos[perfil]}/${id}/senha`, 'PUT', { senhaAtual, novaSenha });
