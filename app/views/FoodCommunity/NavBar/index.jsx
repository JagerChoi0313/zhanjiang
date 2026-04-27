import React from 'react'

const NavBar=()=>{

    //模拟当前选中的菜单
    const activeId = 'home';

    const navItems = [
        {id:'home',label:'首页',icon:'🏠'},
        {id:'fav',label:'我的收藏',icon:'⭐'},
        {id:'comment',label:'我的评论',icon:'💬'},
        {id:'post',label:'我的帖子',icon:'📝'},
    ];

    return(
    <div className="w-64 h-full flex flex-col px-4 py-8 bg-white">
      {/* 1. 顶部 Logo 区 (按需保留) */}
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
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-[#FDF2ED] text-[#A6755D] font-semibold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span className={`text-xl ${isActive ? 'text-[#A6755D]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {item.icon}
              </span>
              <span className="text-[15px]">{item.label}</span>
            </button>
          );
        })}

        {/* 3. 发帖投稿按钮 - 紧跟菜单下方 */}
        <div className="pt-6 px-1">
          <button className="w-full py-4 bg-[#A6755D] text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-900/10 hover:bg-[#8e634f] transition-all active:scale-[0.98]">
            <span>✏️</span>
            <span className="font-medium">发帖投稿</span>
          </button>
        </div>
      </nav>

      {/* 4. 底部固定区域 */}
      <div className="mt-auto pt-6 space-y-4 border-t border-gray-50">
        {/* 用户个人资料卡片 */}
        <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 rounded-full bg-orange-200 flex-shrink-0 flex items-center justify-center border-2 border-white overflow-hidden">
            {/* <img src="/avatar.jpg" alt="avatar" className="w-full h-full object-cover" /> */}
            <span className="text-xs">J</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-800 truncate">Jason</span>
            <span className="text-[11px] text-gray-400 truncate">美食爱好者</span>
          </div>
          <span className="ml-auto text-gray-400 text-xs">＞</span>
        </div>

        {/* 设置项 */}
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-gray-700 transition-colors group">
          <span className="group-hover:rotate-45 transition-transform duration-500">⚙️</span>
          <span className="text-sm font-medium">设置</span>
        </button>
      </div>
    </div>
    )
}

export default NavBar;