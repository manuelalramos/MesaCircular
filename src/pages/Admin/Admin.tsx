import { useState } from 'react';
import Icone from '../../components/Icone/Icone';
import EstatisticasAdmin from './sections/EstatisticasAdmin.tsx';
import LotesAdmin from './sections/LotesAdmin.tsx';
import CategoriasAdmin from './sections/CategoriasAdmin.tsx';
import CadastrosAdmin from './sections/CadastrosAdmin.tsx';

const abas = [
    { id: 'estatisticas', nome: 'Estatísticas' },
    { id: 'lotes', nome: 'Lotes' },
    { id: 'categorias', nome: 'Categorias' },
    { id: 'cadastros', nome: 'Cadastros' },
] as const;
export default function Admin() {
    const [aba, setAba] = useState<(typeof abas)[number]['id']>('estatisticas');
    return (
        <section>
            <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[2px] text-vinho">
                <Icone nome="escudo" className="h-4 w-4" />
                Administração
            </p>
            <h1 className="titulo-secao">
                Cuidar de toda <span className="destaque-laranja">a mesa.</span>
            </h1>
            <p className="mt-4 text-sm leading-7 text-tinta/65">
                Acompanhe o impacto e mantenha as conexões da comunidade em dia.
            </p>
            <div className="my-8 flex flex-wrap gap-2" role="group" aria-label="Seções da administração">
                {abas.map((item) => (
                    <button
                        key={item.id}
                        aria-pressed={aba === item.id}
                        onClick={() => setAba(item.id)}
                        className={`aba ${aba === item.id ? 'bg-vinho text-creme' : 'bg-linha/60 text-tinta/65'}`}
                    >
                        {item.nome}
                    </button>
                ))}
            </div>
            {aba === 'estatisticas' && <EstatisticasAdmin />}
            {aba === 'lotes' && <LotesAdmin />}
            {aba === 'categorias' && <CategoriasAdmin />}
            {aba === 'cadastros' && <CadastrosAdmin />}
        </section>
    );
}