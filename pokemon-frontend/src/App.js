import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Importe o ícone que você decidiu usar (exemplo com FiRefreshCw)
import { FiRefreshCw } from "react-icons/fi";
import PokemonCard from './components/PokemonCard';
import Filters from './components/Filters';
import './App.css';

// --- DEFINIÇÃO DA URL DA API BASEADO NO AMBIENTE ---
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? 'https://scrap-back-27u1.onrender.com' // Sua URL de produção no Render
  : 'http://localhost:5000'; // Sua URL de desenvolvimento local (backend Python)
console.log(`API rodando em modo: ${isProduction ? 'Produção' : 'Desenvolvimento'}. URL Base: ${API_BASE_URL}`);
// --- FIM DA DEFINIÇÃO ---

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [sortByStats, setSortByStats] = useState(false);
  const [canal, setCanal] = useState('');
  const [usuario, setUsuario] = useState('');
  const [loading, setLoading] = useState(false);
  const [prevParams, setPrevParams] = useState({ canal: '', usuario: '' });
  const [isFetchingInitial, setIsFetchingInitial] = useState(false);

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

    // --- USA A API_BASE_URL ---
    axios.get(`${API_BASE_URL}/api/pokemons`, {
      params: { canal, usuario, _t: Date.now() },
    })
      .then(response => {
        console.log("Busca inicial API response recebida:", response.data);
        setPokemons(response.data);
        setFilteredPokemons(response.data);
        const allTypes = response.data.flatMap(p => p.types || []);
        setTypes([...new Set(allTypes)]);
        setPrevParams({ canal, usuario });
      })
      .catch(error => {
        console.error("Erro ao buscar Pokémon:", error);
        alert("Erro ao carregar Pokémon. Verifique o console.");
        setPokemons([]);
        setFilteredPokemons([]);
        setTypes([]);
        setPrevParams({ canal: '', usuario: '' });
      })
      .finally(() => {
        setLoading(false);
        setIsFetchingInitial(false);
      });
  };

  const handleRefresh = () => {
    if (!canal || !usuario) {
      alert("Canal e usuário precisam estar preenchidos para atualizar.");
      return;
    }
    console.log("Botão Atualizar clicado - Forçando refresh para:", canal, usuario);
    setLoading(true);
    setIsFetchingInitial(false);

    // --- USA A API_BASE_URL ---
    axios.get(`${API_BASE_URL}/api/pokemons`, {
      params: {
        canal,
        usuario,
        refresh: true,
        _t: Date.now()
      },
    })
      .then(response => {
        console.log("Refresh API response recebida:", response.data);
        setPokemons(response.data);
        setFilteredPokemons(response.data);
        const allTypes = response.data.flatMap(p => p.types || []);
        setTypes([...new Set(allTypes)]);
        setPrevParams({ canal, usuario });
      })
      .catch(error => {
        console.error("Erro ao atualizar Pokémon:", error);
        alert("Erro ao atualizar Pokémon. Verifique o console.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
    <div className="App">
      <h1>Pokémon Collection</h1>

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
        <button
          onClick={fetchPokemons}
          disabled={loading || !canal || !usuario || (prevParams.canal === canal && prevParams.usuario === usuario)}
        >
          {loading && isFetchingInitial ? "Buscando..." : "Buscar Pokémon"}
        </button>
        <button
          onClick={handleRefresh}
          disabled={loading || !canal || !usuario}
          style={{ marginLeft: '10px', padding: '5px' }} // Ajuste padding se necessário
          title="Forçar atualização dos dados"
          aria-label="Atualizar dados"
        >
          {/* Usando o ícone FiRefreshCw como exemplo */}
          {loading && !isFetchingInitial ? <span className="spinner">🔄</span> : <FiRefreshCw size={14} />}
        </button>
      </div>

      {pokemons && pokemons.length > 0 && (
        <Filters
          types={types}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          sortByStats={sortByStats}
          setSortByStats={setSortByStats}
        />
      )}

      {loading ? (
        <p>Carregando Pokémon...</p>
      ) : (
        <div className="pokemon-list">
          {filteredPokemons.length === 0 && pokemons.length > 0 && <p>Nenhum Pokémon encontrado com os filtros selecionados.</p>}
          {filteredPokemons.length === 0 && !loading && prevParams.canal && <p>Nenhum pokémon encontrado para este usuário/canal ou a busca falhou.</p>}
          {filteredPokemons.map(pokemon => (
            pokemon ? <PokemonCard key={pokemon.id || Math.random()} pokemon={pokemon} /> : null
          ))}
        </div>
      )}
    </div>
  );
}

export default App;