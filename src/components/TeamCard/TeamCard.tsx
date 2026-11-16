import type { Integrante } from '../../data/integrantes';
import Imagem from '../Imagem/Imagem';
import Icone from '../Icone/Icone';

export default function TeamCard({ integrante }: { integrante: Integrante }) {
    return (
        <article className="painel card-interativo">
            <Imagem
                src={integrante.foto}
                alt={`Foto de ${integrante.nome}`}
                loading="lazy"
                className="mb-5 h-28 w-28 rounded-2xl object-cover"
            />
            <h2 className="text-xl font-bold text-verde-escuro">{integrante.nome}</h2>
            <p className="mt-3 text-xs leading-6 text-tinta/65">
                <strong>RM:</strong> {integrante.rm}
                <br />
                <strong>Turma:</strong> {integrante.turma}
            </p>
            <div className="mt-5 flex flex-wrap gap-5 border-t border-linha pt-5 text-sm font-medium text-verde">
                {integrante.github ? (
                    <a className="link-seta" href={integrante.github} target="_blank" rel="noreferrer">
                        <Icone nome="github" className="h-5 w-5" />
                        GitHub
                    </a>
                ) : (
                    <span className="inline-flex items-center gap-2 text-tinta/50">
                        <Icone nome="github" className="h-5 w-5" />
                        GitHub
                    </span>
                )}
                {integrante.linkedin ? (
                    <a className="link-seta" href={integrante.linkedin} target="_blank" rel="noreferrer">
                        <Icone nome="linkedin" className="h-5 w-5" />
                        LinkedIn
                    </a>
                ) : (
                    <span className="inline-flex items-center gap-2 text-tinta/50">
                        <Icone nome="linkedin" className="h-5 w-5" />
                        LinkedIn
                    </span>
                )}
            </div>
        </article>
    );
}