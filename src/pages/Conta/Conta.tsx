import { useState, type FormEvent } from 'react';
import useSessao from '../../hooks/useSessao';
import useAcao from '../../hooks/useAcao';
import { alterarEmail, alterarSenha } from '../../services/api';
import { validarNovaSenha } from '../../services/regras';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import Feedback from '../../components/Feedback/Feedback';
import Icone from '../../components/Icone/Icone';

export default function Conta() {
    const { sessao, atualizarEmail } = useSessao();
    const [email, setEmail] = useState(sessao?.pessoa.email || '');
    const emailAcao = useAcao();
    const senhaAcao = useAcao();

    function salvarEmail(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (!sessao) return;
        const formulario = evento.currentTarget;
        const senhaAtual = String(new FormData(formulario).get('senhaAtual') || '');
        const novoEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
            emailAcao.setErro('Digite um e-mail válido.');
            return;
        }
        if (novoEmail === sessao.pessoa.email.toLowerCase()) {
            emailAcao.setErro('Esse já é seu e-mail atual.');
            return;
        }
        if (!senhaAtual) {
            emailAcao.setErro('Informe sua senha atual para confirmar.');
            return;
        }
        void emailAcao.executar(async () => {
            await alterarEmail(sessao.tipo, sessao.pessoa.id, novoEmail, senhaAtual);
            atualizarEmail(novoEmail);
            setEmail(novoEmail);
            formulario.reset();
        }, 'E-mail atualizado! No próximo acesso, entre com o novo endereço.');
    }

    function salvarSenha(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (!sessao) return;
        const formulario = evento.currentTarget;
        const dados = new FormData(formulario);
        const senhaAtual = String(dados.get('senhaAtual') || '');
        const novaSenha = String(dados.get('novaSenha') || '');
        const falha = validarNovaSenha(senhaAtual, novaSenha, String(dados.get('confirmacao') || ''));
        if (falha) {
            senhaAcao.setErro(falha);
            return;
        }
        void senhaAcao.executar(async () => {
            await alterarSenha(sessao.tipo, sessao.pessoa.id, senhaAtual, novaSenha);
            formulario.reset();
        }, 'Senha alterada! Use a nova senha no próximo acesso.');
    }

    return (
        <section>
            <p className="sobretitulo">Seus dados de acesso</p>
            <h1 className="titulo-secao mt-3">
                Minha <span className="destaque-laranja">conta</span>
            </h1>
            <p className="mt-4 text-sm leading-7 text-tinta/65">
                Atualize seu e-mail ou troque sua senha por aqui.
            </p>
            <p className="mt-3 break-all text-sm text-verde-escuro">
                <strong>{sessao?.pessoa.nome}</strong> · {sessao?.pessoa.email}
            </p>
            <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
                <form onSubmit={salvarEmail} noValidate className="painel">
                    <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold text-verde-escuro">
                        <Icone nome="email" className="h-5 w-5" />
                        Alterar e-mail
                    </h2>
                    <fieldset disabled={emailAcao.enviando} className="grid gap-5">
                        <CampoFormulario
                            label="Novo e-mail"
                            name="email"
                            type="email"
                            autoComplete="email"
                            maxLength={150}
                            value={email}
                            onChange={(evento) => setEmail(evento.target.value)}
                            required
                        />
                        <CampoFormulario
                            label="Senha atual"
                            name="senhaAtual"
                            type="password"
                            autoComplete="current-password"
                            maxLength={100}
                            required
                        />
                        <Feedback erro={emailAcao.erro} sucesso={emailAcao.sucesso} />
                        <button className="botao w-full justify-self-stretch bg-verde text-creme sm:w-auto sm:justify-self-start" type="submit">
                            {emailAcao.enviando ? 'Salvando…' : 'Salvar novo e-mail'}
                            <Icone nome="check" className="h-4 w-4" />
                        </button>
                    </fieldset>
                </form>
                <form onSubmit={salvarSenha} noValidate className="painel">
                    <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold text-verde-escuro">
                        <Icone nome="senha" className="h-5 w-5" />
                        Alterar senha
                    </h2>
                    <fieldset disabled={senhaAcao.enviando} className="grid gap-5">
                        <CampoFormulario
                            label="Senha atual"
                            name="senhaAtual"
                            type="password"
                            autoComplete="current-password"
                            maxLength={100}
                            required
                        />
                        <CampoFormulario
                            label="Nova senha"
                            name="novaSenha"
                            type="password"
                            autoComplete="new-password"
                            minLength={6}
                            maxLength={100}
                            ajuda="Use pelo menos 6 caracteres."
                            required
                        />
                        <CampoFormulario
                            label="Confirme a nova senha"
                            name="confirmacao"
                            type="password"
                            autoComplete="new-password"
                            maxLength={100}
                            required
                        />
                        <Feedback erro={senhaAcao.erro} sucesso={senhaAcao.sucesso} />
                        <button
                            className="botao w-full justify-self-stretch bg-amarelo text-verde-escuro sm:w-auto sm:justify-self-start"
                            type="submit"
                        >
                            {senhaAcao.enviando ? 'Salvando…' : 'Salvar nova senha'}
                            <Icone nome="check" className="h-4 w-4" />
                        </button>
                    </fieldset>
                </form>
            </div>
        </section>
    );
}