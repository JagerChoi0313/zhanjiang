"use client";
import { Anchor, Search } from "lucide-react";
import Link from 'next/link' //Link用来实现路由跳转
import {usePathname} from 'next/navigation'//使用usePathname替代原来的activeTab状态
import {UserCircle} from 'lucide-react';
import {Dropdown} from 'antd';


const NavBar = () => {

  //他会自动获取当前浏览器的路径，比如 "/views/discover/children-views/famousDish"
  const pathname=usePathname()

  //定义菜单对象，包含名字和对应的路由路径
  const menuItems = [
    {name:"首页",path:"/"},
    {name:"探店寻味",path:"/views/discover/children-views/FamousDish"},
    {name:"文化故事",path:"/views/discover/children-views/CultureStory"},
    {name:"寻味路线",path:"/views/discover/children-views/FoodMap"} 
  ];

  const items=[
    {
      key:'login',
      label:(
      <Link href="/views/Login" className="text-[15px] py-1 block">
          立即登录
        </Link>
      ),
    },
    {
      type:'divider',
    },
    {
      key:'register',
      label:(
        <Link href="/views/Register" className="text-[15px] py-1 block text-[#a63d2d] font-medium">
          新用户注册
        </Link>
      ),
    },
  ];

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

         {/*核心高亮逻辑：当前地址栏路径是否等于该项的path */}
         {/*把动作和样式连接起来,当用户点击其它标题时，导航栏要自动聚焦其标题,并且要实现页面跳转 */}
        <ul className="flex items-center gap-x-12 text-[17px] font-medium text-[#1a2a3a]/80">


          {/*menuItems是那个包含“首页” “经典名菜”等的数组*/}
          {menuItems.map((item)=>{
            //.map是遍历数组中的每个元素，他会把下面的<li>复印出四份来
            //这里的item就是当前复印的那个词
            const isActive = pathname === item.path; 
            //activeTab就是当前选中的名字
            //item是当前复印的名字
            //如果相等，isActive就是true，如果不等就是false
            //这个变量就像一个开光决定了后面要不要变红，要不要长出下划线

            return(
              <li
                key={item.path}
                className="group relative py-1 cursor-pointer"
               >
                  
                  {/*实用link实现跳转，并包裹文字和动画 */}
                  <Link href={item.path}>
                  <span className={`transition-colors duration-300 ${
                  isActive ? "text-[#a63d2d] font-bold" : "group-hover:text-[#a63d2d]"
                }`}>
                  {/*注意这里要写item.name了，因为现在item是个对象 */}
                  {item.name}
                </span>
                  </Link>
                  
                
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
            className="input h-10 w-48 bg-[#1a2a3a]/5 rounded-full pl-11 text-sm border-none focus:ring-1 focus:ring-[#005da1]/20 transition-all placeholder:text-gray-400" 
          />
          <Search className="absolute left-4 top-3 w-4 h-4 text-gray-500" />
        </div>
        
        {/* 投稿按钮：从冰冷的黑变成热情的红土色 #a63d2d */}
        <button className="btn btn-sm h-10 bg-[#a63d2d] hover:bg-[#8e3326] border-none text-white rounded-full px-8 text-sm font-semibold shadow-md shadow-[#a63d2d]/20 transition-all hover:scale-105 active:scale-95">
          投稿
        </button>

        {/*-------- 用户头像：登录注册页入口 -------- */}

        <Dropdown 
          menu={{items}}
          trigger={['click']}
          placement="bottomRight"
          >
          <div className="group shrink-0 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#1a2a3a]/5 flex items-center justify-center border border-[#1a2a3a]/10 transition-all group-hover:border-[#a63d2d]/40 group-hover:bg-white group-hover:shadow-md">
                  <UserCircle className="w-6 h-6 text-[#1a2a3a]/70 group-hover:text-[#a63d2d]" />
            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

export default NavBar;