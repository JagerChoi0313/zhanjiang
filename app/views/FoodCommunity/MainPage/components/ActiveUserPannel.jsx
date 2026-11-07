"use client"
import {useState,useEffect} from 'react'
import Link from "next/link";
import IdenticonAvatar from '../../../../components/IdenticonAvatar'

const ActiveUserPannel=()=>{

    const [loading,setLoading] = useState(true)
    const [users,setUsers] = useState([])

    useEffect(()=>{
        const fetchUser = async()=>{
            try{
                const response = await fetch("/API/ActiveUser")
                const result = await response.json();   //这里不要漏了括号，response.json是一个函数，加上括号才能使用
                if(result.success){
                    setUsers(result.data)
                }

            }catch(error){
                console.error("Faild to fetch User",error)
            }finally{
                setLoading(false)
            }
        }

        fetchUser()
    },[])

    if (loading) return <div className="p-5 text-gray-400 text-center">加载中...</div>;

    return(
 <div className="w-full bg-white/70 backdrop-blur-md rounded-[24px] p-5 shadow-sm border border-gray-100/50">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-5 px-1">
        <h3 className="text-[16px] font-bold text-gray-800">活跃作者</h3>
      </div>

      {/* 用户列表 */}
      <div className="space-y-5">
        {users.length === 0 && <p className="text-sm text-gray-500">暂无活跃作者。</p>}
        {users.map((user) => (
          <div key={user.userId} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              {/* 头像 */}
              <div className="relative">
                <IdenticonAvatar
                  src={user.avatar}
                  seed={user.user_name || user.id}
                  alt={user.user_name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-50 shadow-sm"
                />
              </div>
              
              {/* 用户信息 */}
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-gray-800 group-hover:text-[#8B5742] transition-colors">
                  {user.user_name}
                </span>
                <span className="text-[11px] text-gray-400">
                   公开投稿 {user.active_score} 篇
                </span>
              </div>
            </div>

            <Link href={`/views/User/${user.userId}`} className="shrink-0 rounded-full border border-orange-100 px-3 py-1.5 text-xs text-[#8B5742] hover:bg-orange-50">
              看主页
            </Link>
          </div>
        ))}
      </div>
    </div>
    )
}

export default ActiveUserPannel;
