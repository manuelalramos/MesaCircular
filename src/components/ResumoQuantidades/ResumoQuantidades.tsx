import { formatarNumero } from '../../services/regras';

interface ResumoQuantidadesProps {
    titulo: string;
    descricao: string;
    quantidades: { unidade: string; quantidade: number }[];
    vazio: string;
}

const unidades: Record<string, string> = {
    kg: 'Quilos (kg)', l: 'Litros (l)', un: 'Unidades', cx: 'Caixas', pct: 'Pacotes',
};

export default function ResumoQuantidades({ titulo, descricao, quantidades, vazio }: ResumoQuantidadesProps) {
    const positivas = quantidades.filter((total) => total.quantidade > 0);
    return (
        <div className="painel">
            <h2 className="text-lg font-semibold text-verde-escuro">{titulo}</h2>
            <p className="mt-2 text-xs leading-6 text-tinta/65">{descricao}</p>
            {positivas.length ? (
                <dl className="mt-5 grid grid-cols-2 gap-3">
                    {positivas.map((total) => (
                        <div key={total.unidade} className="min-w-0 rounded-2xl bg-verde/5 p-4">
                            <dt className="text-xs font-medium text-tinta/65">{unidades[total.unidade] || total.unidade}</dt>
                            <dd className="mt-2 break-words text-2xl font-bold text-verde-escuro">{formatarNumero(total.quantidade)}</dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className="mt-5 text-sm leading-7 text-tinta/65">{vazio}</p>
            )}
        </div>
    );
}
