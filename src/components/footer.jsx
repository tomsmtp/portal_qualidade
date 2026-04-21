import styles from './footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>

            <a href="https://www.agt.com.br" target="_blank" rel="noopener noreferrer">
                <p>QUALIDADE - PLANEJAMENTO - {new Date().getFullYear()} {" "}</p>
            </a>
            
        </footer>
    );
}