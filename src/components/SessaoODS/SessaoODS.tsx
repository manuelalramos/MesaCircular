import { Link } from 'react-router-dom';
import Icone from '../Icone/Icone';

export default function SecaoODS() {
    return (
        <section className="bg-vinho py-14 text-creme md:py-16">
            <div className="container-page grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[2px] text-rosa">
                        Pequenas conexões. Um futuro melhor.
                    </p>
                    <h2 className="mt-4 max-w-lg text-3xl font-bold leading-tight tracking-[-1px] md:text-4xl">
                        Uma mesa mais cheia.
                        <br />
                        <span className="text-amarelo">Uma cidade mais humana.</span>
                    </h2>
                    <p className="mt-5 max-w-lg text-sm leading-7 text-creme/80">
                        Nossa ideia conversa com os Objetivos de Desenvolvimento Sustentável da ONU. Porque
                        cuidar da comida também é cuidar de quem vive perto.
                    </p>
                    <Link to="/sobre" className="link-seta mt-6 text-sm font-semibold text-amarelo">
                        Conheça nosso propósito <Icone nome="seta" className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <article className="rounded-3xl border border-creme/20 bg-creme/5 p-6">
                        <span className="text-5xl font-extrabold text-amarelo">02</span>
                        <h3 className="mb-2 mt-4 font-semibold">Fome Zero</h3>
                        <p className="text-xs leading-6 text-creme/80">
                            Mais alimento bom chegando a quem precisa, com respeito e dignidade.
                        </p>
                    </article>
                    <article className="rounded-3xl border border-creme/20 bg-creme/5 p-6">
                        <span className="text-5xl font-extrabold text-rosa">11</span>
                        <h3 className="mb-2 mt-4 font-semibold">Cidades sustentáveis</h3>
                        <p className="text-xs leading-6 text-creme/80">
                            Pessoas do mesmo bairro se conectando para aproveitar melhor o que já existe.
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
}