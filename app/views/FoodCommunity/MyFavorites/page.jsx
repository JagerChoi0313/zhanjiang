"use client"
import React, { useEffect, useState } from 'react';
import FavoriteFilter from './FavoriteFilter/page';
import FavoriteCard from './FavoriteCard/page';
import Pagination from './Pagination/page';

export default function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 12, currentPage: 1 }); // 默认给12页以匹配效果图
  const [loading, setLoading] = useState(true);

  const fetchList = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(`/API/MyFavorites?userId=1&page=${page}`);
      const result = await res.json();
      if (result.success) {
        setFavorites(result.data);
        if(result.pagination.totalPages > 0) {
           setPagination({
             totalPages: result.pagination.totalPages,
             currentPage: result.pagination.currentPage
           });
        }
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(pagination.currentPage);
  }, [pagination.currentPage]);

  return (
// 使用 min-h-screen 确保背景铺满，pb-20 确保底部导航不被遮挡
    <div className="w-full min-h-screen bg-[#FAFAFA] py-6 px-10 pb-20">
      {/* 标题 - 稍微调小一点 */}
      <h1 className="text-[20px] font-bold text-gray-900 mb-5">我的收藏集</h1>

      <FavoriteFilter />

      <div className="flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400 text-sm font-light">加载中...</div>
        ) : favorites.length > 0 ? (
          favorites.map((item) => (
            <FavoriteCard key={item.favoriteId} data={item} />
          ))
        ) : (
          <div className="flex justify-center items-center h-40 text-gray-400 text-sm font-light">暂无收藏内容</div>
        )}
      </div>

      {/* 分页控制 - 即使只有1页也显示，方便查看效果 */}
      {!loading && (
        <Pagination 
          totalPages={pagination.totalPages} 
          currentPage={pagination.currentPage}
          onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
        />
      )}
    </div>
  );
}