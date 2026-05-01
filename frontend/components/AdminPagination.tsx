"use client";

type AdminPaginationProps = {
  currentPage: number;
  lastPage: number;
  from: number | null;
  to: number | null;
  total: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
};

function buildVisiblePages(currentPage: number, lastPage: number): number[] {
  if (lastPage <= 5) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(lastPage, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function AdminPagination({
  currentPage,
  lastPage,
  from,
  to,
  total,
  isLoading = false,
  onPageChange,
}: AdminPaginationProps) {
  if (lastPage <= 1) {
    return null;
  }

  const pages = buildVisiblePages(currentPage, lastPage);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Showing {from ?? 0}-{to ?? 0} of {total}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </button>

        {pages.map((page) => (
          <button
            key={page}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              page === currentPage
                ? "bg-teal-700 text-white"
                : "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
            type="button"
            onClick={() => onPageChange(page)}
            disabled={isLoading}
          >
            {page}
          </button>
        ))}

        <button
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage || isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
