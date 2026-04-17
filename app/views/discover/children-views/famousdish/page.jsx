"use client"

import React from 'react';
import ChiKangCard from './ChiKangCard'
// import XiaShangCard from './XiaShangCard'
// import LiangJiangCard from './LiangJiangCard'
// import SuiXiCard from './SuiXiCard'
// import MaZhangCard from './MaZhangCard'
// import WuChuangCard from './WuChuangCard'
// import PoTouCard from './PoTouCard'
// import XuWenCard from './XuWenCard'

const FamousDish = () => {
  
  const cardMap = {
    1:ChiKangCard,
    // 2:XiaShangCard,
    // 3:LiangJiangCard,
    // 4:SuiXiCard,
    // 5:MaZhangCard,
    // 6:WuChuangCard,
    // 7:PoTouCard,
    // 8:PoTouCard,
    // 9:XuWenCard
  };

  const pointsData = [
    {
      id: 1,
      name: "赤坎区",
      dot: { top: '58.5%', left: '50.2%' },
      path: "M 50.2 58.5 Q 35 45 20 25", // 引导向左上
      cardPos: { top: '20%', left: '10%' }
    },
    {
      id: 2,
      name: "霞山区",
      dot: { top: '61%', left: '50.8%' },
      path: "M 50.8 61 Q 65 45 80 25", // 引导向右上
      cardPos: { top: '20%', right: '10%' }
    },
    {
      id: 3,
      name: "廉江市",
      dot: { top: '48%', left: '47%' },
      path: "M 47 48 Q 30 40 15 45", // 向左侧中上偏出
      cardPos: { top: '42%', left: '5%' }
    },
    {
      id: 4,
      name: "遂溪县",
      dot: { top: '54%', left: '46.5%' },
      path: "M 46.5 54 Q 30 60 15 65", // 向左侧中下偏出
      cardPos: { top: '62%', left: '5%' }
    },
    {
      id: 5,
      name: "麻章区",
      dot: { top: '59%', left: '47.5%' },
      path: "M 47.5 59 Q 35 80 30 85", // 向左下角弯曲
      cardPos: { bottom: '10%', left: '15%' }
    },
    {
      id: 6,
      name: "吴川市",
      dot: { top: '54.5%', left: '54.5%' },
      path: "M 54.5 54.5 Q 75 40 85 45", // 向右侧中上偏出
      cardPos: { top: '42%', right: '5%' }
    },
    {
      id: 7,
      name: "坡头区",
      dot: { top: '60%', left: '53.5%' },
      path: "M 53.5 60 Q 75 65 85 65", // 向右侧中下偏出
      cardPos: { top: '62%', right: '5%' }
    },
    {
      id: 8,
      name: "雷州市",
      dot: { top: '74%', left: '48%' },
      path: "M 48 74 Q 65 85 75 85", // 向右下角偏出
      cardPos: { bottom: '10%', right: '15%' }
    },
    {
      id: 9,
      name: "徐闻县",
      dot: { top: '86%', left: '48.5%' },
      path: "M 48.5 86 Q 48.5 95 40 95", // 向底部中心微调
      cardPos: { bottom: '2%', left: '35%' }
    }
  ];

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '80vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      overflow: 'hidden' 
    }}>
      
      {/* 1. 地图底图 */}
      <img 
        src="/Image/Map.png" 
        style={{ width: '360px', marginTop: '150px', zIndex: 1 }} 
        alt="湛江地图" 
      />

      {/* 2. SVG 曲线层 (一次性循环所有线条) */}
     <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none', 
          zIndex: 2 
        }}
      >
        {pointsData.map(item => (
          <path
            key={`line-${item.id}`}
            // 关键：将路径中的 % 替换为空，例如 "50.2% 58.5%" 变为 "50.2 58.5"
            d={item.path.replace(/%/g, '')} 
            fill="none"
            stroke="#999"
            strokeWidth="0.2" // 因为 viewBox 是 100x100，线宽也要相应减小
            opacity="0.5"
          />
        ))}
      </svg>

      {/* 3. 交互层 (一次性循环所有红点和卡片占位) */}
      {pointsData.map(item => {
        // 在这里提取对应的组件
        const CurrentCard = cardMap[item.id];

        return (
           <React.Fragment key={item.id}>
         
          {/* 红点 */}
            <div style={{
              position: 'absolute',
              ...item.dot,
              width: '10px',
              height: '10px',
              backgroundColor: '#8b3d30',
              borderRadius: '50%',
              zIndex: 3,
              transform: 'translate(-50%, -50%)',
              border: '2px solid #fff',
              boxShadow: '0 0 10px rgba(139, 61, 48, 0.5)'
            }} />

            {/* 卡片展示区域 */}
            <div style={{
              position: 'absolute',
              ...item.cardPos,
              zIndex: 4,
            }}>

              {/* --- 核心修复位置：渲染提取出来的 SpecificCard --- */}
              {CurrentCard ? (
                <CurrentCard /> 
              ) : (
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', // 稍微提高不透明度
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#999',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  {item.name} 卡片开发中...
                </div>
              )}
            </div>
            
        </React.Fragment>
        );
      })}

    </div>
  );
};

export default FamousDish;