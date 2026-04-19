import Image from 'next/image'
import {useState,useEffect} from 'react'

// 1. 定义样式对象，保持代码整洁
const styles = {
  listContainer: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f0f0f0',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    gap: '12px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  imageWrapper: {
    position: 'relative',
    width: '64px',
    height: '40px',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  rank: (isFirst) => ({
    fontSize: '12px',
    fontWeight: 'bold',
    color: isFirst ? '#ff7a45' : '#ccc',
  })
};

//工具函数：格式化数字，如99000 ->9.9w

const formatNumber=(num)=>{
    if(num >= 10000){
      return (num/10000).toFixed(1)+'w'; //toFixed是保留一位小数  然后字段后面加上“w”
    }

    return num.toLocaleString();   //小于1万的加逗号分隔
}

const RightHotRanking = () => {

    //定义状态，初始为空数组
    const [data,setData] = useState([]);
    const [loading,setLoading]=useState(true);

    //组件加载时自动请求API
    useEffect(()=>{
      const fetchData = async()=>{
        try{
            const response = await fetch('/API/HotRanking')
            const json = await response.json();
            console.log("接口返回数据:",json);

            if(json.success){
              setData(json.data);
            }
        }catch(error){
          console.error("获取数据失败：",error)
        }finally{
          setLoading(false);
        }
      };

        fetchData();
    },[])
      

    //3.渲染逻辑
    if(loading) return <div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>

  return (
    <div style={styles.listContainer}>
      <div style={styles.header}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>热门推荐</span>
        <span style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>更多 &gt;</span>
      </div>

      {data.length > 0 ? (
        data.map((item, index) => (
          <div 
            key={item.id}
            style={styles.item}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={styles.imageWrapper}>
              <Image
                src={item.cover_image || '/Image/default.png'} 
                alt={item.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>
                {formatNumber(item.views)} 浏览 · {item.comments} 评论
              </div>
            </div>

            <div style={styles.rank(index === 0)}>
              TOP {index + 1}
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ccc' }}>暂无数据</div>
      )}
    </div>
  );
};

export default RightHotRanking;