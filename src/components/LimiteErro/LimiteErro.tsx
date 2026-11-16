import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Icone from '../Icone/Icone';

export default class LimiteErro extends Component<{ children: ReactNode }, { falhou: boolean }> {
    state = { falhou: false };

    static getDerivedStateFromError() {
        return { falhou: true };
    }

    render() {
        if (!this.state.falhou) return this.props.children;
        return (
            <section className="container-page py-16">
                <div className="painel text-center" role="alert">
                    <Icone nome="info" className="mb-4 h-9 w-9 text-verde" />
                    <h1 className="text-2xl font-bold text-verde-escuro">Não conseguimos abrir esta página.</h1>
                    <p className="mt-3 text-sm leading-7 text-tinta/70">
                        Aconteceu um problema ao exibir o conteúdo. Tente carregar novamente ou volte para o início.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button className="botao bg-verde text-creme" onClick={() => this.setState({ falhou: false })}>
                            Tentar novamente
                        </button>
                        <Link className="botao botao-contorno" to="/">Voltar para o início</Link>
                    </div>
                </div>
            </section>
        );
    }
}
