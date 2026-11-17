import test from 'node:test';
import assert from 'node:assert/strict';
import type { Lote } from '../src/types/index.ts';
import { statusDoLote, validarPrazoRetirada, validarReserva } from '../src/services/regras.ts';

const agora = Date.parse('2026-11-16T12:00:00-03:00');
const lote: Lote = {
    id: 1, descricao: 'Legumes para compartilhar', quantidade: 10, saldo: 5, unidade: 'kg',
    criadoEm: '2026-11-01T10:00:00', prazoRetirada: '2026-11-29T18:00:00',
    status: 'DISPONIVEL', ativo: true, idBairro: 1, bairro: 'Centro', local: 'Banca de teste',
    categoria: { id: 1, nome: 'Legumes' },
    ofertante: { id: 1, nome: 'Feira', email: 'feira@example.test', contato: '', bairro: 'Centro', idBairro: 1 },
};

test('o ADM pode encurtar o prazo para uma data passada, posterior à publicação', () => {
    assert.equal(validarPrazoRetirada('2026-11-15T18:00', lote, true, agora), '');
    assert.equal(statusDoLote({ ...lote, prazoRetirada: '2026-11-15T18:00' }, agora), 'VENCIDO');
});

test('publicação nova e alteração de prazo pelo ofertante exigem data futura', () => {
    assert.equal(validarPrazoRetirada('2026-11-15T18:00', undefined, false, agora), 'Escolha um prazo no futuro.');
    assert.equal(validarPrazoRetirada('2026-11-15T18:00', lote, false, agora), 'Escolha um prazo no futuro.');
    assert.equal(validarPrazoRetirada('2026-11-29T18:00', undefined, false, agora), '');
});

test('a edição respeita a regra Java de prazo posterior à publicação', () => {
    assert.match(validarPrazoRetirada('2026-11-01T10:00', lote, true, agora), /posterior à publicação/);
    assert.match(validarPrazoRetirada('2026-10-31T18:00', lote, true, agora), /posterior à publicação/);
    assert.equal(validarPrazoRetirada('', lote, true, agora), 'Informe uma data e um horário válidos.');
});

test('um prazo já expirado pode ser mantido ao editar outros dados', () => {
    const vencido = { ...lote, prazoRetirada: '2026-11-15T18:00:00' };
    assert.equal(validarPrazoRetirada('2026-11-15T18:00', vencido, false, agora), '');
});

test('um lote disponível vence no instante do prazo de São Paulo', () => {
    assert.equal(statusDoLote(lote, Date.parse('2026-11-29T20:59:59Z')), 'DISPONIVEL');
    assert.equal(statusDoLote(lote, Date.parse('2026-11-29T21:00:00Z')), 'VENCIDO');
    const passado = { ...lote, prazoRetirada: '2020-11-15T18:00:00' };
    assert.equal(validarReserva(passado, 1), 'Este lote não está mais disponível para reserva.');
});

test('encerramento de retirada e inativação continuam preservados', () => {
    const passado = { ...lote, prazoRetirada: '2026-11-15T18:00:00' };
    assert.equal(statusDoLote({ ...passado, status: 'RETIRADO' }, agora), 'RETIRADO');
    assert.equal(statusDoLote({ ...passado, ativo: false }, agora), 'INATIVO');
    assert.equal(statusDoLote({ ...lote, status: 'VENCIDO' }, agora), 'VENCIDO');
});
