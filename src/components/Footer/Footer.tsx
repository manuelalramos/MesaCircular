import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Icone from '../Icone/Icone';
// import { contato } from '../../data/contato';

export default function Footer() {
    return (
        <footer className="bg-verde-escuro text-creme">
            <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.1fr_1.4fr] lg:gap-8">
                <div className="min-w-0">
                    <Logo claro />
                    <p className="mt-5 max-w-64 text-sm leading-7 text-creme/75">
                        Alimento bom merece uma nova mesa.
                    </p>
                    <p className="mt-2 max-w-64 text-xs leading-6 text-creme/65">
                        Conectando alimentos e pessoas no mesmo bairro.
                    </p>
                </div>
                <div>
                    <h2 className="mb-4 text-sm font-semibold text-amarelo">Pelo site</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link className="footer-link" to="/">
                                <Icone nome="casa" className="h-4 w-4" />
                                Início
                            </Link>
                        </li>
                        <li>
                            <Link className="footer-link" to="/lotes">
                                <Icone nome="caixa" className="h-4 w-4" />
                                Encontre alimentos
                            </Link>
                        </li>
                        <li>
                            <Link className="footer-link" to="/sobre">
                                <Icone nome="folha" className="h-4 w-4" />
                                Nossa história
                            </Link>
                        </li>
                        <li>
                            <Link className="footer-link" to="/faq">
                                <Icone nome="info" className="h-4 w-4" />
                                Tire suas dúvidas
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h2 className="mb-4 text-sm font-semibold text-amarelo">Vamos juntos</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link className="footer-link" to="/cadastro?tipo=ofertante">
                                <Icone nome="compartilhar" className="h-4 w-4" />
                                Sou ofertante
                            </Link>
                        </li>
                        <li>
                            <Link className="footer-link" to="/cadastro?tipo=organizacao">
                                <Icone nome="pessoas" className="h-4 w-4" />
                                Sou organização
                            </Link>
                        </li>
                        <li>
                            <Link className="footer-link" to="/integrantes">
                                <Icone nome="equipe" className="h-4 w-4" />
                                Integrantes
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="min-w-0">
                    <h2 className="mb-4 text-sm font-semibold text-amarelo">Fale com a gente</h2>
                    <Link className="footer-link" to="/contato">
                        <Icone nome="email" className="h-4 w-4" />
                        Entre em contato
                    </Link>
                    {/* <div className="mt-3 grid gap-2">
                        <a
                            className="footer-link"
                            href={contato.instagram.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icone nome="instagram" className="h-4 w-4" />
                            {contato.instagram.nome}
                        </a>
                    </div> */}
                </div>
            </div>
            <div className="container-page flex flex-col justify-between gap-3 border-t border-creme/15 py-6 text-xs text-creme/65 sm:flex-row">
                <p>© 2026 Mesa Circular · Global Solution FIAP</p>
                <Link to="/integrantes" className="footer-link !text-xs">
                    ADS · Conheça a equipe <Icone nome="seta" className="h-4 w-4" />
                </Link>
            </div>
        </footer>
    );
}
