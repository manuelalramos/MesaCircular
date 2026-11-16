const acentos: Record<string, string> = {
    nao: 'não',
    sao: 'são',
    ja: 'já',
    obrigatorio: 'obrigatório',
    obrigatoria: 'obrigatória',
    obrigatorios: 'obrigatórios',
    obrigatorias: 'obrigatórias',
    invalido: 'inválido',
    invalida: 'inválida',
    invalidos: 'inválidos',
    invalidas: 'inválidas',
    organizacao: 'organização',
    organizacoes: 'organizações',
    responsavel: 'responsável',
    requisicao: 'requisição',
    parametros: 'parâmetros',
    descricao: 'descrição',
    publicacao: 'publicação',
    referencia: 'referência',
    vinculos: 'vínculos',
    metodo: 'método',
    minimo: 'mínimo',
    maximo: 'máximo',
};

function acentuarMensagem(mensagem: string): string {
    const mensagensPublicas: Record<string, string> = {
        'Requisicao invalida: verifique o JSON e os parametros enviados': 'Não foi possível enviar os dados. Confira os campos e tente novamente.',
        'Rota nao encontrada': 'Este serviço não está disponível no momento. Tente novamente em instantes.',
        'Metodo HTTP nao suportado para esta rota': 'Não foi possível concluir esta ação agora. Tente novamente em instantes.',
        'Campos email, senha e perfil sao obrigatorios': 'Informe o e-mail, a senha e o perfil de acesso.',
        'Perfil invalido: use ofertante, organizacao ou administrador': 'Selecione um perfil de acesso válido.',
    };
    return (mensagensPublicas[mensagem] || mensagem)
        .replace(/\be (?=obrigatori[oa]s?\b)/gi, 'é ')
        .replace(/\b[a-z]+\b/gi, (palavra) => {
            const corrigida = acentos[palavra.toLowerCase()];
            if (!corrigida) return palavra;
            return palavra[0] === palavra[0].toUpperCase()
                ? corrigida[0].toUpperCase() + corrigida.slice(1)
                : corrigida;
        });
}

export class ErroApi extends Error {
    status: number;
    constructor(mensagem: string, status = 400) {
        super(acentuarMensagem(mensagem));
        this.name = 'ErroApi';
        this.status = status;
    }
}

export function mensagemErro(erro: unknown): string {
    return erro instanceof Error ? acentuarMensagem(erro.message) : 'Não deu certo dessa vez. Tente de novo.';
}
