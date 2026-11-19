import { Link } from 'react-router-dom';
import type { Integrante } from '../../data/integrantes';
import Imagem from '../Imagem/Imagem';
import Icone from '../Icone/Icone';

interface TeamCardProps {
    integrante: Integrante;
    detalhado?: boolean;
}

export default function TeamCard({ integrante, detalhado = false }: TeamCardProps) {
    const Titulo = detalhado ? 'h1' : 'h2';
    return (
        <article className="painel card-interativo">
            <Imagem
                src={integrante.foto}
                alt={`Foto de ${integrante.nome}`}
                loading="lazy"
                className="mb-5 h-28 w-28 rounded-2xl object-cover"
            />
            <Titulo className={`${detalhado ? 'text-2xl sm:text-3xl' : 'text-xl'} font-bold text-verde-escuro`}>
                {integrante.nome}
            </Titulo>
            <p className="mt-3 text-xs leading-6 text-tinta/65">
                <strong>RM:</strong> {integrante.rm}
                <br />
                <strong>Turma:</strong> {integrante.turma}
            </p>
            <div className="mt-5 flex flex-wrap gap-5 border-t border-linha pt-5 text-sm font-medium text-verde">
                {integrante.github ? (
                    <a
                        className="link-seta"
                        href={integrante.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`GitHub de ${integrante.nome} (abre em nova aba)`}
                    >

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
                    <a
                        className="link-seta"
                        href={integrante.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`LinkedIn de ${integrante.nome} (abre em nova aba)`}
                    >
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
            {!detalhado && (
                <Link
                    to={`/integrantes/${integrante.id}`}
                    className="link-seta mt-5 text-sm font-semibold text-verde"
                    aria-label={`Ver perfil de ${integrante.nome}`}
                >
                    Ver perfil <Icone nome="seta" className="h-4 w-4" />
                </Link>
            )}
        </article>
    );
}
