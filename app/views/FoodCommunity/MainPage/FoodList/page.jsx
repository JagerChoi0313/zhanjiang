"use client"
import React from 'react';
import {useState,useEffect} from 'react'
import FoodPost from './FoodPost/page'; // 引入我们刚才写的卡片组件

const FoodList = () => {
   const [postData,setPostData] = useState([]);
   const [loading,setLoading] = useState(true);
   
   useEffect(()=>{
    const fetchPosts = async()=>{
      try{
        const response = await fetch('/API/Post')
        const data = await response.json();
        setPostData(data)
      }catch(error){
          console.error("获取帖子失败：",error);
      }finally{
        setLoading(false);
      }
    }
    fetchPosts();
   },[])

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
            <FoodPost key={item.id} data={item} />
          ))
        ) : (
          <div style={styles.loadingText}>暂时还没有发现美食投稿哦</div>
        )}
      </div>
    </div>
  );
};

export default FoodList;