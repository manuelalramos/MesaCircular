import type { Sessao } from '../types';

export const CHAVE_SESSAO = 'mesa-circular:sessao';
type Armazenamento = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function dadosDaSessao(valor: unknown): Sessao | null {
    if (!valor || typeof valor !== 'object' || !('tipo' in valor) || !('pessoa' in valor)) return null;
    const pessoa = valor.pessoa;
    if (!pessoa || typeof pessoa !== 'object' || !('id' in pessoa) || !('nome' in pessoa) || !('email' in pessoa)
        || typeof pessoa.id !== 'number' || !Number.isInteger(pessoa.id) || pessoa.id <= 0
        || typeof pessoa.nome !== 'string' || !pessoa.nome.trim()
        || typeof pessoa.email !== 'string' || !pessoa.email.trim()) return null;
    const base = { id: pessoa.id, nome: pessoa.nome, email: pessoa.email };
    // Salva somente os dados usados na interface. Senhas nunca vão para o armazenamento.
    if (valor.tipo === 'administrador') return { tipo: valor.tipo, pessoa: base };
    const participante = {
        ...base,
        contato: 'contato' in pessoa && typeof pessoa.contato === 'string' ? pessoa.contato : '',
        bairro: 'bairro' in pessoa && typeof pessoa.bairro === 'string' ? pessoa.bairro : '',
        idBairro: 'idBairro' in pessoa && typeof pessoa.idBairro === 'number' ? pessoa.idBairro : 0,
    };
    if (valor.tipo === 'ofertante') return { tipo: valor.tipo, pessoa: participante };
    if (valor.tipo === 'organizacao') return {
        tipo: valor.tipo,
        pessoa: { ...participante, responsavel: 'responsavel' in pessoa && typeof pessoa.responsavel === 'string' ? pessoa.responsavel : '' },
    };
    return null;
}

export function lerSessaoSalva(armazenamento?: Armazenamento): Sessao | null {
    try {
        const local = armazenamento || (typeof window !== 'undefined' ? window.localStorage : undefined);
        const salva = local?.getItem(CHAVE_SESSAO);
        return salva ? dadosDaSessao(JSON.parse(salva)) : null;
    } catch {
        return null;
    }
}

export function salvarSessao(sessao: Sessao | null, armazenamento?: Armazenamento) {
    try {
        const local = armazenamento || (typeof window !== 'undefined' ? window.localStorage : undefined);
        const dados = dadosDaSessao(sessao);
        if (dados) local?.setItem(CHAVE_SESSAO, JSON.stringify(dados));
        else local?.removeItem(CHAVE_SESSAO);
    } catch {
        // A navegação continua funcionando quando o navegador bloqueia o armazenamento.
    }
}
