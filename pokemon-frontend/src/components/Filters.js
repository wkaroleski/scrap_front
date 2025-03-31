import React from 'react';

function Filters({ types, selectedType, setSelectedType, sortByStats, setSortByStats }) {

    // --- INÍCIO DA CORREÇÃO ---
    // Garante que 'types' seja sempre um array, mesmo que a prop venha inválida
    const validTypes = Array.isArray(types) ? types : [];
    // --- FIM DA CORREÇÃO ---

    return (
        <div className="filters">
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                <option value="">All Types</option>
                {/* Usa validTypes em vez de types diretamente */}
                {validTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            <label>
                <input
                    type="checkbox"
                    checked={sortByStats}
                    onChange={e => setSortByStats(e.target.checked)}
                />
                Sort by Stats (High to Low)
            </label>
        </div>
    );
}

export default Filters;