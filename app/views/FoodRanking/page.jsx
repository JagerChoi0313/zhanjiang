"use client"

import React, { useState, useEffect } from 'react'
import RankingCard from './RankingCard'
import { getRankingData } from '../../API/FoodRanking/route'

const FoodRankingPage = () => {
  const [list, setList] = useState([])

  // 由于不需要分类，直接初始化获取全部数据
  useEffect(() => {
    const load = async () => {
      const res = await getRankingData("全部"); // 默认传全部，或根据你的API调整
      if (res && res.success) setList(res.data);
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f7', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 头部标题区域 */}
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '46px', 
            fontWeight: '600', 
            fontFamily: '"Noto Serif SC", "Georgia", serif', 
            color: '#1d1d1f', 
            marginBottom: '16px' 
          }}>
            热门推荐榜单
          </h1>
          <p style={{ fontSize: '18px', color: '#86868b', letterSpacing: '1px' }}>
            精选湛江最地道的味蕾体验
          </p>
        </header>

        {/* 核心布局：6列网格。前三名各占2列，后面的各占1列，实现完美对齐 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: '24px' 
        }}>
          {list.map((item, index) => (
            <RankingCard key={item.id || index} item={item} index={index} />
          ))}
        </div>

      </div>
    </div>
  )
}

export default FoodRankingPage;