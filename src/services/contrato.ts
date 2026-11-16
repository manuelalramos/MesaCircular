import type { Bairro, Categoria, Lote, Ofertante, Organizacao, Reserva, StatusLote, StatusReserva } from '../types';
import { ErroApi } from './erro.ts';

export interface BairroApi {
    idBairro: number;
    nomeBairro: string;
    nomeCidade: string;
    uf: string;
}

export interface PessoaApi {
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
    ativo?: string;
}

export interface CategoriaApi {
    idCategoria: number;
    nomeCategoria: string;
    descricaoCategoria?: string;
}

export interface LoteApi {
    idLote: number;
    idOfertante: number;
    idBairro: number;
    idCategoria: number | null;
    descricaoLote: string;
    quantidade: number;
    saldo: number;
    unidade: string;
    localRetirada: string;
    dataPublicacao: string;
    dataPrazoRetirada: string;
    statusLote: string;
    ativo: string;
    imagemUrl?: string;
}

export interface ReservaApi {
    idReserva: number;
    idLote: number;
    idOrganizacao: number;
    quantidadeReservada: number;
    quantidadeRetirada: number | null;
    statusReserva: string;
    dataReserva: string;
}

const falha = 'Não foi possível ler os dados recebidos. Atualize a página ou tente novamente em instantes.';

export function listaApi<T>(dados: unknown): T[] {
    if (!Array.isArray(dados) || dados.some((item) => !item || typeof item !== 'object' || Array.isArray(item)))
        throw new ErroApi(falha, 502);
    return dados as T[];
}

function idValido(id: unknown): number {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) throw new ErroApi(falha, 502);
    return id;
}

function numeroValido(numero: unknown): number {
    if (typeof numero !== 'number' || !Number.isFinite(numero) || numero < 0) throw new ErroApi(falha, 502);
    return numero;
}

export function converterBairro(bairro: BairroApi): Bairro {
    return { id: idValido(bairro.idBairro), nome: bairro.nomeBairro || 'Bairro não informado', cidade: bairro.nomeCidade || '', uf: bairro.uf || '' };
}

export function converterCategoria(categoria: CategoriaApi): Categoria {
    return { id: idValido(categoria.idCategoria), nome: categoria.nomeCategoria || 'Categoria não informada', descricao: categoria.descricaoCategoria || undefined };
}

export function converterOfertante(pessoa: PessoaApi, bairros: Bairro[]): Ofertante {
    return {
        id: idValido(pessoa.idOfertante), nome: pessoa.nomeOfertante || 'Ofertante não informado',
        email: pessoa.email || '', contato: pessoa.contato || '', idBairro: pessoa.idBairro || 0,
        bairro: bairros.find((bairro) => bairro.id === pessoa.idBairro)?.nome || 'Bairro não informado',
    };
}

export function converterOrganizacao(pessoa: PessoaApi, bairros: Bairro[]): Organizacao {
    return {
        id: idValido(pessoa.idOrganizacao), nome: pessoa.nomeOrganizacao || 'Organização não informada',
        email: pessoa.email || '', contato: pessoa.contato || '', idBairro: pessoa.idBairro || 0,
        bairro: bairros.find((bairro) => bairro.id === pessoa.idBairro)?.nome || 'Bairro não informado',
        responsavel: pessoa.nomeResponsavel || '',
    };
}

export interface ReferenciasLote {
    bairros: Bairro[];
    categorias: Categoria[];
    ofertantes: Ofertante[];
}

export function converterLote(lote: LoteApi, referencias: ReferenciasLote): Lote {
    const status = lote.ativo === 'N' ? 'INATIVO' : lote.statusLote?.toUpperCase();
    if (!['DISPONIVEL', 'RESERVADO', 'RETIRADO', 'VENCIDO', 'INATIVO'].includes(status)) throw new ErroApi(falha, 502);
    const ofertante = referencias.ofertantes.find((pessoa) => pessoa.id === lote.idOfertante);
    return {
        id: idValido(lote.idLote), descricao: lote.descricaoLote || 'Lote sem descrição',
        quantidade: numeroValido(lote.quantidade), saldo: numeroValido(lote.saldo), unidade: lote.unidade || '',
        prazoRetirada: lote.dataPrazoRetirada || '', criadoEm: lote.dataPublicacao || '',
        idBairro: lote.idBairro, bairro: referencias.bairros.find((bairro) => bairro.id === lote.idBairro)?.nome || 'Bairro não informado',
        categoria: referencias.categorias.find((categoria) => categoria.id === lote.idCategoria) || { id: lote.idCategoria || 0, nome: 'Sem categoria' },
        ofertante: ofertante || { id: lote.idOfertante, nome: 'Ofertante não disponível', email: '', contato: '', bairro: '', idBairro: 0 },
        local: lote.localRetirada || '', imagem: lote.imagemUrl || undefined,
        status: status as StatusLote, ativo: lote.ativo !== 'N',
    };
}

export function converterReserva(reserva: ReservaApi, lotes: Lote[], organizacoes: Organizacao[]): Reserva {
    const lote = lotes.find((item) => item.id === reserva.idLote);
    const organizacao = organizacoes.find((pessoa) => pessoa.id === reserva.idOrganizacao);
    const status = reserva.statusReserva?.toUpperCase();
    if (!lote || !organizacao || !['ATIVA', 'RETIRADA', 'CANCELADA'].includes(status)) throw new ErroApi(falha, 502);
    return {
        id: idValido(reserva.idReserva), lote, organizacao,
        quantidade: numeroValido(reserva.quantidadeReservada),
        quantidadeRetirada: reserva.quantidadeRetirada == null ? 0 : numeroValido(reserva.quantidadeRetirada),
        status: status as StatusReserva, criadaEm: reserva.dataReserva || '',
    };
}
