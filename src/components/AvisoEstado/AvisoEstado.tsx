import Icone from '../Icone/Icone';

interface AvisoEstadoProps {
    tipo: 'carregando' | 'erro' | 'vazio';
    mensagem?: string;
    tentarNovamente?: () => void;
    compacto?: boolean;
}

export default function AvisoEstado({ tipo, mensagem, tentarNovamente, compacto = false }: AvisoEstadoProps) {
    return (
        <div className={`rounded-3xl border border-dashed border-linha bg-creme text-center ${compacto ? 'px-4 py-5' : 'px-6 py-12'}`} role={tipo === 'erro' ? 'alert' : 'status'} aria-live="polite">
            {tipo === 'carregando' ? (
                <Icone nome="carregar" className="carregando-icone mx-auto mb-4 h-7 w-7 text-verde" />
            ) : (
                <span className="mx-auto mb-4 flex h-10 w-10 items-center justify-center text-verde">
                    <Icone nome={tipo === 'erro' ? 'info' : 'caixa'} />
                </span>
            )}
            <p className="font-semibold text-verde-escuro">
                {mensagem ||
                    (tipo === 'carregando'
                        ? 'Carregando os dados…'
                        : tipo === 'erro'
                            ? 'Não deu pra carregar agora.'
                            : 'Ainda não tem nada por aqui.')}
            </p>
            {tipo === 'carregando' && (
                <p className="mx-auto mt-3 max-w-lg text-sm text-tinta/70">
                    A primeira conexão pode demorar um pouquinho enquanto o serviço inicia.
                    Aguarde, por favor. Você pode deixar esta página aberta.
                </p>
            )}

            {tipo === 'erro' && tentarNovamente && (
                <button onClick={tentarNovamente} className="botao botao-contorno mt-5">
                    Tentar de novo
                </button>
            )}
        </div>
    );
}
