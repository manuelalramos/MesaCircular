export type Perfil = 'ofertante' | 'organizacao' | 'administrador';
export type StatusLote = 'DISPONIVEL' | 'RESERVADO' | 'RETIRADO' | 'VENCIDO';
export type StatusReserva = 'ATIVA' | 'RETIRADA' | 'CANCELADA';

export interface Ofertante {
    id: number;
    nome: string;
    email: string;
    contato: string;
    bairro: string;
}

export interface Organizacao {
    id: number;
    nome: string;
    email: string;
    contato: string;
    bairro: string;
    responsavel: string;
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
}

export interface Reserva {
    id: number;
    lote: Lote;
    organizacao: Organizacao;
    quantidade: number;
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
    bairro: string;
    responsavel?: string;
}

export interface DadosLote {
    descricao: string;
    quantidade: number;
    unidade: string;
    categoriaId: number;
    prazoRetirada: string;
    bairro: string;
    local: string;
    ofertanteId: number;
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
