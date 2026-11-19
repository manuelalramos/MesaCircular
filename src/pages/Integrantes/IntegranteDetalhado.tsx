import { Link, useParams } from 'react-router-dom';
import Icone from '../../components/Icone/Icone';
import TeamCard from '../../components/TeamCard/TeamCard';
import { integrantes } from '../../data/integrantes';
import NotFound from '../NotFound/NotFound';

export default function IntegranteDetalhado() {
    const { id } = useParams();
    const integrante = integrantes.find((item) => String(item.id) === id);
    if (!integrante) return <NotFound />;

    return (
        <section className="container-page secao">
            <Link to="/integrantes" className="link-seta text-sm font-semibold text-verde">
                <Icone nome="voltar" className="h-4 w-4" /> Voltar para a equipe
            </Link>
            <div className="mx-auto mt-8 max-w-xl">
                <p className="sobretitulo mb-4">Nossa equipe · Mesa Circular</p>
                <TeamCard integrante={integrante} detalhado />
            </div>
        </section>
    );
}
