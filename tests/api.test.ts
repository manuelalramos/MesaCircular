import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { buscarBairros, cadastrarOfertante, cadastrarOrganizacao, login } from '../src/services/api.ts';
import { ErroApi, mensagemErro } from '../src/services/erro.ts';
import type { DadosCadastro, Perfil } from '../src/types/index.ts';

const fetchOriginal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchOriginal; });

const bairroJava = { idBairro: 4, nomeBairro: 'Liberdade', nomeCidade: 'São Paulo', uf: 'SP' };
const credenciais = { email: 'conta@example.test', senha: 'senha-de-teste' };
const cadastro: DadosCadastro = {
    ...credenciais,
    nome: 'Cadastro de teste',
    idBairro: 4,
    contato: '11999999999',
    tipoOfertante: 'feirante',
    responsavel: 'Pessoa responsável',
};

const perfis: { perfil: Perfil; recurso: string; resposta: Record<string, unknown> }[] = [
    { perfil: 'administrador', recurso: 'administradores', resposta: { idAdministrador: 7, nomeAdministrador: 'Administração' } },
    { perfil: 'ofertante', recurso: 'ofertantes', resposta: { idOfertante: 7, nomeOfertante: 'Feira de teste', idBairro: 4, contato: cadastro.contato } },
    { perfil: 'organizacao', recurso: 'organizacoes', resposta: { idOrganizacao: 7, nomeOrganizacao: 'Organização de teste', nomeResponsavel: cadastro.responsavel, idBairro: 4, contato: cadastro.contato } },
];

for (const { perfil, recurso, resposta } of perfis) {
    test(`login de ${perfil} aceita a resposta real do Java`, async () => {
        let chamadasLogin = 0;
        globalThis.fetch = async (url, opcoes) => {
            if (String(url).endsWith(`/${recurso}/login`)) {
                chamadasLogin++;
                assert.equal(opcoes?.method, 'POST');
                assert.deepEqual(JSON.parse(String(opcoes?.body)), credenciais);
                return Response.json({ ...resposta, email: credenciais.email });
            }
            assert.ok(String(url).endsWith('/bairros/4'));
            return Response.json(bairroJava);
        };
        const sessao = await login(perfil, credenciais);
        assert.equal(sessao.tipo, perfil);
        assert.equal(sessao.pessoa.id, 7);
        assert.equal(sessao.pessoa.email, credenciais.email);
        assert.ok(sessao.pessoa.nome);
        if (sessao.tipo !== 'administrador') assert.equal(sessao.pessoa.bairro, 'Liberdade');
        if (sessao.tipo === 'organizacao') assert.equal(sessao.pessoa.responsavel, cadastro.responsavel);
        assert.equal(chamadasLogin, 1);
    });
}

test('cadastro de ofertante envia nome, tipo e bairro nos campos do Java', async () => {
    globalThis.fetch = async (url, opcoes) => {
        assert.ok(String(url).endsWith('/ofertantes'));
        assert.equal(opcoes?.method, 'POST');
        assert.deepEqual(JSON.parse(String(opcoes?.body)), {
            nomeOfertante: cadastro.nome, tipoOfertante: 'feirante', idBairro: 4,
            email: cadastro.email, senha: cadastro.senha, contato: cadastro.contato,
        });
        return Response.json({ idOfertante: 7 });
    };
    await cadastrarOfertante(cadastro);
});

test('cadastro de organização envia os nomes da organização e do responsável', async () => {
    globalThis.fetch = async (url, opcoes) => {
        assert.ok(String(url).endsWith('/organizacoes'));
        assert.deepEqual(JSON.parse(String(opcoes?.body)), {
            nomeOrganizacao: cadastro.nome, nomeResponsavel: cadastro.responsavel, idBairro: 4,
            email: cadastro.email, senha: cadastro.senha, contato: cadastro.contato,
        });
        return Response.json({ idOrganizacao: 7 });
    };
    await cadastrarOrganizacao(cadastro);
});

test('bairros mantêm os IDs reais para a seleção no formulário', async () => {
    globalThis.fetch = async () => Response.json([bairroJava]);
    assert.deepEqual(await buscarBairros(), [{ id: 4, nome: 'Liberdade', cidade: 'São Paulo', uf: 'SP' }]);
});

test('credenciais rejeitadas não criam sessão nem sugerem cadastro administrativo', async () => {
    globalThis.fetch = async () => Response.json({ mensagem: 'E-mail ou senha invalidos' }, { status: 401 });
    await assert.rejects(login('ofertante', credenciais), (erro: unknown) =>
        erro instanceof ErroApi && erro.status === 401 && erro.message.includes('perfil selecionado'));
    await assert.rejects(login('administrador', credenciais), (erro: unknown) =>
        erro instanceof ErroApi && erro.status === 401 && !erro.message.includes('faça seu cadastro'));
});

test('resposta de login incompleta não vira sessão nem afirma que a conta não existe', async () => {
    for (const resposta of [null, true, {}, { idAdministrador: 7 }, { idOfertante: 7, nomeOfertante: 'Outro perfil' }]) {
        globalThis.fetch = async () => Response.json(resposta);
        await assert.rejects(login('administrador', credenciais), (erro: unknown) =>
            erro instanceof ErroApi && erro.status === 502 && erro.message === 'Não conseguimos concluir seu acesso agora. Aguarde um instante e tente novamente.');
    }
});

test('mensagens do Java aparecem com acentuação sem alterar campos de cadastro', () => {
    assert.equal(new ErroApi('Nome da organizacao e obrigatorio').message, 'Nome da organização é obrigatório');
    assert.equal(new ErroApi('Nome do responsavel e obrigatorio').message, 'Nome do responsável é obrigatório');
    assert.equal(new ErroApi('Registro possui vinculos e nao pode ser removido').message, 'Registro possui vínculos e não pode ser removido');
    assert.equal(mensagemErro(null), 'Não deu certo dessa vez. Tente de novo.');
});

test('resposta de servidor indisponível não mostra detalhes técnicos', async () => {
    globalThis.fetch = async () => new Response('<html>Servidor indisponível</html>', { status: 503 });
    await assert.rejects(login('administrador', credenciais), (erro: unknown) =>
        erro instanceof ErroApi && erro.status === 503 && erro.message.includes('Aguarde um instante'));
});

test('falha de rede orienta conferir a conexão', async () => {
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
    await assert.rejects(login('administrador', credenciais), (erro: unknown) =>
        erro instanceof ErroApi && erro.status === 0 && erro.message.includes('Confira sua conexão'));
});
