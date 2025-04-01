import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FiSun, FiMoon, FiRefreshCw, FiMenu, FiX } from "react-icons/fi";
import Sidebar from './components/Sidebar';
import PokedexView from './views/pokedexView';
import CompareView from './views/compareView';

import './App.css';

// Define a URL da API baseado no ambiente (pode ficar aqui ou ser importado)
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? 'https://scrap-back-27u1.onrender.com' // Sua URL de produção
  : 'http://localhost:5000'; // Sua URL local
console.log(`APP: API rodando em modo: ${isProduction ? 'Produção' : 'Desenvolvimento'}. URL Base: ${API_BASE_URL}`);

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Inverte o estado atual
  };
  // --- State e Lógica do Dark Mode (Pode ficar aqui se for global) ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const body = document.body;
    if (isDarkMode) { body.classList.add('dark-mode'); localStorage.setItem('theme', 'dark'); }
    else { body.classList.remove('dark-mode'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);
  // --- Fim do Dark Mode ---

  // O App.js agora só renderiza o layout base e as rotas
  return (
    // Não precisa mais da classe dark-mode aqui se aplicou no body
    <div className="App">
      {/* --- BOTÃO HAMBURGER/X --- */}
      <button
        onClick={toggleSidebar}
        className="hamburger-button"
        // Atualiza aria-label dinamicamente
        aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
        title={isSidebarOpen ? "Fechar menu" : "Abrir menu"} // Tooltip dinâmico
      >
        {/* Renderiza FiX se estiver aberto, FiMenu se fechado */}
        {isSidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      {/* --- FIM BOTÃO HAMBURGER/X --- */}

      {/* --- RENDERIZA O SIDEBAR --- */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={toggleSidebar} />
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      {/* Botão de Toggle Dark Mode (Global) */}
      <button onClick={toggleDarkMode} className="theme-toggle-button" aria-label={`Mudar para tema ${isDarkMode ? 'claro' : 'escuro'}`} title={`Mudar para tema ${isDarkMode ? 'claro' : 'escuro'}`} >
        {isDarkMode ? <FiSun /> : <FiMoon />}
      </button>

      <h1>ScrapDex</h1>

      {/* --- Definição das Rotas --- */}
      <Routes>
        {/* Rota Principal: Renderiza PokedexView */}
        <Route
          path="/"
          element={<PokedexView apiBaseUrl={API_BASE_URL} />} // Passa a URL da API como prop
        />

        {/* Rota de Comparação: Renderiza CompareView */}
        <Route
          path="/compare"
          element={<CompareView apiBaseUrl={API_BASE_URL} />} // Passa a URL da API como prop
        />

        {/* Opcional: Rota para página não encontrada */}
        {/* <Route path="*" element={<div>Página não encontrada!</div>} /> */}
      </Routes>
      {/* --- Fim das Rotas --- */}

    </div>
  );
}

export default App;