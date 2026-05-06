"use client"
import React, { useEffect, useState } from 'react';
import PostFilter from './PostFilter/page';
import PostCard from './PostCard/page';
import PaginationPost from './Pagination/page';

export default function MyPost() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 12, currentPage: 1 }); 
  const [loading, setLoading] = useState(true);

  const fetchList = async (page) => {
    setLoading(true);
    try {
      // 严格使用你的 ID 20260001
      const res = await fetch(`/API/MyPost?userId=20260001&page=${page}`);
      const result = await res.json();
      if (result.success) {
        setPosts(result.data);
        if(result.pagination?.totalPages > 0) {
           setPagination({
             totalPages: result.pagination.totalPages,
             currentPage: result.pagination.currentPage
           });
        }
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(pagination.currentPage);
  }, [pagination.currentPage]);

  // 动态计算头部导航的数量
  const counts = {
    all: posts.length || 0,
    published: posts.length || 0,
    draft: 0,
    pending: 0
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] py-6 px-10 pb-20">
      <h1 className="text-[20px] font-bold text-gray-900 mb-5">我的帖子</h1>

      <PostFilter counts={counts} />

      <div className="flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400 text-sm font-light">加载中...</div>
        ) : posts.length > 0 ? (
          posts.map((item) => (
            <PostCard key={item.id} data={item} />
          ))
        ) : (
          <div className="flex justify-center items-center h-40 text-gray-400 text-sm font-light">暂无发布的帖子</div>
        )}
      </div>

      {!loading && (
        <PaginationPost 
          totalPages={pagination.totalPages} 
          currentPage={pagination.currentPage}
          onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
        />
      )}
    </div>
  );
}