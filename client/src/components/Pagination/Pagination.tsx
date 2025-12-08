import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];

    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        {/* Nút Previous */}
        <button
          onClick={() => {
            onPageChange(currentPage - 1);
          }}
          disabled={currentPage === 1}
          className='rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <ChevronLeft className='h-5 w-5' />
        </button>

        {/* Các số trang */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => {
              onPageChange(page);
            }}
            className={`h-10 w-10 rounded-lg border transition-colors ${
              currentPage === page
                ? "border-(--primary) bg-(--primary) font-bold text-white" // Active state
                : "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Nút Next */}
        <button
          onClick={() => {
            onPageChange(currentPage + 1);
          }}
          disabled={currentPage === totalPages}
          className='rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>
    </>
  );
};

export default Pagination;
