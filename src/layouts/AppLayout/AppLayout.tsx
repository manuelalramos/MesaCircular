import { Link, NavLink, Outlet } from 'react-router-dom';
import useSessao from '../../hooks/useSessao';
import Icone, { type NomeIcone } from '../../components/Icone/Icone';

export default function AppLayout() {
    
    const { sessao, sair } = useSessao();
    const administrador = sessao?.tipo === 'administrador';
    const links: { para: string; nome: string; icone: NomeIcone }[] = administrador
        ? [{ para: '/admin', nome: 'Portal admin', icone: 'escudo' }]
        : sessao?.tipo === 'ofertante'
          ? [
                { para: '/app', nome: 'Meu resumo', icone: 'grafico' },
                { para: '/app/publicar', nome: 'Publicar lote', icone: 'mais' },
                { para: '/app/meus-lotes', nome: 'Meus lotes', icone: 'caixa' },
            ]
          : [
                { para: '/app', nome: 'Meu resumo', icone: 'grafico' },
                { para: '/lotes', nome: 'Encontrar alimentos', icone: 'busca' },
                { para: '/app/minhas-reservas', nome: 'Minhas reservas', icone: 'saco' },
            ];
    links.push({ para: '/app/conta', nome: 'Minha conta', icone: 'conta' });

    return (
        <div className="pb-16">
            <div className={`${administrador ? 'bg-vinho' : 'bg-verde-escuro'} text-creme`}>
                <div className="container-page flex flex-wrap items-center justify-between gap-5 py-6">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-amarelo">
                            {administrador
                                ? 'Administração'
                                : `Meu espaço · ${sessao?.tipo === 'ofertante' ? 'Ofertante' : 'Organização'}`}
                        </p>
                        <p className="mt-1 text-sm">{sessao?.pessoa.nome}</p>
                    </div>
                    <div className="flex gap-5 text-xs">
                        <Link to="/" className="footer-link !text-xs">
                            <Icone nome="casa" className="h-4 w-4" />
                            Voltar ao site
                        </Link>
                        <button className="footer-link !text-xs" onClick={sair}>
                            <Icone nome="sair" className="h-4 w-4" />
                            Sair
                        </button>
                    </div>
                </div>
            </div>
            <nav aria-label="Navegação do painel" className="border-b border-linha">
                <div className="container-page flex flex-wrap gap-x-6 gap-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.para}
                            end
                            to={link.para}
                            className={({ isActive }) =>
                                `link-seta border-b-2 py-4 text-xs font-semibold sm:text-sm ${isActive ? 'border-verde text-verde' : 'border-transparent text-tinta/60 hover:text-verde'}`
                            }
                        >
                            <Icone nome={link.icone} className="h-4 w-4" />
                            {link.nome}
                        </NavLink>
                    ))}
                </div>
            </nav>
            <div className="container-page pt-9 md:pt-12">
                <Outlet />
            </div>
        </div>
    );
}