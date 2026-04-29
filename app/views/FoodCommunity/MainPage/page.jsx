"use client";
import React from 'react';
import FoodList from './FoodList/page';
// 引入右侧的三个面板组件
import HotTopicsPannel from './HotTopicsPannel/page';
import Promotion from './Promotion/page';
import ActiveUserPannel from './ActiveUserPannel/page';

const MainPage = () => {
  const styles = {
    pageContainer: {
      display: 'flex',
      height: '100%', // 继承 layout 的 100vh
      width: '100%',
      backgroundColor: '#fbfbfd', // Apple 官网色调
    },
    // 中间内容区：这是全页面唯一允许滚动的区域
    scrollArea: {
      flex: 1,
      height: '100%',
      overflowY: 'auto', 
      padding: '0 20px 40px 20px', // 增加两侧间距，视觉更高级
      scrollbarWidth: 'none', // 隐藏 Firefox 滚动条
      msOverflowStyle: 'none', // 隐藏 IE 滚动条
    },
    // 右侧固定区域
  rightFixedPanel: {
  width: '350px',
  height: '100%',
  padding: '24px',
  borderLeft: '1px solid #f2f2f2',
  backgroundColor: '#fff',
  
  msOverflowStyle: 'none', 
},
    // 搜索栏容器
    headerSection: {
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(251, 251, 253, 0.8)', // 磨砂玻璃背景
      backdropFilter: 'blur(20px)',
      zIndex: 10,
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    searchBar: {
      width: '100%',
      padding: '12px 20px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: '#f5f5f7',
      fontSize: '15px',
      outline: 'none',
      color: '#1d1d1f',
    },
    tabGroup: {
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
    },
    tab: {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      backgroundColor: '#fff',
      color: '#86868b',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    activeTab: {
      backgroundColor: '#e8e8ed',
      color: '#1d1d1f',
      fontWeight: '600',
    }
  };

  // 分类标签数据（对应模板图 2）
  const tabs = ["推荐", "最新", "精华", "问答", "探店", "家常菜", "地方小吃"];

  return (
    <div style={styles.pageContainer}>
      {/* 1. 中间：滚动内容流 */}
      <div style={styles.scrollArea}>
        {/* 顶部粘性搜索和分类区 */}
        <div style={styles.headerSection}>
          <input 
            type="text" 
            placeholder="🔍 搜索美食、话题或用户..." 
            style={styles.searchBar} 
          />
          <div style={styles.tabGroup}>
            {tabs.map((tab, index) => (
              <div 
                key={tab} 
                style={{
                  ...styles.tab, 
                  ...(index === 0 ? styles.activeTab : {}) // 默认选中第一个
                }}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* 帖子列表组件 */}
        <div style={{ paddingBottom: '40px' }}>
          <FoodList />
        </div>
      </div>

      {/* 2. 右侧：固定榜单（不随中间滚动） */}
      <aside style={styles.rightFixedPanel}>
      <div style={{ marginBottom: '16px' }}>
    <HotTopicsPannel />
  </div>
  
  <div style={{ marginBottom: '16px' }}>
    <Promotion />
  </div>
  
  <div>
    <ActiveUserPannel />
  </div>
      </aside>
    </div>
  );
};

export default MainPage;