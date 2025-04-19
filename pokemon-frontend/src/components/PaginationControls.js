// Arquivo: src/components/PaginationControls.js
import React from 'react';
// import './PaginationControls.css'; // Crie este arquivo para estilos se desejar

// Props: currentPage, totalPages, setCurrentPage, totalItems (opcional)
function PaginationControls({ currentPage, totalPages, setCurrentPage, totalItems }) {

    // Não renderiza nada se houver apenas uma página ou nenhuma
    if (totalPages <= 1) {
        return null;
    }

    const handleFirst = () => setCurrentPage(1);
    const handlePrevious = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNext = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
    const handleLast = () => setCurrentPage(totalPages);

    return (
        <div className="pagination-controls" style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
            <button
                onClick={handleFirst}
                disabled={currentPage === 1}
                aria-label="Ir para a primeira página"
                title="Primeira Página"
            >
                {'<<'}
            </button>
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                aria-label="Ir para a página anterior"
                title="Página Anterior"
            >
                {'<'}
            </button>

            <span style={{ margin: '0 10px' }}>
                Página {currentPage} de {totalPages}
                {/* Opcional: Mostrar contagem de itens se totalItems for passado */}
                {/* {typeof totalItems === 'number' && ` (${totalItems} Pokémon)`} */}
            </span>

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                aria-label="Ir para a próxima página"
                title="Próxima Página"
            >
                {'>'}
            </button>
            <button
                onClick={handleLast}
                disabled={currentPage === totalPages}
                aria-label="Ir para a última página"
                title="Última Página"
            >
                {'>>'}
            </button>
        </div>
    );
}

export default PaginationControls;