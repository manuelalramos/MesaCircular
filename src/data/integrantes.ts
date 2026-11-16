import larissa from '../assets/integrantes/foto_larissa.jpg';
import lena from '../assets/integrantes/foto_lena.jpeg';
import lyvia from '../assets/integrantes/foto_lyvia.jpeg';
import manuela from '../assets/integrantes/foto_manuela.jpg';
import yasmin from '../assets/integrantes/foto_yasmin.jpeg';

export interface Integrante {
    id: number;
    nome: string;
    rm: string;
    turma: string;
    foto: string;
    github: string;
    linkedin: string;
}

export const integrantes: Integrante[] = [
    { id: 1, nome: 'Larissa Koprowski Ferreira', rm: '572983', turma: '1TDSPF', foto: larissa, github: 'https://github.com/lkoprowskif', linkedin: 'https://www.linkedin.com/in/larissa-koprowski-111b3a357/' },
    { id: 2, nome: 'Lena Haidar Halawi', rm: '572258', turma: '1TDSPF', foto: lena, github: 'https://github.com/Lenahalawi07', linkedin: 'https://www.linkedin.com/in/lena-haidar-halawi-09134a3b8/' },
    { id: 3, nome: 'Lyvia Correa de Amorim', rm: '589851', turma: '1TDSPF', foto: lyvia, github: 'https://github.com/lyviaamorim', linkedin: 'https://www.linkedin.com/in/lyvia-correa-de-amorim-0203493b8/' },
    { id: 4, nome: 'Manuela de Lima Ramos', rm: '572956', turma: '1TDSPF', foto: manuela, github: 'https://github.com/manuelalramos', linkedin: 'https://www.linkedin.com/in/manuelalramos/' },
    { id: 5, nome: 'Yasmin Souza Silva Martins', rm: '572102', turma: '1TDSPF', foto: yasmin, github: 'https://github.com/yasminmartins18', linkedin: 'https://www.linkedin.com/in/yasmin-souza-silva-martins-32085b376/' },
];