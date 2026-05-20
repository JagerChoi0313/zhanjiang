"use client"
import React, { useEffect, useState } from 'react';
import FavoriteFilter from './FavoriteFilter/page';
import FavoriteCard from './FavoriteCard/page';
import Pagination from './Pagination/page';
import Link from "next/link"

export default function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 }); 
  const [loading, setLoading] = useState(true);

  //用来判断用户是否合法登录
  const [isAuthorized,setIsAuthorized] = useState(true)

  const fetchList = async (page) => {
    setLoading(true);
    try {
      //如果后端返回401，说明没登录或者后端只认cookie里的token，只传page
      const res = await fetch(`/API/MyFavorites?page=${page}`);
      const result = await res.json();

      // 👇 修复点：将 include 换成 includes，并增加 ? 安全链
      if(res.status===401 || (!result.success && result.message?.includes("登录"))){
        setIsAuthorized(false)
        return;   //直接打断，不再往下执行
      }

      if (result.success) {
        setIsAuthorized(true);//确认身份合法
        setFavorites(result.data);

        // 防止 undefined 报错
        if(result.pagination?.totalPages > 0) {
           setPagination({
             totalPages: result.pagination.totalPages || result.pagination.totalPage, // 兼容你后端的不同写法
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

  if (!isAuthorized) {
    return (
      <div className="w-full min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center py-6 px-10">
        <div className="bg-white p-12 rounded-3xl flex flex-col items-center max-w-md w-full shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex justify-center items-center mb-6 text-gray-300">
             {/* 简单的 SVG 占位图标，保持极简 */}
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">需要验证身份</h2>
          <p className="text-gray-500 text-sm mb-8 text-center">登录后即可查看并管理你的专属美食收藏夹</p>
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
    // 使用 min-h-screen 确保背景铺满，pb-20 确保底部导航不被遮挡
    <div className="w-full min-h-screen bg-[#FAFAFA] py-6 px-10 pb-20">
      {/* 标题 - 稍微调小一点 */}
      <h1 className="text-[20px] font-bold text-gray-900 mb-5">我的收藏</h1>

      <FavoriteFilter />

      <div className="flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400 text-sm font-light">加载中...</div>
        ) : favorites.length > 0 ? (
          favorites.map((item) => (
            // 👇 核心升级：套上 Link，实现点击跳转！
            <Link 
                href={`/views/PostDetail/${item.postId}`} 
                key={item.favoriteId} 
                className="block no-underline text-inherit outline-none"
            >
                <FavoriteCard data={item} />
            </Link>
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