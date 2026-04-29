"use client"

//接收父组件传过来的状态和方法
const Pagination=({currentPage,totalPages,onPageChange})=>{

    //生成页码数组的简单逻辑
    //如果总页数不多我们可以直接映射，如果多则直接加省略号表示
    //这里先实现一个能根据totalPages动态显示的逻辑

    const pageNumebers=[];
    for(let i=1;i<=totalPages;i++)
    {
        // 基础逻辑：显示前几页，如果页数过多建议只显示当前页附近的页码
        // 这里暂时展示全部页码，或者你可以根据需求限制只显示前 5 页
        pageNumebers.push(i);
    }

    return(
    <div className="flex items-center justify-center gap-2 mt-10 mb-6 select-none">
      {/* 上一页：如果当前是第一页，则禁用 */}
      <button 
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 transition-colors ${
          currentPage === 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:bg-gray-50"
        }`}
      >
        <span className="text-lg">‹</span>
      </button>

      {/* 动态生成的页码按钮 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-all ${
            currentPage === page 
              ? "bg-[#FDEEE7] text-[#E86D3C] border border-[#FDEEE7]" 
              : "text-gray-400 hover:bg-gray-50 border border-transparent"
          }`}
        >
          {page}
        </button>
      ))}

      {/* 如果页数很多，可以在这里保留你的省略号和最后一页逻辑 */}
      {/* 目前我们先让它根据数据库条数动态生成按钮 */}

      {/* 下一页：如果当前是最后一页，则禁用 */}
      <button 
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 transition-colors ${
          currentPage === totalPages ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:bg-gray-50"
        }`}
      >
        <span className="text-lg">›</span>
      </button>
    </div>
    )
}

export default Pagination;