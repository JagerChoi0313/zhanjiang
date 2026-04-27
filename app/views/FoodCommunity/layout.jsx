"use client"
import React from 'react'
import NavBar from './NavBar/index'

const FoodCommunityLayout=()=>{
    return(
        <div className="flex min-h-screen bg-[#F8F9FA]">
            {/* 左侧：侧边栏容器 */}
            {/* 注意：我加了 top-[64px] 和 h-calc，防止它被你的顶部导航挡住 */}
            <aside className="top-0 h-screen w-64 flex-shrink-0 sticky top-[64px] h-[calc(100vh-64px)] border-r border-gray-100 overflow-y-auto bg-white">
                <NavBar />
            </aside>

            {/* 右侧：临时占位区 */}
            <main className="flex-1 min-h-screen">
                <div className="p-8 text-gray-400">
                    {/* 先不放 children，放个提示语 */}
                    这里是内容区域，等 layout 调好了我们再写 page.jsx
                </div>
            </main>
        </div>
    )
}

export default FoodCommunityLayout;