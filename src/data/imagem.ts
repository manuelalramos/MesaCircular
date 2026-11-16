import type { Lote } from '../types';

export const imagens = {
    feira: 'https://res.cloudinary.com/ddlpxy1dn/image/upload/v1794531908/imagem_home_uqjadm.jpg',
    sobre: 'https://res.cloudinary.com/ddlpxy1dn/image/upload/v1794532116/imagem_sobre_fltgo9.jpg',
    legumes: 'https://res.cloudinary.com/ddlpxy1dn/image/upload/v1794532086/imagem_padrao_r4o49s.jpg',
    frutas: 'https://res.cloudinary.com/ddlpxy1dn/image/upload/v1794532196/imagem_frutas_ik0lau.jpg',
    paes: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
};

export function imagemDoLote(lote: Lote): string {
    // Se o Java devolver o link da foto no campo imagem, usamos ele primeiro.
    if (lote.imagem) return lote.imagem;
    const categoria = lote.categoria.nome.toLowerCase();
    if (categoria.includes('fruta')) return imagens.frutas;
    if (categoria.includes('pã') || categoria.includes('cere')) return imagens.paes;
    return imagens.legumes;
}
