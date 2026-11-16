import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageIntro from '../../components/PageIntro/PageIntro';
import Icone from '../../components/Icone/Icone';

const perguntas = [
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
                                className={`faq-item ${aberta === indice ? 'faq-item-aberto' : ''}`}
                            >
                                <h2>
                                    <button
                                        id={`pergunta-${indice}`}
                                        aria-expanded={aberta === indice}
                                        aria-controls={`resposta-${indice}`}
                                        onClick={() => setAberta(aberta === indice ? null : indice)}
                                        className="faq-pergunta"
                                    >
                                        {item.pergunta}
                                        <Icone nome="chevron" className="faq-sinal h-4 w-4" />
                                    </button>
                                </h2>
                                <div
                                    id={`resposta-${indice}`}
                                    role="region"
                                    aria-labelledby={`pergunta-${indice}`}
                                    aria-hidden={aberta !== indice}
                                    className={`faq-resposta ${aberta === indice ? 'faq-resposta-aberta' : ''}`}
                                >
                                    <div>
                                        <p className="faq-texto">{item.resposta}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="faq-contato mt-10 text-center">
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