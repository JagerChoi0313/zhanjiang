"use client"
import {useState,useEffect} from 'react'
import { Spin, Button, message, Tabs } from 'antd';
import { UserOutlined, FileTextOutlined, MessageOutlined, StarOutlined, LogoutOutlined } from '@ant-design/icons';
import Link from "next/link"
import {useRouter} from 'next/navigation'

const ProfilePage=()=>{
    const router = useRouter()
    const [loading,setLoading] = useState(true)
    const [user,setUser] = useState(null)

    //1，页面加载时自动查验用户的登录状态
    useEffect(()=>{

       const checkLoginStatus = async()=>{

        try{
            const res = await fetch('/API/auth/Login')
            const data = await res.json();

            if(data.success){
                setUser(data.user)  //存入当前登录的用户信息（包含头像，昵称）
            }else{
                setUser(null)
            }
        }catch(error){
                setUser(null)
        }finally{
            setLoading(false)
        }
       }
            checkLoginStatus()
    },[])

    //退出登录逻辑
    const handleLogout=async()=>{
        try{
            const res = await fetch("/API/auth/Logout",{method:POST})
            const data = await res.json()

            if(data.success){
                message.success("已成功退出登录，期待与您下次美食相遇")
                setUser(null)
                router.push('/views/Login')
            }else{
                message.error(data.error||'退出失败')
            }
        }catch(error){
                message.error("网络异常，请稍后再尝试")
        }
    }

    //全局加载动画状态
    if(loading){
        return(
        <div className="flex justify-center items-center min-h-screen bg-white">
            <Spin size="large" description="正在载入食客空间..." />
        </div>
        )
    }

    //情况A：用户未登录，渲染拦截页面
    if(!user){
        return(
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-6 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex justify-center items-center mb-6">
          <UserOutlined className="text-2xl text-gray-400" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 mb-2">探索属于你的湛江美食足迹</h2>
        <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
          登录后即可解锁投稿专属美食、管理你的评论、帖子以及收藏的寻味路线。
        </p>
        <Link 
          href="/views/Login" 
          className="px-8 py-3 bg-[#a63d2d] text-white font-medium rounded-xl transition-all hover:bg-[#8b3224] hover:shadow-lg hover:shadow-red-900/10 active:scale-95 text-base tracking-wide"
        >
          请先登录
        </Link>
    </div>
        )
    }

    
    return(
 <div className="min-h-screen bg-white text-gray-900 antialiased selection:bg-red-100">
      {/* 顶部主体区域 */}
      <div className="max-w-4xl mx-auto pt-20 pb-12 px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between border-b border-gray-100 pb-10">
          
          {/* 用户基础资料 */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full overflow-hidden border border-gray-100 flex justify-center items-center shadow-inner">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
              ) : (
                <UserOutlined className="text-4xl text-gray-300" />
              )}
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{user.nickname}</h1>
              <p className="text-gray-400 text-sm mt-1">湛江美食地图特邀食客</p>
            </div>
          </div>

          {/* 退出登录按钮 */}
          <div className="mt-6 md:mt-0">
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              className="flex items-center text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 px-4 py-2 transition-all font-medium"
            >
              退出登录
            </Button>
          </div>

        </div>

        {/* 下方功能数据同步联动区域 */}
        <div className="mt-10">
          <Tabs
            defaultActiveKey="posts"
            className="custom-profile-tabs"
            items={[
              {
                key: 'posts',
                label: (
                  <span className="flex items-center gap-2 px-1 text-base">
                    <FileTextOutlined /> 我的帖子
                  </span>
                ),
                children: (
                  <div className="py-12 text-center text-gray-300 font-light tracking-wide">
                    暂无发布的帖子，前往探店寻味分享你的美食故事吧。
                  </div>
                ),
              },
              {
                key: 'comments',
                label: (
                  <span className="flex items-center gap-2 px-1 text-base">
                    <MessageOutlined /> 我的评论
                  </span>
                ),
                children: (
                  <div className="py-12 text-center text-gray-300 font-light tracking-wide">
                    写下的每一句赞美，都会留在这里。
                  </div>
                ),
              },
              {
                key: 'collections',
                label: (
                  <span className="flex items-center gap-2 px-1 text-base">
                    <StarOutlined /> 我的收藏
                  </span>
                ),
                children: (
                  <div className="py-12 text-center text-gray-300 font-light tracking-wide">
                    珍藏的湛江风味，不迷路。
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
    )
}

export default ProfilePage