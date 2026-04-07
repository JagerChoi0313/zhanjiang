import Image from 'next/image'


// 卡片外层容器样式要求
const CardContainerStyle = {
  flex: 1,
  height: '180px', // ⭐关键：固定高度
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  position: 'relative',
  cursor:'pointer',
};


// 图片包裹层的样式（固定高度，实现统一裁剪）
const ImageWrapperStyle = {
 position: 'relative',
  width: '100%',
  height: '100%', // 直接撑满卡片
};


// 图片本身的样式要求
const cardImageStyle = {
  objectFit: 'cover',         // 确保美食图片铺满且不变形
  transition: 'transform 0.5s ease', // 增加鼠标悬停缩放效果的过渡
};


const RightTalkCard=()=>{
    return(
       <div style={CardContainerStyle} className="group">
      <div style={ImageWrapperStyle}>
        <Image
          src="/Image/Right2.png" 
          alt="美食特色"
          fill
          style={cardImageStyle}
          // 鼠标悬停时可以加个缩放效果（可选）
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
    </div>
    )
}

export default RightTalkCard;