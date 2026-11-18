import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AcessoLayout from '../../layouts/AcessoLayout/AcessoLayout';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import Feedback from '../../components/Feedback/Feedback';
import AvisoEstado from '../../components/AvisoEstado/AvisoEstado';
import useSessao from '../../hooks/useSessao';
import useAcao from '../../hooks/useAcao';
import useConsulta from '../../hooks/useConsulta';
import { buscarBairros, cadastrarOfertante, cadastrarOrganizacao } from '../../services/api';
import type { DadosCadastro } from '../../types';

export default function Cadastro() {

    
    const [parametros, setParametros] = useSearchParams();
    const tipo = parametros.get('tipo') === 'organizacao' ? 'organizacao' : 'ofertante';
    const [erros, setErros] = useState<Record<string, string>>({});
    const [cadastroCriado, setCadastroCriado] = useState<DadosCadastro | null>(null);
    const { sessao, entrar } = useSessao();
    const acao = useAcao();
    const bairros = useConsulta(buscarBairros);
    const navegar = useNavigate();
    const bairrosDisponiveis = !!bairros.dados?.length && !bairros.carregando && !bairros.erro;

    
    if (sessao)
        return (
            <Navigate
                to={sessao.tipo === 'administrador' ? '/admin' : '/app'}
                state={cadastroCriado ? { bemVindo: true } : undefined}
                replace
            />
        );

    function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const valores = new FormData(formulario);
        const dados: DadosCadastro = cadastroCriado || {
            nome: String(valores.get('nome') || '').trim(),
            email: String(valores.get('email') || '')
                .trim()
                .toLowerCase(),
            senha: String(valores.get('senha') || ''),
            contato: String(valores.get('contato') || '').trim(),
            idBairro: Number(valores.get('idBairro')),
            tipoOfertante: String(valores.get('tipoOfertante') || '') as DadosCadastro['tipoOfertante'],
            responsavel: String(valores.get('responsavel') || '').trim(),
        };
        const falhas: Record<string, string> = {};
        if (dados.nome.length < 3) falhas.nome = 'Informe um nome com pelo menos 3 letras.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) falhas.email = 'Digite um e-mail válido.';
        if (dados.senha.length < 6) falhas.senha = 'Use pelo menos 6 caracteres.';
        if (dados.contato.replace(/\D/g, '').length < 10) falhas.contato = 'Informe um telefone com DDD.';
        if (!bairros.dados?.some((bairro) => bairro.id === dados.idBairro))
            falhas.idBairro = 'Selecione seu bairro.';
        if (tipo === 'ofertante' && !['feirante', 'mercado', 'produtor'].includes(dados.tipoOfertante || ''))
            falhas.tipoOfertante = 'Selecione como você oferece alimentos.';
        if (tipo === 'organizacao' && (dados.responsavel || '').length < 3)
            falhas.responsavel = 'Informe o nome de quem responde pela organização.';
        setErros(falhas);
        if (Object.keys(falhas).length) {
            formulario.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${Object.keys(falhas)[0]}"]`)?.focus();
            return;
        }
        void acao.executar(async () => {
            if (!cadastroCriado) {
                if (tipo === 'ofertante') await cadastrarOfertante(dados);
                else await cadastrarOrganizacao(dados);
                // Se só o login falhar, o próximo clique não cadastra a mesma pessoa de novo.
                setCadastroCriado(dados);
            }
            await entrar(tipo, { email: dados.email, senha: dados.senha });
            navegar('/app', { replace: true, state: { bemVindo: true } });
        });
    }
    return (
        <AcessoLayout
            titulo="Tem lugar pra você nessa mesa."
            descricao="Seja compartilhando o que sobra ou levando alimento a quem precisa, sua participação já faz diferença."
        >
            <h2 className="text-2xl font-bold text-verde-escuro">Vamos fazer parte?</h2>
            <p className="mb-6 mt-2 text-sm text-tinta/60">Primeiro, conta como você quer participar.</p>
            <div
                className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-linha/60 p-1"
                role="group"
                aria-label="Tipo de cadastro"
            >
                {(['ofertante', 'organizacao'] as const).map((perfil) => (
                    <button
                        type="button"
                        key={perfil}
                        disabled={acao.enviando || !!cadastroCriado}
                        aria-pressed={tipo === perfil}
                        onClick={() => {
                            setParametros({ tipo: perfil });
                            setErros({});
                            acao.setErro('');
                        }}
                        className={`aba ${tipo === perfil ? 'bg-verde text-creme' : 'text-tinta/65'}`}
                    >
                        {perfil === 'ofertante' ? 'Ofertante' : 'Organização'}
                    </button>
                ))}
            </div>
            <form onSubmit={enviar} noValidate>
                {bairros.carregando ? (
                    <div className="mb-5">
                        <AvisoEstado tipo="carregando" mensagem="Preparando seu cadastro…" compacto />
                    </div>
                ) : !bairrosDisponiveis ? (
                    <div className="mb-5">
                        <AvisoEstado
                            tipo="erro"
                            mensagem={bairros.erro || 'Não há bairros disponíveis para cadastro no momento. Tente novamente em instantes.'}
                            tentarNovamente={bairros.recarregar}
                            compacto
                        />
                    </div>
                ) : null}
                <fieldset className="grid gap-4" disabled={acao.enviando || !!cadastroCriado || !bairrosDisponiveis}>
                    <CampoFormulario
                        name="nome"
                        label={tipo === 'ofertante' ? 'Nome do ofertante ou negócio' : 'Nome da organização'}
                        autoComplete="organization"
                        maxLength={100}
                        erro={erros.nome}
                        required
                    />
                    {tipo === 'ofertante' && (
                        <div>
                            <label htmlFor="tipo-ofertante" className="mb-2 block text-sm font-semibold">
                                Como você oferece alimentos? <span className="text-vinho" aria-hidden="true">*</span>
                            </label>
                            <select
                                id="tipo-ofertante"
                                name="tipoOfertante"
                                className="campo"
                                defaultValue=""
                                required
                                aria-invalid={!!erros.tipoOfertante}
                                aria-describedby={erros.tipoOfertante ? 'erro-tipo-ofertante' : undefined}
                            >
                                <option value="">Selecione uma opção</option>
                                <option value="feirante">Feirante</option>
                                <option value="mercado">Mercado</option>
                                <option value="produtor">Produtor</option>
                            </select>
                            {erros.tipoOfertante && <p id="erro-tipo-ofertante" className="mt-1.5 text-xs text-vinho">{erros.tipoOfertante}</p>}
                        </div>
                    )}
                    <CampoFormulario
                        name="email"
                        label="E-mail"
                        type="email"
                        autoComplete="email"
                        maxLength={150}
                        erro={erros.email}
                        required
                    />
                    <CampoFormulario
                        name="senha"
                        label="Crie uma senha"
                        type="password"
                        autoComplete="new-password"
                        minLength={6}
                        maxLength={100}
                        ajuda="Pelo menos 6 caracteres."
                        erro={erros.senha}
                        required
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <CampoFormulario
                            name="contato"
                            label="Telefone com DDD"
                            type="tel"
                            autoComplete="tel"
                            maxLength={20}
                            erro={erros.contato}
                            required
                        />
                        <div>
                            <label htmlFor="bairro-cadastro" className="mb-2 block text-sm font-semibold">
                                Bairro <span className="text-vinho" aria-hidden="true">*</span>
                            </label>
                            <select
                                id="bairro-cadastro"
                                name="idBairro"
                                className="campo"
                                defaultValue=""
                                required
                                aria-invalid={!!erros.idBairro}
                                aria-describedby={    
                                    erros.idBairro ? 'erro-bairro ajuda-bairro' : 'ajuda-bairro' }
                            >
                                <option value="">Selecione seu bairro</option>
                                {bairros.dados?.map((bairro) => (
                                    <option key={bairro.id} value={bairro.id}>
                                        {bairro.nome} · {bairro.cidade}/{bairro.uf}
                                    </option>
                                ))}
                            </select>
                            <p id="ajuda-bairro" className="mt-1.5 text-xs leading-5 text-tinta/60">    No momento, atendemos apenas a Região Metropolitana de São Paulo.    Se seu bairro não aparecer,{' '}    <Link to="/contato" className="font-semibold text-verde underline">        fale com a equipe    </Link>{' '}    antes de concluir o cadastro. </p> {erros.idBairro && (    <p id="erro-bairro" className="mt-1.5 text-xs text-vinho">        {erros.idBairro}    </p> )}
                        </div>
                    </div>
                    {tipo === 'organizacao' && (
                        <CampoFormulario
                            name="responsavel"
                            label="Nome da pessoa responsável"
                            autoComplete="name"
                            maxLength={100}
                            erro={erros.responsavel}
                            required
                        />
                    )}
                </fieldset>
                <div className="mt-5 grid gap-4">
                    {acao.enviando && (
                        <AvisoEstado
                            tipo="carregando"
                            mensagem={cadastroCriado ? 'Entrando na sua conta…' : 'Criando sua conta…'}
                            compacto
                        />
                    )}
                    <Feedback
                        erro={acao.erro}
                        sucesso={
                            cadastroCriado && acao.erro
                                ? 'Sua conta foi criada. Tente entrar novamente pelo botão abaixo.'
                                : ''
                        }
                    />
                    {cadastroCriado && acao.erro && (
                        <p role="status" className="text-xs text-verde">
                            O cadastro já foi salvo. O próximo clique tenta somente o login.
                        </p>
                    )}
                    <button type="submit" disabled={acao.enviando || !bairrosDisponiveis} className="botao bg-verde text-creme">
                        {acao.enviando
                            ? 'Só um instante…'
                            : cadastroCriado
                              ? 'Entrar na conta criada'
                              : 'Criar conta e entrar'}
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-xs text-tinta/65">
                Já faz parte?{' '}
                <Link
                    to={`/login?tipo=${tipo}`}
                    className="font-semibold text-verde underline underline-offset-4"
                >
                    Entre na sua conta
                </Link>
            </p>
        </AcessoLayout>
    );
}
