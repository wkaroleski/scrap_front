// Arquivo: src/views/CompareView.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Importa Link
import PokemonCard from '../components/PokemonCard'; // Ajuste o caminho
// import './CompareView.css'; // Se criar CSS específico

// Recebe a URL base da API via props
function CompareView({ apiBaseUrl }) {
    // --- Copia os Estados da Comparação do App.js antigo ---
    const [compareCanal, setCompareCanal] = useState('');
    const [compareUser1, setCompareUser1] = useState('');
    const [compareUser2, setCompareUser2] = useState('');
    const [comparisonResult, setComparisonResult] = useState(null);
    const [comparedUserName, setComparedUserName] = useState('');
    const [comparisonLoading, setComparisonLoading] = useState(false);
    const [comparisonError, setComparisonError] = useState('');
    // --- Fim Estados Comparação ---

    // --- Copia a Função handleCompare do App.js antigo ---
    const handleCompare = () => {
        if (!compareCanal || !compareUser1 || !compareUser2) { alert("Por favor, preencha todos os três campos para comparar."); return; }
        if (compareUser1.toLowerCase() === compareUser2.toLowerCase()) { alert("Os nomes de usuário não podem ser iguais."); return; }
        console.log(`Comparando: Canal=${compareCanal}, User1=${compareUser1}, User2=${compareUser2}`);
        setComparisonLoading(true); setComparisonResult(null); setComparedUserName(''); setComparisonError('');

        axios.get(`${apiBaseUrl}/api/compare_dex`, { // Usa a prop apiBaseUrl
            params: { canal: compareCanal, usuario1: compareUser1, usuario2: compareUser2 }
        })
            .then(response => {
                console.log("Comparação API response:", response.data);
                if (response.data && response.data.pokemon_que_faltam) {
                    setComparisonResult(response.data.pokemon_que_faltam);
                    setComparedUserName(response.data.usuario_comparado || compareUser2);
                } else { setComparisonResult([]); setComparedUserName(compareUser2); setComparisonError("Resposta inesperada."); }
            })
            .catch(error => {
                console.error("Erro ao comparar Pokédex:", error);
                const errorMsg = error.response?.data?.error || "Não foi possível realizar a comparação.";
                setComparisonError(errorMsg); setComparisonResult([]);
            })
            .finally(() => setComparisonLoading(false));
    };
    // --- Fim Função Comparar ---

    return (
        <div> {/* Envolve em um div ou fragmento */}
            {/* Link para Voltar */}
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <Link to="/">
                    <button>&larr; Voltar para Minha Pokédex</button> {/* Botão simples de voltar */}
                </Link>
            </div>

            {/* --- Copia a Seção de Comparação do App.js antigo --- */}
            <div className="comparison-section">
                <h2>Compare sua Pokédex</h2>
                <p>Veja os Pokémon que outro treinador no canal tem e você não.</p>

                <div className="comparison-inputs">
                    <div className="comparison-input-group">
                        <label htmlFor="compareCanal">Canal:</label>
                        <input id="compareCanal" type="text" placeholder="Canal" value={compareCanal} onChange={(e) => setCompareCanal(e.target.value)} disabled={comparisonLoading} />
                    </div>
                    <div className="comparison-input-group">
                        <label htmlFor="compareUser1">Seu Usuário:</label>
                        <input id="compareUser1" type="text" placeholder="Seu usuário" value={compareUser1} onChange={(e) => setCompareUser1(e.target.value)} disabled={comparisonLoading} />
                    </div>
                    <div className="comparison-input-group">
                        <label htmlFor="compareUser2">Comparar com:</label>
                        <input id="compareUser2" type="text" placeholder="Usuário do outro treinador" value={compareUser2} onChange={(e) => setCompareUser2(e.target.value)} disabled={comparisonLoading} />
                    </div>
                    <button onClick={handleCompare} disabled={comparisonLoading || !compareCanal || !compareUser1 || !compareUser2} >
                        {comparisonLoading ? "Comparando..." : "Comparar"}
                    </button>
                </div>

                <div className="comparison-results">
                    {comparisonLoading && <p>Comparando Pokédex...</p>}
                    {comparisonError && <p className="error-message">Erro: {comparisonError}</p>}
                    {comparisonResult && !comparisonLoading && !comparisonError && (
                        <>
                            <h3 className="results-title">
                                Pokémon que {comparedUserName || 'o outro treinador'} tem e você não:
                            </h3>
                            {comparisonResult.length === 0 ? (
                                <p>Nenhuma diferença encontrada!</p>
                            ) : (
                                <div className="pokemon-list">
                                    {comparisonResult.map(pokemon => (
                                        pokemon ? <PokemonCard key={'comp-' + pokemon.id} pokemon={pokemon} /> : null
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* --- Fim Seção Comparação --- */}
        </div>
    );
}

export default CompareView;