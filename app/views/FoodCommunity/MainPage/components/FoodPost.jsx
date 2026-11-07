// views/FoodCommunity/MainPage/components/FoodPost.jsx
import React from 'react';
import IdenticonAvatar from '../../../../components/IdenticonAvatar';

const FoodPost = ({ data }) => {
  if (!data) return null;

  const styles = {
    card: {
      gap: '20px',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '20px',
      marginBottom: '-10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease',
    },
    imgWrapper: {
      height: '160px',
      borderRadius: '12px',
      overflow: 'hidden',
      flexShrink: 0,
    },
    contentWrapper: {
      minWidth: 0,
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
  const authorName = data.username || data.author?.nickname || "未知吃货";

  return (
 <article className="flex flex-col xl:flex-row" style={styles.card}>
      <div className="w-full xl:w-[clamp(145px,18vw,260px)]" style={styles.imgWrapper}>
        <img src={data.coverImage || '/Image/slider1.png'}
            loading="lazy"
            onError={(event) => {
              const image = event.currentTarget;
              if (!image.src.endsWith('/Image/slider1.png')) image.src = '/Image/slider1.png';
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            alt="" />
      </div>
      <div style={styles.contentWrapper}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            {/* 动态读取头像和作者名，加入兜底 */}
            <IdenticonAvatar src={data.avatar || data.author?.avatar} seed={authorName} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', background: '#eee9e3' }} alt="avatar" />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{authorName}</span>
          </div>
          <h3 className="break-words" style={styles.title}>{data.title}</h3>
          <p className="line-clamp-3 break-words" style={styles.desc}>{data.description}</p>
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
    </article>
  );
};

export default FoodPost; // 必须确保这一行存在！
