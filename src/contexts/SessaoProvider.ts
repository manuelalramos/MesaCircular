import { startTransition, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Credenciais, Perfil, Sessao } from '../types';
import { definirSessaoApi, login } from '../services/api';
import { SessaoContext } from './SessaoContext';

export default function SessaoProvider({ children }: { children: ReactNode }) {
    const [sessao, setSessao] = useState<Sessao | null>(null);
    const navegar = useNavigate();
    async function entrar(perfil: Perfil, dados: Credenciais) {
        const novaSessao = await login(perfil, dados);
        definirSessaoApi(novaSessao);
        setSessao(novaSessao);
        return novaSessao;
    }
    function sair() {
        definirSessaoApi(null);
        // Todos os botões de sair passam por aqui e voltam para a Home.
        startTransition(() => {
            setSessao(null);
            navegar('/', { replace: true });
        });
    }
    function atualizarEmail(email: string) {
        if (!sessao) return;
        const atualizada = { ...sessao, pessoa: { ...sessao.pessoa, email } } as Sessao;
        definirSessaoApi(atualizada);
        setSessao(atualizada);
    }
    return (
        <SessaoContext.Provider value={{ sessao, entrar, sair, atualizarEmail }}>
    {children}
</SessaoContext.Provider>
 );
}
