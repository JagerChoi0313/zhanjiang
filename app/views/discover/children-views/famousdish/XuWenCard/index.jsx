import {Carousel} from 'antd'


const XuWenCard =()=>{

    const shopData=[
        {
      shopName: "旺记食铺 WANG JI",
      dishName: "招牌猪红 回味无穷",
      image: "/Image/CK1.png" 
    },
    {
      shopName: "赤坎老街糖水",
      dishName: "鸳鸯糊 SEASAME PASTE",
      image: "/Image/CK2.png"
    },
    {
      shopName: "北桥鸭仔饭",
      dishName: "正宗白切鸭 DUCK RICE",
      image: "/Image/CK3.png"
    }
    ]

    return(
          <div style={{
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
      border: '1px solid rgba(255,255,255,0.3)'
    }}>
      {/* 左侧内容区 */}
      <div style={{ flex: 1, paddingRight: '8px', display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
        
        {/* 固定标题 */}
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#334155', 
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px'
        }}>
          <span>徐闻县</span>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>CHIKAN</span>
        </div>

        {/* 轮播文字部分 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Carousel 
            autoplay 
            dots={false}          /* 修改点：不再使用 dotPosition="none" */
            effect="fade" 
            speed={800}
            autoplaySpeed={3000}
            waitForAnimate={true} /* 保证动画平滑 */
          >
            {shopData.map((item, index) => (
              <div key={index}>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#1e293b', 
                  fontWeight: '600',
                  lineHeight: '1.4', /* 稍微增加行高防止文字重叠 */
                  marginBottom: '2px',
                  display: '-webkit-box',
                  WebkitLineClamp: 1, /* 修改点：限制1行防止溢出影响轮播 */
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

      {/* 右侧图片轮播区 */}
      <div style={{ width: '85px', height: '85px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
        <Carousel 
          autoplay 
          dots={false}            /* 修改点：同步修改此处 */
          effect="fade"
          speed={800}
          autoplaySpeed={3000}
        >
          {shopData.map((item, index) => (
            <div key={index} style={{ width: '85px', height: '85px' }}>
              <img 
                src={item.image} 
                alt={item.shopName}
                style={{ 
                  width: '85px', 
                  height: '85px', 
                  objectFit: 'cover',
                  display: 'block' /* 消除图片底部间隙 */
                }}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
    )
}

export default XuWenCard