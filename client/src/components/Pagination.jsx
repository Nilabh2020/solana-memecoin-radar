export default function Pagination({ pagination, onPageChange }) {
  const { total, limit, offset } = pagination;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) return null;

  function goToPage(page) {
    onPageChange((page - 1) * limit);
  }

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-xs text-tahoe-400 dark:text-gray-500">
        Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-xs rounded-lg bg-tahoe-200/60 dark:bg-surface-300 text-tahoe-500 dark:text-gray-400
                     hover:bg-tahoe-200 dark:hover:bg-surface-200 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
        >
          Prev
        </button>
        {pages.map(page => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-primary-500 dark:bg-primary-600 text-white'
                : 'bg-tahoe-200/60 dark:bg-surface-300 text-tahoe-500 dark:text-gray-400 hover:bg-tahoe-200 dark:hover:bg-surface-200'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-xs rounded-lg bg-tahoe-200/60 dark:bg-surface-300 text-tahoe-500 dark:text-gray-400
                     hover:bg-tahoe-200 dark:hover:bg-surface-200 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
