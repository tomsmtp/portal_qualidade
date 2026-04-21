import { useState, useEffect, useRef } from 'react';
import style from './home.module.css';

export default function Home() {

    // CLIMA /////////////////////////////////////////////////////////////////////////////////
    const cidades = {
        'PARAGUAÇU PAULISTA, SP': 'https://www.google.com/search?q=paraguacu_paulista_sp_clima',
        'MARACAÍ, SP': 'https://www.google.com/search?q=maracai_sp_clima',
        'ASSIS, SP': 'https://www.google.com/search?q=assis_sp_clima',
        'ANAURILÂNDIA, MS': 'https://www.google.com/search?q=anaurilandia_ms_clima'
    };

    const obterlink = (cidade) => {
    return cidades[cidade.toUpperCase()] || '#';
    };
    
    const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
        
    const IconMapa = {
        'clear_day': '☀️',
        'clear': '☀️',
        'Sol': '☀️',
        'clear_night': '🌙',
        'cloudly_day': '☁️',
        'cloud': '☁️',
        'cloudiness': '☁️',
        'Tempo nublado': '☁️',
        'cloudly_day': '☀️☁️',
        'Parcialmente nublado': '☀️☁️',
        'cloudly_night': '🌙☁️',
        'rain': '🌧️',
        'Chuva': '🌧️',
        'storm': '⛈️',
        'Tempestade': '⛈️',
        'snow': '❄️',
        'Neve': '❄️',
        'fog': '🌫️',
    };

    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carrossel automático
    useEffect(() => {
        if (weatherData.length === 0) return;

        const interval = setInterval(() => {
            setCurrentWeatherIndex((prev) => (prev + 1) % weatherData.length);
        }, 10000); // Muda a cada 5 segundos

        return () => clearInterval(interval);
    }, [weatherData.length]);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_API_ENDPOINT_CLIMA);
                if (!response.ok) throw new Error('Erro na requisição');
                const data = await response.json();
                setWeatherData(data.map(item => item.results));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchWeather(); 
    }, []);



    // API PARA FRASES /////////////////////////////////////////////////////////////////////////////////
    const [frase, setFrase] = useState('');
    useEffect(() => {
        const fetchFrase = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_API_FRASE);
                if (!response.ok) throw new Error('Erro na requisição da frase');
                const data = await response.json();
                setFrase(data.advice);
            } catch (err) {
                setFrase('Não foi possível carregar a frase do dia.');
            }
        };
        fetchFrase();
    }, []);





    // RECOMENDAÇÕES - CARREGANDO DADOS PARA O CHAT /////////////////////////////////////////////////////////////////////////////////
    const [recomendacoes, setRecomendacoes] = useState([]);
    const VITE_CONSULTA_RECOMENDACAO = import.meta.env.VITE_CONSULTA_RECOMENDACAO;

    useEffect(() => {
        const fetchRecomendacoes = async () => {
            try {
                const response = await fetch(VITE_CONSULTA_RECOMENDACAO);
                if (!response.ok) throw new Error('Erro ao carregar recomendações');
                const result = await response.json();
                const dataArray = Array.isArray(result) ? result : result.dados || result.data || [];
                setRecomendacoes(dataArray);
            } catch (err) {
                console.error('Erro ao carregar recomendações:', err);
            }
        };
        fetchRecomendacoes();
    }, [VITE_CONSULTA_RECOMENDACAO]);




    // CHAT /////////////////////////////////////////////////////////////////////////////////
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [chatType, setChatType] = useState('GERAL'); // Tipo de chat ativo (padrão: GERAL)
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputValue.trim() === '') {
                alert('Digite uma mensagem antes de enviar.');
                return;
        }
        
        const userMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };
        
        setMessages([...messages, userMessage]);
        const messageToSend = inputValue;
        setInputValue('');

        try {
            // Filtrar apenas recomendações com dados relevantes
            const recomendacoesValidas = recomendacoes.filter(rec => 
                rec.RECOMENDACAO !== null && 
                rec.RECOMENDACAO !== '' && 
                rec.ZONA !== null
            );

            const payload = {
                mensagem: messageToSend,
                tipo_chat: chatType,
                ...(recomendacoesValidas.length > 0 && {
                    contexto: { recomendacoes: recomendacoesValidas }
                })
            };

            const response = await fetch(import.meta.env.VITE_API_CHAT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const data = await response.json();

            const botMessage = {
                id: Date.now() + 1,
                text: data.resposta || 'Sem resposta do servidor',
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Erro ao conectar com o backend:', error);
            
            const errorMessage = {
                id: Date.now() + 1,
                text: `Erro: ${error.message}`,
                sender: 'bot',
                timestamp: new Date()
            };
            
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Limpar chat quando atingir 20 mensagens
    useEffect(() => {
        if (messages.length >= 20) {
            setMessages([]);
        }
    }, [messages.length]);

    // Limpar chat após 3 minutos sem interação
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (messages.length > 0) {
                setMessages([]);
            }
        }, 3 * 60 * 1000); // 3 minutos

        return () => clearTimeout(timeoutId);
    }, [messages]);


    ///////////////////////////////////////////////////////////////////////////////////
    if (loading) return <p>Carregando...</p>;
    if (error) return <p>Erro: {error}</p>;
    /////////////////////////////////////////////////////////////////////////////////

    return (
        <main className={style.main}>

            <div className={style.frase_container}>
                <h1>{frase}</h1>
            </div>


            <div className={style.chat_container}>
                <h2 style={{ margin: 0, fontSize: '1.1em', textAlign: 'center', marginBottom: '12px' }}>CHAT - CONSULTA</h2>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                    <select 
                        value={chatType}
                        onChange={(e) => setChatType(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            transition: 'all 0.2s ease',
                            minWidth: '200px'
                        }}
                    >
                        <option value="GERAL">CHAT-GERAL</option>
                        <option value="RECOMENDACAO">CHAT-RECOMENDAÇÃO</option>
                        <option value="ART">CHAT-ART</option>
                    </select>
                </div>
                
                <div className={style.messages_container} ref={messagesContainerRef}>
                    {messages.length === 0 ? (
                        <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: 'auto' }}>
                            Sem mensagens ainda...
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`${style.message} ${msg.sender === 'user' ? style.user_message : style.bot_message}`}>
                                {msg.text}
                            </div>
                        ))
                    )}

                </div>
                <div className={style.input_container}>
                    <textarea 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)} 
                        onKeyPress={handleKeyPress} 
                        placeholder="Digite sua mensagem..."
                        rows="2"
                    />
                    <button onClick={handleSendMessage}>Enviar</button>
                    <small style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: '0.75em' }}>
                        IA pode cometer erros.
                    </small>
                </div>
            </div>  

            <div className={style.card_container}>
                {weatherData.length > 0 && (
                    <div key={currentWeatherIndex} className={style.weather_card}>
                        <h3>{weatherData[currentWeatherIndex].city}</h3>
                        <p className={style.weather_icon}>{IconMapa[weatherData[currentWeatherIndex].forecast[0].description]}</p>
                        <p>Dia: {weatherData[currentWeatherIndex].forecast[0].full_date}</p>
                        <p>Temperatura: {weatherData[currentWeatherIndex].temp}°C</p>
                        <p>Condição: {weatherData[currentWeatherIndex].forecast[0].description}</p>
                        <p>Umidade: {weatherData[currentWeatherIndex].forecast[0].humidity}%</p>
                        <p>Probabilidade de Chuva: {weatherData[currentWeatherIndex].forecast[0].rain_probability}%</p>
                        <p>Vento: {weatherData[currentWeatherIndex].forecast[0].wind_speedy}</p>
                        <p>Direção do Vento: {weatherData[currentWeatherIndex].wind_cardinal}</p>
                        <button className={style.link_button} onClick={() => window.open(obterlink(weatherData[currentWeatherIndex].city), '_blank')}>Ver mais</button>
                        <div className={style.carousel_controls}>
                            <button onClick={() => setCurrentWeatherIndex((prev) => (prev - 1 + weatherData.length) % weatherData.length)}>❮</button>
                            <span>{currentWeatherIndex + 1} / {weatherData.length}</span>
                            <button onClick={() => setCurrentWeatherIndex((prev) => (prev + 1) % weatherData.length)}>❯</button>
                        </div>
                        <small style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: '0.75em' }}>
                            Dados atualizados a cada 6 horas.
                        </small>
                    </div>
                )}
            </div>
        </main>
    );
}