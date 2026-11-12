import type { Lote, Reserva, StatusLote } from '../types/index.ts';


export function statusDoLote(lote: Lote, agora = Date.now()): StatusLote {
    if (lote.status === 'RETIRADO') return 'RETIRADO';
    if (new Date(lote.prazoRetirada).getTime() <= agora || lote.status === 'VENCIDO') return 'VENCIDO';
    if (lote.saldo <= 0) return 'RESERVADO';
    return lote.status;
}


export function validarReserva(lote: Lote, quantidade: number, jaReservou = false): string {
    if (jaReservou) return 'Sua organização já tem uma reserva ativa neste lote.';
    if (statusDoLote(lote) !== 'DISPONIVEL' || lote.saldo <= 0)
        return 'Este lote não está mais disponível para reserva.';
    if (!Number.isFinite(quantidade) || quantidade <= 0) return 'Informe uma quantidade maior que zero.';
    if (quantidade > lote.saldo) return `Você pode reservar até ${lote.saldo} ${lote.unidade}.`;
    if (lote.unidade !== 'kg' && !Number.isInteger(quantidade))
        return 'Para esta unidade, use uma quantidade inteira.';
    return '';
}

export function quilosRetirados(reservas: Reserva[]): number {
    return reservas
        .filter((r) => r.status === 'RETIRADA' && r.lote.unidade === 'kg')
        .reduce((total, reserva) => total + reserva.quantidade, 0);
}

export function formatarData(data: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(data));
}

export function formatarNumero(numero: number): string {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(numero);
}

export function dataParaCampo(data: string): string {
    const valor = new Date(data);
    return new Date(valor.getTime() - valor.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function validarNovaSenha(senhaAtual: string, novaSenha: string, confirmacao: string): string {
    if (!senhaAtual) return 'Informe sua senha atual.';
    if (novaSenha.length < 6) return 'A nova senha precisa ter pelo menos 6 caracteres.';
    if (novaSenha === senhaAtual) return 'Escolha uma senha diferente da atual.';
    if (novaSenha !== confirmacao) return 'As novas senhas não conferem.';
    return '';
}
