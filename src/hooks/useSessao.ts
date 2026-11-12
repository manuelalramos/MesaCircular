import { useContext } from "react";
import { SessaoContext } from "../contexts/SessaoContext";

export default function useSessao() {
    const contexto = useContext(SessaoContext);
    if(!contexto) throw new Error('useSessao precisa estar dentro do SessaoProvider.');
    return contexto;
}