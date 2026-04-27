// views/FoodCommunity/MainPage/FoodList/FoodPost/page.jsx
import React from 'react';

const FoodPost = ({ data }) => {
  if (!data) return null;

  const styles = {
    card: {
      display: 'flex', // 关键：水平排列
      gap: '20px',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '20px',
      marginBottom: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease',
    },
    imgWrapper: {
      width: '240px', // 固定宽度
      height: '160px',
      borderRadius: '12px',
      overflow: 'hidden',
      flexShrink: 0,
    },
    contentWrapper: {
      flex: 1, // 占据剩余空间
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    title: { fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1d1d1f' },
    desc: { fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '12px' }
  };

  return (
    <div style={styles.card}>
      <div style={styles.imgWrapper}>
        <img src={data.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={styles.contentWrapper}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <img src={data.avatar} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{data.username}</span>
          </div>
          <h3 style={styles.title}>{data.title}</h3>
          <p style={styles.desc}>{data.description}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86868b', fontSize: '13px' }}>
          <span>📍 赤坎区</span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span>🤍 {data.likes}</span>
            <span>💬 {data.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPost; // 必须确保这一行存在！