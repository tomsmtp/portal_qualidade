import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './header.module.css';

export default function Header() {

    // SOBE A PAGINA QUANDO MUDAR DE ROTA
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // OCULTA O HEADER QUANDO O USUÁRIO DESCE A PÁGINA E EXIBE QUANDO SOBE
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    return (
        <header className={`${styles.header} ${isVisible ? '' : styles.hidden}`}>
            
            <Link to="/">
                <img className={styles.logo} src="public/assets/logo.png" alt="Logo da AGT" />
            </Link>
            <nav className={styles.nav}>
                <Link to="/" className={styles.link}>Home</Link>
                <Link to="/recomendacao" className={styles.link}>Recomendações</Link>
                <Link to="/boletins" className={styles.link}>Boletins</Link>
                <Link to="/aviacao" className={styles.link}>Aviação</Link>
                <Link to="/bulas" className={styles.link}>Bulas</Link>
                <Link to="/arts" className={styles.link}>ART</Link>
                <Link to="/minha-conta" className={styles.link}>Minha Conta</Link>
            </nav>
        </header>
    );
}