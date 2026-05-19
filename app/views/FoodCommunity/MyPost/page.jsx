"use client"
import React, { useEffect, useState } from 'react';
import PostFilter from './PostFilter/page';
import PostCard from './PostCard/page';
import PaginationPost from './Pagination/page';
import Link from "next/link"

export default function MyPost() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 }); 
  const [loading, setLoading] = useState(true);

  const [isAuthorized,setIsAuthorized] = useState(true)

  const fetchList = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(`/API/MyPost?&page=${page}`);
      const result = await res.json();

      //拦截逻辑
      if(res.status === 401 || (!result.success && result.message?.includes("登录"))){
        setIsAuthorized(false)
        return;
      }

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

  if (!isAuthorized) {
    return (
      <div className="flex-1 bg-[#FAFAFA] flex flex-col justify-center items-center py-6 px-10 min-h-screen">
        <div className="bg-white p-12 rounded-3xl flex flex-col items-center max-w-md w-full shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex justify-center items-center mb-6 text-gray-300">
            {/* 发帖主题的 SVG 占位图标（羽毛笔/编辑） */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">需要验证身份</h2>
          <p className="text-gray-500 text-sm mb-8 text-center">登录后即可查看并管理你发布的探店与美食路线</p>
          <Link 
            href="/views/Login" 
            className="w-full text-center py-3 bg-[#a63d2d] text-white rounded-xl font-medium active:scale-95 transition-transform hover:bg-[#8e3326]"
          >
            前往登录
          </Link>
        </div>
      </div>
    );
  }

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