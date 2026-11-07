"use client"
import React from 'react';
import {useState,useEffect} from 'react'
import FoodPost from './FoodPost'; // 引入我们刚才写的卡片组件
import Link from "next/link"

//接收Mainpage传下来的关键词
const FoodList = ({ searchQuery, view = "latest", category, location, userId }) => {
  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ view });
    if (searchQuery) params.set('q', searchQuery);
    if (category) params.set('category', category);
    if (userId) params.set('userId', userId);
    if (location) params.set('location', location);

    async function fetchPosts() {
      try {
        const response = await fetch(`/API/Post?${params}`, { cache: 'no-store', signal: controller.signal });
        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.data)) throw new Error('Invalid feed response');
        if (!controller.signal.aborted) setPostData(result.data);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchPosts();
    return () => controller.abort();
  }, [searchQuery, view, category, location, userId, attempt]);

 const styles = {
  container: {
    width: '100%',
    padding: '24px 0', // 左右 padding 由 MainPage 的 mainContent 控制
    backgroundColor: 'transparent', // 背景色由 MainPage 统一控制
  },
  listWrapper: {
    maxWidth: '850px', // 稍微放宽一点，适应并排布局
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  loadingText: {
      textAlign: 'center',
      padding: '40px',
      color: '#86868b',
      fontSize: '15px'
    }
};

if (loading) {
    return <div style={styles.loadingText}>正在探索湛江美食...</div>;
  }

  if (error) return (
    <div style={styles.loadingText} role="alert">
      帖子加载失败。
      <button type="button" className="ml-2 underline" onClick={() => {
        setLoading(true);
        setError(false);
        setAttempt(attempt + 1);
      }}>重试</button>
    </div>
  );

  return (
<div style={styles.container}>
      <div style={styles.listWrapper}>
        {/* 2. 将 mockData 替换为 postData */}
        {postData.length > 0 ? (
          postData.slice(0, visibleCount).map((item) => (
            <Link
            href={`/views/PostDetail/${item.id}`}
            key={item.id}   //key必须移到最外层Link这里
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
            <FoodPost data={item} />
            </Link>
          ))
        ) : (
          <div style={styles.loadingText}>{searchQuery || category || location || view === "featured" ? "没有符合条件的帖子，试试切换分类或搜索词。" : "暂时还没有美食投稿。"}</div>
        )}
        {visibleCount < postData.length && (
          <button type="button" className="self-center rounded-full border px-4 py-2 text-sm text-[#805741]"
            onClick={() => setVisibleCount(count => count + 12)}>加载更多</button>
        )}
      </div>
    </div>
  );
};

export default FoodList;
