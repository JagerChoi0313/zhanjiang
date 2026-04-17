"use client"

import React from 'react';
import ChiKangCard from './ChiKangCard'
import XiaShangCard from './XiaShangCard'
import LiangJiangCard from './LiangJiangCard'
import SuiXiCard from './SuiXiCard'
import MaZhangCard from './MaZhangCard'
import WuChuangCard from './WuChuangCard'
import PoTouCard from './PoTouCard'
import XuWenCard from './XuWenCard'
import LeiZhouCard from './LeiZhouCard'

const FamousDish = () => {
  
  const cardMap = {
    1:ChiKangCard,
    2:XiaShangCard,
    3:LiangJiangCard,
    4:SuiXiCard,
    5:MaZhangCard,
    6:WuChuangCard,
    7:PoTouCard,
    8:LeiZhouCard,
    9:XuWenCard
  };

  const pointsData = [
   // === 左侧梯队 (由北向南，外-内-外-内 阶梯交错排布) ===
{
  id: 3,
  name: "廉江市",
  dot: { top: '42%', left: '45%' },
  path: "M 45 42 Q 30 35 18 25", // 指向 top:15% left:3% 的卡片中心
  cardPos: { top: '15%', left: '3%' }
},
{
  id: 4,
  name: "遂溪县",
  dot: { top: '49%', left: '43%' },
  path: "M 43 49 Q 35 45 28 42", // 指向 top:35% left:9% 的卡片中心
  cardPos: { top: '35%', left: '9%' }
},
{
  id: 5,
  name: "麻章区",
  dot: { top: '54%', left: '48%' },
  path: "M 48 54 Q 35 58 18 62", // 指向 top:55% left:3% 的卡片中心
  cardPos: { top: '55%', left: '3%' }
},
{
  id: 8,
  name: "雷州市",
  dot: { top: '68%', left: '48%' },
  path: "M 48 68 Q 40 75 28 82", // 指向 top:75% left:9% 的卡片中心
  cardPos: { top: '75%', left: '9%' }
},

// === 右侧梯队 (由北向南，外-内-外-内-外 阶梯交错排布) ===
{
  id: 6,
  name: "吴川市",
  dot: { top: '48%', left: '56%' },
  path: "M 56 48 Q 65 30 82 20", // 指向 top:10% right:3% (约left:82%)
  cardPos: { top: '10%', right: '3%' }
},
{
  id: 1,
  name: "赤坎区",
  dot: { top: '51%', left: '50%' },
  path: "M 50 51 Q 60 45 71 38", // 指向 top:30% right:9% (约left:71%)
  cardPos: { top: '30%', right: '9%' }
},
{
  id: 7,
  name: "坡头区",
  dot: { top: '53%', left: '53.5%' },
  path: "M 53.5 53 Q 65 55 82 58", // 指向 top:50% right:3% (约left:82%)
  cardPos: { top: '50%', right: '3%' }
},
{
  id: 2,
  name: "霞山区",
  dot: { top: '55.5%', left: '51.5%' },
  path: "M 51.5 55.5 Q 60 70 71 78", // 指向 top:70% right:9% (约left:71%)
  cardPos: { top: '70%', right: '9%' }
},
    {
      id: 9,
      name: "徐闻县",
      dot: { top: '75%', left: '49%' }, // 真实位置：半岛最南端
      path: "M 49 75 Q 60 85 49 90", 
      cardPos: { top: '90%', right: '37%' } // 靠外侧压轴
    }
  ];

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      // --- 关键修复：增加容器高度并取消隐藏，确保底部卡片有位置放 ---
      minHeight: '110vh', 
      paddingBottom: '120px',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      overflow: 'visible'
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