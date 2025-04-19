// Arquivo: src/components/Filters.js
import React from 'react';

// Mapa de opções de ordenação (label amigável -> valor da API)
const sortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'name', label: 'Nome' },
    { value: 'total_base_stats', label: 'Total Stats' },
    { value: 'hp', label: 'HP' },
    { value: 'attack', label: 'Ataque' },
    { value: 'defense', label: 'Defesa' },
    { value: 'special_attack', label: 'Atq. Especial' },
    { value: 'special_defense', label: 'Def. Especial' },
    { value: 'speed', label: 'Velocidade' },
];

// Props esperadas: types, selectedType, setSelectedType, sortBy, setSortBy, order, setOrder
function Filters({ types, selectedType, setSelectedType, sortBy, setSortBy, order, setOrder }) {

    // Garante que 'types' seja sempre um array
    const validTypes = Array.isArray(types) ? types : [];

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        // A lógica de setCurrentPage(1) é feita no PokedexView ao passar a função
    };

    const handleSortByChange = (e) => {
        setSortBy(e.target.value);
        // A lógica de setCurrentPage(1) é feita no PokedexView
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
        // A lógica de setCurrentPage(1) é feita no PokedexView
    };

    return (
        <div className="filters" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            {/* Filtro de Tipo */}
            <div>
                <label htmlFor="type-select" style={{ marginRight: '5px' }}>Filtrar por Tipo:</label>
                <select
                    id="type-select"
                    value={selectedType}
                    onChange={handleTypeChange}
                >
                    <option value="">Todos</option>
                    {validTypes.map(type => (
                        <option key={type} value={type}>
                            {/* Capitaliza a primeira letra do tipo */}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ordenar Por */}
            <div>
                <label htmlFor="sortby-select" style={{ marginRight: '5px' }}>Ordenar por:</label>
                <select
                    id="sortby-select"
                    value={sortBy}
                    onChange={handleSortByChange}
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ordem (Ascendente/Descendente) */}
            <div>
                <label htmlFor="order-select" style={{ marginRight: '5px' }}>Ordem:</label>
                <select
                    id="order-select"
                    value={order}
                    onChange={handleOrderChange}
                >
                    <option value="asc">Crescente (A-Z, Menor-Maior)</option>
                    <option value="desc">Decrescente (Z-A, Maior-Menor)</option>
                </select>
            </div>

            {/* REMOVIDO: Controle antigo sortByStats */}
            {/*
            <label>
                <input
                    type="checkbox"
                    checked={sortByStats} // sortByStats não existe mais
                    onChange={e => setSortByStats(e.target.checked)} // setSortByStats não existe mais
                />
                Sort by Stats (High to Low)
            </label>
            */}
        </div>
    );
}

export default Filters;