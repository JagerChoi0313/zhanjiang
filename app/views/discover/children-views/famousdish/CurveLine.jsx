import React from 'react';

const CurveLine = ({ start, end, curveOffset = 40 }) => {
  // 计算贝塞尔曲线的路径
  // start: {x, y}, end: {x, y}
  // curveOffset 控制弧度的弯曲程度
  const pathData = `M ${start.x} ${start.y} Q ${start.x + (end.x - start.x) / 2} ${start.y - curveOffset} ${end.x} ${end.y}`;

  return (
    <svg 
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
      <path
        d={pathData}
        fill="none"
        stroke="#999"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
};

export default CurveLine;