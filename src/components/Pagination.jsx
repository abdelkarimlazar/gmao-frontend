function Pagination({
  pageNumber = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  onPrevious,
  onNext,
}) {
  const safeTotalPages = totalPages || 1;

  return (
    <div className="pagination">
      <p className="pagination__meta">
        {totalCount} élément(s) | page {pageNumber} sur {safeTotalPages} | taille {pageSize}
      </p>

      <div className="pagination__actions">
        <button
          type="button"
          className="pagination__button"
          onClick={onPrevious}
          disabled={pageNumber <= 1}
        >
          Précédent
        </button>

        <button
          type="button"
          className="pagination__button"
          onClick={onNext}
          disabled={pageNumber >= safeTotalPages}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

export default Pagination;