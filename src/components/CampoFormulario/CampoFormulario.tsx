import { useId, type InputHTMLAttributes } from 'react';

interface CampoFormularioProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    erro?: string;
    ajuda?: string;
}

export default function CampoFormulario({
    label,
    erro,
    ajuda,
    id,
    required,
    ...props
}: CampoFormularioProps) {
    const gerado = useId();
    const identificador = id || gerado;
    return (
        <div className="min-w-0">
            <label htmlFor={identificador} className="mb-2 block text-sm font-semibold">
                {label}
                {required && (
                    <span className="ml-1 text-vinho" aria-hidden="true">
                        *
                    </span>
                )}
            </label>
            <input
                {...props}
                id={identificador}
                required={required}
                className={`campo ${erro ? 'border-vinho' : ''} ${props.className || ''}`}
                aria-invalid={!!erro}
                aria-describedby={erro || ajuda ? `${identificador}-ajuda` : undefined}
            />
            {(erro || ajuda) && (
                <p
                    id={`${identificador}-ajuda`}
                    className={`mt-1.5 text-xs leading-5 ${erro ? 'text-vinho' : 'text-tinta/60'}`}
                >
                    {erro || ajuda}
                </p>
            )}
        </div>
    );
}
