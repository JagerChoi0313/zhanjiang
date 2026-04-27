"use client"
import React from 'react'
import NavBar from './NavBar/index'

const FoodCommunityLayout=({children})=>{
    return(
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#fbfbfd' }}>
      {/* 左侧：固定导航栏 */}
      <aside style={{ width: '260px', height: '100%', borderRight: '1px solid #f2f2f2', flexShrink: 0 }}>
        <NavBar />
      </aside>

      {/* 右侧：主内容区，交给具体的 page 处理 */}
      <main style={{ flex: 1, height: '100%', position: 'relative' }}>
        {children}
      </main>
    </div>
    )
}

export default FoodCommunityLayout;