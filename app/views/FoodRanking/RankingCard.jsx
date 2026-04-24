import React from 'react';
import { HeartOutlined, StarOutlined, ShareAltOutlined } from '@ant-design/icons';

// --- 前三名：大卡片模式（占2列宽度） ---
const Top3Card = ({ item, index }) => {
  const rankNum = `0${index + 1}`;
  
  return (
    <div style={{
      gridColumn: 'span 2', // 核心：占据6列网格中的2列
      backgroundColor: '#fff',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    }}>
      {/* 图片与悬浮标签区域 */}
      <div style={{ position: 'relative', height: '240px' }}>
        <img src={item.cover_image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        
        {/* 左上角：排名 Tag */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
          TOP {index + 1}
        </div>
        
        {/* 右上角：心形分享 */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(255,255,255,0.9)', color: '#333', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HeartOutlined /> 分享
        </div>

        {/* 左下角：收藏 */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <StarOutlined /> 收藏
        </div>

        {/* 右下角：分享 */}
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShareAltOutlined /> 分享
        </div>
      </div>

      {/* 底部文本区域 */}
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', flex: 1 }}>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px 0', color: '#1d1d1f' }}>{item.title}</h3>
          <p style={{ color: '#86868b', fontSize: '14px', margin: 0 }}>{item.slogan || '传统工序，米香浓郁'}</p>
        </div>
        {/* 杂志风超大数字 */}
        <div style={{ fontSize: '56px', fontFamily: '"Georgia", "Times New Roman", serif', color: '#1d1d1f', lineHeight: 1 }}>
          {rankNum}
        </div>
      </div>
    </div>
  );
};

// --- 4名以后：小卡片模式（占1列宽度） ---
const RegularCard = ({ item, index }) => {
  const rankNum = index + 1 < 10 ? `0${index + 1}` : index + 1;
  
  return (
    <div style={{
      gridColumn: 'span 1', // 核心：占据6列网格中的1列
      backgroundColor: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer'
    }}>
      <div style={{ height: '150px', overflow: 'hidden' }}>
        <img src={item.cover_image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '16px' }}>
        {/* 小卡片顶部的浅灰色数字 */}
        <div style={{ fontSize: '28px', fontFamily: '"Georgia", "Times New Roman", serif', color: '#d2d2d7', marginBottom: '8px', lineHeight: 1 }}>
          {rankNum}
        </div>
        <h4 style={{ fontSize: '17px', fontWeight: '600', margin: '0 0 6px 0', color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
        <p style={{ color: '#86868b', fontSize: '13px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.slogan || '鲜美滋补'}</p>
      </div>
    </div>
  );
};

export default function RankingCard({ item, index }) {
  return index < 3 ? <Top3Card item={item} index={index} /> : <RegularCard item={item} index={index} />;
}