import React from 'react';
import FoodPost from './FoodPost/page'; // 引入我们刚才写的卡片组件

const FoodList = () => {
  // 模拟数据：模拟从数据库拉取的多条记录
  const mockData = [
    {
      id: 1,
      username: "阿强",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1", // 模拟头像
      time: "2小时前",
      title: "赤坎老街的灵魂蘸料：姜蓉白切鸡",
      description: "今天跑过大马路，三十年老店的姜蓉简直绝了，鸡肉皮爽肉嫩，加上秘制蘸料，一口封神...",
      coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
      likes: "1.2k",
      comments: 86
    },
    {
      id: 2,
      username: "喷水鸡研究员",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
      time: "昨天",
      title: "赤坎老街的港式生滚肠粉",
      description: "三十年老店的姜蓉简直绝了，鸡肉皮爽肉嫩。还得看淡淡的米香，加上秘制蘸料，一口封神...",
      coverImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
      likes: 952,
      comments: 64
    },
    {
      id: 3,
      username: "爱吃的小橙子",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
      time: "2天前",
      title: "赤坎老街的灵魂：花生白切",
      description: "鸡肉皮爽肉嫩，加上秘制蘸料，一口封神。根本停不下来！",
      coverImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
      likes: 732,
      comments: 45
    }
  ];

 const styles = {
  container: {
    width: '100%',
    padding: '24px 0', // 左右 padding 由 MainPage 的 mainContent 控制
    backgroundColor: 'transparent', // 背景色由 MainPage 统一控制
  },
  listWrapper: {
    maxWidth: '850px', // 稍微放宽一点，适应并排布局
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.listWrapper}>
        {mockData.map((item) => (
          <FoodPost key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
};

export default FoodList;