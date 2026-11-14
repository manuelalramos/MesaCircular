import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AcessoLayout from '../../layouts/AcessoLayout/AcessoLayout';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import Feedback from '../../components/Feedback/Feedback';
import Icone from '../../components/Icone/Icone';
import useSessao from '../../hooks/useSessao';
import useAcao from '../../hooks/useAcao';
import type { Perfil } from '../../types';

export default function Login() {
    const [parametros, setParametros] = useSearchParams();
    const administrador = parametros.get('admin') === '1';
    const perfil: Perfil = administrador
        ? 'administrador'
        : parametros.get('tipo') === 'organizacao'
          ? 'organizacao'
          : 'ofertante';
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erros, setErros] = useState<Record<string, string>>({});
    const { sessao, entrar } = useSessao();
    const acao = useAcao();
    const navegar = useNavigate();
    const localizacao = useLocation();
    function destinoAposLogin(tipo: Perfil) {
        const destino = (localizacao.state as { de?: string } | null)?.de;
        if (destino === '/app/conta') return destino;
        if (tipo === 'administrador') return '/admin';
        if (destino && /^\/lotes\/[1-9]\d*$/.test(destino)) return destino;
        if (tipo === 'ofertante' && ['/app/publicar', '/app/meus-lotes'].includes(destino || ''))
            return destino!;
        if (tipo === 'organizacao' && destino === '/app/minhas-reservas') return destino;
        return '/app';
    }
    if (sessao) return <Navigate to={destinoAposLogin(sessao.tipo)} replace />;

    function trocarPerfil(tipo: Perfil) {
        setParametros(tipo === 'administrador' ? { admin: '1' } : { tipo });
        setEmail('');
        setSenha('');
        setErros({});
        acao.setErro('');
    }
    function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const falhas: Record<string, string> = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) falhas.email = 'Digite um e-mail válido.';
        if (!senha) falhas.senha = 'Faltou sua senha.';
        setErros(falhas);
        if (Object.keys(falhas).length) {
            evento.currentTarget
                .querySelector<HTMLInputElement>(`[name="${Object.keys(falhas)[0]}"]`)
                ?.focus();
            return;
        }
        void acao.executar(async () => {
            await entrar(perfil, { email: email.trim(), senha });
            navegar(destinoAposLogin(perfil), { replace: true });
        });
    }

    return (
        <AcessoLayout
            titulo={administrador ? 'Cuidar da mesa também é fazer parte.' : 'Que bom ter você por aqui.'}
            descricao={
                administrador
                    ? 'Acesso reservado à equipe que cuida dos lotes, das categorias e da comunidade.'
                    : 'Entre para publicar um alimento, encontrar uma oportunidade ou acompanhar aquela boa conexão.'
            }
        >
            <h2 className="text-2xl font-bold text-verde-escuro">
                {administrador ? 'Acesso do administrador' : 'Entre, a casa é sua.'}
            </h2>
            <p className="mb-6 mt-2 text-sm text-tinta/60">
                {administrador ? 'Use seu cadastro administrativo.' : 'Escolha como você participa.'}
            </p>
            {!administrador && (
                <div
                    className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-linha/60 p-1"
                    role="group"
                    aria-label="Perfil de acesso"
                >
                    <button
                        disabled={acao.enviando}
                        type="button"
                        onClick={() => trocarPerfil('ofertante')}
                        aria-pressed={perfil === 'ofertante'}
                        className={`aba ${perfil === 'ofertante' ? 'bg-verde text-creme shadow-sm' : 'text-tinta/65'}`}
                    >
                        Ofertante
                    </button>
                    <button
                        disabled={acao.enviando}
                        type="button"
                        onClick={() => trocarPerfil('organizacao')}
                        aria-pressed={perfil === 'organizacao'}
                        className={`aba ${perfil === 'organizacao' ? 'bg-verde text-creme shadow-sm' : 'text-tinta/65'}`}
                    >
                        Organização
                    </button>
                </div>
            )}
            <form onSubmit={enviar} noValidate>
                <fieldset disabled={acao.enviando} className="grid gap-5">
                    <CampoFormulario
                        name="email"
                        label="E-mail"
                        type="email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        erro={erros.email}
                    />
                    <CampoFormulario
                        name="senha"
                        label="Senha"
                        type="password"
                        autoComplete="current-password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        erro={erros.senha}
                    />
                    <Feedback erro={acao.erro} />
                    <button type="submit" className="botao botao-entrar w-full">
                        {acao.enviando ? 'Entrando…' : 'Entrar'}
                        <Icone
                            nome={acao.enviando ? 'carregar' : 'seta'}
                            className={`h-4 w-4 ${acao.enviando ? 'carregando-icone' : ''}`}
                        />
                    </button>
                </fieldset>
            </form>
            {!administrador && (
                <p className="mt-6 text-center text-xs text-tinta/65">
                    Ainda não tem conta?{' '}
                    <Link
                        className="font-semibold text-verde underline underline-offset-4"
                        to={`/cadastro?tipo=${perfil}`}
                    >
                        Criar conta
                    </Link>
                </p>
            )}
            <button
                type="button"
                disabled={acao.enviando}
                onClick={() => trocarPerfil(administrador ? 'ofertante' : 'administrador')}
                className="mx-auto mt-6 block text-[11px] text-tinta/60 underline underline-offset-4"
            >
                {administrador ? 'Voltar ao acesso de participantes' : 'Acesso do administrador'}
            </button>
        </AcessoLayout>
    );
}