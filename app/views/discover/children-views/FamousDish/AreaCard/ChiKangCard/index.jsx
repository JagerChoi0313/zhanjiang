import { Carousel } from 'antd';
import Image from 'next/image';

// 卡片外层容器样式
const CardContainer = {
  width: '280px',
  height: '110px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '16px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255,255,255,0.3)',
  position: 'relative' // 保持布局稳定性
};

// 左侧内容区布局
const LeftContentStyle = {
  flex: 1,
  paddingRight: '8px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minWidth: 0
};

// 标题区域样式（霞山市 CHIKAN）
const TitleAreaStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#334155',
  marginBottom: '4px',
  display: 'flex',
  alignItems: 'baseline',
  gap: '6px'
};

// 右侧图片容器 - 关键：必须设置 relative 以支持 Image 的 fill 属性
const ImageWrapper = {
  width: '85px',
  height: '85px',
  borderRadius: '12px',
  overflow: 'hidden',
  flexShrink: 0,
  position: 'relative', 
  background: '#f8fafc' // 占位底色
};

// 轮播图内部图片样式要求
const cardImageStyle = {
  objectFit: 'cover',
  display: 'block',
  transition: 'opacity 0.5s ease'
};

const ChiKangCard = () => {
  const shopData = [
    {
      shopName: "阿六鸭仔饭",
      dishName: "人头攒动，蒸汽腾腾",
      image: "/Image/CK1.png"
    },
    {
      shopName: "老陈牛杂面",
      dishName: "最纯粹的赤坎味道",
      image: "/Image/CK2.png"
    },
    {
      shopName: "北桥鸭仔饭",
      dishName: "正宗白切鸭 DUCK RICE",
      image: "/Image/CK3.png"
    }
  ];

  return (
    <div style={CardContainer}>
      {/* ---------------- 左侧：文字信息轮播区 ---------------- */}
      <div style={LeftContentStyle}>
        {/* 固定标题 */}
        <div style={TitleAreaStyle}>
          <span>赤坎区</span>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>CHIKAN</span>
        </div>

        {/* 动态文字部分 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Carousel
            autoplay
            dots={false}
            effect="fade"
            speed={800}
            autoplaySpeed={3000}
            waitForAnimate={true}
          >
            {shopData.map((item, index) => (
              <div key={index}>
                <div style={{
                  fontSize: '11px',
                  color: '#1e293b',
                  fontWeight: '600',
                  lineHeight: '1.4',
                  marginBottom: '2px',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.shopName}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.dishName}
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* ---------------- 右侧：图片轮播展示区 ---------------- */}
      <div style={ImageWrapper}>
        <Carousel
          autoplay
          dots={false}
          effect="fade"
          speed={800}
          autoplaySpeed={3000}
        >
          {shopData.map((item, index) => (
            <div key={index}>
              {/* 关键：这一层 div 必须也是 85px，Image fill 才能生效 */}
              <div style={{ width: '85px', height: '85px', position: 'relative' }}>
                <Image
                  src={item.image}
                  alt={item.shopName}
                  fill
                  style={cardImageStyle}
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}

export default ChiKangCard;