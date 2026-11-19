import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageIntro from '../../components/PageIntro/PageIntro';
import Icone from '../../components/Icone/Icone';

const perguntas = [
    {
        pergunta: 'Qual é a diferença entre ofertante e organização?',
        resposta:
            'Ofertantes são feirantes, mercados e produtores que publicam alimentos excedentes e confirmam as entregas. Organizações são ONGs, instituições sociais e cozinhas comunitárias que reservam esses alimentos para atender uma comunidade e combinam a retirada.',
    },
    {
        pergunta: 'Posso reservar alimentos como pessoa física?',
        resposta:
            'As reservas são destinadas a organizações cadastradas, como ONGs e instituições sociais. O Mesa Circular não oferece reservas para consumo próprio de pessoas físicas. Se você representa uma organização, cadastre a instituição e informe a pessoa responsável.',
    },
    {
        pergunta: 'O que é o Mesa Circular?',
        resposta:
            'Uma ponte entre quem tem alimentos excedentes e organizações que precisam deles. Feirantes, mercados e produtores publicam os lotes; organizações reservam e combinam a retirada.',
    },
    {
        pergunta: 'Quem pode publicar um lote?',
        resposta:
            'Feirantes, mercadinhos, produtores e estabelecimentos com alimentos em condições de consumo. Crie uma conta de ofertante e informe o alimento, a quantidade, o local e o prazo de retirada.',
    },
    {
        pergunta: 'Como reservo um alimento?',
        resposta:
            'Entre com sua conta de organização, encontre um lote e abra os detalhes. Escolha uma quantidade dentro do saldo disponível e confirme. Depois, combine a retirada pelo contato do ofertante.',
    },
    {
        pergunta: 'É gratuito?',
        resposta:
            'Sim! Criar uma conta, publicar e reservar não tem custo na plataforma. O transporte é combinado entre a organização e o ofertante; o Mesa Circular não faz entregas.',
    },
    {
        pergunta: 'Como funciona a retirada?',
        resposta:
            'A organização combina o horário com o ofertante dentro do prazo publicado. Depois da entrega, o ofertante confirma a retirada no painel. Leve recipientes e transporte adequados para manter a qualidade dos alimentos.',
    },
    {
        pergunta: 'Posso alterar meu e-mail e minha senha?',
        resposta:
            'Sim. Depois de entrar, abra Minha conta no painel ou no menu. Para alterar o e-mail ou a senha, você precisa informar sua senha atual.',
    },
    {
        pergunta: 'Meus dados estão seguros?',
        resposta:
            'O nome e o contato do ofertante aparecem no detalhe do lote para combinar a retirada. As reservas de cada organização ficam no painel dela e são compartilhadas com o ofertante responsável pelo lote.',
    },
    {
        pergunta: 'Em quais regiões o Mesa Circular atende?',
        resposta:
            'No momento, atendemos apenas a Região Metropolitana de São Paulo. No cadastro, ' +
            'escolha seu bairro na lista disponível. Se ele não aparecer, fale com a equipe ' +
            'pela página de Contato antes de concluir o cadastro.',
    },
    {
        pergunta: 'Como adiciono ou altero a foto de um lote?',
        resposta:
            'Ao publicar ou editar um lote, cole um link público direto para a imagem no campo ' +
            'Link da foto. Você pode conferir a prévia antes de salvar. O administrador também ' +
            'pode alterar esse link. Sem link, usamos a foto padrão da categoria.',
    },
];

export default function Faq() {
    const [aberta, setAberta] = useState<number | null>(0);
    return (
        <>
            <PageIntro
                titulo="Pode perguntar."
                descricao="Tiramos as dúvidas para você chegar à mesa com tudo combinado."
                etiqueta="Perguntas frequentes"
            />
            <section className="container-page secao">
                <div className="mx-auto max-w-3xl">
                    <div className="grid gap-3">
                        {perguntas.map((item, indice) => (
                            <article
                                key={item.pergunta}
                                className={`faq-item overflow-hidden rounded-2xl border bg-[#FFFDF8] transition-[border-color,box-shadow] duration-300 ${aberta === indice ? 'faq-item-aberto border-verde shadow-[0_8px_24px_#1c4b3310]' : 'border-[#d8dfd0] shadow-[0_2px_8px_#1c4b3305]'}`}
                            >
                                <h2>
                                    <button
                                        id={`pergunta-${indice}`}
                                        aria-expanded={aberta === indice}
                                        aria-controls={`resposta-${indice}`}
                                        onClick={() => setAberta(aberta === indice ? null : indice)}
                                        className={`faq-pergunta flex w-full items-center justify-between gap-5 px-6 py-5 text-left text-sm font-semibold leading-[1.65] transition-colors duration-300 focus-visible:outline-offset-[-4px] ${aberta === indice ? 'bg-verde-escuro text-creme focus-visible:outline-amarelo' : 'bg-[#e7eee1] text-verde-escuro focus-visible:outline-verde-escuro'}`}
                                    >
                                        {item.pergunta}
                                        <Icone nome="chevron" className={`h-4 w-4 transition-[transform,color] duration-300 ${aberta === indice ? 'rotate-180 text-amarelo' : ''}`} />
                                    </button>
                                </h2>
                                <div
                                    id={`resposta-${indice}`}
                                    role="region"
                                    aria-labelledby={`pergunta-${indice}`}
                                    aria-hidden={aberta !== indice}
                                    className={`grid transition-[grid-template-rows,opacity] duration-[380ms] ease-[cubic-bezier(0.2,0.65,0.3,1)] motion-reduce:duration-[240ms] ${aberta === indice ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                >
                                    <div className="min-h-0 overflow-hidden bg-[#FFFDF8]">
                                        <p className={`border-t border-linha px-6 py-5 text-sm leading-[1.85] text-[#4a443c] transition-transform duration-300 motion-reduce:transform-none ${aberta === indice ? 'translate-y-0' : '-translate-y-1'}`}>
                                            {item.resposta}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="mt-10 rounded-[22px] bg-verde-escuro px-6 py-8 text-center shadow-[0_8px_24px_#1c4b3310]">
                        <h2 className="text-xl font-semibold text-creme">
                            Ficou alguma <span className="text-amarelo">dúvida?</span>
                        </h2>
                        <p className="mb-5 mt-3 text-sm text-creme/85">A gente conversa e resolve junto.</p>
                        <Link to="/contato" className="botao bg-amarelo text-verde-escuro">
                            Fale com a gente <Icone nome="seta" className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
