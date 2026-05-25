import { Search, ChevronDown, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PostFilter({ counts = { all: 0, published: 0, draft: 0, pending: 0 } }) {

  const router = useRouter();
  const searchParams = useSearchParams();

  // 从 URL 提取搜索词
  const currentQuery = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(currentQuery);

  // 监听浏览器回退同步状态
  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  // 回车发射搜索
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (inputValue.trim()) {
        router.push(`?q=${encodeURIComponent(inputValue.trim())}`);
      } else {
        router.push(`?`); 
      }
    }
  };

  const tabs = [
    `全部 (${counts.all})`, 
    `已发布 (${counts.published})`, 
    `草稿箱 (${counts.draft})`, 
    `审核中 (${counts.pending})`
  ];

  return (
  <div className="flex items-center justify-between mb-6">
      {/* 左侧 Tabs */}
      <div className="flex items-center gap-1.5">
        {tabs.map((tab, index) => (
          <button
            key={index}
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
            placeholder="搜索我的帖子..."
            className="pl-9 pr-4 py-1.5 bg-[#F5F6F8] border-none rounded-full text-[13px] w-[220px] outline-none focus:ring-1 focus:ring-gray-200 transition-all text-gray-600 placeholder-gray-400"
            // 👇 绑定状态与键盘事件
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <button className="flex items-center gap-1 text-gray-500 text-[13px] hover:text-gray-800">
          <Filter size={14} />
          <span>最新发布</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}