"use client"
import {useState,useEffect} from 'react'

const ActiveUserPannel=()=>{

    const [loading,setLoading] = useState(false)
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
        <h3 className="text-[16px] font-bold text-gray-800">活跃用户</h3>
        <button className="text-[12px] text-gray-400 hover:text-[#8B5742] transition-colors">
          查看全部 &gt;
        </button>
      </div>

      {/* 用户列表 */}
      <div className="space-y-5">
        {users.map((user, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              {/* 头像 */}
              <div className="relative">
                <img 
                  src={user.avatar} 
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
                   活跃值 {user.active_score}
                </span>
              </div>
            </div>

            {/* 关注按钮 */}
            <button className="px-4 py-1.5 rounded-full border border-orange-100 bg-orange-50/30 text-[#8B5742] text-[12px] font-medium hover:bg-[#8B5742] hover:text-white transition-all duration-300 active:scale-95">
              关注
            </button>
          </div>
        ))}
      </div>
    </div>
    )
}

export default ActiveUserPannel;