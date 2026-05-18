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
            const res = await fetch('/API/auth/Login', { credentials: 'include' })
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
            const res = await fetch("/API/auth/Logout",{method:"POST"})
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
 <div className="min-h-screen bg-[#f5f5f7] pt-28 pb-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center relative">
          
          {/* 右上角退出登录 */}
          <div className="absolute top-6 right-6">
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 rounded-lg"
            >
              退出
            </Button>
          </div>

          {/* 头像与昵称 */}
          <div className="w-24 h-24 bg-gray-50 rounded-full overflow-hidden mb-4 shadow-sm">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <UserOutlined className="text-4xl text-gray-300 w-full h-full flex items-center justify-center" />
            )}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">{user.nickname}</h1>

          {/* 基础信息列表 (无分割线，依靠留白区分) */}
          <div className="w-full max-w-md flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">用户 ID</span>
              <span className="text-gray-900 font-medium">{user.userId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">性别</span>
              <span className="text-gray-900 font-medium">
                {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '保密'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">年龄</span>
              <span className="text-gray-900 font-medium">{user.age ? `${user.age} 岁` : '未填写'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">联系电话</span>
              <span className="text-gray-900 font-medium">{user.phoneNumber || '未填写'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">绑定邮箱</span>
              <span className="text-gray-900 font-medium">{user.email}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
    )
}

export default ProfilePage