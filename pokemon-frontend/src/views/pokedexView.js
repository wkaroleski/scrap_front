// Arquivo: src/views/PokedexView.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiRefreshCw } from "react-icons/fi";
import PokemonCard from '../components/PokemonCard';
import Filters from '../components/Filters';
import PaginationControls from '../components/PaginationControls';

const ITEMS_PER_PAGE = 24;

function PokedexView({ apiBaseUrl }) {
    // --- Estados dos Inputs (o que o usuário digita) ---
    const [canal, setCanal] = useState('');
    const [usuario, setUsuario] = useState('');

    // --- Estados da Busca Ativa (o que foi confirmado no clique) ---
    const [searchedCanal, setSearchedCanal] = useState('');
    const [searchedUsuario, setSearchedUsuario] = useState('');

    // --- Estados da Lista e Paginação ---
    const [pokemonListPage, setPokemonListPage] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Estados de Filtro e Ordenação ---
    const [selectedType, setSelectedType] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [order, setOrder] = useState('asc');
    const [availableTypes, setAvailableTypes] = useState([ /* ... lista ... */
        'normal', 'fire', 'water', 'electric', 'grass', 'ice',
        'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
        'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    ]);

    // --- Função de Busca (Agora usa searchedCanal/searchedUsuario) ---
    const fetchPokemonsData = useCallback(async (forceRefresh = false) => {
        // Só busca se houver termos de busca confirmados
        if (!searchedCanal || !searchedUsuario) {
            setPokemonListPage([]); setTotalItems(0); setTotalPages(0); setError('');
            // Não precisa resetar a página aqui, pois ela só muda com interação do usuário ou nova busca
            return;
        }

        console.log(`Buscando... Canal: ${searchedCanal}, Usuário: ${searchedUsuario}, Página: ${currentPage}, Tipo: ${selectedType}, Sort: ${sortBy} ${order}, Refresh: ${forceRefresh}`);
        setIsLoading(true);
        setError('');

        const params = {
            // Usa os estados da busca confirmada
            canal: searchedCanal,
            usuario: searchedUsuario,
            // --- Parâmetros de paginação/filtro/ordenação ---
            page: currentPage,
            per_page: ITEMS_PER_PAGE,
            type: selectedType || undefined,
            sort_by: sortBy,
            order: order,
            refresh: forceRefresh ? true : undefined,
            _t: Date.now()
        };

        try {
            const response = await axios.get(`${apiBaseUrl}/api/pokemons`, { params });
            if (response.data && response.data.items && response.data.metadata) {
                setPokemonListPage(response.data.items);
                setTotalItems(response.data.metadata.total_items);
                setTotalPages(response.data.metadata.total_pages);
                if (response.data.metadata.page !== currentPage) {
                    setCurrentPage(response.data.metadata.page);
                }
            } else {
                setError("Formato de resposta inesperado da API.");
                setPokemonListPage([]); setTotalItems(0); setTotalPages(0);
            }
        } catch (error) {
            console.error("Erro ao buscar Pokémon:", error);
            const errorMsg = error.response?.data?.error || "Falha ao buscar dados dos Pokémon.";
            setError(errorMsg);
            setPokemonListPage([]); setTotalItems(0); setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
        // Depende dos estados de busca confirmada + paginação/filtros
    }, [apiBaseUrl, searchedCanal, searchedUsuario, currentPage, selectedType, sortBy, order]);


    // --- useEffect Principal (Agora depende da busca confirmada) ---
    useEffect(() => {
        // Chama a busca se os termos confirmados existirem
        // Isso vai rodar quando searchedCanal/searchedUsuario mudarem (após clique no botão)
        // ou quando currentPage/selectedType/sortBy/order mudarem para uma busca ativa.
        if (searchedCanal && searchedUsuario) {
            fetchPokemonsData();
        } else {
            // Se não há busca ativa, garante que a lista esteja limpa
            setPokemonListPage([]);
            setTotalItems(0);
            setTotalPages(0);
            setCurrentPage(1); // Reseta página se a busca for cancelada/limpa
            setError('');
        }
        // Removido canal, usuario das dependências, adicionado searchedCanal, searchedUsuario
    }, [searchedCanal, searchedUsuario, currentPage, selectedType, sortBy, order, fetchPokemonsData]);


    // --- Handler do Botão Buscar (Confirma a busca) ---
    const handleSearchClick = () => {
        if (!canal || !usuario) {
            alert("Por favor, preencha o canal e o usuário.");
            return;
        }
        // Atualiza os estados da busca confirmada com os valores dos inputs
        setSearchedCanal(canal);
        setSearchedUsuario(usuario);
        // Reseta para a página 1 para a nova busca
        setCurrentPage(1);
        // O useEffect vai disparar a chamada a fetchPokemonsData por causa
        // da mudança em searchedCanal, searchedUsuario e/ou currentPage.
    };

    // --- Handler do Botão Refresh (Usa a busca confirmada) ---
    const handleRefreshClick = () => {
        // Só faz refresh se já houve uma busca confirmada
        if (!searchedCanal || !searchedUsuario) {
            alert("Faça uma busca primeiro antes de atualizar.");
            return;
        }
        // Opcional: manter a página atual ou resetar para 1? Vamos manter a atual.
        // setCurrentPage(1);
        fetchPokemonsData(true); // Chama a função com forceRefresh = true para a busca atual
    };


    // --- Lógica para tecla Enter nos inputs ---
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearchClick(); // Chama a mesma função do botão
        }
    };


    return (
        <div>
            {/* Input Fields - Adiciona onKeyPress */}
            <div className="input-fields">
                <input
                    type="text"
                    placeholder="Canal"
                    value={canal}
                    onChange={e => setCanal(e.target.value)}
                    onKeyPress={handleKeyPress} // <-- Adicionado
                    disabled={isLoading}
                />
                <input
                    type="text"
                    placeholder="Usuário da Twitch"
                    value={usuario}
                    onChange={e => setUsuario(e.target.value)}
                    onKeyPress={handleKeyPress} // <-- Adicionado
                    disabled={isLoading}
                />
                {/* Botão Buscar agora chama handleSearchClick */}
                <button onClick={handleSearchClick} disabled={isLoading || !canal || !usuario} >
                    {isLoading ? "Buscando..." : "Buscar Pokémon"}
                </button>
                {/* Botão Refresh agora chama handleRefreshClick */}
                <button onClick={handleRefreshClick} disabled={isLoading || !searchedCanal || !searchedUsuario} style={{ marginLeft: '10px', padding: '8px' }} title="Forçar atualização dos dados da busca atual">
                    {/* Desabilita se estiver carregando ou se não houver busca ativa */}
                    {isLoading ? <span className="spinner">🔄</span> : <FiRefreshCw size={20} />}
                </button>
            </div>

            {/* Filtros - Mostra se houver busca ativa ou loading/error */}
            {(searchedCanal && searchedUsuario) || isLoading || error ? (
                <Filters
                    types={availableTypes}
                    selectedType={selectedType}
                    // Ao mudar filtro/ordem, reseta a página. O useEffect busca.
                    setSelectedType={(type) => { setSelectedType(type); setCurrentPage(1); }}
                    sortBy={sortBy}
                    setSortBy={(value) => { setSortBy(value); setCurrentPage(1); }}
                    order={order}
                    setOrder={(value) => { setOrder(value); setCurrentPage(1); }}
                />
            ) : (
                // Mensagem inicial antes da primeira busca
                <p style={{ marginTop: '20px', fontStyle: 'italic' }}>Digite o canal e usuário e clique em "Buscar Pokémon".</p>
            )}


            {/* Loading / Error */}
            {isLoading && <p>Carregando Pokémon...</p>}
            {error && <p className="error-message">Erro: {error}</p>}

            {/* Lista ou Mensagem de Nenhum Resultado */}
            {!isLoading && !error && searchedCanal && searchedUsuario && totalItems === 0 && <p>Nenhum Pokémon encontrado para '{searchedUsuario}' no canal '{searchedCanal}' com os filtros selecionados.</p>}
            {!isLoading && totalItems > 0 && (
                <div className="pokemon-list">
                    {pokemonListPage.map(pokemon => (
                        pokemon ? <PokemonCard key={pokemon.id || Math.random()} pokemon={pokemon} /> : null
                    ))}
                </div>
            )}

            {/* Controles de Paginação */}
            {!isLoading && totalPages > 1 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    totalItems={totalItems}
                />
            )}

        </div>
    );
}

export default PokedexView;