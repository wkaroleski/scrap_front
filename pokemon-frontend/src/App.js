import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Importa ícones: Refresh, Sol (Light Mode), Lua (Dark Mode)
import { FiSun, FiMoon, FiRefreshCw } from "react-icons/fi";
import PokemonCard from './components/PokemonCard';
import Filters from './components/Filters';
import './App.css'; // Importa o CSS atualizado

// Define a URL da API baseado no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? 'https://scrap-back-27u1.onrender.com' // Sua URL de produção
  : 'http://localhost:5000'; // Sua URL local
console.log(`API rodando em modo: ${isProduction ? 'Produção' : 'Desenvolvimento'}. URL Base: ${API_BASE_URL}`);

function App() {
  // --- State e Lógica do Dark Mode ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const body = document.body; // Aplica no body para afetar a página inteira
    if (isDarkMode) {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };
  // --- Fim do Dark Mode ---

  // Estados existentes
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [sortByStats, setSortByStats] = useState(false);
  const [canal, setCanal] = useState('');
  const [usuario, setUsuario] = useState('');
  const [loading, setLoading] = useState(false);
  const [prevParams, setPrevParams] = useState({ canal: '', usuario: '' });
  const [isFetchingInitial, setIsFetchingInitial] = useState(false); // Para diferenciar loading inicial/refresh

  // Função para buscar Pokémon (sem refresh)
  const fetchPokemons = () => {
    if (!canal || !usuario) {
      alert("Por favor, preencha o canal e o usuário.");
      return;
    }
    if (prevParams.canal === canal && prevParams.usuario === usuario) {
      console.log("Parâmetros idênticos aos anteriores, busca normal ignorada.");
      return;
    }
    console.log("Buscando Pokémon para:", canal, usuario);
    setLoading(true);
    setIsFetchingInitial(true);

    axios.get(`${API_BASE_URL}/api/pokemons`, {
      params: { canal, usuario, _t: Date.now() },
    })
      .then(response => {
        console.log("Busca inicial API response recebida:", response.data);
        handleApiResponse(response.data); // Usa função helper
      })
      .catch(handleApiError) // Usa função helper
      .finally(() => {
        setLoading(false);
        setIsFetchingInitial(false);
      });
  };

  // Função para forçar atualização (com refresh)
  const handleRefresh = () => {
    if (!canal || !usuario) {
      alert("Canal e usuário precisam estar preenchidos para atualizar.");
      return;
    }
    console.log("Botão Atualizar clicado - Forçando refresh para:", canal, usuario);
    setLoading(true);
    setIsFetchingInitial(false); // Não é busca inicial

    axios.get(`${API_BASE_URL}/api/pokemons`, {
      params: { canal, usuario, refresh: true, _t: Date.now() },
    })
      .then(response => {
        console.log("Refresh API response recebida:", response.data);
        handleApiResponse(response.data); // Usa função helper
      })
      .catch(handleApiError) // Usa função helper
      .finally(() => {
        setLoading(false);
      });
  };

  // Função helper para tratar resposta da API (evita duplicação)
  const handleApiResponse = (data) => {
    setPokemons(data);
    setFilteredPokemons(data); // Atualiza filtrados também
    const allTypes = data.flatMap(p => p.types || []);
    setTypes([...new Set(allTypes)]);
    setPrevParams({ canal, usuario }); // Guarda params da última busca ok
    // Opcional: Resetar filtros ao receber novos dados?
    // setSelectedType('');
    // setSortByStats(false);
  };

  // Função helper para tratar erros da API (evita duplicação)
  const handleApiError = (error) => {
    console.error("Erro ao buscar/atualizar Pokémon:", error);
    alert("Erro ao buscar/atualizar Pokémon. Verifique o console.");
    // Decide se limpa os dados ou mantém os antigos em caso de erro
    // Se for erro na busca inicial, talvez limpar:
    // if (isFetchingInitial) {
    //     setPokemons([]); setFilteredPokemons([]); setTypes([]);
    //     setPrevParams({ canal: '', usuario: '' });
    // }
  }

  // useEffect para filtros/ordenação
  useEffect(() => {
    if (!pokemons || pokemons.length === 0) {
      setFilteredPokemons([]);
      return;
    };
    console.log("Aplicando filtros/ordenação...");
    let filtered = [...pokemons];
    if (selectedType) {
      filtered = filtered.filter(p => Array.isArray(p.types) && p.types.includes(selectedType));
    }
    if (sortByStats) {
      filtered.sort((a, b) => (b.total_base_stats || 0) - (a.total_base_stats || 0));
    }
    setFilteredPokemons(filtered);
  }, [selectedType, sortByStats, pokemons]);

  return (
    // A classe dark-mode é aplicada no body pelo useEffect
    <div className="App">

      {/* --- BOTÃO DE TOGGLE DARK MODE --- */}
      <button
        onClick={toggleDarkMode}
        className="theme-toggle-button"
        aria-label={`Mudar para tema ${isDarkMode ? 'claro' : 'escuro'}`}
        title={`Mudar para tema ${isDarkMode ? 'claro' : 'escuro'}`}
      >
        {isDarkMode ? <FiSun /> : <FiMoon />}
      </button>
      {/* --- FIM DO BOTÃO DE TOGGLE --- */}

      <h1>ScrapDex</h1>

      <div className="input-fields">
        <input
          type="text"
          placeholder="Canal"
          value={canal}
          onChange={e => setCanal(e.target.value)}
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Usuário da Twitch"
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          disabled={loading}
        />
        {/* Botão Buscar */}
        <button
          onClick={fetchPokemons}
          disabled={loading || !canal || !usuario || (prevParams.canal === canal && prevParams.usuario === usuario)}
        >
          {loading && isFetchingInitial ? "Buscando..." : "Buscar Pokémon"}
        </button>
        {/* Botão Atualizar com Ícone */}
        <button
          onClick={handleRefresh}
          disabled={loading || !canal || !usuario}
          style={{ marginLeft: '10px', padding: '8px' }}
          title="Forçar atualização dos dados"
          aria-label="Atualizar dados"
        >
          {loading && !isFetchingInitial ? <span className="spinner">🔄</span> : <FiRefreshCw size={13} />}
        </button>
      </div>

      {/* Filtros */}
      {pokemons && pokemons.length > 0 && (
        <Filters
          types={types}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          sortByStats={sortByStats}
          setSortByStats={setSortByStats}
        />
      )}

      {/* Indicador de Carregamento ou Lista */}
      {loading ? (
        <p>Carregando Pokémon...</p> // Pode trocar por uma animação melhor aqui
      ) : (
        <div className="pokemon-list">
          {filteredPokemons.length === 0 && pokemons.length > 0 && <p>Nenhum Pokémon encontrado com os filtros selecionados.</p>}
          {filteredPokemons.length === 0 && !loading && prevParams.canal && pokemons.length === 0 && <p>Nenhum pokémon encontrado para este usuário/canal ou a busca falhou.</p>}
          {filteredPokemons.map(pokemon => (
            pokemon ? <PokemonCard key={pokemon.id || Math.random()} pokemon={pokemon} /> : null
          ))}
        </div>
      )}
    </div>
  );
}

export default App;