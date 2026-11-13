import { useEffect, useState, type ImgHTMLAttributes } from 'react';

import Icone from '../Icone/Icone';

export default function Imagem({
    src,
    alt = '',
    className = '',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    const [falhou, setFalhou] = useState(false);
    useEffect(() => {
        setFalhou(false);
    }, [src]);
    
    if (!src || falhou)
        return (
            <div role="img" aria-label={alt} className={`imagem-indisponivel ${className}`}>
                <Icone nome={src ? 'imagem' : 'usuario'} className="h-10 w-10" />
            </div>
        );
    return <img {...props} src={src} alt={alt} className={className} onError={() => setFalhou(true)} />;
}