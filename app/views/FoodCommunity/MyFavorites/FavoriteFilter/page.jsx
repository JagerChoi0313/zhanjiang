import { Search, ChevronDown, Filter } from 'lucide-react';

export default function FavoriteFilter() {
  const tabs = ["全部", "帖子", "菜谱", "探店", "攻略"];

  return (
    <div className="flex items-center justify-between mb-6">
      {/* 左侧 Tabs */}
      <div className="flex items-center gap-1.5">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`px-4 py-1.5 rounded-full text-[13px] transition-all ${
              index === 0 
                ? "bg-[#FFF0E6] text-[#FF6A00] font-medium" 
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 右侧搜索与排序 */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="搜索我收藏的内容..."
            className="pl-9 pr-4 py-1.5 bg-[#F5F6F8] border-none rounded-full text-[13px] w-[220px] outline-none focus:ring-1 focus:ring-gray-200 transition-all text-gray-600 placeholder-gray-400"
          />
        </div>
        
        <button className="flex items-center gap-1 text-gray-500 text-[13px] hover:text-gray-800">
          <Filter size={14} />
          <span>最新收藏</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}