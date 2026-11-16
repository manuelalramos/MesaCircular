import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useSessao from '../../hooks/useSessao';
import Logo from '../Logo/Logo';
import Icone from '../Icone/Icone';

const links = [
    { para: '/', nome: 'Início' },
    { para: '/lotes', nome: 'Lotes' },
    { para: '/sobre', nome: 'Sobre' },
    { para: '/integrantes', nome: 'Integrantes' },
    { para: '/faq', nome: 'FAQ' },
    { para: '/contato', nome: 'Contato' },
];

export default function Header() {
    const { sessao, sair } = useSessao();
    const perfil = sessao?.tipo === 'administrador' ? 'Administrador' : sessao?.tipo === 'organizacao' ? 'Organização' : 'Ofertante';
    const iniciais = sessao?.pessoa.nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
    const [aberto, setAberto] = useState(false);
    const cabecalho = useRef<HTMLElement>(null);
    useEffect(() => {
        function fechar(evento: KeyboardEvent) {
            if (evento.key === 'Escape') setAberto(false);
        }
        function clicarFora(evento: MouseEvent) {
            if (!cabecalho.current?.contains(evento.target as Node)) setAberto(false);
        }
        document.addEventListener('keydown', fechar);
        document.addEventListener('click', clicarFora);
        return () => {
            document.removeEventListener('keydown', fechar);
            document.removeEventListener('click', clicarFora);
        };
    }, []);

    return (
        <header
            ref={cabecalho}
            className="fixed inset-x-0 top-0 z-40 border-b border-linha bg-creme/95 backdrop-blur-md"
        >
            <a href="#conteudo" className="skip-link">
                Pular para o conteúdo
            </a>
            <div className="container-page flex h-20 items-center justify-between gap-6">
                <Logo />
                <nav aria-label="Navegação principal" className="hidden items-center gap-6 lg:flex">
                    {links.map((link) => (
                        <NavLink
                            end={link.para === '/'}
                            key={link.para}
                            to={link.para}
                            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-ativo' : ''}`}
                        >
                            {link.nome}
                        </NavLink>
                    ))}
                </nav>
                <div className="ml-auto flex items-center gap-3 lg:ml-0">
                    {sessao ? (
                        <>
                            <Link
                                className="botao-pequeno hidden bg-verde text-creme sm:inline-flex"
                                to={sessao.tipo === 'administrador' ? '/admin' : '/app'}
                            >
                                {sessao.tipo === 'administrador' ? 'Painel ADM' : 'Meu painel'} <Icone nome="diagonal" />
                            </Link>
                            <Link
                                to="/app/conta"
                                className="flex shrink-0 items-center gap-2 text-verde-escuro hover:text-verde"
                                aria-label={`Minha conta: ${sessao.pessoa.nome}, ${perfil}`}
                                title={`${sessao.pessoa.nome} · ${perfil}`}
                            >
                                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-creme ${sessao.tipo === 'administrador' ? 'bg-vinho' : 'bg-verde'}`}>
                                    {sessao.tipo === 'administrador' ? 'ADM' : iniciais}
                                </span>
                                <span className="hidden max-w-28 xl:block">
                                    <span className="block truncate text-xs font-semibold">{sessao.pessoa.nome.split(' ')[0]}</span>
                                    <span className="block text-[10px] text-tinta/60">{perfil}</span>
                                </span>
                            </Link>
                            <button
                                onClick={sair}
                                className="hidden p-2 text-verde-escuro sm:inline-flex"
                                aria-label="Sair da conta"
                            >
                                <Icone nome="sair" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link className="botao-pequeno botao-entrar" to="/login">
                                Entrar
                            </Link>
                            <Link to="/cadastro" className="botao-pequeno hidden bg-amarelo text-verde-escuro sm:inline-flex">
                                Faça parte <Icone nome="seta" className="h-3 w-3 text-xs" />
                            </Link>
                        </>
                    )}
                </div>
                <button
                    className="rounded-xl p-2.5 text-verde-escuro hover:bg-amarelo/30 lg:hidden"
                    aria-expanded={aberto}
                    aria-controls="menu-celular"
                    aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
                    onClick={() => setAberto(!aberto)}
                >
                    <Icone nome={aberto ? 'fechar' : 'menu'} />
                </button>
            </div>
            {aberto && (
                <nav
                    id="menu-celular"
                    aria-label="Navegação no celular"
                    className="menu-entrada container-page grid gap-1 border-t border-linha py-4 lg:hidden"
                >
                    {links.map((link) => (
                        <NavLink
                            key={link.para}
                            end={link.para === '/'}
                            to={link.para}
                            className="rounded-xl px-4 py-3 text-sm font-semibold text-verde-escuro hover:bg-verde/10"
                        >
                            {link.nome}
                        </NavLink>
                    ))}
                    {sessao ? (
                        <>
                            <p className="px-4 py-3 text-sm text-verde-escuro">
                                <strong>{sessao.pessoa.nome}</strong> · {perfil}
                            </p>
                            <Link
                                to={sessao.tipo === 'administrador' ? '/admin' : '/app'}
                                className="botao bg-verde text-creme"
                            >
                                {sessao.tipo === 'administrador' ? 'Painel ADM' : 'Meu painel'} <Icone nome="grafico" className="h-4 w-4" />
                            </Link>
                            <Link to="/app/conta" className="botao botao-contorno">
                                <Icone nome="conta" className="h-4 w-4" />
                                Minha conta
                            </Link>
                            <button
                                className="py-3 text-sm"
                                onClick={() => {
                                    sair();
                                    setAberto(false);
                                }}
                            >
                                <Icone nome="sair" className="mr-2 h-4 w-4" />
                                Sair da conta
                            </button>
                        </>
                    ) : (
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <Link className="botao botao-entrar" to="/login">
                                Entrar
                            </Link>
                            <Link className="botao bg-amarelo" to="/cadastro">
                                Faça parte
                            </Link>
                        </div>
                    )}
                </nav>
            )}
        </header>
    );
}
