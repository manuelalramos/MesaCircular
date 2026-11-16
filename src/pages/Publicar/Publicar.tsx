import FormularioLote from '../../components/FormularioLote/FormularioLote';

export default function Publicar() {
    return (
        <section className="max-w-3xl">
            <p className="sobretitulo">Vamos dar um novo destino?</p>
            <h1 className="titulo-secao mt-3">
                Tem alimento bom <span className="destaque-laranja">sobrando?</span>
            </h1>
            <p className="mb-8 mt-4 text-sm leading-7 text-tinta/65">
                Conte o que você tem e como retirar. O resto começa com uma conexão.
            </p>
            <FormularioLote />
        </section>
    );
}