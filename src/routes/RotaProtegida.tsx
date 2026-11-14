import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useSessao from '../hooks/useSessao';
import type { Perfil } from '../types';

export default function RotaProtegida({ perfis }: { perfis: Perfil[] }) {
    const { sessao } = useSessao();
    const localizacao = useLocation();
    if (!sessao)
        return (
            <Navigate
                to={
                    perfis.length === 1 && perfis[0] === 'administrador'
                        ? '/login?admin=1'
                        : `/login?tipo=${perfis[0]}`
                }
                state={{ de: localizacao.pathname }}
                replace
            />
        );
    if (!perfis.includes(sessao.tipo))
        return <Navigate to={sessao.tipo === 'administrador' ? '/admin' : '/app'} replace />;
    return <Outlet />;
}
