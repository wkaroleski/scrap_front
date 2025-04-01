// Arquivo: src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../Sidebar.css';

function Sidebar({ isOpen, closeSidebar }) {
    return (
        // A classe 'open' ou '' será adicionada dinamicamente
        // O CSS usará isso para mostrar/esconder com animação
        <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Botão para fechar o sidebar */}
            <button onClick={closeSidebar} className="close-button" aria-label="Fechar menu">
            </button>

            {/* Lista de Links de Navegação */}
            <ul>
                <li>
                    {/* Ao clicar no link, também chama closeSidebar para fechar o menu */}
                    <Link to="/" onClick={closeSidebar}>Minha Pokédex</Link>
                </li>
                <li>
                    {/* Link para Comparar (movido para cá) */}
                    <Link to="/compare" onClick={closeSidebar}>Comparar Pokédex</Link>
                </li>
                {/* Adicione mais links aqui se precisar no futuro */}
            </ul>
        </nav>
    );
}

export default Sidebar;