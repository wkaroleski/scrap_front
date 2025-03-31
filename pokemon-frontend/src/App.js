// Arquivo: App.js (Versão Simplificada com Rotas)
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; // <-- Importa componentes de rota
// Importa os ícones para o toggle de tema
import { FiSun, FiMoon } from "react-icons/fi";

// Importa os NOVOS componentes de página/view que vamos criar
import PokedexView from './views/pokedexView'; // Assumindo que criará em src/views/
import CompareView from './views/compareView'; // Assumindo que criará em src/views/

import './App.css';

// Define a URL da API baseado no ambiente (pode ficar aqui ou ser importado)
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? 'https://scrap-back-27u1.onrender.com' // Sua URL de produção
  : 'http://localhost:5000'; // Sua URL local
console.log(`APP: API rodando em modo: ${isProduction ? 'Produção' : 'Desenvolvimento'}. URL Base: ${API_BASE_URL}`);

function App() {
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