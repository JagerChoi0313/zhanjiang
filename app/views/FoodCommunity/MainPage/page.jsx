"use client";
import React from 'react';
import FoodList from './FoodList/page';
// 引入右侧的三个面板组件
import HotTopicsPannel from './HotTopicsPannel/page';
import Promotion from './Promotion/page';
import ActiveUserPannel from './ActiveUserPannel/page';
//引入next.js强大的路由和参数提取工具
import {useRouter,useSearchParams} from 'next/navigation'
import {useState,useEffect} from 'react'

const MainPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  //提取URL里的q参数（如果有的话）
  const currentQuery = searchParams.get('q') || '';

  //本地状态：控制搜索框里的文字
  const [inputValue,setInputValue] = useState(currentQuery);

  //监听回车键触发URL跳转
  const handleKeyDown = (e) =>{
    if(e.key === 'Enter'){
      if(inputValue.trim()){
        //带着静默参数改变URL
        router.push(`?q=${encodeURIComponent(inputValue.trim())}`);
      }else{
        //如果清空了输入框按回车就清空了参数，显示全部的帖子
        router.push(`?`)
      }
    }
  };

  //如果用户点击了浏览器的后退按钮，我们要确保搜索框里的字也跟着变回原样
  useEffect(()=>{
    setInputValue(currentQuery);
  },[currentQuery])

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
            // 👇 绑定状态和回车事件
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div style={styles.tabGroup}>
            {tabs.map((tab, index) => (
              <div 
                key={tab} 
                style={{
                  ...styles.tab, 
                  ...(index === 0 ? styles.activeTab : {}) 
                }}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* 帖子列表组件 */}
        <div style={{ paddingBottom: '40px' }}>
          {/* 👇 最核心的一步：把解析出来的 URL 搜索关键字，传给 FoodList */}
          <FoodList searchQuery={currentQuery} />
        </div>
      </div>

      {/* 2. 右侧：固定榜单 */}
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