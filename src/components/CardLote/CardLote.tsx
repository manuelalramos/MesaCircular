import { Link } from 'react-router-dom';
import type { Lote } from '../../types';
import { formatarData, formatarNumero, statusDoLote } from '../../services/regras';
import TagStatus from '../TagStatus/TagStatus';
import Icone from '../Icone/Icone';
import Imagem from '../Imagem/Imagem';
// import { imagemDoLote } from '../../data/imagens';

export default function CardLote({ lote }: { lote: Lote }) {
    return (
        <article className="card-lote group flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-linha bg-[#FFFDF8]">
            <div className="relative h-36 overflow-hidden sm:h-40">
                <Imagem
                    // src={imagemDoLote(lote)}
                    alt={lote.descricao}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    loading="lazy"
                />
                <div className="absolute left-4 top-4">
                    <TagStatus status={statusDoLote(lote)} />
                </div>
                <span className="absolute bottom-3 right-3 rounded-full bg-creme/95 px-3 py-1.5 text-xs font-semibold text-verde-escuro">
                    {formatarNumero(lote.saldo)} {lote.unidade}
                </span>
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[1.2px] text-verde">
                    {lote.categoria.nome}
                </p>
                <h3 className="text-lg font-semibold leading-7 text-verde-escuro">{lote.descricao}</h3>
                <p className="mt-1 text-xs text-tinta/60">por {lote.ofertante.nome}</p>
                <div className="mb-5 mt-5 grid gap-2 text-xs text-tinta/70">
                    <p className="flex items-center gap-2">
                        <Icone nome="pin" className="h-4 w-4 text-verde" />
                        {lote.bairro}
                    </p>
                    <p className="flex items-center gap-2">
                        <Icone nome="relogio" className="h-4 w-4 text-verde" />
                        Retirar até {formatarData(lote.prazoRetirada)}
                    </p>
                </div>
                <Link
                    to={`/lotes/${lote.id}`}
                    className="link-seta mt-auto flex items-center justify-between border-t border-linha pt-4 text-sm font-semibold text-verde"
                >
                    Ver detalhes <Icone nome="seta" className="h-4 w-4" />
                    <span className="sr-only"> de {lote.descricao}</span>
                </Link>
            </div>
        </article>
    );
}
