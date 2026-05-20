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
      marginBottom: '-10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease',
    },
    imgWrapper: {
      width: '260px', // 固定宽度
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

  const favoriteCount = data.favoriteCount || data.favorites || 0;
  const commentCount = data.commentCount || (data.comments ? data.comments.length : 0) || 0;

  return (
 <div style={styles.card}>
      <div style={styles.imgWrapper}>
        <img src={data.coverImage} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            alt="cover" />
      </div>
      <div style={styles.contentWrapper}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            {/* 动态读取头像和作者名，加入兜底 */}
            <img src={data.avatar || data.author?.avatar || "/upload/default-avatar.png"} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', background: '#eee9e3' }} alt="avatar" />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{data.username || data.author?.nickname || "未知吃货"}</span>
          </div>
          <h3 style={styles.title}>{data.title}</h3>
          <p style={styles.desc}>{data.description}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86868b', fontSize: '13px' }}>
          <span>📍 {data.location || '湛江市'}</span>
          <div style={{ display: 'flex', gap: '15px' }}>
            {/* 👇 关键修改区：换成星星，绑定真实的数量 */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⭐ {favoriteCount}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              💬 {commentCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPost; // 必须确保这一行存在！