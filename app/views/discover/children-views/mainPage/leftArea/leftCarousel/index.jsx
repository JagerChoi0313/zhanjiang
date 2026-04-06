import {Carousel} from 'antd'
import Image from 'next/image'

//轮播图区域的位置
const ContentStyle={
  width: '100%',
  height: '300px',          // 根据设计稿，这里建议设置在 400px - 500px 之间
  color: '#fff',
  lineHeight: '300px',      // 与 height 保持一致以实现文字居中（如果你放文字的话）
  textAlign: 'center',
  background: '#f0f2f5',    // 未加载图片时的底色
  borderRadius: '20px',     // 设计稿中有明显的圆角效果
  overflow: 'hidden',       // 确保子元素（如图片）不会超出圆角
  margin: '0',
  //关键：必须设置relative，否则Image的fill属性会相对整个页面定位
  position:'relative'
};


//轮播图中图片样式的要求
const imageStyle={
  //使用next中的fill属性后可自动撑满容器
  // width: '100%',            //宽度撑满容器
  // height: '100%',           //高度撑满容器

  objectFit: 'cover',       // 关键：确保图片充满容器且不变形
  display: 'block',
  transition:'opacity 0.5 ease' //切换时淡入淡出的效果
};

const LeftCarousel =()=>{
    return(
      //autoplay:自动播放  effect-fade:淡入淡出
       <Carousel effect="fade" autoplay>

        {/*------------ 幻灯片1：白切鸡 ------------*/}
    <div>
      <div>
      <h3 style={ContentStyle}>
        <Image
        src="/Image/slider1.png"
        alt="湛江白切鸡"
        fill      //告诉next.js必须撑满整个容器
        style={imageStyle}  //应用objectFit
        priority    //让第一张图优先加载提高性能
        />
      </h3>
      </div>
    </div>

        {/*------------- 幻灯片2：生蚝 ------------- */}
    <div>
     <div>
      <h3 style={ContentStyle}>
        <Image
        src="/Image/slider2.png"
        alt="湛江生蚝"
        fill
        style={imageStyle}
        />
      </h3>
     </div>
    </div>

      {/*--------------幻灯片3：菠萝------------- */}
    <div>
      <div>
        <h3 style={ContentStyle}>
          <Image
          src="/Image/slider3.png"
          alt="徐闻菠萝"
          fill
          style={imageStyle}
          />
        </h3>
      </div>
    </div>

    {/*-------------- 幻灯片4：虾饼 ------------- */}
    <div>
      <div>
      <h3 style={ContentStyle}>
        <Image
        src="/Image/slider4.png"
        alt="湛江虾饼"
        fill
        style={imageStyle}
        />
      </h3>
      </div>
    </div>
  </Carousel>
    )
}

export default LeftCarousel;