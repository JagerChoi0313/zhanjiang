import Image from 'next/image'

// 1. 定义样式对象，保持代码整洁
const ListContainerStyle = {
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
  borderBottom: '1px solid #f0f0f0',
};

const ItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  gap: '12px',
  cursor: 'pointer',
  transition: 'background 0.3s ease',
};

const ImageWrapperStyle = {
  position: 'relative',
  width: '64px', // 按照美食展示比例稍微拉宽
  height: '40px',
  borderRadius: '8px',
  overflow: 'hidden',
  flexShrink: 0, // 防止图片被压缩
};

const RightHotRanking = () => {
  return (
    <div style={ListContainerStyle}>
      {/* 头部 */}
      <div style={HeaderStyle}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>热门推荐</span>
        <span style={{ fontSize: '12px', color: '#999' }}>更多 &gt;</span>
      </div>



      {/* 列表项1 */}
      <div 
        style={ItemStyle} 
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={ImageWrapperStyle}>
          <Image
            src="/Image/Hot1.png" 
            alt="湛江白切鸡"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>湛江白切鸡</div>
          <div style={{ fontSize: '11px', color: '#bbb' }}>9.9w 浏览 ·712 评论</div>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff7a45' }}>TOP 1</div>
      </div>



      {/* 列表项 2 (实际开发中可以写个 map，现在先放个静态的) */}
      <div 
        style={ItemStyle}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={ImageWrapperStyle}>
          <Image
            src="/Image/Hot2.png" 
            alt="木叶夹"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>木叶夹</div>
          <div style={{ fontSize: '11px', color: '#bbb' }}>6.7k 浏览 · 420 评论</div>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#999' }}>TOP 2</div>
      </div>


      {/*列表项3 */}
      <div 
        style={ItemStyle} 
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={ImageWrapperStyle}>
          <Image
            src="/Image/Hot3.png" 
            alt="簸箕炊"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>簸箕炊</div>
          <div style={{ fontSize: '11px', color: '#bbb' }}>2.7w 浏览 · 200 评论</div>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#999' }}>TOP 3</div>
      </div>


      {/*列表项4 */}
      <div 
        style={ItemStyle} 
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={ImageWrapperStyle}>
          <Image
            src="/Image/Hot4.png" 
            alt="沙虫粥"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>沙虫粥</div>
          <div style={{ fontSize: '11px', color: '#bbb' }}>1.2w 浏览 · 100 评论</div>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#999' }}>TOP 4</div>
      </div>

      {/*列表项5 */}
      <div 
        style={ItemStyle} 
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={ImageWrapperStyle}>
          <Image
            src="/Image/Hot5.jpg" 
            alt="白灼对虾"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>白灼对虾</div>
          <div style={{ fontSize: '11px', color: '#bbb' }}>1w 浏览 · 58 评论</div>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#999' }}>TOP 5</div>
      </div>
    </div>
  );
};

export default RightHotRanking;