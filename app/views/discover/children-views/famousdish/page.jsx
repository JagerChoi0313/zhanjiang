import React from 'react';

const FamousDish = () => {
  // --- 以后你只需要维护这个数组即可 ---
  const pointsData = [
    {
      id: 1,
      name: "赤坎区",
      // 红点坐标 (相对于容器)
      dot: { top: '44.5%', left: '50.2%' },
      // 曲线路径: M 起点(和dot一致) Q 控制点(弧度) T 终点(指向卡片)
      // 注意：SVG path 里的百分比在某些浏览器兼容性不同，建议调稳了换成 px 或保持 viewbox
      path: "M 50.2% 44.5% Q 35% 35% 25% 20%", 
      // 卡片位置
      cardPos: { top: '15%', left: '10%' }
    },
    {
      id: 2,
      name: "霞山区",
      dot: { top: '51%', left: '55%' },
      path: "M 55% 51% Q 70% 40% 80% 25%",
      cardPos: { top: '18%', right: '10%' }
    },{
      id: 3,
      name: "廉江市",
      dot: { top: '25%', left: '46%' },
      path: "M 46% 25% Q 35% 15% 25% 8%", 
      cardPos: { top: '5%', left: '15%' }
    },
    {
      id: 4,
      name: "遂溪县",
      dot: { top: '38%', left: '43%' },
      path: "M 43% 38% Q 30% 35% 20% 40%", 
      cardPos: { top: '35%', left: '5%' }
    },
    {
      id: 5,
      name: "麻章区",
      dot: { top: '48%', left: '47%' },
      path: "M 47% 48% Q 30% 55% 20% 65%", 
      cardPos: { top: '60%', left: '5%' }
    },
    {
      id: 6,
      name: "吴川市",
      dot: { top: '40%', left: '58%' },
      path: "M 58% 40% Q 75% 15% 85% 10%", 
      cardPos: { top: '5%', right: '10%' }
    },
    {
      id: 7,
      name: "坡头区",
      dot: { top: '48%', left: '54%' },
      path: "M 54% 48% Q 75% 50% 85% 45%", 
      cardPos: { top: '40%', right: '5%' }
    },
    {
      id: 8,
      name: "雷州市",
      dot: { top: '65%', left: '47%' },
      path: "M 47% 65% Q 70% 75% 80% 75%", 
      cardPos: { bottom: '20%', right: '10%' }
    },
    {
      id: 9,
      name: "徐闻县",
      dot: { top: '82%', left: '48%' },
      path: "M 48% 82% Q 35% 85% 25% 85%", 
      cardPos: { bottom: '5%', left: '20%' }
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
        style={{ width: '360px', marginTop: '40px', zIndex: 1 }} 
        alt="湛江地图" 
      />

      {/* 2. SVG 曲线层 (一次性循环所有线条) */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        {pointsData.map(item => (
          <path
            key={`line-${item.id}`}
            d={item.path}
            fill="none"
            stroke="#999"
            strokeWidth="1.2"
            opacity="0.5"
          />
        ))}
      </svg>

      {/* 3. 交互层 (一次性循环所有红点和卡片占位) */}
      {pointsData.map(item => (
        <React.Fragment key={item.id}>
          {/* 红点 */}
          <div style={{
            position: 'absolute',
            ...item.dot,
            width: '8px',
            height: '8px',
            backgroundColor: '#8b3d30',
            borderRadius: '50%',
            zIndex: 3,
            transform: 'translate(-50%, -50%)'
          }} />

          {/* 卡片占位区域 (目前只有个隐形的框，等你把卡片组件放进去) */}
          <div style={{
            position: 'absolute',
            ...item.cardPos,
            width: '280px',
            height: '80px',
            zIndex: 4,
            // border: '1px dashed #ddd' // 调试时可以打开这个边框看位置
          }}>
            {/* 待接入: <FoodCard data={item} /> */}
          </div>
        </React.Fragment>
      ))}

    </div>
  );
};

export default FamousDish;