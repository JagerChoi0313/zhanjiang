import Image from 'next/image'
import {useEffect,useState} from 'react'

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
  
  //2.定义状态，状态管理
  const [talkData,setTalkData] = useState([]);
  const [loading,setLoading] = useState(true);

  //异步获取后端数据
  useEffect(()=>{
   const fetchData = async() =>{
    try{
        const response = await fetch('/API/TalkRanking')
        const result = await response.json();
        console.log("接口返回的数据：", result);

        if(result.success){
          setTalkData(result.data);
        }
    }catch(error){
      console.error("获取榜单失败",error)
    }finally{
      setLoading(false)
    }
   };

   fetchData();
  },[])

  // 4. 加载状态处理
  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>加载中...</div>;

  return (
    <div style={ContainerStyle}>
      {/* 头部区域 */}
      <div style={HeaderStyle}>
        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>用户互动</span>
        <span style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>更多 &gt;</span>
      </div>

      {/* 互动列表 */}
      {talkData.length > 0 ? (
        talkData.map((item) => (
          <div 
            key={item.id}
            style={ItemStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {/* 用户头像 - 使用数据库字段 avatar */}
            <div style={AvatarStyle}>
              <Image
                src={item.avatar || '/Image/default-avatar.png'} // 增加兜底图
                alt={item.user_name || 'User'}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* 右侧文本内容 */}
            <div style={ContentStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* 字段修正：使用数据库中的 user_name */}
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>
                  {item.user_name}
                </span>
                {/* 根据数据库 rating 动态显示星星，如果没有则默认为5颗 */}
                <span style={{ fontSize: '10px', color: '#faad14' }}>
                  {"⭐".repeat(item.rating || 5)}{"⭐".repeat(5 - (item.rating || 5))}
                </span>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {/* 字段修正：使用数据库中的 comment */}
                {item.comment}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ccc' }}>暂无互动评论</div>
      )}
    </div>
  );
};

export default RightTalkRanking;