// 虽然你在 JSX 中写了 <rightHotCard/>，但在 JavaScript/TypeScript 的编译逻辑中，
// 组件名首字母必须大写，编译器才会把它识别为一个“自定义组件”并去调用你导入的变量。
// 如果你使用的是小写（rightHotCard），编译器会认为这是一个原生的 HTML 标签
// （比如像 <div> 或 <span> 一样的原生标签），因此它不会去寻找你导入的那个变量。
// 既然没有被调用，ESLint 就判定这个导入是“未使用的”。

import LeftCarousel from "./leftArea/leftCarousel"
import LeftRole from './leftArea/leftRole'
import LeftMaster from './leftArea/leftMaster'
import LeftCustomerComment from './leftArea/leftCustomerComment'
import RightHotCard from './rightArea/rightHot/rightHotCard'
import RightTalkCard from './rightArea/rightTalk/rightTalkCard'
import RightHotRanking from './rightArea/rightHot/rightHotRanking'
import RightTalkRanking from './rightArea/rightTalk/rigthTalkRanking'

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
      <div style={{ width: '45%' }}>
        <div style={{
          display: 'flex',
          gap: '35px',
          marginTop:'24px',
          width:'100%',
        }}>
        <RightHotCard/>
        <RightTalkCard/>
        </div>

        {/*右侧下方:排行榜区域*/}
        <div style={{
          display:'flex',
          gap:'35px',
          width:'100%',
          marginTop: '20px',
          alignItems: 'stretch',//  关键 ：让子容器高度互相拉齐
        }}>
         {/* 右侧下放热门推荐榜单 */}
          <div style={{ flex: 1, display: 'flex' }}>
            <RightHotRanking />
          </div>

          {/*右侧下方用户评论榜单 */}
        <div style={{ 
            flex: 1, 
            background: '#fff', 
            borderRadius: '16px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden', 
            display: 'flex'
          }}>
            <RightTalkRanking />
        </div>
        </div>
      </div>
    </div>
    );
};

export default MainPage