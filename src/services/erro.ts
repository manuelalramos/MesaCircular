
export class ErroApi extends Error {
    status: number;
    constructor(mensagem: string, status = 400) {
        super(mensagem);
        this.name = 'ErroApi';
        this.status = status;
    }
}

export function mensagemErro(erro: unknown): string {
    return erro instanceof Error ? erro.message : 'Nâo deu certo dessa vez. Temte de novo.';
}