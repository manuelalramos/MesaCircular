import { useState } from 'react';
import PageIntro from '../../components/PageIntro/PageIntro';
import CardLote from '../../components/CardLote/CardLote';
import AvisoEstado from '../../components/AvisoEstado/AvisoEstado';
import Icone from '../../components/Icone/Icone';
import useConsulta from '../../hooks/useConsulta';
import { buscarLotes } from '../../services/api';
import { statusDoLote } from '../../services/regras';

export default function Lotes() {
    const { dados, carregando, erro, recarregar } = useConsulta(buscarLotes);
    const [busca, setBusca] = useState('');
    const [bairro, setBairro] = useState('');
    const [status, setStatus] = useState('DISPONIVEL');
    const bairros = [...new Set(dados?.map((lote) => lote.bairro) || [])].sort();
    const limparTexto = (texto: string) =>
        texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    const filtrados =
        dados?.filter(
            (lote) =>
                (!bairro || lote.bairro === bairro) &&
                (!status || statusDoLote(lote) === status) &&
                limparTexto(`${lote.descricao} ${lote.categoria.nome} ${lote.ofertante.nome}`).includes(
                    limparTexto(busca.trim()),
                ),
        ) || [];
    return (
        <>
            <PageIntro
                titulo="Lotes disponíveis"
                descricao="Coisa boa merece circular. Encontre alimentos na sua comunidade, confira os detalhes e dê a eles um novo destino."
                etiqueta="Lotes disponíveis"
            />
            <section className="container-page secao !pt-8">
                <form
                    onSubmit={(e) => e.preventDefault()}
                    role="search"
                    aria-busy={carregando}
                    aria-label="Filtros de lotes"
                    className="painel mb-7 grid items-end gap-4 !p-5 md:grid-cols-[2fr_1fr_1fr]"
                >
                    <div>
                        <label htmlFor="busca-lote" className="mb-2 block text-xs font-semibold">
                            O que você procura?
                        </label>
                        <div className="relative">
                            <Icone
                                nome={carregando ? 'carregar' : 'busca'}
                                className={`pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-verde ${carregando ? 'carregando-icone' : ''}`}
                            />
                            <input
                                id="busca-lote"
                                type="search"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="campo pl-12"
                                placeholder="Busque por alimento ou categoria"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="bairro-lote" className="mb-2 block text-xs font-semibold">
                            Bairro
                        </label>
                        <select
                            id="bairro-lote"
                            className="campo"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                        >
                            <option value="">Todos os bairros</option>
                            {bairros.map((nome) => (
                                <option key={nome}>{nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status-lote" className="mb-2 block text-xs font-semibold">
                            Status
                        </label>
                        <select
                            id="status-lote"
                            className="campo"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">Todos os status</option>
                            <option value="DISPONIVEL">Disponível</option>
                            <option value="RESERVADO">Reservado</option>
                            <option value="RETIRADO">Retirado</option>
                            <option value="VENCIDO">Vencido</option>
                        </select>
                    </div>
                </form>
                {carregando ? (
                    <AvisoEstado tipo="carregando" />
                ) : erro ? (
                    <AvisoEstado tipo="erro" mensagem={erro} tentarNovamente={recarregar} />
                ) : (
                    <>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-tinta/60" role="status">
                                {filtrados.length}{' '}
                                {filtrados.length === 1 ? 'lote encontrado' : 'lotes encontrados'}
                            </p>
                            <button
                                className="text-xs font-semibold text-verde underline underline-offset-4"
                                onClick={() => {
                                    setBusca('');
                                    setBairro('');
                                    setStatus('DISPONIVEL');
                                }}
                            >
                                Limpar filtros
                            </button>
                        </div>
                        {filtrados.length ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filtrados.map((lote) => (
                                    <CardLote key={lote.id} lote={lote} />
                                ))}
                            </div>
                        ) : (
                            <AvisoEstado
                                tipo="vazio"
                                mensagem="Nenhum lote por aqui com esses filtros. Que tal tentar outro bairro ou alimento?"
                            />
                        )}
                    </>
                )}
            </section>
        </>
    );
}