import { startTransition, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Credenciais, Perfil, Sessao } from '../types';
import { definirSessaoApi, login } from '../services/api';
import { SessaoContext } from './SessaoContext';
import { CHAVE_SESSAO, lerSessaoSalva, salvarSessao } from '../services/sessao';

export default function SessaoProvider({ children }: { children: ReactNode }) {
    const [sessao, setSessao] = useState<Sessao | null>(() => {
        const salva = lerSessaoSalva();
        definirSessaoApi(salva);
        return salva;
    });
    const navegar = useNavigate();
    useEffect(() => {
        function sincronizar(evento: StorageEvent) {
            if (evento.key !== CHAVE_SESSAO && evento.key !== null) return;
            const salva = lerSessaoSalva();
            definirSessaoApi(salva);
            setSessao(salva);
        }
        window.addEventListener('storage', sincronizar);
        return () => window.removeEventListener('storage', sincronizar);
    }, []);
    async function entrar(perfil: Perfil, dados: Credenciais) {
        const novaSessao = await login(perfil, dados);
        definirSessaoApi(novaSessao);
        salvarSessao(novaSessao);
        setSessao(novaSessao);
        return novaSessao;
    }
    function sair() {
        definirSessaoApi(null);
        salvarSessao(null);
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
        salvarSessao(atualizada);
        setSessao(atualizada);
    }
    return (
        <SessaoContext.Provider value={{ sessao, entrar, sair, atualizarEmail }}>
            {children}
        </SessaoContext.Provider>
    );
}
