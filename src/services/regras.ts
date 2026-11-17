import type { Lote, Reserva, StatusLote } from '../types/index.ts';


function instanteDaData(data: string): number {
    // O Java envia LocalDateTime no horário de São Paulo, sem indicar o fuso.
    const local = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(data);
    return new Date(local ? `${data}-03:00` : data).getTime();
}

export function statusDoLote(lote: Lote, agora = Date.now()): StatusLote {
    if (lote.status === 'INATIVO' || lote.ativo === false) return 'INATIVO';
    if (lote.status === 'RETIRADO') return 'RETIRADO';
    if (instanteDaData(lote.prazoRetirada) <= agora || lote.status === 'VENCIDO') return 'VENCIDO';
    if (lote.saldo <= 0) return 'RESERVADO';
    return lote.status;
}

export function prazoDivergente(lote: Lote, agora = Date.now()): boolean {
    return lote.ativo && lote.status === 'VENCIDO' && instanteDaData(lote.prazoRetirada) > agora;
}


export function validarReserva(lote: Lote, quantidade: number, jaReservou = false): string {
    if (jaReservou) return 'Sua organização já tem uma reserva ativa neste lote.';
    if (statusDoLote(lote) !== 'DISPONIVEL' || lote.saldo <= 0)
        return 'Este lote não está mais disponível para reserva.';
    if (!Number.isFinite(quantidade) || quantidade <= 0) return 'Informe uma quantidade maior que zero.';
    if (quantidade > lote.saldo) return `Você pode reservar até ${lote.saldo} ${lote.unidade}.`;
    if (!['kg', 'l'].includes(lote.unidade) && !Number.isInteger(quantidade))
        return 'Para esta unidade, use uma quantidade inteira.';
    return '';
}

export function quilosRetirados(reservas: Reserva[]): number {
    return reservas
        .filter((r) => r.status === 'RETIRADA' && r.lote.unidade === 'kg')
        .reduce((total, reserva) => total + reserva.quantidadeRetirada, 0);
}

export function formatarData(data: string): string {
    const valor = new Date(instanteDaData(data));
    if (!Number.isFinite(valor.getTime())) return 'Data não informada';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
    }).format(valor);
}

export function formatarNumero(numero: number): string {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(numero);
}

export function dataParaCampo(data: string): string {
    const valor = new Date(instanteDaData(data));
    if (!Number.isFinite(valor.getTime())) return '';
    const partes = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(valor);
    const parte = (tipo: string) => partes.find((item) => item.type === tipo)?.value;
    return `${parte('year')}-${parte('month')}-${parte('day')}T${parte('hour')}:${parte('minute')}`;
}

export function formatarQuantidade(quantidade: number, unidade: string): string {
    const nomes: Record<string, [string, string]> = {
        kg: ['kg', 'kg'], l: ['l', 'l'], un: ['unidade', 'unidades'],
        cx: ['caixa', 'caixas'], pct: ['pacote', 'pacotes'],
    };
    return `${formatarNumero(quantidade)} ${nomes[unidade]?.[quantidade === 1 ? 0 : 1] || unidade}`;
}

export function resumirQuantidades(reservas: Reserva[]) {
    const totais = new Map<string, { unidade: string; reservada: number; retirada: number }>();
    for (const reserva of reservas) {
        if (reserva.status === 'CANCELADA') continue;
        const unidade = reserva.lote.unidade;
        const total = totais.get(unidade) || { unidade, reservada: 0, retirada: 0 };
        if (reserva.status === 'ATIVA') total.reservada += reserva.quantidade;
        if (reserva.status === 'RETIRADA') total.retirada += reserva.quantidadeRetirada;
        totais.set(unidade, total);
    }
    return [...totais.values()].sort((a, b) => a.unidade.localeCompare(b.unidade));
}

export function validarNovaSenha(senhaAtual: string, novaSenha: string, confirmacao: string): string {
    if (!senhaAtual) return 'Informe sua senha atual.';
    if (novaSenha.length < 6) return 'A nova senha precisa ter pelo menos 6 caracteres.';
    if (novaSenha === senhaAtual) return 'Escolha uma senha diferente da atual.';
    if (novaSenha !== confirmacao) return 'As novas senhas não conferem.';
    return '';
}

export function validarLinkImagem(valor: string): string {
    const link = valor.trim();
    if (!link) return '';
    if (link.length > 500) return 'O link da foto deve ter no máximo 500 caracteres.';
    try {
        const endereco = new URL(link);
        if (!/^https?:\/\//i.test(link) || !endereco.hostname || endereco.username || endereco.password)
            return 'Informe um link público de imagem começando com https:// ou http://.';
    } catch {
        return 'Informe um link válido para a foto.';
    }
    return '';
}

export function prazoNoFuturo(prazo: string, agora = Date.now()): boolean {
    const data = instanteDaData(prazo);
    return Number.isFinite(data) && data > agora;
}

export function validarPrazoRetirada(prazo: string, lote?: Lote, administrador = false, agora = Date.now()): string {
    const instante = instanteDaData(prazo);
    if (!Number.isFinite(instante)) return 'Informe uma data e um horário válidos.';
    if (lote && instante <= instanteDaData(lote.criadoEm))
        return 'O prazo de retirada precisa ser posterior à publicação do lote.';
    const mudouPrazo = lote && prazo !== dataParaCampo(lote.prazoRetirada);
    if ((!lote || (!administrador && mudouPrazo)) && !prazoNoFuturo(prazo, agora))
        return 'Escolha um prazo no futuro.';
    return '';
}
