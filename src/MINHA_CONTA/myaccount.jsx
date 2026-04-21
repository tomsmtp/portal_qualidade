import style from './myaccount.module.css';

export default function MyAccount() {

    return (

        <main className={style.main}>

            <div className={style.content}>
                <h1>Dados Conta</h1>
                <p title='NOME UTILIZADO PARA LOGIN, NÃO PODE SER ALTERADO'>USUÁRIO: EXEMPLO</p>
                <p title='EMAIL UTILIZADO PARA LOGIN, NÃO PODE SER ALTERADO'>EMAIL: EXEMPLO</p>
                <p title='SENHA UTILIZADA PARA LOGIN, PODE SER ALTERADA'>SENHA*: EXEMPLO</p>
                <p title='UNIDADE(S) ASSOCIADA(S) AO USUÁRIO'>UNIDADE(S): EXEMPLO</p>
                <div>
                    <button className={style.loginButton}>MUDAR SENHA</button>
                    <button className={style.loginButton}>SAIR</button>
                    <small title='PARA MAIS INFORMAÇÕES; FALE COM O TIME DA QUALIDADE/PLANEJAMENTO AGRÍCOLA'>?</small>
                </div>
            </div>
        </main>
    );
}