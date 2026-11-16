import { Link } from 'react-router-dom';
import Icone from '../../components/Icone/Icone';

export default function NotFound() {
    return (
        <section className="container-page py-24 text-center">
            <Icone nome="folha" className="mx-auto h-14 w-14 text-verde" />
            <p className="mt-6 text-7xl font-extrabold text-verde/25">404</p>
            <h1 className="mt-4 text-3xl font-bold text-verde-escuro">
                Essa página <span className="destaque-laranja">saiu da mesa.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-tinta/65">
                O endereço pode ter mudado, mas ainda tem muita coisa boa esperando por você.
            </p>
            <Link className="botao mt-7 bg-amarelo text-verde-escuro" to="/">
                Voltar para o início <Icone nome="seta" className="h-4 w-4" />
            </Link>
        </section>
    );
}
