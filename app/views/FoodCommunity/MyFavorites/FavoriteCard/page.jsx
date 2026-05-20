import React from 'react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';

export default function FavoriteCard({ data }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "2026-04-29";
    return dateStr.split('T')[0];
  };

  return (
    // 减小了 mb-3 (外边距) 和 p-3 (内边距)
    <div className="group bg-white rounded-[14px] p-3 pr-5 flex gap-4 mb-3 shadow-sm border border-gray-50 hover:shadow-md transition-all duration-300 relative">
      {/* 左侧：封面图 (高度缩减至 100px，宽度 160px) */}
      <div className="w-[160px] h-[100px] overflow-hidden rounded-[10px] flex-shrink-0 bg-gray-50">
        <img 
          // 🔗 【数据绑定】：真实封面图
          src={data.postCover || '/default-food.jpg'} 
          alt={data.postTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = '/default-food.jpg' }}
        />
      </div>

      {/* 右侧：文字区 */}
      <div className="flex flex-col flex-1 py-0.5">
        {/* 标题 - 减小字号到 16px */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-[16px] font-bold text-gray-800 tracking-tight line-clamp-1">
            {/* 🔗 【数据绑定】：真实标题 */}
            {data.postTitle}
          </h3>
          <span className="px-1.5 py-[1px] rounded bg-[#FFF0E6] text-[#FF6A00] text-[10px] font-medium whitespace-nowrap">
            {/* 🔗 【数据绑定】：真实的分类标签 */}
            {data.category || '探店'}
          </span>
        </div>

        {/* 描述 - 减小字号到 12px，限制更严 */}
        <p className="text-gray-400 text-[12px] leading-snug line-clamp-2 mb-2">
          {/* 🔗 【数据绑定】：真实的帖子摘要 */}
          {data.postDescription}
        </p>

        {/* 底部信息栏 */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gray-100 overflow-hidden">
                {/* 🔗 【数据绑定】：真实头像，无头像时使用占位 */}
                <img src={data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username || 'Jason'}`} alt="avatar" className="w-full h-full object-cover" />
              </div>
              {/* 🔗 【数据绑定】：真实作者名 */}
              <span className="text-gray-600 text-[12px] font-medium">{data.username || "未知吃货"}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-400 text-[11px]">
              <div className="flex items-center gap-1">
                {/* 🔗 【数据绑定】：真实收藏数 */}
                <Heart size={12} /> <span>{data.favoriteCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                {/* 🔗 【数据绑定】：真实评论数 */}
                <MessageCircle size={12} /> <span>{data.commentCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="text-gray-400 text-[11px] font-light">
            {/* 🔗 【数据绑定】：兼容后端拼写错误 facoriteAt */}
            收藏于 {formatDate(data.facoriteAt || data.createdAt)}
          </div>
        </div>
      </div>

      <button className="absolute top-3 right-4 text-gray-300 hover:text-gray-600">
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}