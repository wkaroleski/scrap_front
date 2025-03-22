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
  const [canal, setCanal] = useState('');
  const [usuario, setUsuario] = useState('');
  const [loading, setLoading] = useState(false);
  const [prevParams, setPrevParams] = useState({ canal: '', usuario: '' });

  const fetchPokemons = () => {
    if (!canal || !usuario) {
      alert("Por favor, preencha o canal e o usuário.");
      return;
    }

    // Evita buscar com os mesmos parâmetros
    if (prevParams.canal === canal && prevParams.usuario === usuario) return;

    setPrevParams({ canal, usuario });
    setLoading(true);

    axios.get('https://scrap-back-27u1.onrender.com/api/pokemons', {
      params: { canal, usuario, _t: Date.now() }, // Cache-buster
    })
      .then(response => {
        setPokemons(response.data);
        setFilteredPokemons(response.data);

        // Extrai e atualiza os tipos únicos
        const allTypes = response.data.flatMap(p => p.types);
        setTypes([...new Set(allTypes)]);
      })
      .catch(() => {
        alert("Erro ao carregar Pokémon.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (pokemons.length === 0) return;

    let filtered = pokemons;
    if (selectedType) {
      filtered = filtered.filter(p => p.types.includes(selectedType));
    }
    if (sortByStats) {
      filtered = [...filtered].sort((a, b) => b.total_base_stats - a.total_base_stats);
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
