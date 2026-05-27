"use client"
import {useState,useEffect} from 'react'

const styles = {
    card: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)', // 极其轻微的阴影，符合 Apple 简约风
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    title: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#1d1d1f',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    more: {
      fontSize: '13px',
      color: '#999', 
      cursor: 'pointer',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
    },
    leftPart: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    rankNum: (rank) => ({
      fontSize: '14px',
      fontWeight: '700',
      color: rank <= 3 ? '#ff3b30' : '#86868b', // 前三名红色，其余灰色
      width: '18px',
    }),
    topicName: {
      fontSize: '14px',
      color: '#1d1d1f',
      fontWeight: '500',
    },
    viewCount: {
      fontSize: '12px',
      color: '#86868b',
    }
  };



    const HotTopicsPannel=()=>{

 const [topics, setTopics] = useState([]);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await fetch('/API/HotTopics');
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    setTopics(data);
                } else {
                    setTopics([]); 
                    console.error("后端返回了错误格式:", data);
                }
            } catch (error) {
                console.error("网络请求失败:", error);
                setTopics([]);
            }
        };

        fetchTopics(); // 在组件挂载时调用函数
    }, []); // 空数组表示只在第一次加载时运行
    // ------------------------------------------

    
    return(
     <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span>🔥</span> 热门话题
        </div>
        <div style={styles.more}>查看全部 &gt;</div>
      </div>

      
      <div style={styles.list}>
        {topics.map((topic) => (
          <div key={topic.id} style={styles.item}>
            <div style={styles.leftPart}>
              <span style={styles.rankNum(topic.rank)}>{topic.rank}</span>
              <span style={styles.topicName}># {topic.name}</span>
            </div>
            <span style={styles.viewCount}>{topic.viewCourt} 浏览</span>
          </div>
        ))}
      </div>
    </div>
    )
}

export default HotTopicsPannel