import { useState, type ImgHTMLAttributes } from 'react';

import Icone from '../Icone/Icone';

export default function Imagem(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <ConteudoImagem key={props.src || ''} {...props} />;
}

function ConteudoImagem({
    src,
    alt = '',
    className = '',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    const [falhou, setFalhou] = useState(false);
    
    if (!src || falhou)
        return (
            <div role="img" aria-label={alt} className={`imagem-indisponivel ${className}`}>
                <Icone nome={src ? 'imagem' : 'usuario'} className="h-10 w-10" />
            </div>
        );
    return <img {...props} src={src} alt={alt} className={className} onError={() => setFalhou(true)} />;
}
