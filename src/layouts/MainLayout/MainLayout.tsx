import { Outlet, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LimiteErro from "../../components/LimiteErro/LimiteErro";

export default function MainLayout(){
    const { pathname, search } = useLocation();
    return(
        <>
        
        <Header key={`${pathname}${search}`} />
        <main id="conteudo" className="min-h-[70vh] pt-20" tabIndex={-1}>
            <LimiteErro key={pathname}><Outlet /></LimiteErro>
        </main>
        <Footer />

        </>
    )
}
