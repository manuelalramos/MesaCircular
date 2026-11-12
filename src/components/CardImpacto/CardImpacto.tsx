import Icone, { type NomeIcone } from '../Icone/Icone';
interface CardImpactoProps {
    numero: string | number;
    rotulo: string;
    icone: NomeIcone;
    claro?: boolean;
}
export default function CardImpacto({ numero, rotulo, icone, claro = false }: CardImpactoProps) {
    return (
        <div className={`flex items-center gap-4 ${claro ? 'text-creme' : 'text-verde-escuro'}`}>
            <span
                className={`flex h-12 w-10 shrink-0 items-center justify-center ${claro ? 'text-amarelo' : 'text-verde'}`}
            >
                <Icone nome={icone} className="h-7 w-7" />
            </span>
            <div>
                <p className="text-3xl font-bold tracking-[-1px] md:text-4xl">{numero}</p>
                <p className={`mt-1 text-xs sm:text-sm ${claro ? 'text-creme/75' : 'text-tinta/65'}`}>
                    {rotulo}
                </p>
            </div>
        </div>
    );
}
