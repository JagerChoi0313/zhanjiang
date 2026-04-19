import {Carousel} from 'antd'
import Image from 'next/image'

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
  position: 'relative'
};

const LeftContentStyle = {
  flex: 1,
  paddingRight: '8px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minWidth: 0,
  justifyContent: 'center' // 确保文字在左侧垂直居中
};

const TitleAreaStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#334155',
  marginBottom: '2px', // 稍微调小间距
  display: 'flex',
  alignItems: 'baseline',
  gap: '6px'
};

const ImageWrapper = {
  width: '85px',
  height: '85px',
  borderRadius: '12px',
  overflow: 'hidden',
  flexShrink: 0,
  position: 'relative', 
  background: '#f8fafc'
};

const cardImageStyle = {
  objectFit: 'cover',
  display: 'block'
};


const WuChuangCard =()=>{

     const shopData=[
        {
      shopName: "阿六烂镬炒粉",
      dishName: "大火翻炒，镬气升腾",
      image: "/Image/WC1.png" 
    },
    {
      shopName: "梅录陈记白切鸡",
      dishName: "色泽金黄、皮滑肉嫩",
      image: "/Image/WC2.png"
    },
    {
      shopName: "吴川港海鲜大排档",
      dishName: "现浪生蚝 泥丁粥",
      image: "/Image/WC3.png"
    }
    ]


    return(
         <div style={CardContainer}>
              {/* ---------------- 左侧：文字信息轮播区 ---------------- */}
              <div style={LeftContentStyle}>
                {/* 固定标题 */}
                <div style={TitleAreaStyle}>
                  <span>吴川市</span>
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
    )
}

export default WuChuangCard