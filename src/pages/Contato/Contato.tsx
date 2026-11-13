import { useState, type FormEvent } from 'react';
import PageIntro from '../../components/PageIntro/PageIntro';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import Feedback from '../../components/Feedback/Feedback';
import Icone from '../../components/Icone/Icone';
import useAcao from '../../hooks/useAcao';
import { enviarContato } from '../../services/api';
import { contato } from '../../data/contato';
import type { DadosContato } from '../../types';

export default function Contato() {
    const [erros, setErros] = useState<Record<string, string>>({});
    const acao = useAcao();

    function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const campos = new FormData(formulario);
        const dados: DadosContato = {
            nome: String(campos.get('nome') || '').trim(),
            email: String(campos.get('email') || '').trim(),
            assunto: String(campos.get('assunto') || ''),
            mensagem: String(campos.get('mensagem') || '').trim(),
        };
        const falhas: Record<string, string> = {};
        if (dados.nome.length < 3) falhas.nome = 'Conte seu nome (pelo menos 3 letras).';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) falhas.email = 'Digite um e-mail válido.';
        if (!dados.assunto) falhas.assunto = 'Escolha um assunto.';
        if (dados.mensagem.length < 10) falhas.mensagem = 'Escreva pelo menos 10 caracteres.';
        setErros(falhas);
        if (Object.keys(falhas).length) {
            formulario.querySelector<HTMLInputElement>(`[name="${Object.keys(falhas)[0]}"]`)?.focus();
            return;
        }
        void acao.executar(async () => {
            await enviarContato(dados);
            formulario.reset();
        }, 'Mensagem enviada! Obrigado por falar com a gente.');
    }

    return (
        <>
            <PageIntro
                titulo="Vamos conversar?"
                descricao="Uma dúvida, uma ideia ou uma vontade de fazer parte. A gente quer ouvir."
                etiqueta="Contato"
            />
            <section className="container-page secao grid gap-10 lg:grid-cols-[1.4fr_1fr]">
                <form className="painel" onSubmit={enviar} noValidate>
                    <h2 className="mb-6 text-xl font-semibold text-verde-escuro">
                        Pode <span className="destaque-laranja">chegar.</span>
                    </h2>
                    <fieldset disabled={acao.enviando} className="grid gap-5">
                        <CampoFormulario
                            label="Seu nome"
                            name="nome"
                            autoComplete="name"
                            required
                            erro={erros.nome}
                            maxLength={100}
                        />
                        <CampoFormulario
                            label="E-mail"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            erro={erros.email}
                            maxLength={150}
                        />
                        <div>
                            <label className="mb-2 block text-sm font-semibold" htmlFor="assunto">
                                Assunto <span aria-hidden="true">*</span>
                            </label>
                            <select
                                id="assunto"
                                name="assunto"
                                className="campo"
                                aria-invalid={!!erros.assunto}
                                aria-describedby={erros.assunto ? 'erro-assunto' : undefined}
                                required
                            >
                                <option value="">Sobre o que vamos falar?</option>
                                <option>Dúvida sobre a plataforma</option>
                                <option>Quero fazer uma parceria</option>
                                <option>Encontrei um problema</option>
                                <option>Outro assunto</option>
                            </select>
                            {erros.assunto && (
                                <p id="erro-assunto" className="mt-2 text-xs text-vinho">
                                    {erros.assunto}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="mensagem" className="mb-2 block text-sm font-semibold">
                                Sua mensagem <span aria-hidden="true">*</span>
                            </label>
                            <textarea
                                id="mensagem"
                                name="mensagem"
                                rows={5}
                                className="campo resize-y"
                                maxLength={2000}
                                aria-invalid={!!erros.mensagem}
                                aria-describedby={erros.mensagem ? 'erro-mensagem' : undefined}
                                required
                                placeholder="Conta pra gente…"
                            />
                            {erros.mensagem && (
                                <p id="erro-mensagem" className="mt-2 text-xs text-vinho">
                                    {erros.mensagem}
                                </p>
                            )}
                        </div>
                        <Feedback erro={acao.erro} sucesso={acao.sucesso} />
                        <button className="botao justify-self-start bg-verde text-creme" type="submit">
                            {acao.enviando ? 'Enviando…' : 'Enviar mensagem'}
                            <Icone nome="seta" className="h-4 w-4" />
                        </button>
                    </fieldset>
                </form>
                <aside className="h-fit rounded-3xl border border-linha bg-amarelo/20 p-8">
                    <Icone nome="email" className="h-9 w-9 text-verde" />
                    <h2 className="mt-6 text-2xl font-bold text-verde-escuro">
                        Boas ideias merecem <span className="destaque-laranja">uma boa conversa.</span>
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-tinta/70">
                        Escolha o formulário, mande um e-mail ou encontre a gente no Instagram.
                    </p>
                                        <div className="mt-7 grid gap-4 border-t border-verde/15 pt-7">
                        <a
                            className="link-seta min-w-0 text-sm font-medium text-verde-escuro hover:text-verde"
                            href={`mailto:${contato.email}`}
                        >
                            <Icone nome="email" className="h-5 w-5" />
                            <span className="break-all">{contato.email}</span>
                        </a>
                        <a
                            className="link-seta text-sm font-medium text-verde-escuro hover:text-verde"
                            href={contato.instagram.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icone nome="instagram" className="h-5 w-5" />
                            {contato.instagram.nome}
                            <Icone nome="diagonal" className="h-4 w-4" />
                        </a>
                    </div>
                    <p className="mt-6 text-xs leading-5 text-tinta/50">
                        E-mail e redes sociais fictícios, usados apenas para fins acadêmicos.
                    </p>
                </aside>
            </section>
        </>
    );
}