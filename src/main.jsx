import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/header'
import Footer from './components/footer'
import Home from './HOME/home'
import Boletins from './BOLETINS/boletins'
import MyAccount from './MINHA_CONTA/myaccount'
import Recomendacao from './RECOMENDACAO/recomendacao'

// CRIANDO ROTAS PRO PORTAL
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boletins" element={<Boletins />} />
        <Route path="/recomendacao" element={<Recomendacao />} />
        <Route path="/minha-conta" element={<MyAccount />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)
