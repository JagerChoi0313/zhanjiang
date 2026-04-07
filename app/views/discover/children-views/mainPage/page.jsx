import LeftCarousel from "./leftArea/leftCarousel"
import LeftRole from './leftArea/leftRole'
import LeftMaster from './leftArea/leftMaster'
import LeftCustomerComment from './leftArea/leftCustomerComment'

const MainPage=()=>{
    return(
       <div style={{ 
      justifyContent:'center',
      display: 'flex', 
      justifyContent: 'space-between', 
      //padding的顺序是：上 右 下 左
      //顶部给100px是为了避开导航栏
      padding: '100px 50px 20px 50px', // 两侧留出白边，像设计稿那样
      maxWidth: '1400px',   // 限制最大宽度，防止在大屏幕上无限拉伸
      margin: '0 auto'      // 居中
    }}>


      {/* 左侧区域：占 60% 左右 */}
      <div style={{ width: '50%',marginTop:'24px' }}>
        <LeftCarousel />

        {/* 这里之后放下方的小图区域 */}
        {/*卡片展示区域，使用flex布局让三个卡片横向排列 */}
        <div style={{
          display:'flex',
          width:'100%',
          marginTop:'20px',
          gap:'16px'
        }}
        >

          <LeftRole/>
          <LeftMaster/>
          <LeftCustomerComment/>
        </div>
        
      </div>



      {/* 右侧区域：占 35% 左右 */}
      <div style={{ width: '35%' }}>
        {/* 这里放“寻味湛江”文案和地图 */}
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>寻味湛江...</div>
      </div>
    </div>
    );
};

export default MainPage