import type { HTMLAttributes } from 'react';


const icones = {
    seta: 'fa-solid fa-arrow-right',
    voltar: 'fa-solid fa-arrow-left',
    diagonal: 'fa-solid fa-arrow-up-right-from-square',
    baixo: 'fa-solid fa-arrow-down',
    chevron: 'fa-solid fa-chevron-down',
    folha: 'fa-solid fa-leaf',
    caixa: 'fa-solid fa-box-open',
    pin: 'fa-solid fa-location-dot',
    relogio: 'fa-regular fa-clock',
    pessoas: 'fa-solid fa-users',
    compartilhar: 'fa-solid fa-hand-holding-hand',
    check: 'fa-solid fa-check',
    busca: 'fa-solid fa-magnifying-glass',
    menu: 'fa-solid fa-bars',
    fechar: 'fa-solid fa-xmark',
    mais: 'fa-solid fa-plus',
    menos: 'fa-solid fa-minus',
    sair: 'fa-solid fa-right-from-bracket',
    casa: 'fa-solid fa-house',
    escudo: 'fa-solid fa-shield-halved',
    email: 'fa-regular fa-envelope',
    editar: 'fa-regular fa-pen-to-square',
    lixeira: 'fa-regular fa-trash-can',
    info: 'fa-solid fa-circle-info',
    grafico: 'fa-solid fa-chart-simple',
    saco: 'fa-solid fa-bag-shopping',
    usuario: 'fa-regular fa-user',
    conta: 'fa-solid fa-user-gear',
    senha: 'fa-solid fa-key',
    carregar: 'fa-solid fa-spinner',
    imagem: 'fa-regular fa-image',
    instagram: 'fa-brands fa-instagram',
    github: 'fa-brands fa-github',
    linkedin: 'fa-brands fa-linkedin-in',
    entrega: 'fa-solid fa-truck-ramp-box',
    talheres: 'fa-solid fa-utensils',
    cidade: 'fa-solid fa-city',
    equipe: 'fa-solid fa-user-group',
} as const;


export type NomeIcone = keyof typeof icones;
interface IconeProps extends HTMLAttributes<HTMLSpanElement> {
    nome: NomeIcone;
}


export default function Icone({ nome, className = 'h-5 w-5', ...props }: IconeProps) {
    return (
        <span {...props} aria-hidden="true" data-icone={nome} className={`icone ${className}`}>
            <i className={icones[nome]} />
        </span>
    );
}
