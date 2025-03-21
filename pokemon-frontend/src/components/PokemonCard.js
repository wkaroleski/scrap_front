import React, { useState } from 'react';

// Função para mapear os tipos de Pokémon para gradientes metalizados
const getTypeColor = (type) => {
    switch (type) {
        case 'fighting': return 'linear-gradient(45deg, #ce3f6a, #ff7f9f)';
        case 'psychic': return 'linear-gradient(45deg, #f97077, #ff9a9e)';
        case 'poison': return 'linear-gradient(45deg, #ab6ac8, #d8a5eb)';
        case 'dragon': return 'linear-gradient(45deg, #096dc3, #4da8ff)';
        case 'ghost': return 'linear-gradient(45deg, #5269ab, #8fa8de)';
        case 'dark': return 'linear-gradient(45deg, #595365, #8c8c8c)';
        case 'ground': return 'linear-gradient(45deg, #d97746, #ffa07a)';
        case 'fire': return 'linear-gradient(45deg, #fe9c53, #ffcc70)';
        case 'fairy': return 'linear-gradient(45deg, #ec8fe7, #ffb6f4)';
        case 'water': return 'linear-gradient(45deg, #4d90d5, #87cefa)';
        case 'flying': return 'linear-gradient(45deg, #8fa8de, #b0c4de)';
        case 'normal': return 'linear-gradient(45deg, #9098a2, #c0c0c0)';
        case 'rock': return 'linear-gradient(45deg, #c6b889, #e0c68c)';
        case 'electric': return 'linear-gradient(45deg, #f4d23b, #ffeb3b)';
        case 'bug': return 'linear-gradient(45deg, #90c02c, #c0e862)';
        case 'grass': return 'linear-gradient(45deg, #63bb5c, #90ee90)';
        case 'ice': return 'linear-gradient(45deg, #73cebf, #a0e6d2)';
        case 'steel': return 'linear-gradient(45deg, #5a8fa1, #87b8c7)';
        default: return 'linear-gradient(45deg, #9098a2, #c0c0c0)'; // Gradiente padrão
    }
};

const PokemonCard = ({ pokemon }) => {
    const [isFlipped, setIsFlipped] = useState(false); // Estado para controlar se o card está virado

    // Gera o gradiente com base nos tipos do Pokémon
    const getBackgroundStyle = () => {
        if (pokemon.types && pokemon.types.length > 1) {
            // Gradiente para múltiplos tipos
            const color1 = getTypeColor(pokemon.types[0]);
            const color2 = getTypeColor(pokemon.types[1]);
            return {
                background: `${color1}, ${color2}`,
            };
        } else {
            // Gradiente para um único tipo
            const gradient = getTypeColor(pokemon.types ? pokemon.types[0] : 'normal');
            return {
                background: gradient,
            };
        }
    };

    // Função para virar o card
    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div
            className={`pokemon-card ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
            style={getBackgroundStyle()} // Aplica o gradiente
        >
            <div className="card-front">
                {/* Fundo com Pokébola */}
                <div className="pokeball-background"></div>

                {/* Nome do Pokémon e indicador de shiny */}
                <div className="card-name">
                    <h2>{pokemon.name}</h2>
                    {pokemon.shiny && <p className="shiny">✨ Shiny ✨</p>}
                </div>

                {/* Imagem do Pokémon centralizada */}
                <div className="card-image">
                    <img src={pokemon.image} alt={pokemon.name} />
                </div>

                {/* Tipo do Pokémon centralizado */}
                <div className="card-type">
                    <p>{pokemon.types ? pokemon.types.join(', ') : 'Unknown'}</p>
                </div>

                {/* ID do Pokémon no canto inferior direito */}
                <div className="card-id">
                    <p>#{pokemon.id}</p>
                </div>

                {/* Stats Total no canto superior direito */}
                <div className="card-stats">
                    <p><strong>Stats Base = {pokemon.total_base_stats}</strong></p>
                </div>

            </div>

            {/* Verso do card */}
            <div className="card-back">
                <h2>{pokemon.name} Stats</h2>
                {pokemon.stats ? (
                    <ul>
                        {Object.entries(pokemon.stats).map(([statName, statValue]) => (
                            <li key={statName}>
                                <strong>{statName}:</strong> {statValue}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No stats available.</p>
                )}
            </div>
        </div>
    );
};

export default PokemonCard;