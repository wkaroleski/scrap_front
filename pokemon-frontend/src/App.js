import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonCard from './components/PokemonCard';
import Filters from './components/Filters';
import './App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [sortByStats, setSortByStats] = useState(false);
  const [canal, setCanal] = useState('');  // Estado para o canal
  const [usuario, setUsuario] = useState('');  // Estado para o usuário
  const [loading, setLoading] = useState(false);  // Estado para carregamento

  const fetchPokemons = () => {
    if (!canal || !usuario) {
      alert("Por favor, preencha o canal e o usuário.");
      return;
    }

    setLoading(true);  // Ativa o estado de carregamento

    // Busca os Pokémon do backend Flask
    axios.get('https://scrap-back-27u1.onrender.com/api/pokemons', {
      params: {
        canal: canal,
        usuario: usuario
      }
    })
      .then(response => {
        setPokemons(response.data);
        setFilteredPokemons(response.data);
        // Extrai todos os tipos únicos de Pokémon
        const allTypes = response.data.flatMap(p => p.types);
        setTypes([...new Set(allTypes)]);
        setLoading(false);  // Desativa o estado de carregamento
      })
      .catch(error => {
        console.error(error);
        setLoading(false);  // Desativa o estado de carregamento em caso de erro
      });
  };

  useEffect(() => {
    if (pokemons.length > 0) {
      let filtered = pokemons;
      if (selectedType) {
        filtered = filtered.filter(p => p.types.includes(selectedType));
      }
      if (sortByStats) {
        filtered = [...filtered].sort((a, b) => b.total_base_stats - a.total_base_stats);
      }
      setFilteredPokemons(filtered);
    }
  }, [selectedType, sortByStats, pokemons]);

  return (
    <div className="App">
      <h1>Pokémon Collection</h1>

      {/* Campos de entrada para canal e usuário */}
      <div className="input-fields">
        <input
          type="text"
          placeholder="Canal"
          value={canal}
          onChange={e => setCanal(e.target.value)}
        />
        <input
          type="text"
          placeholder="Usuário da Twitch"
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
        />
        <button onClick={fetchPokemons} disabled={loading}>
          {loading ? "Carregando..." : "Buscar Pokémon"}
        </button>
      </div>

      {/* Filtros e lista de Pokémon */}
      <Filters
        types={types}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        sortByStats={sortByStats}
        setSortByStats={setSortByStats}
      />
      <div className="pokemon-list">
        {filteredPokemons.map(pokemon => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    </div>
  );
}

export default App;
