import { Outlet } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export default function MainLayout(){
    return(
        <>
        
        <Header />
        <main id="conteudo" className="min-h[70vh] pt-20" tabIndex={-1}>
            <Outlet />
        </main>
        <Footer />

        </>
    )
}