// Arquivo: src/views/PokedexView.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // <-- Importa Link para navegação
import { FiRefreshCw } from "react-icons/fi"; // Ícone de refresh
import PokemonCard from '../components/PokemonCard'; // Ajuste o caminho se necessário
import Filters from '../components/Filters';       // Ajuste o caminho se necessário
// Importa o CSS global ou um específico se desejar
// import './PokedexView.css'; // Se criar CSS específico

// Recebe a URL base da API via props
function PokedexView({ apiBaseUrl }) {
    // --- Copia os Estados da Pokédex Principal do App.js antigo ---
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
    // --- Fim dos Estados ---

    // --- Copia as Funções de API e Helpers do App.js antigo ---
    const handleApiResponse = (data) => {
        setPokemons(data);
        const allTypes = data.flatMap(p => p.types || []);
        setTypes([...new Set(allTypes)]);
        setPrevParams({ canal, usuario });
    };

    const handleApiError = (error) => {
        console.error("Erro ao buscar/atualizar Pokémon:", error);
        const errorMsg = error.response?.data?.error || "Erro ao buscar/atualizar Pokémon.";
        alert(errorMsg);
    };

    const fetchPokemons = () => {
        if (!canal || !usuario) { alert("Por favor, preencha o canal e o usuário."); return; }
        if (prevParams.canal === canal && prevParams.usuario === usuario && !isFetchingInitial) { console.log("Params iguais, busca ignorada."); return; }
        console.log("Buscando Pokémon para:", canal, usuario);
        setLoading(true); setIsFetchingInitial(true);
        axios.get(`${apiBaseUrl}/api/pokemons`, { params: { canal, usuario, _t: Date.now() } })
            .then(response => handleApiResponse(response.data))
            .catch(handleApiError)
            .finally(() => { setLoading(false); setIsFetchingInitial(false); });
    };

    const handleRefresh = () => {
        if (!canal || !usuario) { alert("Canal e usuário precisam estar preenchidos para atualizar."); return; }
        console.log("Forçando refresh para:", canal, usuario);
        setLoading(true); setIsFetchingInitial(false);
        axios.get(`${apiBaseUrl}/api/pokemons`, { params: { canal, usuario, refresh: true, _t: Date.now() } })
            .then(response => handleApiResponse(response.data))
            .catch(handleApiError)
            .finally(() => setLoading(false));
    };
    // --- Fim das Funções ---

    // --- Copia o useEffect de Filtros/Ordenação do App.js antigo ---
    useEffect(() => {
        if (!pokemons || pokemons.length === 0) { setFilteredPokemons([]); return; };
        console.log("Aplicando filtros/ordenação na Dex principal...");
        let filtered = [...pokemons];
        if (selectedType) { filtered = filtered.filter(p => Array.isArray(p.types) && p.types.includes(selectedType)); }
        if (sortByStats) { filtered.sort((a, b) => (b.total_base_stats || 0) - (a.total_base_stats || 0)); }
        setFilteredPokemons(filtered);
    }, [selectedType, sortByStats, pokemons]);
    // --- Fim useEffect ---

    // Dentro do componente PokedexView

    return (
        <div> {/* Div principal do componente */}

            {/* Seção de Busca Principal */}
            <div className="input-fields">
                <input type="text" placeholder="Canal" value={canal} onChange={e => setCanal(e.target.value)} disabled={loading} />
                <input type="text" placeholder="Usuário da Twitch" value={usuario} onChange={e => setUsuario(e.target.value)} disabled={loading} />
                <button onClick={fetchPokemons} disabled={loading || !canal || !usuario || (prevParams.canal === canal && prevParams.usuario === usuario && !isFetchingInitial)} >
                    {loading && isFetchingInitial ? "Buscando..." : "Buscar Pokémon"}
                </button>
                <button onClick={handleRefresh} disabled={loading || !canal || !usuario} style={{ marginLeft: '10px', padding: '8px' }} aria-label="Atualizar dados" title="Forçar atualização dos dados" >
                    {loading && !isFetchingInitial ? <span className="spinner">🔄</span> : <FiRefreshCw size={20} />}
                </button>
            </div>

            {/* Filtros para a Busca Principal */}
            {/* Só mostra filtros se a busca principal já retornou pokemons */}
            {pokemons && pokemons.length > 0 && (
                <Filters
                    types={types}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    sortByStats={sortByStats}
                    setSortByStats={setSortByStats}
                />
            )}

            {/* Exibição da Pokédex Principal */}
            {loading && isFetchingInitial ? (<p>Carregando Pokémon...</p>) : (
                <div className="pokemon-list">
                    {filteredPokemons.length === 0 && pokemons.length > 0 && <p>Nenhum Pokémon encontrado com os filtros selecionados.</p>}
                    {filteredPokemons.length === 0 && !loading && prevParams.canal && pokemons.length === 0 && <p>Nenhum pokémon encontrado para este usuário/canal ou a busca falhou.</p>}
                    {filteredPokemons.map(pokemon => (
                        pokemon ? <PokemonCard key={pokemon.id || Math.random()} pokemon={pokemon} /> : null
                    ))}
                </div>
            )}
            {/* Fim da exibição da lista principal */}

        </div>
    );

}

export default PokedexView;