import React from 'react';

function Filters({ types, selectedType, setSelectedType, sortByStats, setSortByStats }) {
    return (
        <div className="filters">
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                <option value="">All Types</option>
                {types.map(type => (
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