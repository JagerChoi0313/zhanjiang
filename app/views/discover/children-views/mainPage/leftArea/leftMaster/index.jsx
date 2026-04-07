import {Card} from 'antd'
import Image from 'next/image'


// 卡片外层容器样式要求
const CardContainerStyle = {
  flex: 1,                    // 让卡片在 Flex 布局中等分宽度
  borderRadius: '16px',       // 匹配设计稿的圆角
  overflow: 'hidden',         // 确保图片不超出圆角
  border: 'none',             // 移除 AntD 默认边框，更显现代感
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // 增加微弱的投影
  position: 'relative',       // 必须设置，作为 Image fill 的定位基准
};


// 图片包裹层的样式（固定高度，实现统一裁剪）
const ImageWrapperStyle = {
  position: 'relative',       // fill 属性的关键
  width: '100%',
  height: '160px',            // 统一设置卡片图片高度
  overflow: 'hidden',
};


// 图片本身的样式要求
const cardImageStyle = {
  objectFit: 'cover',         // 确保美食图片铺满且不变形
  transition: 'transform 0.3s ease', // 增加鼠标悬停缩放效果的过渡
};

const LeftMaster=()=>{

  return(
    <Card
      hoverable
      style={CardContainerStyle}
      // Ant Design 5.x 废弃了 bodyStyle，改用 styles.body
      styles={{
        body: {
          padding: '16px',
          background: '#fff',
        }
      }}
      cover={
        <div style={ImageWrapperStyle}>
          <Image
            src="/Image/Left2.png"
            alt="匠心传承"
            fill
            style={cardImageStyle}
            //鼠标悬停有缩放效果
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
      }
    >
      {/* 底部文案部分 */}
      <div style={{ marginBottom: '4px' }}>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
          匠心传承：聚焦老店传承人
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#999' }}>
        一代代对秘方的传承
      </div>
    </Card>
  )
}

export default LeftMaster;