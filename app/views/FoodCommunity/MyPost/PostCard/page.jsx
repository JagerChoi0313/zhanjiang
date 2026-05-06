import React from 'react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';

export default function PostCard({ data }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "2026-04-29";
    return dateStr.split('T')[0];
  };

  return (
    <div className="group bg-white rounded-[14px] p-3 pr-5 flex gap-4 mb-3 shadow-sm border border-gray-50 hover:shadow-md transition-all duration-300 relative">
      {/* 左侧：封面图 */}
      <div className="w-[160px] h-[100px] overflow-hidden rounded-[10px] flex-shrink-0">
        <img 
          src={data.coverImage} 
          alt={data.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* 右侧：文字区 */}
      <div className="flex flex-col flex-1 py-0.5">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-[16px] font-bold text-gray-800 tracking-tight line-clamp-1">
            {data.title}
          </h3>
          <span className="px-1.5 py-[1px] rounded bg-[#E6F4FF] text-[#0071E3] text-[10px] font-medium whitespace-nowrap">
            {data.category}
          </span>
          {/* 修正后的 is_hot 字段判断 */}
          {data.is_hot && (
            <span className="px-1.5 py-[1px] rounded bg-[#FFF0E6] text-[#FF6A00] text-[10px] font-medium whitespace-nowrap">
              精选
            </span>
          )}
        </div>

        {/* 描述 */}
        <p className="text-gray-400 text-[12px] leading-snug line-clamp-2 mb-2">
          {data.excerpt || data.description}
        </p>

        {/* 底部信息栏 */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-gray-400 text-[11px]">
              <div className="flex items-center gap-1">
                <Heart size={12} /> <span>{data.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={12} /> <span>{data.comments}</span>
              </div>
            </div>
            <div className="text-gray-400 text-[11px] font-light">
              {formatDate(data.createdAt)}
            </div>
          </div>

          {/* 右下角操作按钮 */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-[12px] text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">编辑</button>
            <button className="px-3 py-1 text-[12px] text-[#FF4D4F] bg-[#FFF1F0] hover:bg-[#FFCCC7] rounded-md transition-colors">删除</button>
          </div>
        </div>
      </div>

      <button className="absolute top-3 right-4 text-gray-300 hover:text-gray-600">
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}