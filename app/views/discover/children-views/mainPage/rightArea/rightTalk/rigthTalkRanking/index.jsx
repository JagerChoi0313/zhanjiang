import Image from 'next/image'

// 1. 定义样式对象，确保与“热门推荐”视觉对齐
const ContainerStyle = {
  background: '#fff',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  overflow: 'hidden',
  width: '100%',
};

const HeaderStyle = {
  padding: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #f9f9f9',
};

const ItemStyle = {
  display: 'flex',
  padding: '16px',
  gap: '12px',
  borderBottom: '1px solid #f9f9f9',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
};

const AvatarStyle = {
  position: 'relative',
  width: '40px',
  height: '40px',
  borderRadius: '50%', // ⭐ 关键：圆形头像
  overflow: 'hidden',
  flexShrink: 0,
};

const ContentStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0, // 防止文字溢出撑开容器
};

const RightTalkRanking = () => {
  // 模拟数据，你可以根据需要修改
  const talkData = [
    { id: 1, name: '林小厨', comment: '湛江的白切鸡真的是一绝，皮爽肉滑！', avatar: '/Image/Talk1.png' },
    { id: 2, name: '美食家阿强', comment: '赤坎老街那家牛腩粉，味道还是没变。', avatar: '/Image/Talk2.png' },
    { id: 3, name: '逛吃湛江', comment: '生蚝非常肥美，蒜蓉配比刚刚好。', avatar: '/Image/Talk3.png' },
    { id: 4, name: '粤西食客', comment: '好吃，爱吃', avatar: '/Image/Talk4.png' },
  ];

  return (
    <div style={ContainerStyle}>
      {/* 头部区域 */}
      <div style={HeaderStyle}>
        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>用户互动</span>
        <span style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>更多 &gt;</span>
      </div>

      {/* 互动列表 */}
      {talkData.map((item) => (
        <div 
          key={item.id}
          style={ItemStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* 用户头像 */}
          <div style={AvatarStyle}>
            <Image
              src={item.avatar}
              alt={item.name}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* 右侧文本内容 */}
          <div style={ContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>{item.name}</span>
              <span style={{ fontSize: '10px', color: '#faad14' }}>⭐⭐⭐⭐⭐</span>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2, // ⭐ 关键：最多显示两行文字
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {item.comment}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RightTalkRanking;