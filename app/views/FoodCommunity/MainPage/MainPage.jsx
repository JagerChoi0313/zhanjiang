"use client";
import React, { Suspense } from 'react';
import FoodList from './components/FoodList';
// 引入右侧的三个面板组件
import HotTopicsPannel from './components/HotTopicsPannel';
import Promotion from './components/Promotion';
import ActiveUserPannel from './components/ActiveUserPannel';
//引入next.js强大的路由和参数提取工具
import {usePathname,useRouter,useSearchParams} from 'next/navigation'
import {useRef} from 'react'
import { POST_CATEGORIES, COMMUNITY_VIEWS } from '../../../../lib/community.mjs'

const MainPageContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';
  const requestedView = searchParams.get('view');
  const view = COMMUNITY_VIEWS.includes(requestedView) ? requestedView : 'recommended';
  const scrollArea = useRef(null);

  const updateFeed = (changes) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    scrollArea.current?.scrollTo({ top: 0 });
    router.push(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };

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
  width: 'min(32%, 350px)',
  overflowY: 'auto',
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

  const tabs = [
    ...['推荐', '最新', '精华'].map((label, index) => ({ label, view: COMMUNITY_VIEWS[index] })),
    ...POST_CATEGORIES.map(label => ({ label, category: label, view: 'latest' })),
  ];

  return (
  <div style={styles.pageContainer}>
      {/* 1. 中间：滚动内容流 */}
      <div ref={scrollArea} style={{ ...styles.scrollArea, minWidth: 0 }}>
        {/* 顶部粘性搜索和分类区 */}
        <div style={styles.headerSection}>
          <form key={currentQuery} className="flex gap-2" onSubmit={(event) => {
            event.preventDefault();
            updateFeed({ q: new FormData(event.currentTarget).get('q').trim() });
          }}>
            <input name="q" aria-label="搜索帖子" defaultValue={currentQuery} maxLength={80}
              placeholder="搜索美食、地区或作者…" style={styles.searchBar} />
            <button className="shrink-0 rounded-xl bg-[#805741] px-4 text-sm text-white" type="submit">搜索</button>
          </form>
          <div style={styles.tabGroup} aria-label="帖子分类">
            {tabs.map(tab => {
              const active = tab.category ? tab.category === category : !category && tab.view === view;
              return (
                <button key={tab.label} type="button" aria-pressed={active}
                  style={{ ...styles.tab, ...(active ? styles.activeTab : {}) }}
                  onClick={() => updateFeed({ view: tab.view, category: tab.category })}>
                  {tab.label}
                </button>
              );
            })}
          </div>
          {view === 'recommended' && !category && <p className="text-xs text-gray-500">近期发布、有收藏和讨论的帖子优先展示。</p>}
          {view === 'featured' && <p className="text-xs text-gray-500">收录精选帖子，以及至少有 2 次收藏或 3 条评论的投稿。</p>}
          {location && (
            <button className="self-start rounded-full bg-[#f6ebe3] px-3 py-1 text-sm text-[#805741]"
              type="button" onClick={() => updateFeed({ location: '' })}>
              地区：{location} ×
            </button>
          )}
        </div>

        {/* 帖子列表组件 */}
        <div style={{ paddingBottom: '40px' }}>
          {/* 👇 最核心的一步：把解析出来的 URL 搜索关键字，传给 FoodList */}
          <FoodList key={JSON.stringify([currentQuery, view, category, location])}
            searchQuery={currentQuery} view={view} category={category} location={location} />
        </div>
      </div>

      {/* 2. 右侧：固定榜单 */}
      <aside style={styles.rightFixedPanel}>
        <div style={{ marginBottom: '16px' }}>
          <HotTopicsPannel location={location} onSelect={location => updateFeed({ location, q: '', category: '', view: 'recommended' })} />
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

const MainPage = () => (
  <Suspense fallback={null}>
    <MainPageContent />
  </Suspense>
);

export default MainPage;
