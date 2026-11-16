export type Perfil = 'ofertante' | 'organizacao' | 'administrador';
export type TipoOfertante = 'feirante' | 'mercado' | 'produtor';
export type StatusLote = 'DISPONIVEL' | 'RESERVADO' | 'RETIRADO' | 'VENCIDO' | 'INATIVO';
export type StatusReserva = 'ATIVA' | 'RETIRADA' | 'CANCELADA';

export interface Ofertante {
    id: number;
    nome: string;
    email: string;
    contato: string;
    bairro: string;
    idBairro: number;
}

export interface Organizacao {
    id: number;
    nome: string;
    email: string;
    contato: string;
    bairro: string;
    responsavel: string;
    idBairro: number;
}

export interface Administrador {
    id: number;
    nome: string;
    email: string;
}

export type Sessao =
    | { tipo: 'ofertante'; pessoa: Ofertante; token?: string }
    | { tipo: 'organizacao'; pessoa: Organizacao; token?: string }
    | { tipo: 'administrador'; pessoa: Administrador; token?: string };

export interface Categoria {
    id: number;
    nome: string;
    descricao?: string;
}

export interface Lote {
    id: number;
    descricao: string;
    quantidade: number;
    saldo: number;
    unidade: string;
    categoria: Categoria;
    prazoRetirada: string;
    bairro: string;
    local: string;
    status: StatusLote;
    ofertante: Ofertante;
    imagem?: string;
    criadoEm: string;
    idBairro: number;
    ativo: boolean;
}

export interface Reserva {
    id: number;
    lote: Lote;
    organizacao: Organizacao;
    quantidade: number;
    quantidadeRetirada: number;
    status: StatusReserva;
    criadaEm: string;
}

export interface Credenciais {
    email: string;
    senha: string;
}

export interface DadosCadastro extends Credenciais {
    nome: string;
    contato: string;
    idBairro: number;
    tipoOfertante?: TipoOfertante;
    responsavel?: string;
}

export interface Bairro {
    id: number;
    nome: string;
    cidade: string;
    uf: string;
}

export interface DadosLote {
    descricao: string;
    quantidade: number;
    unidade: string;
    categoriaId: number;
    prazoRetirada: string;
    idBairro: number;
    local: string;
    ofertanteId: number;
    imagem?: string;
    ativo?: boolean;
}

export interface DadosReserva {
    loteId: number;
    organizacaoId: number;
    quantidade: number;
}

export interface DadosContato {
    nome: string;
    email: string;
    assunto: string;
    mensagem: string;
}

export interface Estatisticas {
    quilos: number;
    lotes: number;
    organizacoes: number;
    concluidas: number;
}
