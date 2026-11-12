import type {
    Administrador,
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

export const API_BASE = import.meta.env?.VITE_API_BASE || 'https://api-mesa-circular.onrender.com'; // TROCAR API
let sessaoAtual: Sessao | null = null;
export function definirSessaoApi(sessao: Sessao | null) {
    sessaoAtual = sessao;
}
async function requisicao<T>(caminho: string, metodo = 'GET', dados?: unknown): Promise<T> {
    const controle = new AbortController();
    // Demora do render
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
            const erro = conteudo as { mensagem?: string; message?: string } | undefined;
            const mensagem =
                resposta.status === 401
                    ? 'E-mail ou senha não conferem. Tente de novo.'
                    : resposta.status === 404
                        ? 'Esse registro não foi encontrado.'
                        : 'Não foi possível concluir. Tente de novo.';
            throw new ErroApi(erro?.mensagem || erro?.message || mensagem, resposta.status);
        }
        return conteudo as T;

    } catch (erro) {
        if (erro instanceof ErroApi) throw erro;
        if (erro instanceof DOMException && erro.name === 'AbortError')
            throw new ErroApi(
                'A API está demorando para responder. Ela pode estar iniciando no Render. Tente de novo.',
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
    type RetornoLogin =
        | Sessao
        | { pessoa: Ofertante | Organizacao | Administrador; token?: string }
        | Ofertante
        | Organizacao
        | Administrador;
    const retorno = await requisicao<RetornoLogin>(`/${recursos[perfil]}/login`, 'POST', dados);
    if (!retorno || typeof retorno !== 'object')
        throw new ErroApi('A API respondeu sem os dados do cadastro. Confira o contrato do login.', 502);
    // Aceita o cadastro direto ou conforme o DTO do Java.
    const pessoa = 'pessoa' in retorno ? retorno.pessoa : retorno;
    if (!pessoa?.id || !pessoa.nome)
        throw new ErroApi('A API respondeu sem os dados do cadastro. Confira o contrato do login.', 502);
    const token = 'token' in retorno ? retorno.token : undefined;

    if (perfil === 'ofertante') return { tipo: perfil, pessoa: pessoa as Ofertante, token };
    if (perfil === 'organizacao') return { tipo: perfil, pessoa: pessoa as Organizacao, token };
    return { tipo: perfil, pessoa, token };
}
export const cadastrarOfertante = (dados: DadosCadastro) =>
    requisicao<Ofertante>('/ofertantes', 'POST', dados);

export const cadastrarOrganizacao = (dados: DadosCadastro) =>
    requisicao<Organizacao>('/organizacoes', 'POST', dados);

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