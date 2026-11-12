"use client"
import React, { Suspense, useEffect, useState,useRef } from 'react';
import PostFilter from './components/PostFilter';
import PostCard from './components/PostCard';
import PaginationPost from './components/PaginationPost';
import Link from "next/link"
import { useSearchParams } from 'next/navigation';
import { Modal } from 'antd';
import { csrfFetch } from '../../../../lib/csrf-client';

function MyPostContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 }); 
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');
  const deletingRef = useRef(false);

  const deletePost = async () => {
    if (!deleteTarget || deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    setDeleteError('');
    try {
      const response = await csrfFetch(`/API/MyPost/${deleteTarget.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || '删除失败，请稍后重试');
      setDeleteTarget(null);
      setNotice('帖子已删除');
      const page = posts.length === 1 ? Math.max(1, pagination.currentPage - 1) : pagination.currentPage;
      if (page !== pagination.currentPage) setPagination(prev => ({ ...prev, currentPage: page }));
      else await fetchList(page, searchQuery);
    } catch (error) {
      setDeleteError(error.message || '删除失败，请稍后重试');
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  };

  const [isAuthorized,setIsAuthorized] = useState(true)

  // 记录上一次的搜索词，用于分页判定
  const prevSearchQuery = useRef(searchQuery);

  const fetchList = async (page,query) => {
    setLoading(true);
    try {
      // 动态拼装请求 URL
      const url = query 
        ? `/API/MyPost?page=${page}&q=${encodeURIComponent(query)}`
        : `/API/MyPost?page=${page}`;

      // 严格使用带防缓存的 fetch
      const res = await fetch(url, { cache: 'no-store' });
      const result = await res.json();

      //拦截逻辑
      if(res.status === 401 || (!result.success && result.message?.includes("登录"))){
        setIsAuthorized(false)
        return;
      }

      if (result.success) {
        setPosts(result.data);
        const pageInfo = result.meta?.pagination;
        if(pageInfo) {
           setPagination({
             totalPages: pageInfo.totalPages || 1,
             currentPage: pageInfo.currentPage
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
    let targetPage = pagination.currentPage;
    
    if (prevSearchQuery.current !== searchQuery) {
      targetPage = 1; 
      prevSearchQuery.current = searchQuery; 
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }

    fetchList(targetPage, searchQuery);
  }, [pagination.currentPage, searchQuery]);

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
      {notice && <p role="status" className="mb-3 text-sm text-green-700">{notice}</p>}
      <Modal title="删除帖子" open={!!deleteTarget} onOk={deletePost}
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        okText="确认删除" cancelText="取消" confirmLoading={deleting}
        okButtonProps={{ danger: true }} cancelButtonProps={{ disabled: deleting }}
        closable={!deleting} maskClosable={!deleting} keyboard={!deleting}>
        <p>确定删除“{deleteTarget?.title}”吗？删除后将不再公开展示，页面不提供恢复操作。</p>
        {deleteError && <p role="alert" className="mt-3 text-red-600">{deleteError}</p>}
      </Modal>

      <div className="flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400 text-sm font-light">加载中...</div>
        ) : posts.length > 0 ? (
          posts.map((item) => (
            <PostCard key={item.id} data={item} deleting={deleting}
              onDelete={(post) => { setDeleteError(''); setNotice(''); setDeleteTarget(post); }} />
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

export default function MyPost() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-[#FAFAFA] py-6 px-10 text-gray-400 text-sm">加载中...</div>}>
      <MyPostContent />
    </Suspense>
  );
}
