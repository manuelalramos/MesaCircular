import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro/PageIntro';
import TeamCard from '../components/TeamCard/TeamCard';
import Icone from '../components/Icone/Icone';
import { integrantes } from '../data/integrantes';

export default function Integrantes() {
    return (
        <>
            <PageIntro
                titulo="Conheça os integrantes"
                descricao="Cinco estudantes de ADS, uma ideia em comum: usar a tecnologia para fazer a comida circular."
                etiqueta="Nossa equipe · Global Solution 2026/2"
            />
            <section className="container-page secao">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {integrantes.map((integrante) => (
                        <TeamCard key={integrante.id} integrante={integrante} />
                    ))}
                </div>
                <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-linha pt-8">
                    <p className="text-sm leading-7 text-tinta/70">
                        Uma ideia que a gente constrói junto, dentro e fora da sala.
                    </p>
                    <Link to="/sobre" className="link-seta text-sm font-semibold text-verde">
                        Conheça o projeto <Icone nome="seta" className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </>
    );
}