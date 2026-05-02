export default function Pagination({ totalPages, currentPage, onPageChange }) {
  // 生成分页数组，为了完全匹配模板图效果，限制最多显示页码或加入省略号
  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, 3, '...', totalPages];
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6 pb-6">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
      >
        &lt;
      </button>

      {getPages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-all ${
            page === currentPage
              ? "bg-[#FFF0E6] text-[#FF6A00] font-medium"
              : page === '...' 
              ? "text-gray-400 cursor-default" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
      >
        &gt;
      </button>
    </div>
  );
}