"use client"
import { useState } from 'react'

const CommentFilter = () => {
    // 增加一个状态来控制当前选中的 Tab
    const [activeTab, setActiveTab] = useState('全部');
    const tabs = ['全部', '帖子评论', '回复我的', '@ 我的'];

    return (
        <div className="flex justify-between items-center mb-5 shrink-0">
            {/* 左侧 Tab */}
            <div className="flex gap-1.5">
                {tabs.map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-full text-[13px] transition-colors ${
                            activeTab === tab 
                            ? 'bg-[#FFF5F0] text-[#E46B38] font-bold' 
                            : 'bg-transparent text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            
            {/* 右侧搜索与筛选 */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="搜索我评论过的内容..." 
                        className="w-[240px] pl-4 pr-9 py-1.5 bg-white border border-gray-100 rounded-full text-[12px] text-gray-600 focus:outline-none focus:border-orange-200 shadow-sm" 
                    />
                    {/* 原生 SVG 放大镜图标 */}
                    <svg className="absolute right-3 top-1.5 w-[15px] h-[15px] text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <div className="flex items-center gap-1 text-[13px] text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                    <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    <span>筛选</span>
                </div>
            </div>
        </div>
    )
}

export default CommentFilter;