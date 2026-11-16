import { createContext } from 'react';
import type { Credenciais, Perfil, Sessao } from '../types';

export interface DadosSessao {
    sessao: Sessao | null;
    entrar: (perfil: Perfil, dados: Credenciais) => Promise<Sessao>;
    sair: () => void;
    atualizarEmail: (email: string) => void;
}

export const SessaoContext = createContext<DadosSessao | undefined>(undefined);