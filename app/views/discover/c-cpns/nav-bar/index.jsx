"use client";
import { Anchor, Search } from "lucide-react";
import {useState} from 'react' //用来记录被选中的标题


const NavBar = () => {
  const menuItems = ["首页", "经典名菜", "街头小吃", "文化故事"];

  //定义初始选中的人，默认用户刚打开网页时聚焦的地方是首页
  const [activeTab,setActiveTab]=useState("首页")


  return (
    // 1. 容器：背景换成淡淡的暖色调 #fdfaf5 (蚝壳白)，依然保留毛玻璃
    <nav className="navbar h-20 bg-[#fdfaf5]/80 backdrop-blur-md fixed top-0 left-0 z-50 px-6 md:px-20 border-b-[0.5px] border-[#005da1]/10 transition-all">
      
      {/* 2. 左侧 Logo：主色调改为深墨青，更有文化底蕴 */}
      <div className="navbar-start flex items-center gap-2">
        <Anchor className="text-[#003d6b] w-6 h-6 opacity-90" />
        <button className="text-2xl font-bold tracking-tight text-[#1a2a3a]">
          Zhanjiang<span className="text-[#005da1]">·</span>Food
        </button>
      </div>


      {/* 3. 中间菜单：文字改用墨青色，悬浮效果改为温暖的红土色 
              学习重点：聚焦逻辑和路由跳转的实现*/}
      <div className="navbar-center hidden lg:flex">

         {/*把动作和样式连接起来,当用户点击其它标题时，导航栏要自动聚焦其标题,并且要实现页面跳转 */}
        <ul className="flex items-center gap-x-12 text-[17px] font-medium text-[#1a2a3a]/80">

          {/*menuItems是那个包含“首页” “经典名菜”等的数组*/}
          {menuItems.map((item)=>{
            //.map是遍历数组中的每个元素，他会把下面的<li>复印出四份来
            //这里的item就是当前复印的那个词
            const isActive = activeTab === item; 
            //activeTab就是当前选中的名字
            //item是当前复印的名字
            //如果相等，isActive就是true，如果不等就是false
            //这个变量就像一个开光决定了后面要不要变红，要不要长出下划线

            return(
              <li
                key={item}
                className="group relative py-1 cursor-pointer"
                //当鼠标点击这个标题时，监听器onClick会立刻执行setActiveTab，把当前这个item的名字告诉给react
                //那这个时候activeTab就等于item了
                onClick={()=>setActiveTab(item)}>
                  
                  {/*动态文字颜色：${ isActive ? ... } 
                     如果isActive为真：应用 text-[#a63d2d]（红土色）和 font-bold（加粗）
                     否则：只应用 group-hover 效果，即只有鼠标滑过时才变色 */}
                  <span className={`transition-colors duration-300 ${
                  isActive ? "text-[#a63d2d] font-bold" : "group-hover:text-[#a63d2d]"
                }`}>
                  {item}
                </span>
                
                {/*动态下划线：动画的灵魂
                    其本质原理是控制下划线的宽度
                    作用：激活状态：w-full 让下划线长度为 100%
                          未激活状态：w-0 让它缩成一个点（看不见）。
                          过渡：配合 transition-all duration-500，
                          宽度变化时就会产生那种从中间向两边滑开、或者平滑长出来的“果味”动画感。
                           */}
                <div className={`absolute bottom-0 left-0 h-[1.5px] bg-[#a63d2d] transition-all duration-500 ${
                  isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-80"
                }`}></div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 4. 右侧功能区：搜索框微调为暖灰色，投稿按钮用暖橙红 */}
      <div className="navbar-end gap-6 flex items-center">
        <div className="relative hidden sm:block">
          <input 
            type="text" 
            placeholder="搜搜白切鸡..." 
            className="input h-10 w-64 bg-[#1a2a3a]/5 rounded-full pl-11 text-sm border-none focus:ring-1 focus:ring-[#005da1]/20 transition-all placeholder:text-gray-400" 
          />
          <Search className="absolute left-4 top-3 w-4 h-4 text-gray-500" />
        </div>
        
        {/* 投稿按钮：从冰冷的黑变成热情的红土色 #a63d2d */}
        <button className="btn btn-sm h-10 bg-[#a63d2d] hover:bg-[#8e3326] border-none text-white rounded-full px-8 text-sm font-semibold shadow-md shadow-[#a63d2d]/20 transition-all hover:scale-105 active:scale-95">
          投稿
        </button>
      </div>
    </nav>
  );
};

export default NavBar;