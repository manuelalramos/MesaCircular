import type { StatusLote, StatusReserva } from '../../types';

const etiquetas = {
    DISPONIVEL: { texto: 'Disponível', cor: 'bg-[#E5EFDF] text-verde-escuro' },
    RESERVADO: { texto: 'Reservado', cor: 'bg-[#FBE5CE] text-[#793D13]' },
    RETIRADO: { texto: 'Retirado', cor: 'bg-[#F0DDE1] text-vinho' },
    VENCIDO: { texto: 'Vencido', cor: 'bg-[#F9DCE1] text-[#762C3B]' },
    ATIVA: { texto: 'Ativa', cor: 'bg-[#FBE5CE] text-[#793D13]' },
    RETIRADA: { texto: 'Retirada', cor: 'bg-[#F0DDE1] text-vinho' },
    CANCELADA: { texto: 'Cancelada', cor: 'bg-linha text-tinta' },
};

export default function TagStatus({ status }: { status: StatusLote | StatusReserva }) {
    const etiqueta = etiquetas[status];
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold ${etiqueta.cor}`}>

            {etiqueta.texto}
        </span>
    );
}
