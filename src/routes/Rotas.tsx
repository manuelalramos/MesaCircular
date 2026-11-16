import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout/MainLayout';
import AppLayout from '../layouts/AppLayout/AppLayout';
import RotaProtegida from './RotaProtegida';
import Home from '../pages/Home/Home';
import Sobre from '../pages/Sobre/Sobre';
import Integrantes from '../pages/Integrantes/Integrantes';
import Faq from '../pages/FAQ/FAQ';
import Contato from '../pages/Contato/Contato';
import Login from '../pages/Login/Login';
import Cadastro from '../pages/Cadastro/Cadastro';
import Lotes from '../pages/Lotes/Lotes';
import LoteDetalhe from '../pages/Lotes/LoteDetalhado';
import Dashboard from '../pages/Dashboard/Dashboard';
import Publicar from '../pages/Publicar/Publicar';
import MeusLotes from '../pages/MeusLotes/MeusLotes';
import MinhasReservas from '../pages/MinhasReservas/MinhasReservas';
import Admin from '../pages/Admin/Admin';
import NotFound from '../pages/NotFound/NotFound';
import Conta from '../pages/Conta/Conta';

const titulos: Record<string, string> = {
    '/': 'Alimento bom merece uma nova mesa',
    '/lotes': 'Lotes disponíveis',
    '/sobre': 'Nossa história',
    '/faq': 'Perguntas frequentes',
    '/contato': 'Vamos conversar',
    '/integrantes': 'Nossa equipe',
    '/login': 'Entrar',
    '/cadastro': 'Faça parte',
    '/app': 'Meu resumo',
    '/app/publicar': 'Publicar lote',
    '/app/meus-lotes': 'Meus lotes',
    '/app/minhas-reservas': 'Minhas reservas',
    '/admin': 'Administração',
    '/app/conta': 'Minha conta',
};

export default function Rotas() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.title = `${titulos[pathname] || (pathname.startsWith('/lotes/') ? 'Detalhe do lote' : 'Página não encontrada')} · Mesa Circular`;
        document.getElementById('conteudo')?.focus({ preventScroll: true });
    }, [pathname]);
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="sobre" element={<Sobre />} />
                <Route path="integrantes" element={<Integrantes />} />
                <Route path="faq" element={<Faq />} />
                <Route path="contato" element={<Contato />} />
                <Route path="login" element={<Login />} />
                <Route path="cadastro" element={<Cadastro />} />
                <Route path="lotes" element={<Lotes />} />
                <Route path="lotes/:id" element={<LoteDetalhe />} />
                <Route element={<RotaProtegida perfis={['ofertante', 'organizacao', 'administrador']} />}>
                    <Route path="app" element={<AppLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="conta" element={<Conta />} />
                        <Route element={<RotaProtegida perfis={['ofertante']} />}>
                            <Route path="publicar" element={<Publicar />} />
                            <Route path="meus-lotes" element={<MeusLotes />} />
                        </Route>
                        <Route element={<RotaProtegida perfis={['organizacao']} />}>
                            <Route path="minhas-reservas" element={<MinhasReservas />} />
                        </Route>
                    </Route>
                </Route>
                <Route element={<RotaProtegida perfis={['administrador']} />}>
                    <Route element={<AppLayout />}>
                        <Route path="admin" element={<Admin />} />
                    </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}