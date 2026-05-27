"use client"
import React from 'react';
import {useState,useEffect} from 'react'
import FoodPost from './FoodPost'; // 引入我们刚才写的卡片组件
import Link from "next/link"

//接收Mainpage传下来的关键词
const FoodList = ({searchQuery=""}) => {
   const [postData,setPostData] = useState([]);
   const [loading,setLoading] = useState(true);
   
   useEffect(()=>{
    const fetchPosts = async()=>{
      setLoading(true)
      try{

        //动态拼装，有搜索词就加上？q=，没有就查全部
        const url = searchQuery
            ?`/API/Post?q=${encodeURIComponent(searchQuery)}`
            :`/API/Post`

        const response = await fetch(url, { cache: 'no-store' })
        const data = await response.json();

        //防御性测试，确保拿到的是数组
        setPostData(Array.isArray(data)?data:[])
      }catch(error){
          console.error("获取帖子失败：",error);
      }finally{
        setLoading(false);
      }
    }
    fetchPosts();
    // 核心机制：把 searchQuery 变成监听依赖，只要它变了，马上重新执行查询！
   },[searchQuery])

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

  return (
<div style={styles.container}>
      <div style={styles.listWrapper}>
        {/* 2. 将 mockData 替换为 postData */}
        {postData.length > 0 ? (
          postData.map((item) => (
            <Link
            href={`/views/PostDetail/${item.id}`}
            key={item.id}   //key必须移到最外层Link这里
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
            <FoodPost data={item} />
            </Link>
          ))
        ) : (
          <div style={styles.loadingText}>暂时还没有发现美食投稿哦</div>
        )}
      </div>
    </div>
  );
};

export default FoodList;
