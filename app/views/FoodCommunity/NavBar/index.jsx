import React from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

const NavBar=()=>{

    //模拟当前选中的菜单
    const pathname = usePathname();//获取当前浏览器地址栏的路径

    const navItems = [
        {id:'home',label:'首页',icon:'🏠',href:'/views/FoodCommunity'},
        {id:'fav',label:'我的收藏',icon:'⭐',href:'/views/FoodCommunity/MyFavorites'},
        {id:'comment',label:'我的评论',icon:'💬',href:'/views/FoodCommunity/MyComments'},
        {id:'post',label:'我的帖子',icon:'📝',href:'/views/FoodCommunity/MyPost'},
    ];

    return(
<div className="w-64 h-full flex flex-col px-4 py-8 bg-white">
            {/* 1. Logo 区 */}
            <div className="px-4 mb-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600">🍲</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-800">Zhanjiang·Food</span>
                </div>
            </div>

            {/* 2. 导航菜单列表 */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    // 核心逻辑：判断当前路径是否与该项的 href 匹配
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                                w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                ${isActive 
                                    ? 'bg-[#FDF2ED] text-[#A6755D] font-semibold shadow-sm' 
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                            `}
                        >
                            <span className={`text-xl transition-colors ${isActive ? 'text-[#A6755D]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {item.icon}
                            </span>
                            <span className="text-[15px]">{item.label}</span>
                        </Link>
                    );
                })}

                {/* 3. 发帖投稿按钮 */}
                <div className="pt-6 px-1">
                    <button className="w-full py-4 bg-[#A6755D] text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-900/10 hover:bg-[#8e634f] transition-all active:scale-[0.98]">
                        <span>✏️</span>
                        <span className="font-medium">发帖投稿</span>
                    </button>
                </div>
            </nav>

            {/* 4. 底部用户信息 (保持不变) */}
            <div className="mt-auto pt-6 space-y-4 border-t border-gray-50">
                {/* ... 用户资料代码 ... */}
                <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-gray-700 transition-colors group">
                    <span className="group-hover:rotate-45 transition-transform duration-500">⚙️</span>
                    <span className="text-sm font-medium">设置</span>
                </button>
            </div>
        </div>
    )
}

export default NavBar;